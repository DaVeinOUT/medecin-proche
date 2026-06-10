/**
 * Import des professionnels de santé DOM-TOM
 *
 * Source  : Annuaire Santé CNAM via Opendatasoft
 * Dataset : medecins (géolocalisé, avec convention, spécialité, téléphone)
 * Fichier : data/medecins_domtom.csv  (généré par npm run download-data)
 *
 * Usage :
 *   npm run import
 *   npm run import -- ./data/mon-fichier.csv
 */

import { createClient } from '@supabase/supabase-js';
import { parse } from 'csv-parse';
import { createReadStream } from 'fs';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY manquante dans .env.local');
  console.error('   L\'import requiert la clé service_role pour bypasser le RLS.');
  console.error('   Ne jamais utiliser la clé anon pour l\'import — les insertions échoueraient silencieusement.');
  process.exit(1);
}
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseKey,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const TERRITOIRES: Record<string, string> = {
  '971': 'Guadeloupe',
  '972': 'Martinique',
  '973': 'Guyane',
  '974': 'La Réunion',
  '976': 'Mayotte',
  '977': 'Saint-Barthélemy',
  '978': 'Saint-Martin',
};

// Colonnes du CSV Opendatasoft (export filtré DOM-TOM)
interface CsvRow {
  'nom': string;              // Nom complet "JEAN MARTIN" (prénom + nom)
  'civilite': string;         // "Homme" | "Femme"
  'column_10': string;        // Numéro de téléphone "06.32.02.74.42"
  'column_14': string;        // Secteur "Secteur 1 ou conventionné" | "Secteur 2" | ...
  'libelle_profession': string; // Spécialité "Médecin généraliste"
  'coordonnees': string;      // "lat, lon" ex: "14.777358, -61.030342"
  'commune': string;          // Ville
  'dep_code': string;         // "971" | "972" | "973" | "974" | "976"
  'dep_name': string;         // "Martinique" | "Guadeloupe" | ...
  'concat': string;           // Clé de déduplication (nom + adresse)
}

interface MedecinInsert {
  nom: string;
  prenom: string;
  specialite: string;
  adresse: string;
  ville: string;
  code_postal: string | null;
  departement: string;
  territoire: string;
  telephone: string | null;
  secteur: number;
  langues: string[];
  accepte_nouveaux_patients: boolean;
  localisation: string;
}

// Déduplication par concat (nom + adresse regroupés)
const seen = new Set<string>();

function parseSecteur(raw: string): number {
  if (!raw) return 1;
  const s = raw.toLowerCase();
  if (s.includes('secteur 2') || s.includes('optam')) return 2;
  if (s.includes('non conventionné') || s.includes('non-conventionné')) return 3;
  return 1; // Secteur 1 ou conventionné par défaut
}

function parseAcceptePatients(secteurRaw: string): boolean {
  // Non conventionné = hors circuit SS → false
  const s = (secteurRaw ?? '').toLowerCase();
  return !s.includes('non conventionné') && !s.includes('non-conventionné');
}

function formatTelephone(raw: string): string | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[.\s\-]/g, '');
  if (cleaned.length === 10 && /^0[1-9]/.test(cleaned)) return cleaned;
  if (cleaned.length === 9) return '0' + cleaned;
  return null;
}

/**
 * Sépare "JEAN PAUL MARTIN" → { prenom: "JEAN PAUL", nom: "MARTIN" }
 * Pour les professionnels de santé, le format est généralement Prénom(s) Nom
 */
function parseName(fullName: string): { prenom: string; nom: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { prenom: '', nom: '' };
  if (parts.length === 1) return { prenom: '', nom: parts[0] };
  const nom = parts[parts.length - 1];
  const prenom = parts.slice(0, -1).join(' ');
  return { prenom, nom };
}

/**
 * Parse "lat, lon" → { lat, lng }
 * Ex: "14.777358, -61.030342" → { lat: 14.777358, lng: -61.030342 }
 */
function parseCoords(raw: string): { lat: number; lng: number } | null {
  if (!raw) return null;
  const parts = raw.split(',').map(s => s.trim());
  if (parts.length !== 2) return null;
  const lat = parseFloat(parts[0]);
  const lng = parseFloat(parts[1]);
  if (isNaN(lat) || isNaN(lng)) return null;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return { lat, lng };
}

async function insertBatch(batch: MedecinInsert[]): Promise<number> {
  const { error } = await supabase
    .from('medecins')
    .upsert(batch, { onConflict: 'nom,adresse,specialite', ignoreDuplicates: true });

  if (error) {
    console.error(`\n❌ Erreur batch:`, error.message);
    return 0;
  }
  return batch.length;
}

async function importCsv(filePath: string): Promise<void> {
  const batch: MedecinInsert[] = [];
  let totalLignes = 0;
  let sansCoordsIgnores = 0;
  let duplicatasIgnores = 0;
  let inseres = 0;

  console.log(`\n📂 Lecture : ${filePath}`);
  console.log('   Traitement et déduplification en cours...\n');

  const parser = createReadStream(filePath).pipe(
    parse({
      columns: true,
      delimiter: ';',
      skip_empty_lines: true,
      encoding: 'utf8',
      bom: true,
      relax_column_count: true,
    })
  );

  for await (const row of parser as AsyncIterable<CsvRow>) {
    totalLignes++;

    // Coordonnées obligatoires pour la carte
    const coords = parseCoords(row['coordonnees']);
    if (!coords) {
      sansCoordsIgnores++;
      continue;
    }

    const nomComplet = row['nom']?.trim();
    if (!nomComplet) continue;

    // Déduplication : même professionnel, même localisation
    const dedupeKey = row['concat']?.trim() ?? `${nomComplet}|${row['commune']}|${row['libelle_profession']}`;
    if (seen.has(dedupeKey)) {
      duplicatasIgnores++;
      continue;
    }
    seen.add(dedupeKey);

    const dept = row['dep_code']?.trim();
    const territoire = row['dep_name']?.trim() || TERRITOIRES[dept] || dept;
    const secteurRaw = row['column_14']?.trim() ?? '';
    const { prenom, nom } = parseName(nomComplet);

    // L'adresse est dans concat = nom + adresse collés : on extrait l'adresse
    const concatRaw = row['concat']?.trim() ?? '';
    const adresse = concatRaw.startsWith(nomComplet)
      ? concatRaw.slice(nomComplet.length).trim() || row['commune']?.trim() || '-'
      : row['commune']?.trim() || '-';

    batch.push({
      nom,
      prenom,
      specialite: row['libelle_profession']?.trim() || 'Autre',
      adresse,
      ville: row['commune']?.trim() || '',
      code_postal: null,
      departement: dept,
      territoire,
      telephone: formatTelephone(row['column_10']),
      secteur: parseSecteur(secteurRaw),
      langues: ['Français'],
      accepte_nouveaux_patients: parseAcceptePatients(secteurRaw),
      localisation: `POINT(${coords.lng} ${coords.lat})`,
    });

    if (batch.length >= 200) {
      inseres += await insertBatch(batch.splice(0, 200));
      process.stdout.write(`   ${inseres} médecins importés...\r`);
    }
  }

  if (batch.length > 0) {
    inseres += await insertBatch(batch);
  }

  console.log('\n');
  console.log('✅ Import terminé !');
  console.log(`   Lignes lues           : ${totalLignes.toLocaleString()}`);
  console.log(`   Sans coordonnées GPS  : ${sansCoordsIgnores.toLocaleString()}`);
  console.log(`   Doublons ignorés      : ${duplicatasIgnores.toLocaleString()}`);
  console.log(`   Médecins uniques      : ${inseres.toLocaleString()}`);
  console.log('');

  await printStats();
}

async function printStats(): Promise<void> {
  console.log('   Répartition par territoire :');
  const { data } = await supabase
    .from('medecins')
    .select('territoire')
    .in('departement', ['971', '972', '973', '974', '976', '977', '978']);

  if (!data) return;

  const counts: Record<string, number> = {};
  for (const row of data) {
    counts[row.territoire] = (counts[row.territoire] ?? 0) + 1;
  }
  for (const [t, c] of Object.entries(counts).sort()) {
    console.log(`   ${t.padEnd(20)} : ${c.toLocaleString()} médecins`);
  }
}

async function main() {
  console.log('🏥 Import Médecin Proche — Annuaire Santé DOM-TOM');
  console.log('==================================================');

  const filePath = process.argv[2] ?? './data/medecins_domtom.csv';

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL manquante dans .env.local');
    process.exit(1);
  }

  console.log('🔑 Clé service_role détectée → RLS bypassé automatiquement.');

  try {
    await importCsv(filePath);
  } catch (err) {
    console.error('\n❌ Erreur fatale:', err);
    process.exit(1);
  }
}

main();

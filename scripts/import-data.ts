/**
 * Import des professionnels de santé DOM-TOM
 *
 * Source  : Annuaire Santé CNAM via Opendatasoft
 * Dataset : annuaire-des-professionnels-de-sante (toutes professions,
 *           téléphone, convention, horaires — une ligne CSV par créneau)
 * Fichier : data/professionnels_domtom.csv  (généré par npm run download-data)
 *
 * Usage :
 *   npm run import
 *   npm run import -- --reset            # vide la table avant import
 *   npm run import -- ./data/fichier.csv
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

const DEPARTEMENTS: Record<string, string> = {
  'Guadeloupe':       '971',
  'Martinique':       '972',
  'Guyane':           '973',
  'La Réunion':       '974',
  'Mayotte':          '976',
  'Saint-Barthélemy': '977',
  'Saint-Martin':     '978',
};

const JOURS: Record<number, string> = {
  1: 'lun', 2: 'mar', 3: 'mer', 4: 'jeu', 5: 'ven', 6: 'sam', 7: 'dim',
};
const JOURS_ORDRE = ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'];

// Colonnes du CSV Opendatasoft (export filtré DOM-TOM)
interface CsvRow {
  'nom': string;                // Nom complet "JEAN MARTIN" (prénom + nom)
  'civilite': string;           // "Homme" | "Femme"
  'libelle_profession': string; // "Médecin généraliste", "Chirurgien-dentiste"...
  'adresse3': string;           // Voie ex: "9 ALLEE DE LA LOUISIANE"
  'adresse4': string;           // Complément ex: "TERREVILLE"
  'code_postal': string;        // "97200"
  'telephone': string;          // "05.96.71.57.54"
  'convention': string;         // "Secteur 1 ou conventionné" | "Secteur 2..." | ...
  'coordonnees': string;        // "lat, lon"
  'adresse': string;            // Adresse complète "... 97200 FORT DE FRANCE"
  'dep_name': string;           // "Martinique" | "Saint-Martin" | ...
  'jour': string;               // 1 (lundi) … 7 (dimanche), peut être vide
  'heure_debut': string;        // "0001-01-01T08:00:00+00:00"
  'heure_fin': string;          // "0001-01-01T12:00:00+00:00"
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
  horaires: Record<string, string> | null;
  langues: string[];
  accepte_nouveaux_patients: boolean;
  localisation: string;
}

// Un professionnel = N lignes CSV (une par créneau horaire) → agrégation
interface Aggregat {
  insert: Omit<MedecinInsert, 'horaires'>;
  // jour ('lun'…) → heure début → heure fin (créneau le plus long conservé)
  creneaux: Map<string, Map<string, string>>;
}

function parseSecteur(raw: string): number {
  if (!raw) return 1;
  const s = raw.toLowerCase();
  if (s.includes('secteur 2') || s.includes('optam')) return 2;
  if (s.includes('non conventionné') || s.includes('non-conventionné')) return 3;
  return 1; // Secteur 1 ou conventionné par défaut
}

function parseAcceptePatients(conventionRaw: string): boolean {
  // Non conventionné = hors circuit SS → false
  const s = (conventionRaw ?? '').toLowerCase();
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

/** Parse "lat, lon" → { lat, lng } */
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

/** "0001-01-01T08:00:00+00:00" → "08h00" */
function parseHeure(raw: string): string | null {
  const m = raw?.match(/T(\d{2}):(\d{2})/);
  return m ? `${m[1]}h${m[2]}` : null;
}

/** Extrait la ville depuis l'adresse complète "… 97200 FORT DE FRANCE" */
function parseVille(adresseComplete: string): string {
  const m = adresseComplete?.match(/\b97\d{3}\s+(.+)$/);
  return m ? m[1].trim() : '';
}

/** Construit le JSONB horaires : { "lun": "08h00–12h00 · 14h00–17h00", ... } */
function buildHoraires(creneaux: Map<string, Map<string, string>>): Record<string, string> | null {
  if (creneaux.size === 0) return null;
  const horaires: Record<string, string> = {};
  for (const jour of JOURS_ORDRE) {
    const slots = creneaux.get(jour);
    if (!slots || slots.size === 0) continue;
    horaires[jour] = [...slots.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([debut, fin]) => `${debut}–${fin}`)
      .join(' · ');
  }
  return Object.keys(horaires).length > 0 ? horaires : null;
}

async function insertBatch(batch: MedecinInsert[]): Promise<number> {
  const { error } = await supabase
    .from('medecins')
    .upsert(batch, { onConflict: 'nom,adresse,specialite', ignoreDuplicates: false });

  if (error) {
    console.error(`\n❌ Erreur batch:`, error.message);
    return 0;
  }
  return batch.length;
}

async function importCsv(filePath: string): Promise<void> {
  const aggregats = new Map<string, Aggregat>();
  let totalLignes = 0;
  let sansCoordsIgnores = 0;

  console.log(`\n📂 Lecture : ${filePath}`);
  console.log('   Agrégation des créneaux horaires par professionnel...\n');

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
    const profession = row['libelle_profession']?.trim();
    if (!nomComplet || !profession) continue;

    const adresseComplete = row['adresse']?.trim() ?? '';
    const key = `${nomComplet}|${adresseComplete}|${profession}`;

    let agg = aggregats.get(key);
    if (!agg) {
      const territoire = row['dep_name']?.trim() ?? '';
      const conventionRaw = row['convention']?.trim() ?? '';
      const { prenom, nom } = parseName(nomComplet);
      const adresse = [row['adresse3']?.trim(), row['adresse4']?.trim()]
        .filter(Boolean).join(', ') || adresseComplete || '-';

      agg = {
        insert: {
          nom,
          prenom,
          specialite: profession,
          adresse,
          ville: parseVille(adresseComplete),
          code_postal: row['code_postal']?.trim() || null,
          departement: DEPARTEMENTS[territoire] ?? '',
          territoire,
          telephone: formatTelephone(row['telephone']),
          secteur: parseSecteur(conventionRaw),
          langues: ['Français'],
          accepte_nouveaux_patients: parseAcceptePatients(conventionRaw),
          localisation: `POINT(${coords.lng} ${coords.lat})`,
        },
        creneaux: new Map(),
      };
      aggregats.set(key, agg);
    }

    // Téléphone : première valeur valide rencontrée
    if (!agg.insert.telephone) {
      agg.insert.telephone = formatTelephone(row['telephone']);
    }

    // Créneau horaire de cette ligne
    const jour = JOURS[Number(row['jour'])];
    const debut = parseHeure(row['heure_debut']);
    const fin = parseHeure(row['heure_fin']);
    if (jour && debut && fin) {
      let slots = agg.creneaux.get(jour);
      if (!slots) { slots = new Map(); agg.creneaux.set(jour, slots); }
      // Même heure de début vue deux fois (ex: cabinet + consultation) → fin la plus tardive
      const finExistante = slots.get(debut);
      if (!finExistante || fin > finExistante) slots.set(debut, fin);
    }

    if (totalLignes % 5000 === 0) {
      process.stdout.write(`   ${totalLignes.toLocaleString()} lignes lues, ${aggregats.size.toLocaleString()} professionnels uniques...\r`);
    }
  }

  console.log(`\n   ${totalLignes.toLocaleString()} lignes lues → ${aggregats.size.toLocaleString()} professionnels uniques`);
  console.log('   Insertion en base...\n');

  let inseres = 0;
  let batch: MedecinInsert[] = [];
  for (const agg of aggregats.values()) {
    batch.push({ ...agg.insert, horaires: buildHoraires(agg.creneaux) });
    if (batch.length >= 200) {
      inseres += await insertBatch(batch);
      batch = [];
      process.stdout.write(`   ${inseres.toLocaleString()} professionnels importés...\r`);
    }
  }
  if (batch.length > 0) inseres += await insertBatch(batch);

  console.log('\n');
  console.log('✅ Import terminé !');
  console.log(`   Lignes lues             : ${totalLignes.toLocaleString()}`);
  console.log(`   Sans coordonnées GPS    : ${sansCoordsIgnores.toLocaleString()}`);
  console.log(`   Professionnels uniques  : ${inseres.toLocaleString()}`);
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
    console.log(`   ${t.padEnd(20)} : ${c.toLocaleString()} professionnels`);
  }
}

async function resetTable(): Promise<void> {
  console.log('🗑  Option --reset : vidage de la table medecins...');
  const { error } = await supabase
    .from('medecins')
    .delete()
    .gte('created_at', '1970-01-01');
  if (error) {
    console.error('❌ Échec du vidage :', error.message);
    process.exit(1);
  }
  console.log('   Table vidée.\n');
}

async function main() {
  console.log('🏥 Import Médecin Proche — Annuaire Santé DOM-TOM (toutes professions)');
  console.log('======================================================================');

  const args = process.argv.slice(2);
  const reset = args.includes('--reset');
  const filePath = args.find((a) => !a.startsWith('--')) ?? './data/professionnels_domtom.csv';

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL manquante dans .env.local');
    process.exit(1);
  }

  console.log('🔑 Clé service_role détectée → RLS bypassé automatiquement.');

  try {
    if (reset) await resetTable();
    await importCsv(filePath);
  } catch (err) {
    console.error('\n❌ Erreur fatale:', err);
    process.exit(1);
  }
}

main();

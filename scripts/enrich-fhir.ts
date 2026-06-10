/**
 * Enrichissement via l'Annuaire Santé FHIR (api.esante.gouv.fr)
 *
 * Complète les fiches importées de la CNAM avec les données RPPS officielles :
 * vérification d'exercice (praticien toujours en activité), RPPS, et à terme
 * langues parlées et horaires structurés.
 *
 * Prérequis : une clé API gratuite — créer un compte sur
 *   https://gateway.api.esante.gouv.fr (espace ANS / Annuaire Santé)
 * puis renseigner ESANTE_API_KEY dans .env.local
 *
 * Usage :
 *   npx ts-node --project tsconfig.json scripts/enrich-fhir.ts            # test sur 10 fiches
 *   npx ts-node --project tsconfig.json scripts/enrich-fhir.ts --limit=500
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const FHIR_BASE = 'https://gateway.api.esante.gouv.fr/fhir';

const apiKey = process.env.ESANTE_API_KEY;
if (!apiKey) {
  console.log('ℹ️  ESANTE_API_KEY absente de .env.local — enrichissement FHIR désactivé.');
  console.log('');
  console.log('   Pour l\'activer (gratuit) :');
  console.log('   1. Créer un compte sur https://gateway.api.esante.gouv.fr');
  console.log('   2. Souscrire à l\'API « Annuaire Santé en santé FHIR »');
  console.log('   3. Ajouter ESANTE_API_KEY=<votre clé> dans .env.local');
  process.exit(0);
}

const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY manquante dans .env.local (requise pour mettre à jour les fiches).');
  process.exit(1);
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

interface FhirBundle {
  total?: number;
  entry?: { resource: FhirPractitioner }[];
}

interface FhirPractitioner {
  resourceType: 'Practitioner';
  id: string;
  identifier?: { system?: string; value?: string }[];
  name?: { family?: string; given?: string[] }[];
  active?: boolean;
}

/** Recherche un praticien par nom dans l'Annuaire Santé FHIR */
async function searchPractitioner(nom: string, prenom: string | null): Promise<FhirPractitioner | null> {
  const params = new URLSearchParams({ family: nom, _count: '5' });
  if (prenom) params.set('given', prenom.split(' ')[0]);

  const res = await fetch(`${FHIR_BASE}/Practitioner?${params}`, {
    headers: { 'ESANTE-API-KEY': apiKey!, Accept: 'application/fhir+json' },
  });
  if (!res.ok) {
    if (res.status === 429) throw new Error('rate-limit');
    return null;
  }
  const bundle = (await res.json()) as FhirBundle;
  return bundle.entry?.[0]?.resource ?? null;
}

function extractRpps(p: FhirPractitioner): string | null {
  // L'identifiant RPPS est porté par le system .../rpps (IDNPS préfixé 8)
  const idn = p.identifier?.find((i) => i.system?.toLowerCase().includes('rpps'))
    ?? p.identifier?.find((i) => i.value?.startsWith('8'));
  return idn?.value?.replace(/^8/, '') ?? null;
}

async function main() {
  console.log('🔗 Enrichissement FHIR — Annuaire Santé (api.esante.gouv.fr)');
  console.log('============================================================');

  const limitArg = process.argv.find((a) => a.startsWith('--limit='));
  const limit = limitArg ? Number(limitArg.split('=')[1]) : 10;

  const { data: medecins, error } = await supabase
    .from('medecins')
    .select('id,nom,prenom,rpps')
    .is('rpps', null)
    .limit(limit);

  if (error || !medecins) {
    console.error('❌ Lecture des fiches impossible :', error?.message);
    process.exit(1);
  }

  console.log(`   ${medecins.length} fiche(s) sans RPPS à enrichir (--limit=${limit})\n`);

  let enrichis = 0;
  for (const m of medecins) {
    try {
      const praticien = await searchPractitioner(m.nom, m.prenom);
      if (!praticien) continue;

      const rpps = extractRpps(praticien);
      if (!rpps) continue;

      const { error: upErr } = await supabase
        .from('medecins')
        .update({ rpps })
        .eq('id', m.id);

      if (!upErr) {
        enrichis++;
        process.stdout.write(`   ${enrichis} fiche(s) enrichie(s)...\r`);
      }
      // Respect du rate limit de l'API publique
      await new Promise((r) => setTimeout(r, 250));
    } catch (e) {
      if (e instanceof Error && e.message === 'rate-limit') {
        console.warn('\n⚠️  Rate limit atteint — réessayez plus tard ou réduisez --limit.');
        break;
      }
      throw e;
    }
  }

  console.log(`\n✅ Terminé : ${enrichis}/${medecins.length} fiche(s) enrichie(s) avec le RPPS.`);
}

main();

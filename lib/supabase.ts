import { createClient } from '@supabase/supabase-js';
import { Medecin, SearchParams } from '@/types/medecin';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// ─── Cache client-side (TTL 5 min, max 50 entrées) ───────────────────────────
const cache = new Map<string, { data: Medecin[]; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000;
const MAX_CACHE_SIZE = 50;

function getCached(key: string): Medecin[] | null {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.ts > CACHE_TTL) { cache.delete(key); return null; }
  return hit.data;
}

function setCached(key: string, data: Medecin[]): void {
  if (cache.size >= MAX_CACHE_SIZE) {
    // Supprime l'entrée la plus ancienne (insertion order)
    cache.delete(cache.keys().next().value!);
  }
  cache.set(key, { data, ts: Date.now() });
}

// Supprime les caractères spéciaux PostgREST (séparateurs de filtre .or())
// pour éviter l'injection de conditions arbitraires via la saisie utilisateur.
function sanitizeQuery(q: string): string {
  return q.trim().slice(0, 100).replace(/[,().]/g, ' ').trim();
}

// Colonnes légères — on exclut horaires (JSONB lourd) et langues non affichés en liste
const LIST_COLUMNS = 'id,nom,prenom,specialite,adresse,ville,territoire,telephone,secteur,accepte_nouveaux_patients,lat,lng';

// ─── MODE PROXIMITÉ ──────────────────────────────────────────────────────────
export async function getMedecinsProches({
  lat, lng, rayon, specialite, secteur, accepteNouveauxPatients,
}: SearchParams): Promise<Medecin[]> {
  const key = `prox:${lat.toFixed(4)},${lng.toFixed(4)},${rayon},${specialite},${secteur},${accepteNouveauxPatients}`;
  const cached = getCached(key);
  if (cached) return cached;

  let query = supabase.rpc('medecins_proches', {
    user_lat: lat,
    user_lng: lng,
    rayon_km: rayon,
  });

  if (specialite)              query = query.ilike('specialite', `%${specialite}%`);
  if (secteur)                 query = query.eq('secteur', secteur);
  if (accepteNouveauxPatients) query = query.eq('accepte_nouveaux_patients', true);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const result = (data as unknown as Medecin[]) ?? [];
  setCached(key, result);
  return result;
}

// ─── MODE TERRITOIRE ─────────────────────────────────────────────────────────
export async function getMedecinsByTerritoire(
  territoire: string,
  specialite?: string,
  secteur?: number | null,
  accepteNouveauxPatients?: boolean,
): Promise<Medecin[]> {
  const key = `ter:${territoire},${specialite},${secteur},${accepteNouveauxPatients}`;
  const cached = getCached(key);
  if (cached) return cached;

  let query = supabase
    .from('medecins_vue')
    .select(LIST_COLUMNS)
    .eq('territoire', territoire);

  if (specialite)              query = query.ilike('specialite', `%${specialite}%`);
  if (secteur)                 query = query.eq('secteur', secteur);
  if (accepteNouveauxPatients) query = query.eq('accepte_nouveaux_patients', true);

  const { data, error } = await query.limit(300);
  if (error) throw new Error(error.message);

  const result = (data as unknown as Medecin[]) ?? [];
  setCached(key, result);
  return result;
}

// ─── MODE RECHERCHE TEXTUELLE ────────────────────────────────────────────────
export async function searchMedecins(
  query: string,
  specialite?: string,
  secteur?: number | null,
  accepteNouveauxPatients?: boolean,
): Promise<Medecin[]> {
  const safe = sanitizeQuery(query);
  const key = `search:${safe},${specialite},${secteur},${accepteNouveauxPatients}`;
  const cached = getCached(key);
  if (cached) return cached;

  let q = supabase
    .from('medecins_vue')
    .select(LIST_COLUMNS)
    .or(
      `nom.ilike.%${safe}%,` +
      `prenom.ilike.%${safe}%,` +
      `specialite.ilike.%${safe}%,` +
      `ville.ilike.%${safe}%,` +
      `territoire.ilike.%${safe}%`
    );

  if (specialite)              q = q.ilike('specialite', `%${specialite}%`);
  if (secteur)                 q = q.eq('secteur', secteur);
  if (accepteNouveauxPatients) q = q.eq('accepte_nouveaux_patients', true);

  const { data, error } = await q.limit(150);
  if (error) throw new Error(error.message);

  const result = (data as unknown as Medecin[]) ?? [];
  setCached(key, result);
  return result;
}

// ─── FICHE MÉDECIN ───────────────────────────────────────────────────────────
export async function getMedecinById(id: string): Promise<Medecin | null> {
  const { data, error } = await supabase
    .from('medecins_vue')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data as Medecin;
}

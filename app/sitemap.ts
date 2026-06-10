import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';
import { slugify } from '@/lib/slug';

export const revalidate = 86400; // Revalide toutes les 24h (ISR)

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://medecinproche.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/urgences`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
  ];

  // Récupère IDs médecins et couples annuaire — client créé localement pour
  // éviter le crash au niveau module si les env vars sont absentes au build
  let data: { id: string }[] | null = null;
  let pairs: { territoire: string; specialite: string }[] | null = null;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const client = createClient(supabaseUrl, supabaseKey);
      const [medecinsRes, pairsRes] = await Promise.all([
        client.from('medecins_vue').select('id').limit(10000),
        client.from('annuaire_pairs').select('territoire,specialite'),
      ]);
      data = medecinsRes.data;
      pairs = pairsRes.data;
    } catch {
      // Supabase indisponible — sitemap statique uniquement
    }
  }

  const annuairePages: MetadataRoute.Sitemap = (pairs ?? []).map((p) => ({
    url: `${BASE_URL}/annuaire/${slugify(p.territoire)}/${slugify(p.specialite)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  const medecinPages: MetadataRoute.Sitemap = (data ?? []).map((m) => ({
    url: `${BASE_URL}/medecin/${m.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticPages, ...annuairePages, ...medecinPages];
}

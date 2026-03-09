import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

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
  ];

  // Récupère tous les IDs médecins — client créé localement pour éviter
  // le crash au niveau module si les env vars sont absentes au build
  let data: { id: string }[] | null = null;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const client = createClient(supabaseUrl, supabaseKey);
      const result = await client.from('medecins_vue').select('id').limit(10000);
      data = result.data;
    } catch {
      // Supabase indisponible — sitemap statique uniquement
    }
  }

  const medecinPages: MetadataRoute.Sitemap = (data ?? []).map((m) => ({
    url: `${BASE_URL}/medecin/${m.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticPages, ...medecinPages];
}

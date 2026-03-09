import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

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

  // Récupère tous les IDs médecins sans limite (colonne légère)
  // Graceful fallback si les env vars Supabase ne sont pas disponibles au build
  let data: { id: string }[] | null = null;
  try {
    const result = await supabase.from('medecins_vue').select('id').limit(10000);
    data = result.data;
  } catch {
    // Build sans Supabase — sitemap statique uniquement
  }

  const medecinPages: MetadataRoute.Sitemap = (data ?? []).map((m) => ({
    url: `${BASE_URL}/medecin/${m.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticPages, ...medecinPages];
}

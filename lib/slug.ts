/**
 * Slugs URL pour les pages d'annuaire SEO.
 * « Médecin généraliste » ↔ medecin-generaliste
 */
export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // retire les diacritiques
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

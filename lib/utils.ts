/** Met chaque mot en majuscule initiale — gère les tirets et apostrophes */
export function toTitleCase(s: string): string {
  if (!s) return s;
  return s
    .toLowerCase()
    .replace(/(?:^|\s|-|')\S/g, (c) => c.toUpperCase());
}

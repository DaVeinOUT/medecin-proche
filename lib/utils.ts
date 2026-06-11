/** Met chaque mot en majuscule initiale — gère les tirets et apostrophes */
export function toTitleCase(s: string): string {
  if (!s) return s;
  return s
    .toLowerCase()
    .replace(/(?:^|\s|-|')\S/g, (c) => c.toUpperCase());
}

/** Formate un numéro à 10 chiffres « 0596 60 60 44 » — sinon renvoyé tel quel */
export function formatTel(tel: string): string {
  const d = tel.replace(/\D/g, '');
  if (d.length !== 10) return tel;
  return `${d.slice(0, 4)} ${d.slice(4, 6)} ${d.slice(6, 8)} ${d.slice(8, 10)}`;
}

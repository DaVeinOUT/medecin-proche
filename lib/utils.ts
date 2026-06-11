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

// Professions autorisant le titre « Dr » — médecins et chirurgiens-dentistes.
// Les infirmiers, kinés, sages-femmes, fournisseurs de matériel, etc. n'en ont pas.
const PROFESSIONS_DOCTEUR = [
  'medecin', 'medecine', 'generaliste', 'cardiologue', 'dermatologue',
  'venerologue', 'gynecologue', 'obstetricien', 'ophtalmologiste',
  'oto-rhino', 'orl', 'pediatre', 'psychiatre', 'radiologue', 'rhumatologue',
  'gastro-enterologue', 'hepatologue', 'neurologue', 'endocrinologue',
  'pneumologue', 'nephrologue', 'urologue', 'chirurgien', 'dentiste',
  'anesthesiste', 'stomatologue', 'allergologue', 'angiologue',
  'hematologue', 'oncologue', 'geriatre', 'neuropsychiatre', 'interniste',
  'biologiste medical',
];

function sansAccents(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

/** « Dr » uniquement pour les professions médicales — vide sinon */
export function titrePraticien(specialite?: string | null): string {
  if (!specialite) return '';
  const s = sansAccents(specialite);
  return PROFESSIONS_DOCTEUR.some((p) => s.includes(p)) ? 'Dr ' : '';
}

/** Nom affiché complet : « Dr Marie Payet » ou « Marie Payet » selon la profession */
export function nomAffiche(
  prenom: string | null | undefined,
  nom: string,
  specialite?: string | null,
): string {
  const titre = titrePraticien(specialite);
  const p = prenom ? toTitleCase(prenom) : '';
  return `${titre}${p} ${toTitleCase(nom)}`.replace(/\s+/g, ' ').trim();
}

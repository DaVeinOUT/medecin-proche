// Utilitaires avatar partagés entre MedecinCard, la fiche médecin et l'annuaire.
// Palette « Édition Lagon » : pastilles douces sur crème, dégradés profonds
// (texte blanc lisible AA), halo aurora pour les héros encre.

interface SpecialiteTheme {
  bg: string;        // pastille avatar sur fond crème
  gradient: string;  // dégradé CTA / médaillon (texte blanc)
  aurora: string;    // halo coloré des héros encre
}

const SPECIALITE_COLORS: Record<string, SpecialiteTheme> = {
  'Médecine générale':         { bg: 'bg-lagoon-100 text-ink-800',      gradient: 'from-lagoon-600 to-ink-800',     aurora: '#2BC4A4' },
  'Cardiologie':               { bg: 'bg-coral-100 text-coral-700',     gradient: 'from-coral-600 to-coral-700',    aurora: '#FF7E66' },
  'Gynécologie-Obstétrique':   { bg: 'bg-pink-100 text-pink-900',       gradient: 'from-pink-600 to-pink-800',      aurora: '#F472B6' },
  'Pédiatrie':                 { bg: 'bg-sky-100 text-sky-900',         gradient: 'from-sky-600 to-sky-800',        aurora: '#38BDF8' },
  'Dermatologie':              { bg: 'bg-orange-100 text-orange-900',   gradient: 'from-orange-700 to-orange-900',  aurora: '#FB923C' },
  'Ophtalmologie':             { bg: 'bg-blue-100 text-blue-900',       gradient: 'from-blue-600 to-blue-800',      aurora: '#60A5FA' },
  'ORL':                       { bg: 'bg-violet-100 text-violet-900',   gradient: 'from-violet-600 to-violet-800',  aurora: '#A78BFA' },
  'Psychiatrie':               { bg: 'bg-purple-100 text-purple-900',   gradient: 'from-purple-600 to-purple-800',  aurora: '#C084FC' },
  'Rhumatologie':              { bg: 'bg-mango-100 text-mango-600',     gradient: 'from-mango-600 to-orange-900',   aurora: '#F2B14E' },
  'Neurologie':                { bg: 'bg-indigo-100 text-indigo-900',   gradient: 'from-indigo-600 to-indigo-800',  aurora: '#818CF8' },
  'Endocrinologie':            { bg: 'bg-teal-100 text-teal-900',       gradient: 'from-teal-600 to-teal-800',      aurora: '#2DD4BF' },
  'Chirurgie générale':        { bg: 'bg-slate-200 text-slate-900',     gradient: 'from-slate-600 to-slate-800',    aurora: '#94A3B8' },
  'Orthopédie':                { bg: 'bg-amber-100 text-amber-900',     gradient: 'from-amber-700 to-amber-900',    aurora: '#FBBF24' },
  'Radiologie':                { bg: 'bg-cyan-100 text-cyan-900',       gradient: 'from-cyan-600 to-cyan-800',      aurora: '#22D3EE' },
  'Anesthésie-Réanimation':    { bg: 'bg-rose-100 text-rose-900',       gradient: 'from-rose-600 to-rose-800',      aurora: '#FB7185' },
  // Libellés réels de l'Annuaire Santé CNAM (libelle_profession)
  'Médecin généraliste':       { bg: 'bg-lagoon-100 text-ink-800',      gradient: 'from-lagoon-600 to-ink-800',     aurora: '#2BC4A4' },
  'Pédiatre':                  { bg: 'bg-sky-100 text-sky-900',         gradient: 'from-sky-600 to-sky-800',        aurora: '#38BDF8' },
  'Chirurgien-dentiste':       { bg: 'bg-blue-100 text-blue-900',       gradient: 'from-blue-600 to-blue-800',      aurora: '#60A5FA' },
  'Sage-femme':                { bg: 'bg-pink-100 text-pink-900',       gradient: 'from-pink-600 to-pink-800',      aurora: '#F472B6' },
  'Infirmier':                 { bg: 'bg-teal-100 text-teal-900',       gradient: 'from-teal-600 to-teal-800',      aurora: '#2DD4BF' },
  'Masseur-kinésithérapeute':  { bg: 'bg-lime-100 text-lime-900',       gradient: 'from-lime-700 to-emerald-900',   aurora: '#A3E635' },
  'Orthophoniste':             { bg: 'bg-fuchsia-100 text-fuchsia-900', gradient: 'from-fuchsia-600 to-fuchsia-800',aurora: '#E879F9' },
  'Cardiologue':               { bg: 'bg-coral-100 text-coral-700',     gradient: 'from-coral-600 to-coral-700',    aurora: '#FF7E66' },
  'Dermatologue et vénérologue': { bg: 'bg-orange-100 text-orange-900', gradient: 'from-orange-700 to-orange-900',  aurora: '#FB923C' },
  'Gynécologue obstétricien':  { bg: 'bg-pink-100 text-pink-900',       gradient: 'from-pink-600 to-pink-800',      aurora: '#F472B6' },
  'Gynécologue médical':       { bg: 'bg-pink-100 text-pink-900',       gradient: 'from-pink-600 to-pink-800',      aurora: '#F472B6' },
  'Ophtalmologiste':           { bg: 'bg-blue-100 text-blue-900',       gradient: 'from-blue-600 to-blue-800',      aurora: '#60A5FA' },
  'Psychiatre':                { bg: 'bg-purple-100 text-purple-900',   gradient: 'from-purple-600 to-purple-800',  aurora: '#C084FC' },
  'Radiologue':                { bg: 'bg-cyan-100 text-cyan-900',       gradient: 'from-cyan-600 to-cyan-800',      aurora: '#22D3EE' },
  'Rhumatologue':              { bg: 'bg-mango-100 text-mango-600',     gradient: 'from-mango-600 to-orange-900',   aurora: '#F2B14E' },
};

// Fallback par lettre du nom (spécialités non listées ou données inconnues)
const FALLBACK: SpecialiteTheme[] = [
  { bg: 'bg-blue-100 text-blue-900',     gradient: 'from-blue-600 to-blue-800',       aurora: '#60A5FA' },
  { bg: 'bg-violet-100 text-violet-900', gradient: 'from-violet-600 to-violet-800',   aurora: '#A78BFA' },
  { bg: 'bg-lagoon-100 text-ink-800',    gradient: 'from-lagoon-600 to-ink-800',      aurora: '#2BC4A4' },
  { bg: 'bg-orange-100 text-orange-900', gradient: 'from-orange-700 to-orange-900',   aurora: '#FB923C' },
  { bg: 'bg-pink-100 text-pink-900',     gradient: 'from-pink-600 to-pink-800',       aurora: '#F472B6' },
  { bg: 'bg-cyan-100 text-cyan-900',     gradient: 'from-cyan-600 to-cyan-800',       aurora: '#22D3EE' },
];

function fallbackIdx(name: string): number {
  return name.charCodeAt(0) % FALLBACK.length;
}

/** Trouve la correspondance de spécialité sans tenir compte de la casse ni des accents */
function findSpecialite(specialite: string): SpecialiteTheme | undefined {
  const needle = specialite.trim().toLowerCase();
  const key = Object.keys(SPECIALITE_COLORS).find(
    (k) => k.toLowerCase() === needle
  );
  return key ? SPECIALITE_COLORS[key] : undefined;
}

function themeFor(nom: string, specialite?: string): SpecialiteTheme {
  if (specialite) {
    const found = findSpecialite(specialite);
    if (found) return found;
  }
  return FALLBACK[fallbackIdx(nom)];
}

/** Couleur de fond de l'avatar — par spécialité (case-insensitive), fallback sur le nom */
export function avatarBg(nom: string, specialite?: string): string {
  return themeFor(nom, specialite).bg;
}

/** Dégradé CTA / médaillon — par spécialité, fallback sur le nom */
export function avatarGradient(nom: string, specialite?: string): string {
  return themeFor(nom, specialite).gradient;
}

/** Couleur du halo aurora des héros encre — par spécialité, fallback sur le nom */
export function avatarAurora(nom: string, specialite?: string): string {
  return themeFor(nom, specialite).aurora;
}

/** Retourne les 2 initiales (prénom + nom) */
export function getInitiales(prenom: string | null | undefined, nom: string): string {
  return `${prenom?.[0] ?? ''}${nom?.[0] ?? ''}`.toUpperCase();
}

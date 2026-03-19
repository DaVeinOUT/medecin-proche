// Utilitaires avatar partagés entre MedecinCard et la page fiche médecin

// Couleurs par spécialité — identification visuelle rapide
const SPECIALITE_COLORS: Record<string, { bg: string; gradient: string }> = {
  'Médecine générale':         { bg: 'bg-emerald-100 text-emerald-800', gradient: 'from-emerald-400 to-emerald-600' },
  'Cardiologie':               { bg: 'bg-red-100 text-red-800',         gradient: 'from-red-400 to-red-600' },
  'Gynécologie-Obstétrique':   { bg: 'bg-pink-100 text-pink-800',       gradient: 'from-pink-400 to-pink-600' },
  'Pédiatrie':                 { bg: 'bg-cyan-100 text-cyan-800',       gradient: 'from-cyan-400 to-cyan-600' },
  'Dermatologie':              { bg: 'bg-orange-100 text-orange-800',   gradient: 'from-orange-400 to-orange-600' },
  'Ophtalmologie':             { bg: 'bg-blue-100 text-blue-800',       gradient: 'from-blue-400 to-blue-600' },
  'ORL':                       { bg: 'bg-violet-100 text-violet-800',   gradient: 'from-violet-400 to-violet-600' },
  'Psychiatrie':               { bg: 'bg-purple-100 text-purple-800',   gradient: 'from-purple-400 to-purple-600' },
  'Rhumatologie':              { bg: 'bg-amber-100 text-amber-800',     gradient: 'from-amber-400 to-amber-600' },
  'Neurologie':                { bg: 'bg-indigo-100 text-indigo-800',   gradient: 'from-indigo-400 to-indigo-600' },
  'Endocrinologie':            { bg: 'bg-teal-100 text-teal-800',       gradient: 'from-teal-400 to-teal-600' },
  'Chirurgie générale':        { bg: 'bg-slate-100 text-slate-800',     gradient: 'from-slate-400 to-slate-600' },
  'Orthopédie':                { bg: 'bg-yellow-100 text-yellow-800',   gradient: 'from-yellow-400 to-yellow-600' },
  'Radiologie':                { bg: 'bg-sky-100 text-sky-800',         gradient: 'from-sky-400 to-sky-600' },
  'Anesthésie-Réanimation':    { bg: 'bg-rose-100 text-rose-800',       gradient: 'from-rose-400 to-rose-600' },
};

// Fallback par lettre du nom (pour les spécialités non listées)
const FALLBACK_BG = [
  'bg-blue-100 text-blue-800',
  'bg-violet-100 text-violet-800',
  'bg-emerald-100 text-emerald-800',
  'bg-orange-100 text-orange-800',
  'bg-pink-100 text-pink-800',
  'bg-cyan-100 text-cyan-800',
];
const FALLBACK_GRADIENT = [
  'from-blue-400 to-blue-600',
  'from-violet-400 to-violet-600',
  'from-emerald-400 to-emerald-600',
  'from-orange-400 to-orange-600',
  'from-pink-400 to-pink-600',
  'from-cyan-400 to-cyan-600',
];

function fallbackIdx(name: string): number {
  return name.charCodeAt(0) % FALLBACK_BG.length;
}

/** Couleur de fond de l'avatar — basée sur la spécialité si connue, sinon sur le nom */
export function avatarBg(nom: string, specialite?: string): string {
  if (specialite && SPECIALITE_COLORS[specialite]) return SPECIALITE_COLORS[specialite].bg;
  return FALLBACK_BG[fallbackIdx(nom)];
}

/** Gradient pour la page fiche — basé sur la spécialité si connue */
export function avatarGradient(nom: string, specialite?: string): string {
  if (specialite && SPECIALITE_COLORS[specialite]) return SPECIALITE_COLORS[specialite].gradient;
  return FALLBACK_GRADIENT[fallbackIdx(nom)];
}

/** Retourne les 2 initiales (prénom + nom) */
export function getInitiales(prenom: string | null | undefined, nom: string): string {
  return `${prenom?.[0] ?? ''}${nom?.[0] ?? ''}`.toUpperCase();
}

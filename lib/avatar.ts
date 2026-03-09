// Utilitaires avatar partagés entre MedecinCard et la page fiche médecin
const AVATAR_BG = [
  'bg-blue-100 text-blue-700',
  'bg-violet-100 text-violet-700',
  'bg-emerald-100 text-emerald-700',
  'bg-orange-100 text-orange-700',
  'bg-pink-100 text-pink-700',
  'bg-cyan-100 text-cyan-700',
];

const AVATAR_GRADIENT = [
  'from-blue-400 to-blue-600',
  'from-violet-400 to-violet-600',
  'from-emerald-400 to-emerald-600',
  'from-orange-400 to-orange-600',
  'from-pink-400 to-pink-600',
  'from-cyan-400 to-cyan-600',
];

function idx(name: string): number {
  return name.charCodeAt(0) % AVATAR_BG.length;
}

export function avatarBg(name: string): string {
  return AVATAR_BG[idx(name)];
}

export function avatarGradient(name: string): string {
  return AVATAR_GRADIENT[idx(name)];
}

export function getInitiales(prenom: string | null | undefined, nom: string): string {
  return `${prenom?.[0] ?? ''}${nom?.[0] ?? ''}`.toUpperCase();
}

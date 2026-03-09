export interface Medecin {
  id: string;
  nom: string;
  prenom: string | null;
  specialite: string;
  adresse: string;
  ville: string;
  territoire: string;
  code_postal: string | null;
  telephone: string | null;
  secteur: 1 | 2 | 3;
  horaires: Record<string, string> | null;
  langues: string[] | null;
  accepte_nouveaux_patients: boolean;
  lat: number;
  lng: number;
  distance?: number; // en mètres, calculé par PostGIS
}

export interface FiltersState {
  specialite: string;
  distance: number; // en km
  secteur: 1 | 2 | 3 | null;
  accepteNouveauxPatients: boolean;
}

export interface SearchParams {
  lat: number;
  lng: number;
  rayon: number; // en km
  specialite?: string;
  secteur?: 1 | 2 | 3 | null;
  accepteNouveauxPatients?: boolean;
}

export const SPECIALITES = [
  'Médecine générale',
  'Pédiatrie',
  'Cardiologie',
  'Gynécologie-Obstétrique',
  'Dermatologie',
  'Ophtalmologie',
  'ORL',
  'Psychiatrie',
  'Rhumatologie',
  'Neurologie',
  'Endocrinologie',
  'Chirurgie générale',
  'Orthopédie',
  'Radiologie',
  'Anesthésie-Réanimation',
] as const;

export const DEPARTEMENTS_DOM = {
  '971': 'Guadeloupe',
  '972': 'Martinique',
  '973': 'Guyane',
  '974': 'La Réunion',
  '976': 'Mayotte',
} as const;

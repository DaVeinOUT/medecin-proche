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

// Libellés alignés sur l'Annuaire Santé CNAM (libelle_profession) —
// le filtre utilise ilike '%…%', les valeurs doivent être des sous-chaînes réelles.
export const SPECIALITES = [
  'Médecin généraliste',
  'Pédiatre',
  'Chirurgien-dentiste',
  'Sage-femme',
  'Infirmier',
  'Masseur-kinésithérapeute',
  'Orthophoniste',
  'Cardiologue',
  'Dermatologue',
  'Gynécologue',
  'Ophtalmologiste',
  'ORL',
  'Psychiatre',
  'Radiologue',
  'Rhumatologue',
  'Gastro-entérologue',
  'Pédicure-podologue',
  'Orthoptiste',
] as const;

export const DEPARTEMENTS_DOM = {
  '971': 'Guadeloupe',
  '972': 'Martinique',
  '973': 'Guyane',
  '974': 'La Réunion',
  '976': 'Mayotte',
  '977': 'Saint-Barthélemy',
  '978': 'Saint-Martin',
} as const;

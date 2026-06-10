/**
 * Numéros d'urgence et de garde — DOM-TOM
 *
 * Données statiques embarquées : doivent rester consultables hors-ligne
 * (cyclones, coupures réseau). Vérifier les numéros locaux à chaque
 * rafraîchissement mensuel des données.
 */

export interface NumeroUrgence {
  nom: string;
  numero: string;       // tel: utilisable (chiffres uniquement)
  affichage: string;    // forme lisible "0596 60 60 44"
  description?: string;
}

export interface UrgencesTerritoire {
  territoire: string;
  sosMedecins?: NumeroUrgence;
  pharmaciesGarde: { label: string; url?: string; numero?: string };
}

/** Numéros nationaux — valables sur tout le territoire français */
export const NUMEROS_NATIONAUX: NumeroUrgence[] = [
  { nom: 'SAMU', numero: '15', affichage: '15', description: 'Urgence médicale — 24h/24' },
  { nom: 'Pompiers', numero: '18', affichage: '18', description: 'Incendie, secours' },
  { nom: 'Police / Gendarmerie', numero: '17', affichage: '17' },
  { nom: 'Urgences (UE)', numero: '112', affichage: '112', description: 'Numéro européen, tous secours' },
  { nom: 'Urgences SMS', numero: '114', affichage: '114', description: 'Sourds et malentendants — SMS/visio' },
  { nom: 'Secours en mer', numero: '196', affichage: '196', description: 'CROSS — urgences maritimes' },
  { nom: 'Centre antipoison', numero: '0140054848', affichage: '01 40 05 48 48', description: 'Intoxications — 24h/24 (Paris, couvre les DOM)' },
];

export const URGENCES_PAR_TERRITOIRE: UrgencesTerritoire[] = [
  {
    territoire: 'Martinique',
    sosMedecins: { nom: 'SOS Médecins Martinique', numero: '0596606044', affichage: '0596 60 60 44', description: 'Visites et consultations — soir, week-end, jours fériés' },
    pharmaciesGarde: { label: 'Pharmacies de garde — ARS Martinique', url: 'https://www.martinique.ars.sante.fr' },
  },
  {
    territoire: 'Guadeloupe',
    sosMedecins: { nom: 'SOS Médecins Guadeloupe', numero: '0590901313', affichage: '0590 90 13 13', description: 'Visites et consultations — soir, week-end, jours fériés' },
    pharmaciesGarde: { label: 'Pharmacies de garde — ARS Guadeloupe', url: 'https://www.guadeloupe.ars.sante.fr' },
  },
  {
    territoire: 'Guyane',
    // Pas de SOS Médecins en Guyane — le 15 oriente vers le médecin de garde
    pharmaciesGarde: { label: 'Pharmacies de garde — ARS Guyane', url: 'https://www.guyane.ars.sante.fr' },
  },
  {
    territoire: 'La Réunion',
    sosMedecins: { nom: 'SOS Médecins Réunion', numero: '0262974444', affichage: '0262 97 44 44', description: 'Visites et consultations — soir, week-end, jours fériés' },
    pharmaciesGarde: { label: 'Pharmacies de garde — ARS La Réunion', url: 'https://www.lareunion.ars.sante.fr' },
  },
  {
    territoire: 'Mayotte',
    // Pas de SOS Médecins à Mayotte — le 15 oriente vers le médecin de garde
    pharmaciesGarde: { label: 'Pharmacies de garde — ARS Mayotte', url: 'https://www.mayotte.ars.sante.fr' },
  },
];

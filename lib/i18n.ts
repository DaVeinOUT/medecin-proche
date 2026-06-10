/**
 * i18n léger — interface en créole pour l'ancrage local DOM-TOM.
 *
 * ⚠️ TRADUCTIONS PROVISOIRES : générées automatiquement, à faire relire
 * par des locuteurs natifs avant toute communication publique.
 * Le shimaoré (swb) en particulier demande une validation locale.
 *
 * Langues : fr (français), gcf (créole antillais — Guadeloupe/Martinique),
 * rcf (créole réunionnais), swb (shimaoré — Mayotte).
 */

export type Lang = 'fr' | 'gcf' | 'rcf' | 'swb';

export const LANG_STORAGE_KEY = 'medecin-proche:lang';
export const LANG_EVENT = 'medecin-proche:langchange';

export const LANGS: { code: Lang; label: string }[] = [
  { code: 'fr',  label: 'Français' },
  { code: 'gcf', label: 'Kréyol' },
  { code: 'rcf', label: 'Kréol réyoné' },
  { code: 'swb', label: 'Shimaoré' },
];

type Dict = Record<string, string>;

const FR: Dict = {
  'nav.carte': 'Carte',
  'nav.liste': 'Liste',
  'nav.favoris': 'Favoris',
  'nav.urgences': 'Urgences',
  'search.placeholder': 'Médecin, spécialité ou ville...',
  'sheet.recherche': 'Recherche...',
  'sheet.proximite': 'À proximité',
  'sheet.resultats': 'Résultats',
  'sheet.trouve': 'médecin trouvé',
  'sheet.trouves': 'médecins trouvés',
  'sheet.reduire': 'Réduire ↓',
  'sheet.toutVoir': 'Tout voir ↑',
  'geo.refusee': 'Localisation désactivée — sélectionnez un territoire ou effectuez une recherche',
  'urgences.sousTitre': 'Numéros vitaux et services de garde — disponibles même hors-ligne',
  'urgences.vital': 'Urgence vitale ? Appelez le 15',
  'urgences.vitalSous': 'SAMU — 24h/24, 7j/7',
  'urgences.nationaux': 'Numéros nationaux',
};

const GCF: Dict = {
  'nav.carte': 'Kat',
  'nav.liste': 'Lis',
  'nav.favoris': 'Favori',
  'nav.urgences': 'Ijans',
  'search.placeholder': 'Doktè, spésyalité oben vil...',
  'sheet.recherche': 'Ka chèché...',
  'sheet.proximite': 'Toupre’w',
  'sheet.resultats': 'Rézilta',
  'sheet.trouve': 'doktè touvé',
  'sheet.trouves': 'doktè touvé',
  'sheet.reduire': 'Fèmé ↓',
  'sheet.toutVoir': 'Vwè tout ↑',
  'geo.refusee': 'Lokalizasyon dézaktivé — chwazi on téritwa oben fè on rechèch',
  'urgences.sousTitre': 'Niméwo enpòtan é sèvis gad — menm san rézo',
  'urgences.vital': 'Ijans grav ? Kriyé 15',
  'urgences.vitalSous': 'SAMU — 24è/24, 7j/7',
  'urgences.nationaux': 'Niméwo nasyonal',
};

const RCF: Dict = {
  'nav.carte': 'Kart',
  'nav.liste': 'List',
  'nav.favoris': 'Favori',
  'nav.urgences': 'Irzans',
  'search.placeholder': 'Doktèr, spésialité oubien vil...',
  'sheet.recherche': 'I rod...',
  'sheet.proximite': 'Pré ou',
  'sheet.resultats': 'Rézilta',
  'sheet.trouve': 'doktèr trouvé',
  'sheet.trouves': 'doktèr trouvé',
  'sheet.reduire': 'Ferm ↓',
  'sheet.toutVoir': 'Oir tout ↑',
  'geo.refusee': 'Lokalizasion lé kopé — soizi in téritoir oubien fé in rosèrs',
  'urgences.sousTitre': 'Bann niméro inportan ék servis gard — mèm san rézo',
  'urgences.vital': 'Irzans grav ? Apèl lo 15',
  'urgences.vitalSous': 'SAMU — 24h/24, 7j/7',
  'urgences.nationaux': 'Niméro nasional',
};

const SWB: Dict = {
  'nav.carte': 'Ramani',
  'nav.liste': 'Orodha',
  'nav.favoris': 'Favori',
  'nav.urgences': 'Dharura',
  'search.placeholder': 'Duktera, spesialite au mdji...',
  'sheet.recherche': 'Risi tsaha...',
  'sheet.proximite': 'Karibu',
  'sheet.resultats': 'Matokeo',
  'sheet.trouve': 'duktera apatikana',
  'sheet.trouves': 'maduktera wapatikana',
  'sheet.reduire': 'Funga ↓',
  'sheet.toutVoir': 'Ona piya ↑',
  'geo.refusee': 'Lokalizasioni haitumiyi — tsagua territoire au utsahe',
  'urgences.sousTitre': 'Nambari za dharura na huduma za ulinzi — hata bila réseau',
  'urgences.vital': 'Dharura kubwa ? Pigia 15',
  'urgences.vitalSous': 'SAMU — 24h/24, 7j/7',
  'urgences.nationaux': 'Nambari za taifa',
};

const DICTS: Record<Lang, Dict> = { fr: FR, gcf: GCF, rcf: RCF, swb: SWB };

/** Traduit une clé — repli sur le français si absente */
export function t(lang: Lang, key: string): string {
  return DICTS[lang]?.[key] ?? FR[key] ?? key;
}

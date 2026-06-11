# Design System — « Édition Lagon »

Identité visuelle de Médecin Proche : **éditorial tropical médical**. Ni blanc clinique,
ni bleu hôpital — une fusion premium entre carnet de santé éditorial et lagon caribéen,
pensée pour les DOM-TOM.

## Piliers

| Pilier | Incarnation |
|---|---|
| Encre océan | Chrome de l'app (héros, nav, CTA bar) en `ink-950 #071E1A` — profondeur, calme, confiance |
| Sable chaud | Fonds `sand-50 #FBF7F0`, surfaces `paper #FFFDF9` — jamais de blanc pur |
| Lagon | Action primaire `lagoon-600 #0E8E76`, accents lumineux `lagoon-300/400` sur encre |
| Corail hibiscus | Urgences et favoris `coral-500 #F0604A` — le rouge vital, réservé |
| Mangue | Avertissements doux `mango-500 #E89B2D` |
| Brume | Textes secondaires `mist-500/600` (gris-vert, jamais de gris neutre) |

## Typographie

- **Fraunces** (`--font-display`, classe `font-display`) — titres, compteurs, initiales d'avatar,
  numéros d'urgence. Serif à caractère, chargée via `next/font`.
- **Plus Jakarta Sans** (`--font-sans`, défaut) — UI et corps de texte.
- **`.label-mono`** — étiquettes uppercase espacées (10px/800/0.16em) : contexte, sections, distances.
- **`.tnum`** — chiffres tabulaires (distances, téléphones, compteurs).

## Signatures visuelles

1. **ECG-vague** (`components/PulseLine.tsx`) — un battement cardiaque qui se fond en houle.
   Divider du bottom sheet, héros, états vides. `animated` = tracé voyageant (`.ecg-path`),
   neutralisé par `prefers-reduced-motion`.
2. **Grain papier** (`.grain`) — bruit SVG (feTurbulence) à 5,5 % sur héros encre et bottom sheet.
3. **Aurora** (`.aurora`) — halos flous colorés sur les héros encre ; la teinte vient de la
   spécialité (`avatarAurora()` dans `lib/avatar.ts`).
4. **Carte teintée** — filtre CSS sur `.leaflet-tile-pane` (saturate/hue-rotate/sepia) : les tuiles
   OSM prennent la teinte sable-lagon de la marque.
5. **Verre encré** (`.glass-ink`) — capsule header, chips territoires, bottom nav flottante,
   barre CTA de la fiche : encre à 86 % + blur 16px + liseré `white/9`.
6. **Monogramme** (`components/BrandMark.tsx`) — croix médicale en filigrane + ligne de pouls
   lagon + point corail (la localisation).

## Composants clés

- **Bottom nav** : capsule flottante `glass-ink` arrondie 28px, item actif `lagoon-300` sur
  `white/10`, Urgences toujours en corail. Hauteur réservée : `--bottom-nav-height: 88px`.
- **Bottom sheet** : `paper`, rayon 28px, grain, poignée sable ; en-tête = label-mono du contexte
  + compteur en Fraunces 26px + PulseLine animée. Peek : `--bottom-sheet-peek: 236px`.
- **Carte médecin** (`.medecin-card`) : paper, bordure `sand-200`, avatar squircle aux initiales
  Fraunces teintées spécialité, pastille « Disponible » lagon pulsante / « Complet » brume
  (le rouge est réservé aux urgences), bouton appel `lagoon-600` 44px.
- **Pins carte** (`.pin-medecin`) : goutte encre, croix lagon ; position utilisateur `.user-dot`
  avec onde. Popups crème éditoriales (nom en Fraunces via `var(--font-display)`).
- **Statuts** : jamais de couleur seule — toujours pastille + libellé.

## Accessibilité (socle santé)

- Contrastes AA : corps `ink-950` sur sable ; `mist-600` minimum pour le texte secondaire ;
  blanc sur `lagoon-600`/`coral-600` ; libellés sous chaque icône de nav.
- `:focus-visible` global lagon 3px ; cibles tactiles ≥ 44px ; `prefers-reduced-motion`
  désactive ECG, halos pulsés, transitions du sheet.

## Garde-fous

- Le **rouge/corail** signifie « vital » : urgences, cœur favoris. Pas pour « cabinet complet ».
- Fraunces ne descend jamais sous 14px ; l'UI courante reste en Jakarta.
- Tout nouvel écran : fond `sand-50`, surfaces `paper` bordées `sand-200`, héros `ink-950 grain`
  + aurora, sections en `.label-mono`.

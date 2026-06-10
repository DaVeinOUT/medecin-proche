#!/bin/bash
# ============================================================
# Téléchargement Annuaire Santé DOM-TOM — Opendatasoft / CNAM
# Source : annuaire-des-professionnels-de-sante (toutes professions :
#          médecins, dentistes, sages-femmes, kinés, infirmiers,
#          orthophonistes…) avec convention, téléphone, horaires
#          (une ligne par créneau jour/heure_debut/heure_fin)
#
# Usage : npm run download-data
# ============================================================

set -e

mkdir -p data

# where=dep_name IN ('Martinique','Guadeloupe','Guyane','La Réunion','Mayotte','Saint-Barthélemy','Saint-Martin')
EXPORT_URL="https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/annuaire-des-professionnels-de-sante/exports/csv?where=dep_name%20IN%20('Martinique'%2C'Guadeloupe'%2C'Guyane'%2C'La%20R%C3%A9union'%2C'Mayotte'%2C'Saint-Barth%C3%A9lemy'%2C'Saint-Martin')&select=nom%2Ccivilite%2Clibelle_profession%2Cadresse3%2Cadresse4%2Ccode_postal%2Ctelephone%2Cconvention%2Ccoordonnees%2Cadresse%2Cdep_name%2Cjour%2Cheure_debut%2Cheure_fin&delimiter=%3B&lang=fr"

echo "📥 Téléchargement Annuaire Santé DOM-TOM (CNAM)..."
echo "   Source  : Opendatasoft / CNAM — toutes professions de santé"
echo "   Filtres : Martinique · Guadeloupe · Guyane · Réunion · Mayotte · Saint-Barthélemy · Saint-Martin"
echo "   Champs  : Nom, Profession, GPS, Convention, Téléphone, Adresse, Horaires"
echo ""

curl -L "$EXPORT_URL" \
  -o data/professionnels_domtom.csv \
  --progress-bar \
  -H "Accept: text/csv"

echo ""
echo "✅ Fichier téléchargé : data/professionnels_domtom.csv"
echo "   Taille : $(du -sh data/professionnels_domtom.csv | cut -f1)"
echo "   Lignes : $(wc -l < data/professionnels_domtom.csv)"
echo ""
echo "▶️  Lancer l'import : npm run import"
echo "   (premier import après changement de source : npm run import -- --reset)"

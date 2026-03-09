#!/bin/bash
# ============================================================
# Téléchargement Annuaire Santé DOM-TOM — Opendatasoft / CNAM
# Source : Annuaire Santé (CNAM) — données géolocalisées
#          avec secteur de convention, spécialité, téléphone
#
# Usage : npm run download-data
# ============================================================

set -e

mkdir -p data

EXPORT_URL="https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/medecins/exports/csv?where=dep_code%20IN%20('971'%2C'972'%2C'973'%2C'974'%2C'976')&select=nom%2Ccivilite%2Ccolumn_10%2Ccolumn_14%2Clibelle_profession%2Ccoordonnees%2Ccommune%2Cdep_code%2Cdep_name%2Cconcat&delimiter=%3B&lang=fr"

echo "📥 Téléchargement Annuaire Santé DOM-TOM (CNAM)..."
echo "   Source  : Opendatasoft / CNAM — données géolocalisées"
echo "   Filtres : Martinique · Guadeloupe · Guyane · Réunion · Mayotte"
echo "   Champs  : Nom, Spécialité, GPS, Convention, Téléphone, Ville"
echo ""

curl -L "$EXPORT_URL" \
  -o data/medecins_domtom.csv \
  --progress-bar \
  -H "Accept: text/csv"

echo ""
echo "✅ Fichier téléchargé : data/medecins_domtom.csv"
echo "   Taille : $(du -sh data/medecins_domtom.csv | cut -f1)"
echo "   Lignes : $(wc -l < data/medecins_domtom.csv)"
echo ""
echo "▶️  Lancer l'import : npm run import"

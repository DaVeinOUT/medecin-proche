-- ============================================================
-- MÉDECIN PROCHE — Schéma Supabase
-- À exécuter dans : Supabase > SQL Editor
-- ============================================================

-- 1. Activer PostGIS (extension géographique)
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- ============================================================
-- 2. Table principale des médecins
-- ============================================================
CREATE TABLE IF NOT EXISTS medecins (
  id                        UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nom                       VARCHAR(255) NOT NULL,
  prenom                    VARCHAR(255),
  specialite                VARCHAR(100) NOT NULL,
  adresse                   TEXT NOT NULL,
  ville                     VARCHAR(100) NOT NULL,
  code_postal               VARCHAR(10),
  departement               VARCHAR(3),  -- ex: '972', '973'
  territoire                VARCHAR(50), -- 'Martinique', 'Guadeloupe', 'Guyane'...
  telephone                 VARCHAR(20),
  secteur                   INTEGER CHECK (secteur IN (1, 2, 3)) DEFAULT 1,
  horaires                  JSONB,       -- {"lun": "08h-12h", "mar": "08h-12h", ...}
  langues                   TEXT[],      -- ['Français', 'Créole martiniquais']
  accepte_nouveaux_patients BOOLEAN DEFAULT true,
  rpps                      VARCHAR(20),
  localisation              GEOGRAPHY(POINT, 4326) NOT NULL,
  source                    VARCHAR(50) DEFAULT 'data.gouv.fr',
  created_at                TIMESTAMPTZ DEFAULT now(),
  updated_at                TIMESTAMPTZ DEFAULT now(),
  UNIQUE (nom, adresse, specialite)             -- Contrainte de déduplication
);

-- ============================================================
-- 3. Index pour les performances
-- ============================================================

-- Index géographique (requêtes de proximité)
CREATE INDEX IF NOT EXISTS idx_medecins_localisation
  ON medecins USING GIST(localisation);

-- Index sur la spécialité (filtres fréquents)
CREATE INDEX IF NOT EXISTS idx_medecins_specialite
  ON medecins(specialite);

-- Index sur le département (filtres DOM-TOM)
CREATE INDEX IF NOT EXISTS idx_medecins_departement
  ON medecins(departement);

-- Index sur secteur
CREATE INDEX IF NOT EXISTS idx_medecins_secteur
  ON medecins(secteur);

-- Index sur territoire (requêtes getMedecinsByTerritoire avec eq())
CREATE INDEX IF NOT EXISTS idx_medecins_territoire
  ON medecins(territoire);

-- Index composite territoire + specialite (filtre combiné fréquent)
CREATE INDEX IF NOT EXISTS idx_medecins_territoire_specialite
  ON medecins(territoire, specialite);

-- ============================================================
-- 4. Trigger : mise à jour automatique de updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_medecins_updated_at ON medecins;
CREATE TRIGGER trg_medecins_updated_at
  BEFORE UPDATE ON medecins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 5. Fonction PostGIS : médecins dans un rayon
--    Appelée via supabase.rpc('medecins_proches', {...})
-- ============================================================
CREATE OR REPLACE FUNCTION medecins_proches(
  user_lat  FLOAT,
  user_lng  FLOAT,
  rayon_km  FLOAT DEFAULT 10
)
RETURNS TABLE (
  id                        UUID,
  nom                       VARCHAR,
  prenom                    VARCHAR,
  specialite                VARCHAR,
  adresse                   TEXT,
  ville                     VARCHAR,
  code_postal               VARCHAR,
  territoire                VARCHAR,
  telephone                 VARCHAR,
  secteur                   INTEGER,
  horaires                  JSONB,
  langues                   TEXT[],
  accepte_nouveaux_patients BOOLEAN,
  lat                       FLOAT,
  lng                       FLOAT,
  distance                  FLOAT  -- en mètres
)
LANGUAGE sql STABLE AS $$
  SELECT
    m.id,
    m.nom,
    m.prenom,
    m.specialite,
    m.adresse,
    m.ville,
    m.code_postal,
    m.territoire,
    m.telephone,
    m.secteur,
    m.horaires,
    m.langues,
    m.accepte_nouveaux_patients,
    ST_Y(m.localisation::geometry)  AS lat,
    ST_X(m.localisation::geometry)  AS lng,
    ST_Distance(
      m.localisation,
      ST_MakePoint(user_lng, user_lat)::geography
    ) AS distance
  FROM medecins m
  WHERE ST_DWithin(
    m.localisation,
    ST_MakePoint(user_lng, user_lat)::geography,
    rayon_km * 1000  -- convertir km → mètres
  )
  ORDER BY distance ASC
  LIMIT 50;
$$;

-- ============================================================
-- 6. Sécurité Row Level Security (RLS)
-- ============================================================
ALTER TABLE medecins ENABLE ROW LEVEL SECURITY;

-- Lecture publique (tous les utilisateurs)
DROP POLICY IF EXISTS "lecture_publique" ON medecins;
CREATE POLICY "lecture_publique"
  ON medecins FOR SELECT
  USING (true);

-- Écriture réservée aux admins authentifiés
DROP POLICY IF EXISTS "ecriture_admin" ON medecins;
CREATE POLICY "ecriture_admin"
  ON medecins FOR ALL
  USING (auth.role() = 'authenticated');

-- ============================================================
-- 7. Vue pratique : médecins avec lat/lng extraits
-- ============================================================
CREATE OR REPLACE VIEW medecins_vue AS
SELECT
  id, nom, prenom, specialite, adresse, ville,
  code_postal, departement, territoire, telephone,
  secteur, horaires, langues, accepte_nouveaux_patients,
  ST_Y(localisation::geometry) AS lat,
  ST_X(localisation::geometry) AS lng,
  created_at, updated_at
FROM medecins;

-- ============================================================
-- 8. Données de test (DOM-TOM)
-- ============================================================
INSERT INTO medecins (nom, prenom, specialite, adresse, ville, code_postal, departement, territoire, telephone, secteur, langues, accepte_nouveaux_patients, localisation)
VALUES
  -- Martinique
  ('MARTIN', 'Sophie', 'Médecine générale', '12 Rue de la République', 'Fort-de-France', '97200', '972', 'Martinique', '0596600001', 1, ARRAY['Français', 'Créole martiniquais'], true, ST_MakePoint(-61.0588, 14.6037)::geography),
  ('BERNARD', 'Jean-Claude', 'Pédiatrie', '45 Blvd du Général de Gaulle', 'Fort-de-France', '97200', '972', 'Martinique', '0596600002', 2, ARRAY['Français'], true, ST_MakePoint(-61.0620, 14.6080)::geography),
  ('JOSEPH', 'Marie-France', 'Cardiologie', '8 Rue Victor Hugo', 'Le Lamentin', '97232', '972', 'Martinique', '0596600003', 1, ARRAY['Français', 'Créole martiniquais'], false, ST_MakePoint(-60.9932, 14.5968)::geography),
  ('CELESTIN', 'Patrick', 'Dermatologie', '3 Rue Schœlcher', 'Schoelcher', '97233', '972', 'Martinique', '0596600004', 2, ARRAY['Français'], true, ST_MakePoint(-61.1013, 14.6195)::geography),
  ('RAMIREZ', 'Laura', 'Gynécologie-Obstétrique', '20 Rue du Marché', 'Saint-Pierre', '97250', '972', 'Martinique', '0596600005', 1, ARRAY['Français', 'Espagnol'], true, ST_MakePoint(-61.1779, 14.7436)::geography),

  -- Guadeloupe
  ('DURAND', 'Pierre', 'Médecine générale', '15 Rue Frébault', 'Pointe-à-Pitre', '97110', '971', 'Guadeloupe', '0590600001', 1, ARRAY['Français', 'Créole guadeloupéen'], true, ST_MakePoint(-61.5333, 16.2417)::geography),
  ('LACOUR', 'Émilie', 'Ophtalmologie', '7 Blvd Légitimus', 'Pointe-à-Pitre', '97110', '971', 'Guadeloupe', '0590600002', 2, ARRAY['Français'], false, ST_MakePoint(-61.5370, 16.2440)::geography),
  ('MONTROSE', 'Thierry', 'ORL', '32 Rue Nozières', 'Basse-Terre', '97100', '971', 'Guadeloupe', '0590600003', 1, ARRAY['Français', 'Créole guadeloupéen'], true, ST_MakePoint(-61.7250, 16.0090)::geography),
  ('VIGNERON', 'Cécile', 'Psychiatrie', '5 Impasse des Flamboyants', 'Abymes', '97139', '971', 'Guadeloupe', '0590600004', 2, ARRAY['Français'], true, ST_MakePoint(-61.5073, 16.2678)::geography),

  -- Guyane
  ('POMPEE', 'Régis', 'Médecine générale', '10 Av. du Général de Gaulle', 'Cayenne', '97300', '973', 'Guyane', '0594600001', 1, ARRAY['Français', 'Créole guyanais'], true, ST_MakePoint(-52.3261, 4.9372)::geography),
  ('LAFLEUR', 'Christiane', 'Pédiatrie', '3 Rue Justin Catayée', 'Cayenne', '97300', '973', 'Guyane', '0594600002', 1, ARRAY['Français', 'Créole guyanais', 'Portugais'], true, ST_MakePoint(-52.3310, 4.9402)::geography),
  ('TIOUKA', 'Marc', 'Médecine générale', '1 Rue du Marché', 'Saint-Laurent-du-Maroni', '97320', '973', 'Guyane', '0594600003', 1, ARRAY['Français', 'Taki-Taki'], false, ST_MakePoint(-54.0347, 5.4997)::geography),
  ('WONG', 'Linda', 'Dermatologie', '22 Rue Lieutenant Goursolas', 'Cayenne', '97300', '973', 'Guyane', '0594600004', 2, ARRAY['Français', 'Chinois'], true, ST_MakePoint(-52.3280, 4.9350)::geography)
ON CONFLICT (nom, adresse, specialite) DO NOTHING;

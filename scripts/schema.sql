-- Activation de l'extension PostGIS pour la géolocalisation
CREATE EXTENSION IF NOT EXISTS postgis;

-- Types ENUM pour les centres de santé
CREATE TYPE centre_type AS ENUM (
  'hopital_public',
  'hopital_prive',
  'centre_sante',
  'clinique',
  'maternite',
  'dispensaire',
  'cabinet_medical'
);

CREATE TYPE statut_centre AS ENUM (
  'actif',
  'en_attente',
  'suspendu',
  'ferme'
);

-- Table principale des centres de santé
CREATE TABLE centres_sante (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom VARCHAR(255) NOT NULL,
  type_centre centre_type NOT NULL,
  statut statut_centre DEFAULT 'en_attente',
  
  -- Localisation
  adresse_complete TEXT NOT NULL,
  ville VARCHAR(100) NOT NULL,
  commune VARCHAR(100),
  quartier VARCHAR(100),
  geolocation GEOMETRY(POINT, 4326), -- PostGIS pour géolocalisation
  
  -- Contact
  telephone VARCHAR(20),
  whatsapp VARCHAR(20),
  email VARCHAR(255),
  site_web VARCHAR(255),
  
  -- Services et horaires
  services TEXT[] DEFAULT '{}',
  specialites TEXT[] DEFAULT '{}',
  horaires JSONB, -- Format: {"lundi": {"ouvert": true, "debut": "08:00", "fin": "17:00"}}
  urgences_24h BOOLEAN DEFAULT FALSE,
  
  -- Accessibilité
  accessibilite_handicapes BOOLEAN DEFAULT FALSE,
  parking_disponible BOOLEAN DEFAULT FALSE,
  transport_public BOOLEAN DEFAULT FALSE,
  
  -- Média
  photos TEXT[] DEFAULT '{}', -- URLs Supabase Storage
  description TEXT,
  
  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  -- SEO
  slug VARCHAR(255) UNIQUE NOT NULL
);

-- Table des évaluations (optionnel)
CREATE TABLE evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  centre_id UUID REFERENCES centres_sante(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  note INTEGER CHECK (note >= 1 AND note <= 5),
  commentaire TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les performances

-- Index géospatial pour les recherches par proximité
CREATE INDEX idx_centres_geolocation ON centres_sante USING GIST(geolocation);

-- Index pour la recherche textuelle (français)
CREATE INDEX idx_centres_search ON centres_sante USING GIN(
  to_tsvector('french', nom || ' ' || ville || ' ' || COALESCE(quartier, '') || ' ' || array_to_string(services, ' '))
);

-- Index pour les filtres courants
CREATE INDEX idx_centres_ville ON centres_sante(ville);
CREATE INDEX idx_centres_type ON centres_sante(type_centre);
CREATE INDEX idx_centres_urgences ON centres_sante(urgences_24h);
CREATE INDEX idx_centres_statut ON centres_sante(statut);
CREATE INDEX idx_centres_slug ON centres_sante(slug);

-- Index pour les services (recherche dans les tableaux)
CREATE INDEX idx_centres_services ON centres_sante USING GIN(services);
CREATE INDEX idx_centres_specialites ON centres_sante USING GIN(specialites);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_centres_sante_updated_at 
    BEFORE UPDATE ON centres_sante 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Activer RLS sur les tables
ALTER TABLE centres_sante ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;

-- Politique : Le public peut voir les centres actifs
CREATE POLICY "Public can view active centres" ON centres_sante
  FOR SELECT USING (statut = 'actif');

-- Politique : Les utilisateurs authentifiés peuvent ajouter des centres (en attente de modération)
CREATE POLICY "Authenticated users can insert centres for moderation" ON centres_sante
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND statut = 'en_attente'
  );

-- Politique : Les créateurs peuvent modifier leurs propres centres
CREATE POLICY "Users can update their own centres" ON centres_sante
  FOR UPDATE USING (auth.uid() = created_by);

-- Politique : Les admins peuvent tout faire
CREATE POLICY "Admins can manage all centres" ON centres_sante
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin' OR
    auth.jwt() ->> 'user_role' = 'admin'
  );

-- Politique pour les évaluations : lecture publique
CREATE POLICY "Public can view evaluations" ON evaluations
  FOR SELECT USING (true);

-- Politique pour les évaluations : les utilisateurs authentifiés peuvent en créer
CREATE POLICY "Authenticated users can create evaluations" ON evaluations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Politique pour les évaluations : les utilisateurs peuvent modifier leurs propres évaluations
CREATE POLICY "Users can update their own evaluations" ON evaluations
  FOR UPDATE USING (auth.uid() = user_id);

-- Fonction utilitaire pour générer un slug
CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(input_text, '[àáâãäåæçèéêëìíîïñòóôõöøùúûüýÿ]', 
          translate(input_text, 'àáâãäåæçèéêëìíîïñòóôõöøùúûüýÿ', 'aaaaaaaceeeeiiiinooooooouuuuyyy'), 'g'),
        '[^a-z0-9\s-]', '', 'g'),
      '\s+', '-', 'g')
  );
END;
$$ LANGUAGE plpgsql;
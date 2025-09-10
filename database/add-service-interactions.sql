-- =============================================
-- AJOUT DE LA TABLE service_interactions
-- Script à exécuter dans Supabase SQL Editor
-- =============================================

-- Créer la table service_interactions
CREATE TABLE service_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Type d'interaction
    interaction_type VARCHAR(50) NOT NULL CHECK (interaction_type IN (
        'service_search',      -- Recherche incluant un service spécifique
        'service_filter',      -- Utilisation du filtre services
        'service_click',       -- Clic sur un service dans la page d'accueil
        'popular_service_click', -- Clic sur un service populaire
        'center_type_filter',  -- Utilisation du filtre type de centre
        'emergency_filter',    -- Utilisation du filtre urgences 24h
        'accessibility_filter', -- Utilisation du filtre accessibilité
        'text_search',         -- Recherche textuelle
        'center_view',         -- Consultation d'un centre
        'center_contact'       -- Tentative de contact d'un centre
    )),
    
    -- Données de l'interaction
    service_name VARCHAR(255),        -- Nom du service (si applicable)
    center_type VARCHAR(50),          -- Type de centre (si applicable)
    center_id UUID REFERENCES health_centers(id), -- Centre concerné (si applicable)
    search_term VARCHAR(255),         -- Terme de recherche (si applicable)
    filter_values JSONB,              -- Valeurs des filtres appliqués
    
    -- Contexte de l'interaction
    page_url VARCHAR(500),            -- Page où l'interaction a eu lieu
    referrer_url VARCHAR(500),        -- Page précédente
    session_id VARCHAR(255),          -- ID de session utilisateur
    
    -- Informations utilisateur
    user_id UUID REFERENCES auth.users(id),
    ip_address INET,
    user_agent TEXT,
    user_position GEOMETRY(POINT, 4326),
    
    -- Métadonnées
    result_count INTEGER,             -- Nombre de résultats (pour les recherches)
    interaction_value INTEGER DEFAULT 1  -- Poids de l'interaction (pour pondération)
);

-- Créer les index pour optimiser les performances
CREATE INDEX idx_service_interactions_type ON service_interactions(interaction_type);
CREATE INDEX idx_service_interactions_service ON service_interactions(service_name) WHERE service_name IS NOT NULL;
CREATE INDEX idx_service_interactions_center_type ON service_interactions(center_type) WHERE center_type IS NOT NULL;
CREATE INDEX idx_service_interactions_created_at ON service_interactions(created_at);
CREATE INDEX idx_service_interactions_type_service ON service_interactions(interaction_type, service_name) WHERE service_name IS NOT NULL;
CREATE INDEX idx_service_interactions_session ON service_interactions(session_id) WHERE session_id IS NOT NULL;

-- Activer RLS (Row Level Security)
ALTER TABLE service_interactions ENABLE ROW LEVEL SECURITY;

-- Policy pour permettre l'insertion anonyme (pour le tracking)
CREATE POLICY "Anyone can insert interactions" ON service_interactions
    FOR INSERT WITH CHECK (true);

-- Policy pour les admins seulement en lecture
CREATE POLICY "Admin can read all interactions" ON service_interactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND role IN ('admin', 'super_admin', 'moderator')
        )
    );

-- Commentaires pour documentation
COMMENT ON TABLE service_interactions IS 'Table de tracking des interactions utilisateur pour analytics';
COMMENT ON COLUMN service_interactions.interaction_type IS 'Type d''interaction (search, click, filter, etc.)';
COMMENT ON COLUMN service_interactions.interaction_value IS 'Poids de l''interaction pour calcul de popularité';
COMMENT ON COLUMN service_interactions.session_id IS 'ID de session unique pour regrouper les actions utilisateur';

-- Vérifier que la table a été créée
SELECT 
    'service_interactions table created successfully' as status,
    COUNT(*) as initial_row_count
FROM service_interactions;
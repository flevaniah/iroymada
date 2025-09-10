-- =============================================
-- MADAGASCAR HEALTH DIRECTORY DATABASE SCHEMA (VERSION FIANARANTSOA)
-- Supabase PostgreSQL + PostGIS
-- =============================================
-- Enable PostGIS extension for geospatial data
CREATE EXTENSION IF NOT EXISTS postgis;
-- Enable UUID generation extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABLE: health_centers (mise à jour pour Fianarantsoa)
-- =============================================
CREATE TABLE health_centers (
    -- Identifiers and metadata
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- General information
    name VARCHAR(255) NOT NULL,
    description TEXT,
    center_type VARCHAR(50) NOT NULL CHECK (center_type IN (
        -- Types existants
        'public_hospital', 'private_hospital', 'private_clinic', 'health_center',
        'dispensary', 'maternity', 'specialized_center', 'laboratory',
        'pharmacy', 'medical_office', 'dialysis_center',

        -- Nouveaux types pour Fianarantsoa
        'fire_station', 'fire_hydrant', 'police_station', 'gendarmerie',
        'jirama_office', 'red_cross', 'samu', 'ngo_medical', 'other'
    )),
    service_category VARCHAR(50) NOT NULL CHECK (service_category IN (
        'health', 'fire_rescue', 'security', 'essential_services', 'other'
    )),

    -- Location (focus Fianarantsoa)
    full_address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL DEFAULT 'Fianarantsoa',
    district VARCHAR(100),
    postal_code VARCHAR(10),
    region VARCHAR(100) NOT NULL DEFAULT 'Haute Matsiatra',

    -- Geographic coordinates (PostGIS)
    coordinates GEOMETRY(POINT, 4326),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),

    -- Contact information
    phone VARCHAR(20),
    secondary_phone VARCHAR(20),
    whatsapp VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(500),

    -- Services and specialties
    services JSONB DEFAULT '[]'::jsonb,
    specialties JSONB DEFAULT '[]'::jsonb,

    -- Features
    emergency_24h BOOLEAN DEFAULT FALSE,
    wheelchair_accessible BOOLEAN DEFAULT FALSE,
    parking_available BOOLEAN DEFAULT FALSE,
    public_transport BOOLEAN DEFAULT FALSE,

    -- Opening hours
    opening_hours JSONB DEFAULT '{}'::jsonb,

    -- Media
    photos JSONB DEFAULT '[]'::jsonb,
    logo_url VARCHAR(500),

    -- Administration
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
    admin_notes TEXT,
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMP WITH TIME ZONE,

    -- Statistics
    view_count INTEGER DEFAULT 0,
    last_viewed TIMESTAMP WITH TIME ZONE,

    -- User metadata
    created_by UUID REFERENCES auth.users(id),
    contact_email VARCHAR(255),

    -- Search index
    search_vector TSVECTOR
);

-- =============================================
-- TABLE: user_profiles (inchangée)
-- =============================================
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin', 'super_admin')),
    preferred_city VARCHAR(100) DEFAULT 'Fianarantsoa',
    email_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP WITH TIME ZONE,
    avatar_url VARCHAR(500)
);

-- =============================================
-- TABLE: modification_requests (inchangée)
-- =============================================
CREATE TABLE modification_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    center_id UUID NOT NULL REFERENCES health_centers(id) ON DELETE CASCADE,
    requester_id UUID REFERENCES auth.users(id),
    requester_email VARCHAR(255),
    modification_type VARCHAR(50) NOT NULL CHECK (modification_type IN (
        'general_info', 'contact', 'hours', 'services', 'location', 'photos', 'deletion', 'other'
    )),
    requested_changes JSONB NOT NULL,
    justification TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    processed_by UUID REFERENCES auth.users(id),
    processed_at TIMESTAMP WITH TIME ZONE,
    admin_comment TEXT
);

-- =============================================
-- TABLE: reviews (inchangée)
-- =============================================
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    center_id UUID NOT NULL REFERENCES health_centers(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    care_quality INTEGER CHECK (care_quality >= 1 AND care_quality <= 5),
    reception INTEGER CHECK (reception >= 1 AND reception <= 5),
    waiting_time INTEGER CHECK (waiting_time >= 1 AND waiting_time <= 5),
    cleanliness INTEGER CHECK (cleanliness >= 1 AND cleanliness <= 5),
    approved BOOLEAN DEFAULT FALSE,
    moderated_by UUID REFERENCES auth.users(id),
    ip_address INET,
    user_agent TEXT
);

-- =============================================
-- TABLE: search_statistics (adaptée pour Fianarantsoa)
-- =============================================
CREATE TABLE search_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    search_term VARCHAR(255),
    city VARCHAR(100) DEFAULT 'Fianarantsoa',
    center_type VARCHAR(50),
    service_category VARCHAR(50),
    applied_filters JSONB,
    result_count INTEGER,
    displayed_centers JSONB,
    user_id UUID REFERENCES auth.users(id),
    ip_address INET,
    user_agent TEXT,
    user_position GEOMETRY(POINT, 4326)
);

-- =============================================
-- TABLE: service_interactions (nouveau tracking détaillé)
-- =============================================
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

-- =============================================
-- TABLE: admin_logs (inchangée)
-- =============================================
CREATE TABLE admin_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    admin_id UUID NOT NULL REFERENCES auth.users(id),
    action VARCHAR(100) NOT NULL,
    affected_table VARCHAR(50),
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    comment TEXT,
    ip_address INET,
    user_agent TEXT
);

-- =============================================
-- INDEXES (optimisés pour Fianarantsoa)
-- =============================================
CREATE INDEX idx_centers_coordinates ON health_centers USING GIST(coordinates);
CREATE INDEX idx_centers_search ON health_centers USING GIN(search_vector);
CREATE INDEX idx_centers_name ON health_centers(name);
CREATE INDEX idx_centers_city ON health_centers(city);
CREATE INDEX idx_centers_type ON health_centers(center_type);
CREATE INDEX idx_centers_category ON health_centers(service_category);
CREATE INDEX idx_centers_status ON health_centers(status);
CREATE INDEX idx_centers_emergency ON health_centers(emergency_24h) WHERE emergency_24h = TRUE;
CREATE INDEX idx_centers_city_type ON health_centers(city, center_type);
CREATE INDEX idx_centers_city_category ON health_centers(city, service_category);
CREATE INDEX idx_centers_status_updated ON health_centers(status, updated_at);

-- Index pour service_interactions
CREATE INDEX idx_service_interactions_type ON service_interactions(interaction_type);
CREATE INDEX idx_service_interactions_service ON service_interactions(service_name) WHERE service_name IS NOT NULL;
CREATE INDEX idx_service_interactions_center_type ON service_interactions(center_type) WHERE center_type IS NOT NULL;
CREATE INDEX idx_service_interactions_created_at ON service_interactions(created_at);
CREATE INDEX idx_service_interactions_type_service ON service_interactions(interaction_type, service_name) WHERE service_name IS NOT NULL;
CREATE INDEX idx_service_interactions_session ON service_interactions(session_id) WHERE session_id IS NOT NULL;

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================
-- Update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for health_centers
CREATE TRIGGER update_health_centers_updated_at
    BEFORE UPDATE ON health_centers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update search vector
CREATE OR REPLACE FUNCTION update_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := to_tsvector('french',
        COALESCE(NEW.name, '') || ' ' ||
        COALESCE(NEW.description, '') || ' ' ||
        COALESCE(NEW.city, '') || ' ' ||
        COALESCE(NEW.district, '') || ' ' ||
        COALESCE(NEW.full_address, '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for search vector
CREATE TRIGGER update_centers_search_vector
    BEFORE INSERT OR UPDATE ON health_centers
    FOR EACH ROW
    EXECUTE FUNCTION update_search_vector();

-- Sync coordinates
CREATE OR REPLACE FUNCTION sync_coordinates()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
        NEW.coordinates := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
    ELSIF NEW.coordinates IS NOT NULL THEN
        NEW.latitude := ST_Y(NEW.coordinates);
        NEW.longitude := ST_X(NEW.coordinates);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to sync coordinates
CREATE TRIGGER sync_centers_coordinates
    BEFORE INSERT OR UPDATE ON health_centers
    FOR EACH ROW
    EXECUTE FUNCTION sync_coordinates();

-- =============================================
-- VIEWS (adaptées pour Fianarantsoa)
-- =============================================
-- Approved centers with stats
CREATE VIEW public_health_centers AS
SELECT
    c.*,
    ROUND(AVG(r.rating), 2) as average_rating,
    COUNT(r.id) as review_count,
    ST_Y(c.coordinates) as lat,
    ST_X(c.coordinates) as lng
FROM health_centers c
LEFT JOIN reviews r ON c.id = r.center_id AND r.approved = TRUE
WHERE c.status = 'approved' AND c.city = 'Fianarantsoa'
GROUP BY c.id;

-- Dashboard stats (Fianarantsoa only)
CREATE VIEW dashboard_statistics AS
SELECT
    COUNT(*) FILTER (WHERE status = 'approved') as approved_centers,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_centers,
    COUNT(*) FILTER (WHERE status = 'rejected') as rejected_centers,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as new_this_week,
    COUNT(*) as total_centers
FROM health_centers
WHERE city = 'Fianarantsoa';

-- Centers by category (Fianarantsoa only)
CREATE VIEW centers_by_category AS
SELECT
    service_category,
    COUNT(*) as count
FROM health_centers
WHERE status = 'approved' AND city = 'Fianarantsoa'
GROUP BY service_category;

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
ALTER TABLE health_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE modification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- Policies for health_centers
CREATE POLICY "Approved centers publicly visible" ON health_centers
    FOR SELECT USING (status = 'approved' AND city = 'Fianarantsoa');

CREATE POLICY "Users see their own centers" ON health_centers
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can create centers" ON health_centers
    FOR INSERT WITH CHECK (auth.uid() = created_by AND city = 'Fianarantsoa');

CREATE POLICY "Admin full access to centers" ON health_centers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND role IN ('admin', 'super_admin', 'moderator')
        )
    );

-- Policies for other tables (unchanged)
CREATE POLICY "Users manage their own profile" ON user_profiles
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "Approved reviews are public" ON reviews
    FOR SELECT USING (approved = TRUE);

CREATE POLICY "Users can create reviews" ON reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin logs for admins only" ON admin_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND role IN ('admin', 'super_admin')
        )
    );

-- =============================================
-- CUSTOM API FUNCTION (filtre par défaut sur Fianarantsoa)
-- =============================================
CREATE OR REPLACE FUNCTION search_health_centers(
    p_latitude DECIMAL DEFAULT NULL,
    p_longitude DECIMAL DEFAULT NULL,
    p_radius_km INTEGER DEFAULT 50,
    p_query TEXT DEFAULT '',
    p_center_type TEXT DEFAULT '',
    p_service_category TEXT DEFAULT '',
    p_emergency_24h BOOLEAN DEFAULT NULL,
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    city VARCHAR,
    center_type VARCHAR,
    service_category VARCHAR,
    full_address TEXT,
    phone VARCHAR,
    emergency_24h BOOLEAN,
    latitude DECIMAL,
    longitude DECIMAL,
    distance_km DECIMAL,
    average_rating DECIMAL,
    review_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.name,
        c.city,
        c.center_type,
        c.service_category,
        c.full_address,
        c.phone,
        c.emergency_24h,
        c.latitude,
        c.longitude,
        CASE
            WHEN p_latitude IS NOT NULL AND p_longitude IS NOT NULL THEN
                ROUND((ST_Distance(
                    c.coordinates,
                    ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)
                ) / 1000)::DECIMAL, 2)
            ELSE NULL
        END as distance_km,
        ROUND(AVG(r.rating), 2) as average_rating,
        COUNT(r.id) as review_count
    FROM health_centers c
    LEFT JOIN reviews r ON c.id = r.center_id AND r.approved = TRUE
    WHERE
        c.status = 'approved'
        AND c.city = 'Fianarantsoa'
        AND (p_query = '' OR c.search_vector @@ plainto_tsquery('french', p_query))
        AND (p_center_type = '' OR c.center_type = p_center_type)
        AND (p_service_category = '' OR c.service_category = p_service_category)
        AND (p_emergency_24h IS NULL OR c.emergency_24h = p_emergency_24h)
        AND (
            p_latitude IS NULL OR p_longitude IS NULL OR
            ST_DWithin(
                c.coordinates,
                ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326),
                p_radius_km * 1000
            )
        )
    GROUP BY c.id
    ORDER BY
        CASE
            WHEN p_latitude IS NOT NULL AND p_longitude IS NOT NULL THEN
                ST_Distance(c.coordinates, ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326))
            ELSE c.created_at
        END DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- SEEDERS UNIQUEMENT POUR FIANARANTSOA
-- =============================================
-- Santé
INSERT INTO health_centers (
    name, center_type, service_category, status, full_address, district, latitude, longitude, phone, emergency_24h, description
) VALUES
('CHU Fianarantsoa', 'public_hospital', 'health', 'approved', 'Route de Manakara', 'Ambalamanakana', -21.4536, 47.0854, '+261 20 75 500 00', TRUE, 'Hôpital universitaire de référence.'),
('Clinique Saint Jean', 'private_hospital', 'health', 'approved', 'Rue Rainandriamampandry', 'Centre-Ville', -21.4601, 47.0872, '+261 34 01 234 56', TRUE, 'Clinique privée avec urgences.'),
('CSB II Ambalamanakana', 'health_center', 'health', 'approved', 'Quartier Ambalamanakana', 'Ambalamanakana', -21.4489, 47.0812, '+261 32 07 123 45', FALSE, 'Centre de santé de base niveau II.'),
('Pharmacie de Garde Andriamanjato', 'pharmacy', 'health', 'approved', 'Avenue Andriamanjato', 'Centre-Ville', -21.4550, 47.0860, '+261 32 15 678 90', TRUE, 'Ouverte 24h/24.');

-- Secours & Incendie
INSERT INTO health_centers (
    name, center_type, service_category, status, full_address, district, latitude, longitude, phone, emergency_24h, description
) VALUES
('Caserne des Pompiers', 'fire_station', 'fire_rescue', 'approved', 'Rue des Sapeurs', 'Centre-Ville', -21.4512, 47.0801, '+261 20 75 512 34', TRUE, 'Intervention incendie et secours.'),
('Bouche d''Incendie - Place de la Gare', 'fire_hydrant', 'fire_rescue', 'approved', 'Place de la Gare', 'Centre-Ville', -21.4590, 47.0845, NULL, FALSE, 'Point d''eau pour pompiers.');

-- Sécurité
INSERT INTO health_centers (
    name, center_type, service_category, status, full_address, district, latitude, longitude, phone, emergency_24h, description
) VALUES
('Commissariat Central', 'police_station', 'security', 'approved', 'Place de l''Indépendance', 'Centre-Ville', -21.4567, 47.0850, '+261 20 75 501 23', TRUE, 'Commissariat central.'),
('Gendarmerie Fianarantsoa', 'gendarmerie', 'security', 'approved', 'Avenue de la Gendarmerie', 'Ambalamanakana', -21.4501, 47.0889, '+261 20 75 502 34', TRUE, 'Brigade territoriale.');

-- Services Essentiels
INSERT INTO health_centers (
    name, center_type, service_category, status, full_address, district, latitude, longitude, phone, emergency_24h, description
) VALUES
('Agence JIRAMA', 'jirama_office', 'essential_services', 'approved', 'Avenue de la République', 'Centre-Ville', -21.4543, 47.0876, '+261 20 75 503 45', FALSE, 'Service client eau/électricité.');

-- Autres
INSERT INTO health_centers (
    name, center_type, service_category, status, full_address, district, latitude, longitude, phone, emergency_24h, description
) VALUES
('Croix-Rouge Fianarantsoa', 'red_cross', 'other', 'approved', 'Rue du Commerce', 'Centre-Ville', -21.4570, 47.0890, '+261 33 11 223 34', TRUE, 'Premiers secours et actions humanitaires.'),
('SAMU Fianarantsoa', 'samu', 'other', 'approved', 'CHU Fianarantsoa', 'Ambalamanakana', -21.4530, 47.0850, '+261 32 09 112 22', TRUE, 'Service d''urgence médicale.');

-- Mise à jour des coordonnées PostGIS
UPDATE health_centers
SET coordinates = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
WHERE coordinates IS NULL;

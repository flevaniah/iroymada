# 🚨 Annuaire Digital des Services d'Urgence de Fianarantsoa

## 🎯 Objectif
Permettre aux habitants de Fianarantsoa et ses environs de rechercher rapidement les services d'urgence disponibles (hôpitaux, police, pompiers, gendarmerie, etc.) avec géolocalisation et informations de contact en temps réel.

## 🛠 Stack Technique

### Frontend
- **Framework :** Next.js 14+ (App Router)
- **Styling :** Tailwind CSS + Shadcn/ui
- **Cartes :** Leaflet + OpenStreetMap (gratuit)
- **État :** Zustand ou Context API
- **Validation :** Zod
- **Déploiement :** Vercel

### Backend & Base de Données
- **Backend :** Supabase (PostgreSQL + PostGIS)
- **API :** Supabase Auto-generated REST API + Edge Functions si nécessaire
- **Authentification :** Supabase Auth
- **Storage :** Supabase Storage (pour les images)
- **Real-time :** Supabase Realtime (notifications)

### DevOps
- **Hosting :** Vercel (Frontend) + Supabase (Backend)
- **Domaine :** Custom domain
- **Monitoring :** Vercel Analytics + Supabase Dashboard

## 📱 Structure de l'Application

### Pages Principales
1. **Page d'accueil** (`/`)
   - Boutons d'urgence rapide (Police, Pompiers, SAMU)
   - Moteur de recherche (type de service + localisation)
   - Carte interactive avec services proches
   - Numéros d'urgence nationaux

2. **Page de résultats** (`/recherche`)
   - Liste des services avec filtres
   - Vue carte/liste toggle
   - Tri par distance/disponibilité
   - Statut en temps réel (ouvert/fermé)

3. **Fiche service** (`/service/[id]`)
   - Informations complètes et contact
   - Horaires de service
   - Carte de localisation précise
   - Bouton d'appel direct
   - Instructions d'accès

4. **Inscription service** (`/inscription`)
   - Formulaire multi-étapes pour services
   - Validation administrative
   - Upload de documents officiels
   - Preview avant soumission

5. **Dashboard Admin** (`/admin`)
   - Gestion des services (CRUD)
   - Modération des inscriptions
   - Mise à jour statuts en temps réel
   - Statistiques d'usage par zone

## 🗄 Base de Données (PostgreSQL + PostGIS)

### Table `emergency_services`
```sql
CREATE TYPE service_type AS ENUM (
  'hopital_public',
  'hopital_prive',
  'clinique',
  'centre_sante',
  'maternite',
  'police_nationale',
  'gendarmerie',
  'pompiers',
  'protection_civile',
  'croix_rouge',
  'ambulance',
  'pharmacie_garde',
  'veterinaire_urgence'
);

CREATE TYPE service_status AS ENUM (
  'ouvert_24h',
  'ouvert',
  'ferme',
  'urgence_seulement',
  'en_attente',
  'suspendu'
);

CREATE TYPE priority_level AS ENUM (
  'critique',      -- Services vitaux (SAMU, Pompiers)
  'urgent',        -- Police, Gendarmerie
  'important',     -- Hôpitaux, Cliniques
  'standard'       -- Autres services
);

CREATE TABLE emergency_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  service_type service_type NOT NULL,
  status service_status DEFAULT 'en_attente',
  priority_level priority_level DEFAULT 'standard',
  
  -- Localisation Fianarantsoa et environs
  full_address TEXT NOT NULL,
  district VARCHAR(100) NOT NULL, -- Fianarantsoa I, II, Ambohimahasoa, etc.
  fokontany VARCHAR(100), -- Subdivision administrative malgache
  coordinates GEOMETRY(POINT, 4326), -- PostGIS
  
  -- Contact d'urgence
  emergency_phone VARCHAR(20) NOT NULL,
  secondary_phone VARCHAR(20),
  whatsapp VARCHAR(20),
  radio_frequency VARCHAR(50), -- Pour services radio
  email VARCHAR(255),
  
  -- Disponibilité
  opening_hours JSONB, -- Format: {"lundi": {"ouvert": true, "debut": "08:00", "fin": "17:00"}}
  available_24h BOOLEAN DEFAULT FALSE,
  weekend_service BOOLEAN DEFAULT FALSE,
  
  -- Capacités et équipements
  services_offered TEXT[] DEFAULT '{}',
  equipment TEXT[] DEFAULT '{}', -- Ambulances, défibrillateurs, etc.
  staff_count INTEGER,
  bed_capacity INTEGER, -- Pour hôpitaux
  
  -- Accessibilité
  wheelchair_accessible BOOLEAN DEFAULT FALSE,
  parking_available BOOLEAN DEFAULT FALSE,
  public_transport_nearby BOOLEAN DEFAULT FALSE,
  
  -- Informations pratiques
  languages_spoken TEXT[] DEFAULT '{"Malagasy", "Français"}',
  accepted_insurance TEXT[] DEFAULT '{}',
  special_instructions TEXT,
  
  -- Média
  photos TEXT[] DEFAULT '{}', -- URLs Supabase Storage
  logo_url VARCHAR(255),
  description TEXT,
  
  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_verified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  verified_by_authority BOOLEAN DEFAULT FALSE,
  
  -- SEO
  slug VARCHAR(255) UNIQUE
);

-- Index géospatial pour Fianarantsoa
CREATE INDEX idx_services_coordinates ON emergency_services USING GIST(coordinates);

-- Index recherche textuelle en malgache et français
CREATE INDEX idx_services_search ON emergency_services USING GIN(
  to_tsvector('french', name || ' ' || district || ' ' || fokontany || ' ' || array_to_string(services_offered, ' '))
);

-- Index filtres spécifiques urgence
CREATE INDEX idx_services_district ON emergency_services(district);
CREATE INDEX idx_services_type ON emergency_services(service_type);
CREATE INDEX idx_services_24h ON emergency_services(available_24h);
CREATE INDEX idx_services_status ON emergency_services(status);
CREATE INDEX idx_services_priority ON emergency_services(priority_level);
```

### Table `emergency_contacts` (Numéros nationaux)
```sql
CREATE TABLE emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name VARCHAR(100) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  description TEXT,
  coverage_area VARCHAR(100), -- National, Fianarantsoa, etc.
  is_free BOOLEAN DEFAULT TRUE,
  priority_order INTEGER DEFAULT 1
);

-- Données de base Madagascar
INSERT INTO emergency_contacts (service_name, phone_number, description, coverage_area) VALUES
('Police Secours', '117', 'Police nationale - Urgences', 'National'),
('Pompiers', '118', 'Brigade de sapeurs-pompiers', 'National'),
('SAMU', '124', 'Service d''aide médicale urgente', 'National'),
('Gendarmerie', '119', 'Gendarmerie nationale', 'National');
```

## 🔧 API Routes (Supabase + Edge Functions)

### Routes Principales
- `GET /api/services` - Liste avec géolocalisation Fianarantsoa
- `GET /api/services/[id]` - Détails service d'urgence
- `POST /api/services` - Ajout nouveau service (modération)
- `PUT /api/services/[id]/status` - Mise à jour statut temps réel
- `GET /api/services/nearby` - Services dans rayon X km
- `GET /api/services/emergency` - Services critiques disponibles
- `POST /api/emergency-call` - Log appels d'urgence (analytics)

### Requêtes Géospatiaux Fianarantsoa
```sql
-- Services d'urgence dans Fianarantsoa (rayon 25km)
SELECT *, 
  ST_Distance(coordinates, ST_Point($longitude, $latitude)) as distance_meters,
  CASE 
    WHEN available_24h THEN 'Disponible 24h/24'
    WHEN status = 'ouvert' THEN 'Ouvert maintenant'
    ELSE 'Fermé'
  END as availability_status
FROM emergency_services 
WHERE ST_DWithin(coordinates, ST_Point($longitude, $latitude), 25000)
AND status NOT IN ('suspendu', 'ferme')
ORDER BY priority_level DESC, distance_meters ASC;

-- Services par district de Fianarantsoa
SELECT * FROM emergency_services 
WHERE district = $district 
AND status IN ('ouvert', 'ouvert_24h', 'urgence_seulement')
ORDER BY priority_level DESC;

-- Recherche urgence avec priorité
SELECT * FROM emergency_services 
WHERE to_tsvector('french', name || ' ' || services_offered::text) @@ plainto_tsquery('french', $query)
AND ($service_type IS NULL OR service_type = $service_type)
AND ($available_24h IS NULL OR available_24h = $available_24h)
ORDER BY priority_level DESC, available_24h DESC;
```

## 🎨 Composants Frontend

### Composants Spécialisés Urgence
- `EmergencyButton` - Boutons d'appel rapide
- `ServiceCard` - Carte service avec statut temps réel
- `UrgencyMap` - Carte optimisée services d'urgence
- `QuickContact` - Contact direct avec validation
- `StatusIndicator` - Indicateur visuel disponibilité
- `DistanceCalculator` - Calcul temps trajet
- `EmergencyInstructions` - Instructions premiers secours

### Features UX Urgence
- **Boutons XL** : Accessibles en situation stress
- **Mode Urgence** : Interface simplifiée rouge
- **Appel Direct** : Tel: links pour appel immédiat
- **Géolocalisation Auto** : Détection position automatique
- **Mode Hors-ligne** : Cache services critiques
- **Multi-langues** : Malgache/Français

## 🔐 Authentification & Autorisations

### Politiques RLS spécifiques
```sql
-- Public peut voir services actifs
CREATE POLICY "Public can view active services" ON emergency_services
  FOR SELECT USING (status IN ('ouvert', 'ouvert_24h', 'urgence_seulement'));

-- Autorités peuvent modifier statuts
CREATE POLICY "Authorities can update status" ON emergency_services
  FOR UPDATE USING (
    auth.jwt() ->> 'role' IN ('authority', 'admin')
  );

-- Admins gestion complète
CREATE POLICY "Admins full access" ON emergency_services
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin'
  );
```

## 📊 Fonctionnalités Spécifiques Urgence

### Géolocalisation Fianarantsoa
- Coordonnées Centre Fianarantsoa : -21.4409, 47.0866
- Couverture districts environnants (50km rayon)
- Calcul temps trajet réaliste routes malgaches
- Points de repère locaux (monuments, marchés)

### Fonctionnalités Temps Réel
- **Statut Services** : Ouvert/Fermé en temps réel
- **Notifications** : Alertes services indisponibles
- **Queue Status** : Nombre d'attente hôpitaux
- **Traffic Info** : État routes principales

### Analytics Urgence
- Temps de réponse appels
- Services les plus sollicités
- Zones mal desservies
- Pics d'activité par heure/jour

## 🗺 Données Spécifiques Fianarantsoa

### Districts Couverts
- **Fianarantsoa I** : Centre urbain
- **Fianarantsoa II** : Périphérie nord
- **Ambohimahasoa** : 45km nord-est
- **Ambalavao** : 55km sud
- **Ikalamavony** : 75km ouest

### Services d'Urgence Existants
```sql
-- Seed data pour Fianarantsoa
INSERT INTO emergency_services (name, service_type, district, coordinates, emergency_phone, available_24h, priority_level) VALUES
('CHR Fianarantsoa', 'hopital_public', 'Fianarantsoa I', ST_Point(47.0866, -21.4409), '+261 20 75 50 123', true, 'critique'),
('Commissariat Central Fianarantsoa', 'police_nationale', 'Fianarantsoa I', ST_Point(47.0845, -21.4389), '117', true, 'urgent'),
('Caserne Pompiers Fianarantsoa', 'pompiers', 'Fianarantsoa I', ST_Point(47.0823, -21.4398), '118', true, 'critique'),
('Brigade Gendarmerie Fianarantsoa', 'gendarmerie', 'Fianarantsoa I', ST_Point(47.0901, -21.4423), '119', true, 'urgent');
```

## 🚀 Roadmap Spécialisé

### Phase 1 (MVP Urgence - 2 semaines)
- [ ] Base données services Fianarantsoa
- [ ] Boutons urgence rapide
- [ ] Carte interactive zone Fianarantsoa
- [ ] Recherche par type service
- [ ] Contact direct téléphone

### Phase 2 (Features Avancées - 2 semaines)
- [ ] Statuts temps réel
- [ ] Mode hors-ligne
- [ ] Multi-langues Malgache/Français
- [ ] Notifications push urgence
- [ ] Instructions premiers secours

### Phase 3 (Optimisation - 1 semaine)
- [ ] PWA installation
- [ ] Analytics dashboard autorités
- [ ] Intégration radio fréquences
- [ ] Tests terrain Fianarantsoa

## 🎯 Métriques de Succès
- **Temps accès info** : < 3 secondes
- **Précision géoloc** : < 100m erreur
- **Disponibilité** : 99.9% uptime
- **Adoption** : 1000+ utilisateurs Fianarantsoa premier mois

## 📋 Installation et Configuration

### Prérequis
- Node.js 18+
- Compte Supabase
- Compte Vercel (optionnel)

### Variables d'environnement
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Maps
NEXT_PUBLIC_NOMINATIM_URL=https://nominatim.openstreetmap.org

# App
NEXT_PUBLIC_APP_URL=https://urgence-fianarantsoa.vercel.app
```

### Scripts de développement
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "db:setup": "supabase db reset",
    "db:seed": "tsx scripts/seed-fianarantsoa.ts",
    "deploy": "vercel deploy --prod"
  }
}
```

---

*Spécifications adaptées pour services d'urgence Fianarantsoa, Madagascar*
-- =============================================
-- SEEDERS UNIQUEMENT POUR FIANARANTSOA (MISE À JOUR)
-- =============================================
-- Suppression des anciennes données pour Fianarantsoa (si nécessaire)
DELETE FROM health_centers WHERE city = 'Fianarantsoa';

-- Insertion des centres pour Fianarantsoa (avec service_category et coordinates)
INSERT INTO health_centers (
    name, description, center_type, service_category, full_address, city, district, region,
    latitude, longitude, phone, email, services, specialties,
    emergency_24h, wheelchair_accessible, parking_available, public_transport,
    opening_hours, status
) VALUES
-- ========== SANTÉ (health) ==========
-- Hôpitaux
(
    'Centre Hospitalier Universitaire de Fianarantsoa',
    'Hôpital universitaire de référence pour la région Haute Matsiatra, offrant des soins spécialisés et un service d''urgence 24h/24.',
    'public_hospital', 'health',
    'Route de Manakara, Fianarantsoa',
    'Fianarantsoa', 'Ambalamanakana', 'Haute Matsiatra',
    -21.4536, 47.0854,
    '+261 20 75 500 00', 'chu.fianarantsoa@mg.gov',
    '["Urgences", "Chirurgie", "Maternité", "Pédiatrie", "Médecine interne", "Radiologie", "Laboratoire", "Réanimation"]',
    '["Cardiologie", "Neurologie", "Orthopédie", "Gynécologie", "Pédiatrie", "Oncologie"]',
    true, true, true, true,
    '{
        "lundi": {"ouvert": true, "debut": "00:00", "fin": "23:59"},
        "mardi": {"ouvert": true, "debut": "00:00", "fin": "23:59"},
        "mercredi": {"ouvert": true, "debut": "00:00", "fin": "23:59"},
        "jeudi": {"ouvert": true, "debut": "00:00", "fin": "23:59"},
        "vendredi": {"ouvert": true, "debut": "00:00", "fin": "23:59"},
        "samedi": {"ouvert": true, "debut": "00:00", "fin": "23:59"},
        "dimanche": {"ouvert": true, "debut": "00:00", "fin": "23:59"}
    }',
    'approved'
),
(
    'Clinique Saint Jean',
    'Clinique privée réputée avec équipements modernes et personnel qualifié. Urgences disponibles.',
    'private_hospital', 'health',
    'Rue Rainandriamampandry, Fianarantsoa',
    'Fianarantsoa', 'Centre-Ville', 'Haute Matsiatra',
    -21.4601, 47.0872,
    '+261 34 01 234 56', 'contact@clinique-saintjean.mg',
    '["Urgences", "Consultation", "Chirurgie", "Maternité", "Laboratoire", "Imagerie"]',
    '["Médecine générale", "Chirurgie", "Gynécologie", "Pédiatrie", "Ophtalmologie"]',
    true, true, true, true,
    '{
        "lundi": {"ouvert": true, "debut": "07:00", "fin": "19:00"},
        "mardi": {"ouvert": true, "debut": "07:00", "fin": "19:00"},
        "mercredi": {"ouvert": true, "debut": "07:00", "fin": "19:00"},
        "jeudi": {"ouvert": true, "debut": "07:00", "fin": "19:00"},
        "vendredi": {"ouvert": true, "debut": "07:00", "fin": "19:00"},
        "samedi": {"ouvert": true, "debut": "08:00", "fin": "16:00"},
        "dimanche": {"ouvert": true, "debut": "08:00", "fin": "12:00"}
    }',
    'approved'
),
-- Centres de Santé de Base (CSB)
(
    'CSB II Ambalamanakana',
    'Centre de santé de base niveau II avec maternité, consultations générales et vaccinations.',
    'health_center', 'health',
    'Quartier Ambalamanakana, Fianarantsoa',
    'Fianarantsoa', 'Ambalamanakana', 'Haute Matsiatra',
    -21.4489, 47.0812,
    '+261 32 07 123 45', NULL,
    '["Consultation", "Vaccination", "Soins infirmiers", "Planning familial", "Pédiatrie", "Maternité"]',
    '["Médecine générale", "Pédiatrie", "Gynécologie"]',
    false, false, false, true,
    '{
        "lundi": {"ouvert": true, "debut": "07:30", "fin": "15:30"},
        "mardi": {"ouvert": true, "debut": "07:30", "fin": "15:30"},
        "mercredi": {"ouvert": true, "debut": "07:30", "fin": "15:30"},
        "jeudi": {"ouvert": true, "debut": "07:30", "fin": "15:30"},
        "vendredi": {"ouvert": true, "debut": "07:30", "fin": "15:30"},
        "samedi": {"ouvert": false, "debut": "", "fin": ""},
        "dimanche": {"ouvert": false, "debut": "", "fin": ""}
    }',
    'approved'
),
(
    'CSB I Mahazoarivo',
    'Centre de santé de base niveau I pour soins primaires et suivi communautaire.',
    'health_center', 'health',
    'Quartier Mahazoarivo, Fianarantsoa',
    'Fianarantsoa', 'Mahazoarivo', 'Haute Matsiatra',
    -21.4656, 47.0921,
    '+261 33 08 654 32', NULL,
    '["Consultation", "Soins infirmiers", "Vaccination", "Planning familial"]',
    '["Médecine générale"]',
    false, false, false, true,
    '{
        "lundi": {"ouvert": true, "debut": "07:30", "fin": "15:00"},
        "mardi": {"ouvert": true, "debut": "07:30", "fin": "15:00"},
        "mercredi": {"ouvert": true, "debut": "07:30", "fin": "15:00"},
        "jeudi": {"ouvert": true, "debut": "07:30", "fin": "15:00"},
        "vendredi": {"ouvert": true, "debut": "07:30", "fin": "15:00"},
        "samedi": {"ouvert": false, "debut": "", "fin": ""},
        "dimanche": {"ouvert": false, "debut": "", "fin": ""}
    }',
    'approved'
),
-- Dispensaires
(
    'Dispensaire Tsianolondroa',
    'Dispensaire communal pour soins de proximité et urgences légères.',
    'dispensary', 'health',
    'Rue Tsianolondroa, Fianarantsoa',
    'Fianarantsoa', 'Tsianolondroa', 'Haute Matsiatra',
    -21.4578, 47.0839,
    '+261 34 12 345 67', NULL,
    '["Consultation", "Soins infirmiers", "Vaccination", "Petites urgences"]',
    '["Médecine générale"]',
    false, false, false, true,
    '{
        "lundi": {"ouvert": true, "debut": "08:00", "fin": "16:00"},
        "mardi": {"ouvert": true, "debut": "08:00", "fin": "16:00"},
        "mercredi": {"ouvert": true, "debut": "08:00", "fin": "16:00"},
        "jeudi": {"ouvert": true, "debut": "08:00", "fin": "16:00"},
        "vendredi": {"ouvert": true, "debut": "08:00", "fin": "16:00"},
        "samedi": {"ouvert": false, "debut": "", "fin": ""},
        "dimanche": {"ouvert": false, "debut": "", "fin": ""}
    }',
    'approved'
),
-- Pharmacies de garde
(
    'Pharmacie de Garde Andriamanjato',
    'Pharmacie ouverte 24h/24 pour urgences médicales et médicaments essentiels.',
    'pharmacy', 'health',
    'Avenue Andriamanjato, Fianarantsoa',
    'Fianarantsoa', 'Centre-Ville', 'Haute Matsiatra',
    -21.4550, 47.0860,
    '+261 32 15 678 90', 'pharmacie.andriamanjato@email.mg',
    '["Vente de médicaments", "Conseils pharmaceutiques", "Urgences"]',
    '["Pharmacie générale"]',
    true, true, false, true,
    '{
        "lundi": {"ouvert": true, "debut": "00:00", "fin": "23:59"},
        "mardi": {"ouvert": true, "debut": "00:00", "fin": "23:59"},
        "mercredi": {"ouvert": true, "debut": "00:00", "fin": "23:59"},
        "jeudi": {"ouvert": true, "debut": "00:00", "fin": "23:59"},
        "vendredi": {"ouvert": true, "debut": "00:00", "fin": "23:59"},
        "samedi": {"ouvert": true, "debut": "00:00", "fin": "23:59"},
        "dimanche": {"ouvert": true, "debut": "00:00", "fin": "23:59"}
    }',
    'approved'
),
-- ========== SECOURS & INCENDIE (fire_rescue) ==========
(
    'Caserne des Sapeurs-Pompiers Fianarantsoa',
    'Intervention incendie, secours d''urgence et prévention des risques.',
    'fire_station', 'fire_rescue',
    'Rue des Sapeurs, Fianarantsoa',
    'Fianarantsoa', 'Centre-Ville', 'Haute Matsiatra',
    -21.4512, 47.0801,
    '+261 20 75 512 34', NULL,
    '["Intervention incendie", "Secours routier", "Prévention", "Formation"]',
    '["Secourisme", "Lutte contre l''incendie"]',
    true, true, true, true,
    '{
        "lundi": {"ouvert": true, "debut": "00:00", "fin": "23:59"},
        "mardi": {"ouvert": true, "debut": "00:00", "fin": "23:59"},
        "mercredi": {"ouvert": true, "debut": "00:00", "fin": "23:59"},
        "jeudi": {"ouvert": true, "debut": "00:00", "fin": "23:59"},
        "vendredi": {"ouvert": true, "debut": "00:00", "fin": "23:59"},
        "samedi": {"ouvert": true, "debut": "00:00", "fin": "23:59"},
        "dimanche": {"ouvert": true, "debut": "00:00", "fin": "23:59"}
    }',
    'approved'
),
(
    'Bouche d''Incendie - Place de la Gare',
    'Point d''eau dédié aux interventions des pompiers en cas d''incendie.',
    'fire_hydrant', 'fire_rescue',
    'Place de la Gare, Fianarantsoa',
    'Fianarantsoa', 'Centre-Ville', 'Haute Matsiatra',
    -21.4590, 47.0845,
    NULL, NULL,
    '[]', '[]',
    false, false, false, false,
    '{}',
    'approved'
),
-- ========== SÉCURITÉ (security) ==========
(
    'Commissariat Central Fianarantsoa',
    'Commissariat central de police pour dépôts de plainte, sécurité publique et interventions.',
    'police_station', 'security',
    'Place de l''Indépendance, Fianarantsoa',
    'Fianarantsoa', 'Centre-Ville', 'Haute Matsiatra',
    -21.4567, 47.0850,
    '+261 20 75 501 23', NULL,
    '["Dépôt de plainte", "Sécurité publique", "Intervention"]',
    '["Police nationale"]',
    true, true, true, true,
    '{
        "lundi": {"ouvert": true, "debut": "00:00", "fin": "23:59"},
        "mardi": {"ouvert": true, "debut": "00:00", "fin": "23:59"},
        "mercredi": {"ouvert": true, "debut": "00:00", "fin": "23:59"},
        "jeudi": {"ouvert": true, "debut": "00:00", "fin": "23:59"},
        "vendredi": {"ouvert": true, "debut": "00:00", "fin": "23:59"},
        "samedi": {"ouvert": true, "debut": "00:00", "fin": "23:59"},
        "dimanche": {"ouvert": true, "debut": "00:00", "fin": "23:59"}
    }',
    'approved'
),
(
    'Brigade de Gendarmerie Fianarantsoa',
    'Brigade territoriale de gendarmerie pour la sécurité et l''ordre public.',
    'gendarmerie', 'security',
    'Avenue de la Gendarmerie, Fianarantsoa',
    'Fianarantsoa', 'Ambalamanakana', 'Haute Matsiatra',
    -21.4501, 47.0889,
    '+261 20 75 502 34', NULL,
    '["Sécurité publique", "Enquêtes", "Intervention"]',
    '["Gendarmerie nationale"]',
    true, true, true, true,
    '{
        "lundi": {"ouvert": true, "debut": "00:00", "fin": "23:59"},
        "mardi": {"ouvert": true, "debut": "00:00", "fin": "23:59"},
        "mercredi": {"ouvert": true, "debut": "00:00", "fin": "23:59"},
        "jeudi": {"ouvert": true, "debut": "00:00", "fin": "23:59"},
        "vendredi": {"ouvert": true, "debut": "00:00", "fin": "23:59"},
        "samedi": {"ouvert": true, "debut": "00:00", "fin": "23:59"},
        "dimanche": {"ouvert": true, "debut": "00:00", "fin": "23:59"}
    }',
    'approved'
),
-- ========== SERVICES ESSENTIELS (essential_services) ==========
(
    'Agence JIRAMA Fianarantsoa',
    'Service client et dépannage pour l''eau et l''électricité. Coupures = urgence.',
    'jirama_office', 'essential_services',
    'Avenue de la République, Fianarantsoa',
    'Fianarantsoa', 'Centre-Ville', 'Haute Matsiatra',
    -21.4543, 47.0876,
    '+261 20 75 503 45', 'jirama.fianarantsoa@jirama.mg',
    '["Abonnement", "Dépannage", "Réclamation", "Paiement"]',
    '["Eau", "Électricité"]',
    false, true, true, true,
    '{
        "lundi": {"ouvert": true, "debut": "07:30", "fin": "16:00"},
        "mardi": {"ouvert": true, "debut": "07:30", "fin": "16:00"},
        "mercredi": {"ouvert": true, "debut": "07:30", "fin": "16:00"},
        "jeudi": {"ouvert": true, "debut": "07:30", "fin": "16:00"},
        "vendredi": {"ouvert": true, "debut": "07:30", "fin": "16:00"},
        "samedi": {"ouvert": true, "debut": "08:00", "fin": "12:00"},
        "dimanche": {"ouvert": false, "debut": "", "fin": ""}
    }',
    'approved'
),
-- ========== AUTRES POINTS STRATÉGIQUES (other) ==========
(
    'Croix-Rouge Malgache - Antenne Fianarantsoa',
    'Premiers secours, formations, actions humanitaires et soutien aux populations vulnérables.',
    'red_cross', 'other',
    'Rue du Commerce, Fianarantsoa',
    'Fianarantsoa', 'Centre-Ville', 'Haute Matsiatra',
    -21.4570, 47.0890,
    '+261 33 11 223 34', 'croixrouge.fianarantsoa@email.mg',
    '["Premiers secours", "Formation", "Aide humanitaire", "Soutien social"]',
    '["Urgence", "Santé communautaire"]',
    true, true, true, true,
    '{
        "lundi": {"ouvert": true, "debut": "08:00", "fin": "17:00"},
        "mardi": {"ouvert": true, "debut": "08:00", "fin": "17:00"},
        "mercredi": {"ouvert": true, "debut": "08:00", "fin": "17:00"},
        "jeudi": {"ouvert": true, "debut": "08:00", "fin": "17:00"},
        "vendredi": {"ouvert": true, "debut": "08:00", "fin": "17:00"},
        "samedi": {"ouvert": false, "debut": "", "fin": ""},
        "dimanche": {"ouvert": false, "debut": "", "fin": ""}
    }',
    'approved'
),
(
    'SAMU Fianarantsoa',
    'Service d''Aide Médicale Urgente pour interventions médicales d''urgence.',
    'samu', 'other',
    'CHU Fianarantsoa, Route de Manakara',
    'Fianarantsoa', 'Ambalamanakana', 'Haute Matsiatra',
    -21.4530, 47.0850,
    '+261 32 09 112 22', NULL,
    '["Urgences médicales", "Transport sanitaire", "Réanimation"]',
    '["Médecine d''urgence"]',
    true, true, true, true,
    '{
        "lundi": {"ouvert": true, "debut": "00:00", "fin": "23:59"},
        "mardi": {"ouvert": true, "debut": "00:00", "fin": "23:59"},
        "mercredi": {"ouvert": true, "debut": "00:00", "fin": "23:59"},
        "jeudi": {"ouvert": true, "debut": "00:00", "fin": "23:59"},
        "vendredi": {"ouvert": true, "debut": "00:00", "fin": "23:59"},
        "samedi": {"ouvert": true, "debut": "00:00", "fin": "23:59"},
        "dimanche": {"ouvert": true, "debut": "00:00", "fin": "23:59"}
    }',
    'approved'
),
(
    'Médecins Sans Frontières (MSF) - Fianarantsoa',
    'ONG médicale offrant des soins gratuits, programmes de santé publique et soutien aux épidémies.',
    'ngo_medical', 'other',
    'Lot II J 12 Bis, Ambalamanakana, Fianarantsoa',
    'Fianarantsoa', 'Ambalamanakana', 'Haute Matsiatra',
    -21.4498, 47.0823,
    '+261 34 10 123 45', 'msf.fianarantsoa@msf.org',
    '["Soins gratuits", "Santé maternelle", "Lutte contre les épidémies", "Nutrition"]',
    '["Médecine humanitaire", "Pédiatrie", "Santé publique"]',
    true, true, true, true,
    '{
        "lundi": {"ouvert": true, "debut": "08:00", "fin": "17:00"},
        "mardi": {"ouvert": true, "debut": "08:00", "fin": "17:00"},
        "mercredi": {"ouvert": true, "debut": "08:00", "fin": "17:00"},
        "jeudi": {"ouvert": true, "debut": "08:00", "fin": "17:00"},
        "vendredi": {"ouvert": true, "debut": "08:00", "fin": "17:00"},
        "samedi": {"ouvert": false, "debut": "", "fin": ""},
        "dimanche": {"ouvert": false, "debut": "", "fin": ""}
    }',
    'approved'
);

-- Mise à jour des coordonnées PostGIS pour tous les centres de Fianarantsoa
UPDATE health_centers
SET coordinates = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
WHERE city = 'Fianarantsoa' AND coordinates IS NULL;

-- Insertion d'avis pour les centres de Fianarantsoa
INSERT INTO reviews (
    center_id, rating, comment, care_quality, reception, waiting_time, cleanliness, approved
)
SELECT
    c.id,
    (RANDOM() * 2 + 3)::INTEGER,
    CASE (RANDOM() * 4)::INTEGER
        WHEN 0 THEN 'Très bon accueil, personnel compétent et à l''écoute.'
        WHEN 1 THEN 'Soins de qualité, équipements modernes. Je recommande.'
        WHEN 2 THEN 'Bonne prise en charge, temps d''attente raisonnable.'
        ELSE 'Personnel professionnel, installations propres et bien entretenues.'
    END,
    (RANDOM() * 2 + 3)::INTEGER,
    (RANDOM() * 2 + 3)::INTEGER,
    (RANDOM() * 3 + 2)::INTEGER,
    (RANDOM() * 2 + 3)::INTEGER,
    true
FROM health_centers c
WHERE c.status = 'approved' AND c.city = 'Fianarantsoa' AND RANDOM() < 0.7;

-- Insertion de statistiques de recherche pour Fianarantsoa
INSERT INTO search_statistics (
    search_term, city, center_type, service_category, result_count
) VALUES
('urgence', 'Fianarantsoa', '', '', 5),
('hôpital', 'Fianarantsoa', 'public_hospital', '', 2),
('clinique', 'Fianarantsoa', 'private_hospital', '', 1),
('pharmacie de garde', 'Fianarantsoa', 'pharmacy', 'health', 1),
('pompiers', 'Fianarantsoa', 'fire_station', 'fire_rescue', 1),
('police', 'Fianarantsoa', 'police_station', 'security', 1),
('jirama', 'Fianarantsoa', 'jirama_office', 'essential_services', 1),
('croix rouge', 'Fianarantsoa', '', 'other', 1),
('samu', 'Fianarantsoa', 'samu', 'other', 1),
('maternité', 'Fianarantsoa', '', 'health', 2),
('pédiatrie', 'Fianarantsoa', '', 'health', 3),
('vaccination', 'Fianarantsoa', '', 'health', 3);

-- Mise à jour des compteurs de vues pour Fianarantsoa
UPDATE health_centers
SET view_count = (RANDOM() * 100)::INTEGER,
    last_viewed = NOW() - (RANDOM() * INTERVAL '7 days')
WHERE status = 'approved' AND city = 'Fianarantsoa';

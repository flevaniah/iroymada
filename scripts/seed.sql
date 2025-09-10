-- Script de seed pour ajouter des données de test

-- Insertion des centres de santé de test
INSERT INTO centres_sante (
  nom, type_centre, statut, adresse_complete, ville, commune, quartier,
  geolocation, telephone, whatsapp, email, services, specialites,
  urgences_24h, accessibilite_handicapes, parking_disponible, transport_public,
  description, slug
) VALUES

-- Brazzaville
(
  'Hôpital Général de Brazzaville',
  'hopital_public',
  'actif',
  'Avenue Félix Eboué, Centre-ville',
  'Brazzaville',
  'Bacongo',
  'Centre-ville',
  ST_Point(15.2662, -4.2634, 4326),
  '+242 05 532 23 45',
  '+242 05 532 23 45',
  'contact@hgb.cg',
  ARRAY['urgences', 'consultation', 'hospitalisation', 'laboratoire', 'radiologie'],
  ARRAY['médecine générale', 'chirurgie', 'pédiatrie', 'gynécologie'],
  true,
  true,
  true,
  true,
  'Hôpital public principal de Brazzaville avec services d''urgence 24h/24',
  'hopital-general-brazzaville'
),

(
  'Clinique les Flamboyants',
  'clinique',
  'actif',
  'Rue Monseigneur Vogt, Plateau des 15 ans',
  'Brazzaville',
  'Moungali',
  'Plateau des 15 ans',
  ST_Point(15.2837, -4.2445, 4326),
  '+242 06 677 88 99',
  '+242 06 677 88 99',
  'info@flamboyants.cg',
  ARRAY['consultation', 'laboratoire', 'radiologie', 'pharmacie'],
  ARRAY['cardiologie', 'dermatologie', 'ophtalmologie'],
  false,
  true,
  true,
  false,
  'Clinique privée moderne spécialisée en médecine spécialisée',
  'clinique-flamboyants-brazzaville'
),

(
  'Maternité de Poto-Poto',
  'maternite',
  'actif',
  'Quartier Poto-Poto, près du marché',
  'Brazzaville',
  'Poto-Poto',
  'Poto-Poto',
  ST_Point(15.2798, -4.2516, 4326),
  '+242 05 445 67 89',
  '+242 05 445 67 89',
  NULL,
  ARRAY['accouchement', 'consultation prénatale', 'urgences obstétricales'],
  ARRAY['gynécologie', 'obstétrique', 'pédiatrie'],
  true,
  false,
  false,
  true,
  'Maternité publique dédiée aux soins obstétricaux et néonataux',
  'maternite-poto-poto'
),

-- Pointe-Noire
(
  'Hôpital Général de Pointe-Noire',
  'hopital_public',
  'actif',
  'Avenue Charles de Gaulle, Centre-ville',
  'Pointe-Noire',
  'Lumumba',
  'Centre-ville',
  ST_Point(11.8636, -4.7948, 4326),
  '+242 05 94 56 78',
  '+242 05 94 56 78',
  'hopital@pointenoire.cg',
  ARRAY['urgences', 'consultation', 'hospitalisation', 'laboratoire', 'radiologie', 'pharmacie'],
  ARRAY['médecine générale', 'chirurgie', 'traumatologie', 'pédiatrie'],
  true,
  true,
  true,
  true,
  'Principal hôpital public de Pointe-Noire avec toutes les spécialités',
  'hopital-general-pointe-noire'
),

(
  'Centre de Santé Tié-Tié',
  'centre_sante',
  'actif',
  'Quariter Tié-Tié, près de l''école primaire',
  'Pointe-Noire',
  'Tié-Tié',
  'Tié-Tié',
  ST_Point(11.8547, -4.8123, 4326),
  '+242 06 123 45 67',
  '+242 06 123 45 67',
  NULL,
  ARRAY['consultation', 'vaccination', 'soins infirmiers'],
  ARRAY['médecine générale', 'pédiatrie'],
  false,
  false,
  false,
  true,
  'Centre de santé communautaire offrant des soins de base',
  'centre-sante-tie-tie'
),

-- Dolisie
(
  'Hôpital de Dolisie',
  'hopital_public',
  'actif',
  'Route Nationale, Centre-ville',
  'Dolisie',
  'Dolisie',
  'Centre-ville',
  ST_Point(12.6693, -4.2055, 4326),
  '+242 05 78 90 12',
  '+242 05 78 90 12',
  'hopital.dolisie@sante.cg',
  ARRAY['urgences', 'consultation', 'hospitalisation', 'laboratoire'],
  ARRAY['médecine générale', 'chirurgie', 'pédiatrie'],
  true,
  false,
  true,
  true,
  'Hôpital régional de Dolisie',
  'hopital-dolisie'
),

-- Ouesso
(
  'Dispensaire d''Ouesso',
  'dispensaire',
  'actif',
  'Centre-ville d''Ouesso',
  'Ouesso',
  'Ouesso',
  'Centre-ville',
  ST_Point(16.0516, 1.6136, 4326),
  '+242 05 34 56 78',
  NULL,
  NULL,
  ARRAY['consultation', 'soins infirmiers', 'vaccination'],
  ARRAY['médecine générale'],
  false,
  false,
  false,
  false,
  'Dispensaire public pour les soins de base',
  'dispensaire-ouesso'
),

-- Owando
(
  'Centre de Santé d''Owando',
  'centre_sante',
  'actif',
  'Quartier administratif',
  'Owando',
  'Owando',
  'Centre',
  ST_Point(15.9000, -0.4833, 4326),
  '+242 05 67 89 01',
  '+242 05 67 89 01',
  NULL,
  ARRAY['consultation', 'laboratoire', 'pharmacie'],
  ARRAY['médecine générale', 'pédiatrie'],
  false,
  false,
  true,
  false,
  'Centre de santé principal d''Owando',
  'centre-sante-owando'
),

-- Impfondo
(
  'Hôpital d''Impfondo',
  'hopital_public',
  'actif',
  'Route du Port',
  'Impfondo',
  'Impfondo',
  'Centre',
  ST_Point(18.0603, 1.6176, 4326),
  '+242 05 89 12 34',
  NULL,
  'hopital.impfondo@sante.cg',
  ARRAY['urgences', 'consultation', 'hospitalisation'],
  ARRAY['médecine générale', 'chirurgie'],
  true,
  false,
  false,
  false,
  'Hôpital régional d''Impfondo',
  'hopital-impfondo'
),

-- Madingou
(
  'Centre de Santé de Madingou',
  'centre_sante',
  'actif',
  'Quartier Mission',
  'Madingou',
  'Madingou',
  'Mission',
  ST_Point(13.5500, -4.1667, 4326),
  '+242 05 23 45 67',
  '+242 05 23 45 67',
  NULL,
  ARRAY['consultation', 'maternité', 'vaccination'],
  ARRAY['médecine générale', 'gynécologie'],
  false,
  false,
  false,
  true,
  'Centre de santé avec services de maternité',
  'centre-sante-madingou'
);

-- Ajout d'horaires d'exemple
UPDATE centres_sante SET horaires = jsonb_build_object(
  'lundi', jsonb_build_object('ouvert', true, 'debut', '08:00', 'fin', '17:00'),
  'mardi', jsonb_build_object('ouvert', true, 'debut', '08:00', 'fin', '17:00'),
  'mercredi', jsonb_build_object('ouvert', true, 'debut', '08:00', 'fin', '17:00'),
  'jeudi', jsonb_build_object('ouvert', true, 'debut', '08:00', 'fin', '17:00'),
  'vendredi', jsonb_build_object('ouvert', true, 'debut', '08:00', 'fin', '17:00'),
  'samedi', jsonb_build_object('ouvert', true, 'debut', '08:00', 'fin', '12:00'),
  'dimanche', jsonb_build_object('ouvert', false)
) WHERE type_centre != 'hopital_public';

-- Horaires 24/7 pour les hôpitaux publics avec urgences
UPDATE centres_sante SET horaires = jsonb_build_object(
  'lundi', jsonb_build_object('ouvert', true, 'debut', '00:00', 'fin', '23:59'),
  'mardi', jsonb_build_object('ouvert', true, 'debut', '00:00', 'fin', '23:59'),
  'mercredi', jsonb_build_object('ouvert', true, 'debut', '00:00', 'fin', '23:59'),
  'jeudi', jsonb_build_object('ouvert', true, 'debut', '00:00', 'fin', '23:59'),
  'vendredi', jsonb_build_object('ouvert', true, 'debut', '00:00', 'fin', '23:59'),
  'samedi', jsonb_build_object('ouvert', true, 'debut', '00:00', 'fin', '23:59'),
  'dimanche', jsonb_build_object('ouvert', true, 'debut', '00:00', 'fin', '23:59')
) WHERE type_centre = 'hopital_public' AND urgences_24h = true;
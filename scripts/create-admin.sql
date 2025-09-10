-- Script pour créer un utilisateur admin de test
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Créer un utilisateur admin (à remplacer par votre email)
-- NOTE: Ceci ne peut être fait que via l'interface Supabase Auth ou via API
-- Aller sur https://app.supabase.com -> Authentication -> Users -> Invite User
-- Email: admin@iroy.mg
-- Password: AdminIroy2024!

-- 2. Une fois l'utilisateur créé, récupérer son ID et exécuter cette requête:
-- Remplacez 'USER_ID_HERE' par l'ID réel de l'utilisateur créé

INSERT INTO user_profiles (
  id, 
  first_name, 
  last_name, 
  role,
  preferred_city,
  email_notifications,
  created_at,
  updated_at
) VALUES (
  'USER_ID_HERE', -- Remplacez par l'ID UUID de l'utilisateur
  'Admin',
  'Iroy',
  'super_admin',
  'Fianarantsoa',
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  updated_at = EXCLUDED.updated_at;

-- 3. Vérifier que le profil a été créé
SELECT 
  u.email,
  p.first_name,
  p.last_name,
  p.role,
  p.created_at
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.id
WHERE p.role IN ('admin', 'super_admin', 'moderator');

-- 4. Instructions pour la connexion:
-- Email: admin@iroy.mg
-- Mot de passe: AdminIroy2024!
-- URL: http://localhost:3000/login
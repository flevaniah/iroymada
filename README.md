# iroy — Annuaire digital des centres d’urgence à Madagascar

## 🎯 Objectif
Permettre aux utilisateurs de rechercher, filtrer et consulter **tous les centres d’urgence** disponibles dans leur zone  
(région, district, commune/fokontany, ville).  
Chaque centre dispose d’une fiche détaillée.

Types de centres pris en charge :
- Santé : hôpitaux publics/privés, cliniques, centres de santé, maternités, SAMU
- Sécurité : commissariats, gendarmeries
- Incendies et secours : casernes de pompiers
- Autres services d’urgence : Croix-Rouge, protection civile, etc.

---

## 🧱 Frontend
- **Framework :** Next.js  
- **Pages principales :**
  1. **Accueil** — moteur de recherche (ville/région + type de service)
  2. **Résultats** — filtres (ville/région, type de centre, ouverture 24h/24, accessibilité, etc.)
  3. **Fiche détaillée** — informations complètes d’un centre
  4. **Inscription** — formulaire pour ajouter un centre
  5. **Administration** — gestion des centres (optionnel)

- **Composants à inclure :**
  - Barre de recherche
  - Cartes ou listes des centres
  - Filtres dynamiques
  - Modale de contact
  - Design responsive

---

## 📦 Backend
- **Framework :** Next.js (API Routes)  
- **Base de données :** Supabase  
- **Routes API :**
  - `GET /centres` — liste avec pagination & filtres
  - `GET /centres/:id` — détails d’un centre
  - `POST /centres` — création d’un centre (formulaire d’inscription)
  - `PUT /centres/:id` — modification d’un centre
  - `DELETE /centres/:id` — suppression d’un centre

---

## 🧾 Données à collecter
Pour chaque centre d’urgence :
- Nom du centre
- Type : hôpital, clinique, commissariat, gendarmerie, caserne, SAMU, etc.
- Adresse complète
- Ville, commune/fokontany, district, région
- Téléphone, WhatsApp
- Email
- Site web (facultatif)
- Jours et heures d’ouverture
- Services disponibles (consultation, urgences médicales, intervention incendie, assistance policière, etc.)
- Urgences 24/7 : oui/non
- Accessibilité PMR : oui/non
- Géolocalisation (latitude, longitude)
- Photos (optionnel)

---

## 🎛 Fonctionnalités supplémentaires
- Carte interactive (Mapbox ou Leaflet) affichant les centres et la position de l’utilisateur
- Authentification administrateur (login simple)
- Validation des données (frontend & backend)
- Badges automatiques : **“24/7”**, **“Urgences”**, **“Accessible PMR”**, **“Police”**, **“Pompiers”**, etc.

---

## 📱 Bonus
- PWA (Progressive Web App)
- Mode sombre

---

## 🧰 Qualité & DX
- Code propre, modulaire, typé et commenté
- Architecture claire (composants, hooks, services, schémas de validation)
- README complet pour :
  - Installation
  - Développement
  - Déploiement
  - Variables d’environnement

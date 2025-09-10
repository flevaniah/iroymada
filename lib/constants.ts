import { CenterType, ServiceCategory } from '@/types/database'

export const CENTER_TYPES: Record<CenterType, string> = {
  // Types de santé existants
  public_hospital: 'Hôpital Public',
  private_hospital: 'Hôpital Privé',
  private_clinic: 'Clinique Privée',
  health_center: 'Centre de Santé',
  dispensary: 'Dispensaire',
  maternity: 'Maternité',
  specialized_center: 'Centre Spécialisé',
  laboratory: 'Laboratoire',
  pharmacy: 'Pharmacie',
  medical_office: 'Cabinet Médical',
  dialysis_center: 'Centre de Dialyse',
  // Nouveaux types pour services d'urgence Fianarantsoa
  fire_station: 'Caserne de Pompiers',
  fire_hydrant: 'Bouche d\'Incendie',
  police_station: 'Commissariat de Police',
  gendarmerie: 'Gendarmerie',
  jirama_office: 'Agence JIRAMA',
  red_cross: 'Croix-Rouge',
  samu: 'SAMU',
  ngo_medical: 'ONG Médicale',
  other: 'Autre',
}

export const SERVICE_CATEGORIES: Record<ServiceCategory, string> = {
  health: 'Santé',
  fire_rescue: 'Incendie et Secours',
  security: 'Sécurité',
  essential_services: 'Services Essentiels',
  other: 'Autres Services',
}

export const AVAILABLE_SERVICES = [
  // Services de santé
  'Urgences médicales',
  'Consultation générale',
  'Hospitalisation',
  'Laboratoire d\'analyses',
  'Radiologie',
  'Pharmacie',
  'Maternité',
  'Accouchement',
  'Consultation prénatale',
  'Urgences obstétricales',
  'Vaccination',
  'Soins infirmiers',
  'Chirurgie',
  'Soins dentaires',
  'Pédiatrie',
  'Médecine interne',
  'Réanimation',
  // Services d'urgence et sécurité
  'Intervention incendie',
  'Secours routier',
  'Premiers secours',
  'Urgences policières',
  'Intervention gendarmerie',
  'Transport sanitaire',
  'Évacuation médicale',
  'Actions humanitaires',
  // Services essentiels
  'Service eau et électricité',
  'Dépannage JIRAMA',
  'Urgences techniques',
]

export const MEDICAL_SPECIALTIES = [
  'Médecine générale',
  'Chirurgie',
  'Pédiatrie',
  'Gynécologie',
  'Obstétrique',
  'Cardiologie',
  'Dermatologie',
  'Ophtalmologie',
  'Traumatologie',
  'Psychiatrie',
  'Neurologie',
  'Oncologie',
  'Urologie',
  'Orthopédie',
  'Oto-rhino-laryngologie',
  'Néphrologie',
  'Biologie médicale',
  'Médecine tropicale',
  'Pneumologie',
  'Gastro-entérologie',
]

export const MADAGASCAR_CITIES = [
  'Antananarivo',
  'Toamasina',
  'Antsirabe',
  'Fianarantsoa',
  'Mahajanga',
  'Toliara',
  'Antsiranana',
  'Morondava',
  'Manakara',
  'Sambava',
  'Ambatondrazaka',
  'Farafangana',
  'Maintirano',
  'Ambositra',
  'Vangaindrano',
]

export const WEEKDAYS = [
  'lundi',
  'mardi',
  'mercredi',
  'jeudi',
  'vendredi',
  'samedi',
  'dimanche',
]

export const PAGINATION_LIMIT = 10

export const MAP_CONFIG = {
  defaultCenter: [-21.4536, 47.0854] as [number, number], // Fianarantsoa (CHU)
  defaultZoom: 12,
  maxZoom: 18,
  minZoom: 6,
  fianarantsoa: {
    center: [-21.4536, 47.0854] as [number, number],
    bounds: {
      north: -21.35,
      south: -21.55,
      east: 47.15,
      west: 47.00,
    }
  }
}

export const CONTACT_INFO = {
  email: 'contact@iroy.mg',
  phone: '+261 20 22 000 00',
  address: 'Antananarivo, Madagascar',
}

export const EMERGENCY_NUMBERS = [
  {
    service: 'Police Secours',
    number: '117',
    description: 'Police nationale - Urgences',
    coverage: 'National',
    priority: 1,
  },
  {
    service: 'Pompiers',
    number: '118',
    description: 'Brigade de sapeurs-pompiers',
    coverage: 'National',
    priority: 2,
  },
  {
    service: 'SAMU',
    number: '124',
    description: 'Service d\'aide médicale urgente',
    coverage: 'National',
    priority: 3,
  },
  {
    service: 'Gendarmerie',
    number: '119',
    description: 'Gendarmerie nationale',
    coverage: 'National',
    priority: 4,
  },
]

// Backward compatibility aliases (to be removed after migration)
export const CENTRE_TYPES = CENTER_TYPES
export const VILLES_Madagascar = MADAGASCAR_CITIES
export const JOURS_SEMAINE = WEEKDAYS
export const SPECIALITES_MEDICALES = MEDICAL_SPECIALTIES
export const SERVICES_MEDICAUX = AVAILABLE_SERVICES
export const SERVICES_DISPONIBLES = AVAILABLE_SERVICES
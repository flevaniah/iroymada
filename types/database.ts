export type CenterType = 
  // Types de santé existants
  | 'public_hospital'
  | 'private_hospital'
  | 'private_clinic'
  | 'health_center'
  | 'dispensary'
  | 'maternity'
  | 'specialized_center'
  | 'laboratory'
  | 'pharmacy'
  | 'medical_office'
  | 'dialysis_center'
  // Nouveaux types pour services d'urgence Fianarantsoa
  | 'fire_station'
  | 'fire_hydrant'
  | 'police_station'
  | 'gendarmerie'
  | 'jirama_office'
  | 'red_cross'
  | 'samu'
  | 'ngo_medical'
  | 'other'

export type CenterStatus = 
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'suspended'

export type ServiceCategory = 
  | 'health'
  | 'fire_rescue'
  | 'security'
  | 'essential_services'
  | 'other'

export interface OpeningHours {
  [day: string]: {
    open: boolean
    start?: string
    end?: string
  }
}

export interface HealthCenter {
  id: string
  real_id?: string // UUID réel pour compatibilité backend
  name: string
  center_type: CenterType
  service_category: ServiceCategory
  status: CenterStatus
  
  // Location
  full_address: string
  city: string
  district?: string
  postal_code?: string
  region?: string
  coordinates?: {
    lat: number
    lng: number
  }
  latitude?: number
  longitude?: number
  
  // Contact
  phone?: string
  secondary_phone?: string
  whatsapp?: string
  email?: string
  website?: string
  
  // Services and hours
  services: string[]
  specialties: string[]
  opening_hours?: OpeningHours
  emergency_24h: boolean
  
  // Accessibility
  wheelchair_accessible: boolean
  parking_available: boolean
  public_transport: boolean
  
  // Media
  photos: string[]
  logo_url?: string
  description?: string
  
  // Metadata
  created_at: string
  updated_at: string
  created_by?: string
  contact_email?: string
  view_count?: number
  last_viewed?: string
  
  // Admin
  admin_notes?: string
  approved_by?: string
  approved_at?: string
  
  // Search
  search_vector?: string
  
  // For distance calculations
  distance?: number | null
}

export interface Review {
  id: string
  center_id: string
  user_id?: string
  rating: number
  comment?: string
  care_quality?: number
  reception?: number
  waiting_time?: number
  cleanliness?: number
  approved: boolean
  moderated_by?: string
  created_at: string
  ip_address?: string
  user_agent?: string
}

export interface SearchFilters {
  query?: string
  city?: string
  center_type?: CenterType
  service_category?: ServiceCategory
  services?: string[]
  emergency_24h?: boolean
  wheelchair_accessible?: boolean
  lat?: number
  lng?: number
  radius?: number
}

export interface SearchResult {
  centers: HealthCenter[]
  total: number
  page: number
  limit: number
}

export interface UserProfile {
  id: string
  first_name?: string
  last_name?: string
  phone?: string
  role: 'user' | 'moderator' | 'admin' | 'super_admin'
  preferred_city?: string
  email_notifications: boolean
  sms_notifications: boolean
  last_login?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}
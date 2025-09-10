import { CenterType } from '@/types/database'

// Configuration des marqueurs par type de centre
export const MARKER_CONFIG = {
  // Types de santé existants
  public_hospital: {
    iconUrl: '/icons/markers/public_hospital.svg',
    color: 'coral',
    size: [32, 32] as [number, number],
    label: 'Hôpital Public',
    description: 'Hôpital public avec services d\'urgence'
  },
  private_hospital: {
    iconUrl: '/icons/markers/hospital-building.png',
    color: 'coral',
    size: [32, 32] as [number, number],
    label: 'Hôpital Privé',
    description: 'Hôpital privé avec services complets'
  },
  private_clinic: {
    iconUrl: '/icons/markers/private_clinic.svg',
    color: 'teal',
    size: [30, 30] as [number, number],
    label: 'Clinique Privée',
    description: 'Clinique privée avec soins spécialisés'
  },
  health_center: {
    iconUrl: '/icons/markers/health_center.svg',
    color: 'teal',
    size: [28, 28] as [number, number],
    label: 'Centre de Santé',
    description: 'Centre de santé de base'
  },
  dispensary: {
    iconUrl: '/icons/markers/dispensary.svg',
    color: 'orange',
    size: [26, 26] as [number, number],
    label: 'Dispensaire',
    description: 'Dispensaire médical'
  },
  maternity: {
    iconUrl: '/icons/markers/breastfeeding.png',
    color: 'pink',
    size: [28, 28] as [number, number],
    label: 'Maternité',
    description: 'Services de maternité et obstétrique'
  },
  specialized_center: {
    iconUrl: '/icons/markers/medicine.png',
    color: 'purple',
    size: [28, 28] as [number, number],
    label: 'Centre Spécialisé',
    description: 'Centre médical spécialisé'
  },
  laboratory: {
    iconUrl: '/icons/markers/laboratory.svg',
    color: 'yellow',
    size: [26, 26] as [number, number],
    label: 'Laboratoire',
    description: 'Laboratoire d\'analyses médicales'
  },
  pharmacy: {
    iconUrl: '/icons/markers/medicalstore.png',
    color: 'green',
    size: [26, 26] as [number, number],
    label: 'Pharmacie',
    description: 'Pharmacie et médicaments'
  },
  medical_office: {
    iconUrl: '/icons/markers/medical_office.svg',
    color: 'yellow',
    size: [24, 24] as [number, number],
    label: 'Cabinet Médical',
    description: 'Cabinet médical privé'
  },
  dialysis_center: {
    iconUrl: '/icons/markers/dialysis_center.svg',
    color: 'coral',
    size: [30, 30] as [number, number],
    label: 'Centre de Dialyse',
    description: 'Centre spécialisé en dialyse'
  },
  // Nouveaux types pour services d'urgence Fianarantsoa
  fire_station: {
    iconUrl: '/icons/markers/firstaid.png',
    color: 'red',
    size: [32, 32] as [number, number],
    label: 'Caserne de Pompiers',
    description: 'Intervention incendie et secours'
  },
  fire_hydrant: {
    iconUrl: '/icons/markers/firstaid.png',
    color: 'red',
    size: [24, 24] as [number, number],
    label: 'Bouche d\'Incendie',
    description: 'Point d\'eau pour pompiers'
  },
  police_station: {
    iconUrl: '/icons/markers/emergencyphone.png',
    color: 'blue',
    size: [30, 30] as [number, number],
    label: 'Commissariat de Police',
    description: 'Services de police et urgences'
  },
  gendarmerie: {
    iconUrl: '/icons/markers/emergencyphone.png',
    color: 'blue',
    size: [30, 30] as [number, number],
    label: 'Gendarmerie',
    description: 'Gendarmerie nationale'
  },
  jirama_office: {
    iconUrl: '/icons/markers/pleasurepier.png',
    color: 'orange',
    size: [26, 26] as [number, number],
    label: 'Agence JIRAMA',
    description: 'Service eau et électricité'
  },
  red_cross: {
    iconUrl: '/icons/markers/firstaid.png',
    color: 'red',
    size: [28, 28] as [number, number],
    label: 'Croix-Rouge',
    description: 'Premiers secours et actions humanitaires'
  },
  samu: {
    iconUrl: '/icons/markers/ambulance.png',
    color: 'coral',
    size: [30, 30] as [number, number],
    label: 'SAMU',
    description: 'Service d\'urgence médicale'
  },
  ngo_medical: {
    iconUrl: '/icons/markers/sozialeeinrichtung.png',
    color: 'green',
    size: [28, 28] as [number, number],
    label: 'ONG Médicale',
    description: 'Organisation non gouvernementale médicale'
  },
  other: {
    iconUrl: '/icons/markers/default.svg',
    color: 'neutral',
    size: [28, 28] as [number, number],
    label: 'Autre',
    description: 'Autre service d\'urgence'
  },
  default: {
    iconUrl: 'https://cdn-icons-png.flaticon.com/256/3448/3448513.png',
    color: 'neutral',
    size: [28, 28] as [number, number],
    label: 'Centre Médical',
    description: 'Centre médical'
  }
} as const

// Cache pour les instances d'icônes (optimisation performance)
const iconCache = new Map<string, any>()

/**
 * Crée ou récupère une icône Leaflet pour un type de centre donné
 * Fonction utilisable uniquement côté client
 */
export function createMarkerIcon(centerType: CenterType): any {
  
  if (typeof window === 'undefined') {

    return null
  }

  if (iconCache.has(centerType)) {
    return iconCache.get(centerType)!
  }

  
  const L = require('leaflet')
 
  const config = MARKER_CONFIG[centerType] || MARKER_CONFIG.default
  
  
  const icon = L.icon({
    iconUrl: config.iconUrl,
    iconSize: config.size,
    iconAnchor: [config.size[0] / 2, config.size[1]], 
    popupAnchor: [0, -config.size[1]], 
    className: `marker-${config.color} marker-${centerType}`,
    
  })

  
  iconCache.set(centerType, icon)
  
  return icon
}

/**
 * Retourne la configuration d'un type de centre
 */
export function getMarkerConfig(centerType: CenterType) {
  return MARKER_CONFIG[centerType] || MARKER_CONFIG.default
}

/**
 * Retourne tous les types de centres disponibles avec leurs configs
 */
export function getAllMarkerTypes() {
  return Object.entries(MARKER_CONFIG)
    .filter(([key]) => key !== 'default')
    .map(([type, config]) => ({
      type: type as CenterType,
      ...config
    }))
}

/**
 * Crée un marqueur Leaflet complet avec popup pour un centre de santé
 * Fonction utilisable uniquement côté client
 */
export function createHealthCenterMarker(center: {
  id: string
  name: string
  center_type: CenterType
  latitude: number
  longitude: number
  emergency_24h?: boolean
  phone?: string
}) {
  if (typeof window === 'undefined') {
    
    return null
  }

  const L = require('leaflet')

  const config = getMarkerConfig(center.center_type)
  const icon = createMarkerIcon(center.center_type)
  

  const popupContent = `
    <div class="marker-popup">
      <h3 class="font-semibold text-sm mb-1">${center.name}</h3>
      <p class="text-xs text-muted-foreground mb-2">${config.label}</p>
      ${center.emergency_24h ? '<span class="inline-block bg-coral-light text-coral text-xs px-2 py-1 rounded">24/7</span>' : ''}
      ${center.phone ? `<p class="text-xs mt-2"><strong>📞</strong> ${center.phone}</p>` : ''}
      <a href="/centre/${center.id}" class="inline-block mt-2 text-xs text-primary hover:underline">Voir détails →</a>
    </div>
  `
  
  return L.marker([center.latitude, center.longitude], { icon })
    .bindPopup(popupContent, {
      maxWidth: 250,
      className: 'custom-popup'
    })
}

/**
 * Crée une légende pour la carte avec tous les types de marqueurs
 */
export function createMapLegend() {
  const legendItems = getAllMarkerTypes().map(({ type, iconUrl, label, color }) => `
    <div class="flex items-center gap-2 mb-1">
      <img src="${iconUrl}" alt="${label}" class="w-4 h-4" />
      <span class="text-xs text-${color}">${label}</span>
    </div>
  `).join('')

  return `
    <div class="map-legend bg-white p-3 rounded-lg shadow-sm border">
      <h4 class="text-sm font-semibold mb-2">Types de centres</h4>
      ${legendItems}
    </div>
  `
}
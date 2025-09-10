'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { createMarkerIcon, getMarkerConfig } from '@/lib/mapMarkers'
import { CenterType } from '@/types/database'
import { MAP_CONFIG } from '@/lib/constants'
import { useSearchStore } from '@/lib/store'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface RouteData {
  coordinates: [number, number][]
  color?: string
}

interface MapProps {
  centers?: Array<{
    id: string
    name: string
    latitude: number
    longitude: number
    center_type: CenterType
    full_address: string
    city: string
    phone?: string
    emergency_24h?: boolean
    photos?: string[]
  }>
  center?: [number, number]
  zoom?: number
  height?: string
  className?: string
  onMarkerClick?: (center: any) => void
  showLocationButton?: boolean
  showFullscreenButton?: boolean
  isFullscreen?: boolean
  visibleTypes?: CenterType[]
  onFullscreenClick?: () => void
  route?: RouteData
  userPosition?: [number, number]
}

// Composant interne qui importe Leaflet de manière dynamique
function MapComponent({ 
  centers = [], 
  center = MAP_CONFIG.defaultCenter, // Fianarantsoa par défaut
  zoom = MAP_CONFIG.defaultZoom,
  height = '400px',
  className = '',
  onMarkerClick,
  showLocationButton = true,
  showFullscreenButton = false,
  isFullscreen = false,
  visibleTypes,
  onFullscreenClick,
  route,
  userPosition
}: MapProps) {
  const { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } = require('react-leaflet')
  const L = require('leaflet')
  
  // État global pour la mémoire de la carte
  const { mapState, setMapState } = useSearchStore()
  
  // Debug logging pour vérifier les updates des centers
  useEffect(() => {
    console.log('🗺️ Map component received centers update:', {
      centersCount: centers.length,
      visibleTypesCount: visibleTypes?.length || 'all',
      centers: centers.map(c => ({ id: c.id, name: c.name, type: c.center_type }))
    })
  }, [centers, visibleTypes])
  
  // États pour la géolocalisation
  const [currentPosition, setCurrentPosition] = useState<[number, number] | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  
  // Utiliser l'état global ou les props par défaut
  const [mapCenter, setMapCenter] = useState<[number, number]>(mapState.center)
  const [mapZoom, setMapZoom] = useState(mapState.zoom)
  
  // Fix pour les icônes Leaflet dans Next.js
  useEffect(() => {
    require('leaflet/dist/leaflet.css')
  }, [L])

  // Fonction pour obtenir la position de l'utilisateur
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      alert('La géolocalisation n\'est pas prise en charge par ce navigateur.')
      return
    }

    setIsLocating(true)
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        const newPosition: [number, number] = [latitude, longitude]
        setCurrentPosition(newPosition)
        setMapCenter(newPosition)
        setMapZoom(15) 
        setIsLocating(false)
      },
      (error) => {
       
        let message = 'Impossible d\'obtenir votre position.'
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            message = 'Autorisation de géolocalisation refusée.'
            break
          case error.POSITION_UNAVAILABLE:
            message = 'Position non disponible.'
            break
          case error.TIMEOUT:
            message = 'Délai de géolocalisation dépassé.'
            break
        }
        
        alert(message)
        setIsLocating(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    )
  }

  // Component pour contrôler le centrage de la carte
  function MapController({ center, zoom }: { center: [number, number], zoom: number }) {
    const map = useMap()
    
    useEffect(() => {
      if (center) {
        map.setView(center, zoom)
      }
    }, [center, zoom, map])
    
    return null
  }

  // Composant pour sauvegarder les changements de carte
  function MapEvents() {
    const map = useMap()
    
    useEffect(() => {
      const saveMapState = () => {
        const center = map.getCenter()
        const zoom = map.getZoom()
        const newCenter: [number, number] = [center.lat, center.lng]
        
        // Sauvegarder dans le store global
        setMapState(newCenter, zoom)
        
        // Mettre à jour l'état local
        setMapCenter(newCenter)
        setMapZoom(zoom)
      }
      
      map.on('moveend', saveMapState)
      map.on('zoomend', saveMapState)
      
      return () => {
        map.off('moveend', saveMapState)
        map.off('zoomend', saveMapState)
      }
    }, [map])
    
    return null
  }

  return (
    <TooltipProvider>
      <div className={`relative ${className}`} style={{ height }}>
        {/* Bouton plein écran */}
        {showFullscreenButton && !isFullscreen && onFullscreenClick && (
          <div className="absolute top-4 right-4 z-[1000]">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onFullscreenClick}
                  className="bg-white border border-gray-300 rounded-md p-2 shadow-lg hover:bg-gray-50 transition-all duration-200 hover:shadow-xl flex items-center justify-center"
                >
                  <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Afficher en plein écran</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}
        
        {/* Bouton de géolocalisation */}
        {showLocationButton && (
          <button
            onClick={getUserLocation}
            disabled={isLocating}
            className={`absolute top-4 z-40 bg-white border border-gray-300 rounded-md p-2 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ${
              showFullscreenButton && !isFullscreen ? 'right-16' : 'right-4'
            }`}
            title="Utiliser ma position"
          >
            {isLocating ? (
              <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            ) : (
              <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </button>
        )}
      
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        scrollWheelZoom={true}
        className="w-full h-full rounded-lg overflow-hidden"
        style={{ height: '100%', minHeight: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController center={mapCenter} zoom={mapZoom} />
        <MapEvents />
        
        {/* Marqueur pour la position de l'utilisateur (priorise userPosition puis currentPosition) */}
        {(userPosition || currentPosition) && (
          <Marker 
            position={userPosition || currentPosition!}
            icon={L.divIcon({
              className: 'custom-user-marker',
              html: `
                <div style="
                  width: 20px; 
                  height: 20px; 
                  border-radius: 50%; 
                  background-color: #3b82f6; 
                  border: 3px solid white;
                  box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
                  position: relative;
                ">
                  <div style="
                    position: absolute;
                    top: -10px;
                    left: -10px;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background-color: rgba(59, 130, 246, 0.2);
                    animation: pulse 2s infinite;
                  "></div>
                </div>
                <style>
                  @keyframes pulse {
                    0% { transform: scale(1); opacity: 0.8; }
                    50% { transform: scale(1.2); opacity: 0.4; }
                    100% { transform: scale(1); opacity: 0.8; }
                  }
                </style>
              `,
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            })}
          >
            <Popup>
              <div className="text-center">
                <div className="text-sm font-semibold mb-1">📍 Votre position</div>
                <div className="text-xs text-gray-600">Position actuelle</div>
              </div>
            </Popup>
          </Marker>
        )}
        
        {centers
          .filter((center) => {
            // Si visibleTypes n'est pas fourni du tout, afficher tous
            if (!visibleTypes) {
              console.log('🏷️ No visibleTypes filter, showing all centers');
              return true
            }
            // Si visibleTypes est un tableau vide, ne rien afficher (tout masqué)
            if (visibleTypes.length === 0) {
              console.log('🚫 VisibleTypes is empty, hiding all centers');
              return false
            }
            // Filtrer par type selon visibleTypes
            const isVisible = visibleTypes.includes(center.center_type);
            console.log(`🏷️ Center ${center.name} (${center.center_type}): ${isVisible ? 'visible' : 'hidden'}`, {
              visibleTypes,
              centerType: center.center_type
            });
            return isVisible;
          })
          .map((center) => {
            if (!center.latitude || !center.longitude) return null
            
            // Créer l'icône personnalisée selon le type
            const customIcon = createMarkerIcon(center.center_type)
            const config = getMarkerConfig(center.center_type)
            
            // Skip if icon creation failed (SSR case)
            if (!customIcon) return null
            
            return (
            <Marker
              key={center.id}
              position={[center.latitude, center.longitude]}
              icon={customIcon}
              eventHandlers={{
                click: () => onMarkerClick?.(center)
              }}
            >
              {/* Tooltip seulement si pas en plein écran */}
              {!isFullscreen && (
                <Popup>
                  <div className="min-w-56 max-w-64">
                    {/* Photo du centre */}
                    {center.photos && center.photos.length > 0 && (
                      <div className="mb-2 rounded overflow-hidden">
                        <img 
                          src={center.photos[0]} 
                          alt={center.name}
                          className="w-full h-24 object-cover"
                          onError={(e) => {
                            // Si l'image ne charge pas, la cacher
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    
                    {/* Nom du centre */}
                    <h3 className="font-semibold text-sm mb-1">{center.name}</h3>
                    
                    {/* Adresse */}
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {center.full_address}
                    </p>
                    
                    {/* Bouton */}
                    <a 
                      href={`/centre/${center.id}`}
                      className="block w-full bg-primary !text-white px-3 py-2 rounded text-xs hover:bg-primary/90 transition-colors text-center no-underline"
                    >
                      Voir les détails →
                    </a>
                  </div>
                </Popup>
              )}
            </Marker>
          )
        })}


        {/* Tracé de l'itinéraire */}
        {route && route.coordinates && route.coordinates.length > 1 && (
          <Polyline
            positions={route.coordinates}
            pathOptions={{
              color: route.color || '#3b82f6',
              weight: 4,
              opacity: 0.8,
              lineJoin: 'round',
              lineCap: 'round'
            }}
          />
        )}
      </MapContainer>
      </div>
    </TooltipProvider>
  )
}

// Export dynamique pour éviter les problèmes SSR
export const Map = dynamic(() => Promise.resolve(MapComponent), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center bg-gray-100 rounded-lg" style={{ height: '400px' }}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-sm text-gray-600">Chargement de la carte...</p>
      </div>
    </div>
  )
})

export default Map
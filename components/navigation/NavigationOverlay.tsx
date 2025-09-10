'use client';

import React, { useState, useEffect } from 'react';
import { X, Navigation, Car, PersonStanding, Bike, Clock, MapPin, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HealthCenter } from '@/types/database';

interface NavigationOverlayProps {
  destination: HealthCenter;
  onClose: () => void;
  onRouteCalculated?: (route: any) => void;
  onUserPositionFound?: (position: [number, number]) => void;
}

interface RouteInfo {
  distance: number; // en mètres
  duration: number; // en secondes
  coordinates: [number, number][];
}

export function NavigationOverlay({ destination, onClose, onRouteCalculated, onUserPositionFound }: NavigationOverlayProps) {
  const [transportMode, setTransportMode] = useState<string>('driving-car');
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationPermission, setLocationPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [isFallbackRoute, setIsFallbackRoute] = useState(false);

  const transportModes = [
    { key: 'driving-car', label: 'Voiture', icon: Car, color: 'text-blue-600' },
    { key: 'foot-walking', label: 'À pied', icon: PersonStanding, color: 'text-green-600' },
    { key: 'cycling-regular', label: 'Vélo', icon: Bike, color: 'text-orange-600' },
  ];

  // Demander la géolocalisation
  useEffect(() => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: [number, number] = [position.coords.latitude, position.coords.longitude];
          setUserPosition(coords);
          setLocationPermission('granted');
          setIsLoading(false);
         
          if (onUserPositionFound) {
            onUserPositionFound(coords);
          }
        },
        (error) => {
          
          setLocationPermission('denied');
          setError('Impossible d\'obtenir votre position. Veuillez autoriser la géolocalisation.');
          setIsLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    } else {
      setError('La géolocalisation n\'est pas supportée par ce navigateur.');
      setLocationPermission('denied');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Calculer l'itinéraire avec OSRM et fallback
  const calculateRoute = async () => {
    if (!userPosition || !destination.latitude || !destination.longitude) return;

    setIsLoading(true);
    setError(null);

    try {
      // Calculer la distance à vol d'oiseau comme base
      const distance = calculateDistance(
        userPosition[0],
        userPosition[1], 
        destination.latitude,
        destination.longitude
      );

      // Si la distance est trop grande (>100km), utiliser seulement le calcul à vol d'oiseau
      if (distance > 100) {
        const routeData = createFallbackRoute(distance);
        setRouteInfo(routeData);
        setIsFallbackRoute(true);
        if (onRouteCalculated) {
          onRouteCalculated(routeData);
        }
        setIsLoading(false);
        return;
      }

      // Essayer OSRM avec les modes de transport corrects
      const osrmMode = transportMode === 'driving-car' ? 'driving' : 
                      transportMode === 'foot-walking' ? 'walking' : 'cycling';
      
      const osrmUrl = `https://router.project-osrm.org/route/v1/${osrmMode}/${userPosition[1]},${userPosition[0]};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson`;
      
      const response = await fetch(osrmUrl, { 
        signal: AbortSignal.timeout(5000) // Timeout de 5 secondes
      });
      
      if (!response.ok) {
        throw new Error('OSRM API error');
      }

      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        
        // Ajuster la durée selon le mode de transport pour Madagascar
        let adjustedDuration = route.duration;
        const distanceKm = route.distance / 1000;
        
        // Si OSRM ne donne pas des durées réalistes, les recalculer
        if (transportMode === 'driving-car' || osrmMode === 'driving') {
          // Vitesse moyenne en voiture à Madagascar : ~24 km/h
          adjustedDuration = Math.max(300, (distanceKm / 24) * 3600); // min 5 min
        } else if (transportMode === 'foot-walking' || osrmMode === 'walking') {
          // Vitesse de marche : ~5 km/h
          adjustedDuration = Math.max(600, (distanceKm / 5) * 3600); // min 10 min
        } else if (transportMode === 'cycling-regular' || osrmMode === 'cycling') {
          // Vitesse à vélo : ~15 km/h
          adjustedDuration = Math.max(480, (distanceKm / 15) * 3600); // min 8 min
        }
        
        const routeData: RouteInfo = {
          distance: route.distance,
          duration: adjustedDuration,
          coordinates: route.geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng])
        };
        
        setRouteInfo(routeData);
        setIsFallbackRoute(false); 
        if (onRouteCalculated) {
          onRouteCalculated(routeData);
        }
      } else {
        throw new Error('No routes found');
      }
    } catch (err) {
    
      
     
      try {
        const distance = calculateDistance(
          userPosition[0],
          userPosition[1],
          destination.latitude,
          destination.longitude
        );
        
        const routeData = createFallbackRoute(distance);
        setRouteInfo(routeData);
        setIsFallbackRoute(true); // Mode fallback
        if (onRouteCalculated) {
          onRouteCalculated(routeData);
        }
      } catch (fallbackErr) {
        setError('Impossible de calculer l\'itinéraire. Position trop éloignée.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Créer un itinéraire de fallback basé sur la distance à vol d'oiseau
  const createFallbackRoute = (distanceKm: number): RouteInfo => {
    // Estimation des temps selon le mode de transport (Madagascar)
    const estimatedTimes = {
      'driving-car': Math.max(5, Math.round(distanceKm * 2.5)), // ~24km/h (routes malgaches)
      'foot-walking': Math.max(10, Math.round(distanceKm * 12)), // ~5km/h
      'cycling-regular': Math.max(8, Math.round(distanceKm * 4)), // ~15km/h
    };

    const durationMinutes = estimatedTimes[transportMode as keyof typeof estimatedTimes];

    return {
      distance: distanceKm * 1000, // Convertir en mètres
      duration: durationMinutes * 60, // Convertir en secondes
      coordinates: [userPosition!, [destination.latitude!, destination.longitude!]]
    };
  };

  // Calculer la distance à vol d'oiseau (formule de Haversine)
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Rayon de la Terre en kilomètres
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Calculer l'itinéraire avec OSRM
  useEffect(() => {
    if (userPosition && destination.latitude && destination.longitude) {
      setIsFallbackRoute(false); // Reset du flag
      calculateRoute();
    }
  }, [userPosition, transportMode, destination]); // eslint-disable-line react-hooks/exhaustive-deps

  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}min`;
  };


  return (
    <div className="absolute top-4 left-4 z-[1010] bg-white rounded-lg shadow-lg border border-gray-200 max-w-sm w-full">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <Navigation className="h-5 w-5 text-primary flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm truncate">Itinéraire vers</h3>
              <p className="text-xs text-gray-600 truncate">{destination.name}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Modes de transport */}
        <div className="flex gap-1 mb-3">
          {transportModes.map(({ key, label, icon: Icon, color }) => (
            <Button
              key={key}
              variant={transportMode === key ? "default" : "outline"}
              onClick={() => setTransportMode(key)}
              className="flex-1 p-2"
              size="sm"
            >
              <Icon className={`h-4 w-4 ${transportMode === key ? 'text-white' : color}`} />
              <span className="text-xs ml-1 hidden sm:inline">{label}</span>
            </Button>
          ))}
        </div>

        {error && (
          <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Informations sur l'itinéraire */}
        {isLoading && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2 text-sm text-gray-600">Calcul en cours...</span>
          </div>
        )}

        {routeInfo && !isLoading && (
          <div className="space-y-2 mb-3">
            {isFallbackRoute && (
              <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg mb-2">
                <p className="text-xs text-blue-700">
                  ℹ️ Estimation basée sur la distance à vol d'oiseau (routes détaillées non disponibles)
                </p>
              </div>
            )}
            
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Distance</span>
              </div>
              <span className="text-sm font-bold text-primary">
                {formatDistance(routeInfo.distance)} {isFallbackRoute && '(à vol d\'oiseau)'}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Durée {isFallbackRoute ? 'estimée' : ''}</span>
              </div>
              <span className="text-sm font-bold text-primary">
                {formatDuration(routeInfo.duration)}
              </span>
            </div>
          </div>
        )}

        {locationPermission === 'denied' && (
          <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-700">
              Autorisez la géolocalisation pour calculer l'itinéraire depuis votre position.
            </p>
          </div>
        )}

        {/* Boutons d'action */}
        <div className="space-y-2">
          {locationPermission === 'denied' && (
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="w-full"
              size="sm"
            >
              Réessayer la géolocalisation
            </Button>
          )}
          
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full"
            size="sm"
          >
            Fermer l'itinéraire
          </Button>
        </div>
      </div>
    </div>
  );
}

export default NavigationOverlay;
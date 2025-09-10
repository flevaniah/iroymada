'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, Filter, Search, Map as MapIcon } from 'lucide-react';
import { NavigationOverlay } from '@/components/navigation/NavigationOverlay';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Map } from '@/components/ui/map';
import { CenterDrawer } from '@/components/centres/CenterDrawer';
import { FilterPanel } from '@/components/centres/FilterPanel';
import { MapLegend, MapLegendMobile } from '@/components/ui/map-legend';
import { Drawer } from '@/components/ui/drawer';
import { useSearchStore } from '@/lib/store';
import { HealthCenter, CenterType } from '@/types/database';

interface FullscreenMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFilters?: {
    query?: string;
    center_type?: CenterType;
    emergency_24h?: boolean;
    wheelchair_accessible?: boolean;
    services?: string[];
  };
}

export function FullscreenMapModal({ isOpen, onClose, initialFilters = {} }: FullscreenMapModalProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState<HealthCenter | null>(null);
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [showNavigation, setShowNavigation] = useState(false);
  const [navigationDestination, setNavigationDestination] = useState<HealthCenter | null>(null);
  const [visibleTypes, setVisibleTypes] = useState<CenterType[]>([
    'public_hospital', 'private_hospital', 'private_clinic', 'health_center', 
    'medical_office', 'pharmacy', 'laboratory', 'fire_station', 'police_station', 
    'samu', 'jirama_office', 'gendarmerie', 'red_cross'
  ]);
  const [routeData, setRouteData] = useState<{coordinates: [number, number][], color?: string} | null>(null);
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  
  const { 
    centers, 
    isLoading, 
    error,
    filters,
    searchCentersForMap,
    setFilters,
    clearResults
  } = useSearchStore();

  // Debug logging pour suivre les changements de centres
  useEffect(() => {
    console.log('🖼️ FullscreenMapModal centers updated:', {
      count: centers.length,
      isLoading,
      centers: centers.map(c => ({ id: c.id, name: c.name, type: c.center_type }))
    });
  }, [centers, isLoading]);

  // Synchroniser visibleTypes avec les filtres qui changent
  useEffect(() => {
    console.log('🔄 Synchronizing visibleTypes with filters.center_type:', filters.center_type);
    if (filters.center_type) {
      // Si un type spécifique est filtré, n'afficher que ce type
      setVisibleTypes([filters.center_type]);
    } else {
      // Sinon, afficher tous les types par défaut
      setVisibleTypes([
        'public_hospital', 'private_hospital', 'private_clinic', 'health_center', 
        'medical_office', 'pharmacy', 'laboratory', 'fire_station', 'police_station', 
        'samu', 'jirama_office', 'gendarmerie', 'red_cross'
      ]);
    }
  }, [filters.center_type]); // Se déclencher quand center_type change

  // Handler pour basculer la visibilité d'un type
  const handleToggleType = (type: CenterType) => {
    setVisibleTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  // Handler pour afficher tous les types
  const handleShowAll = () => {
    setVisibleTypes([
      'public_hospital', 'private_hospital', 'private_clinic', 'health_center', 
      'medical_office', 'pharmacy', 'laboratory', 'fire_station', 'police_station', 
      'samu', 'jirama_office', 'gendarmerie', 'red_cross'
    ]);
  };

  // Handler pour masquer tous les types
  const handleHideAll = () => {
    setVisibleTypes([]);
  };

  // Charger tous les centres au démarrage en utilisant initialFilters
  useEffect(() => {
    if (isOpen && !filtersApplied) {
      // Fusionner les initialFilters avec les filtres du store et s'assurer que la ville est définie
      const mergedFilters = { 
        ...filters,
        ...initialFilters,
        city: "Fianarantsoa" // Toujours forcer Fianarantsoa
      };
      
      console.log('🗺️ Fullscreen Map initializing with filters:', mergedFilters);
      
      // Appliquer les filtres fusionnés
      setFilters(mergedFilters);
      
      // Déclencher la recherche avec les filtres fusionnés
      setTimeout(() => {
        searchCentersForMap();
      }, 100); // Petit délai pour s'assurer que les filtres sont appliqués
      setFiltersApplied(true);
    }
    if (!isOpen) {
      setFiltersApplied(false);
    }
  }, [isOpen, filtersApplied, initialFilters]);

  // Empêcher le scroll du body quand le modal est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Écouter les événements personnalisés pour la navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleStartNavigation = (event: any) => {
      const destination = event.detail?.destination;
      if (destination) {
        setNavigationDestination(destination);
        setShowNavigation(true);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('startNavigation', handleStartNavigation);
      return () => {
        window.removeEventListener('startNavigation', handleStartNavigation);
      };
    }
  }, [isOpen]);


  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/80 z-[9998]" />
      
      {/* Modal */}
      <div className="fixed inset-0 z-[9999] flex flex-col bg-background overflow-hidden fullscreen-map-modal">
        <style jsx global>{`
          .fullscreen-map-modal {
            scrollbar-width: none; /* Firefox */
            -ms-overflow-style: none; /* Internet Explorer 10+ */
          }
          .fullscreen-map-modal::-webkit-scrollbar { /* WebKit */
            width: 0;
            height: 0;
            background: transparent;
          }
          .leaflet-container {
            scrollbar-width: none !important;
            -ms-overflow-style: none !important;
          }
          .leaflet-container::-webkit-scrollbar {
            width: 0 !important;
            height: 0 !important;
            background: transparent !important;
          }
        `}</style>
        {/* Header responsive */}
        <div className="bg-card border-b border-border">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 md:space-x-4 flex-1 min-w-0">
                <h1 className="text-lg md:text-xl font-semibold text-foreground truncate">
                  Carte des centres de santé
                </h1>
                {centers.length > 0 && (
                  <div className="text-xs md:text-sm text-muted-foreground hidden sm:block">
                    {centers.length} centre{centers.length > 1 ? 's' : ''} affiché{centers.length > 1 ? 's' : ''}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                {/* Boutons desktop */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="hidden sm:flex"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filtres
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="hidden sm:flex"
                  onClick={() => setShowLegend(!showLegend)}
                >
                  <MapIcon className="h-4 w-4 mr-2" />
                  Légende
                </Button>
                
                <Button variant="outline" size="sm" onClick={onClose}>
                  <X className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Fermer</span>
                </Button>
              </div>
            </div>
          </div>
        </div>


        {/* Carte */}
        <div className="flex-1 relative overflow-hidden">
          {error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-red-500 mb-4">⚠️</div>
                <h3 className="text-lg font-semibold mb-2">Erreur de chargement</h3>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={() => searchCentersForMap()}>
                  Réessayer
                </Button>
              </div>
            </div>
          ) : (
            <div className="relative w-full h-full">
              <Map
                key={`map-${centers.length}-${JSON.stringify(filters.center_type)}-${JSON.stringify(visibleTypes)}`} // Forcer re-render
                centers={centers
                  .filter(centre => centre.latitude && centre.longitude)
                  .map(centre => ({
                    id: centre.id,
                    name: centre.name || '',
                    latitude: centre.latitude!,
                    longitude: centre.longitude!,
                    center_type: centre.center_type,
                    full_address: centre.full_address || '',
                    city: centre.city || '',
                    phone: centre.phone,
                    emergency_24h: centre.emergency_24h
                  }))
                }
                center={[-21.4536, 47.0854]} // Fianarantsoa
                zoom={12}
                height="100%"
                className="w-full h-full"
                isFullscreen={true}
                visibleTypes={visibleTypes}
                route={routeData || undefined}
                userPosition={userPosition || undefined}
                onMarkerClick={(center) => {
                  const fullCenter = centers.find(c => c.id === center.id);
                  if (fullCenter) {
                    setSelectedCenter(fullCenter);
                  }
                }}
              />
              
              {/* Navigation Overlay */}
              {showNavigation && navigationDestination && (
                <NavigationOverlay
                  destination={navigationDestination}
                  onClose={() => {
                    setShowNavigation(false);
                    setNavigationDestination(null);
                    setRouteData(null);
                    setUserPosition(null);
                  }}
                  onRouteCalculated={(route) => {
                    if (route && route.coordinates) {
                      setRouteData({
                        coordinates: route.coordinates,
                        color: '#3b82f6'
                      });
                    }
                  }}
                  onUserPositionFound={(position) => {
                    setUserPosition(position);
                  }}
                />
              )}
            </div>
          )}

          {/* Boutons flottants mobiles */}
          <div className="absolute bottom-4 left-4 z-[1010] md:hidden flex flex-col gap-2">
            <Button 
              onClick={() => setShowFilters(!showFilters)}
              className="rounded-full w-12 h-12 p-0 shadow-lg"
            >
              <Filter className="h-5 w-5" />
            </Button>
            <Button 
              onClick={() => setShowLegend(!showLegend)}
              variant="secondary" 
              className="rounded-full w-12 h-12 p-0 shadow-lg"
            >
              <MapIcon className="h-5 w-5" />
            </Button>
          </div>

        </div>

        {/* Légende flottante sur desktop */}
        {showLegend && (
          <div 
            className="fixed top-24 right-4 z-[10000] hidden md:block max-h-[calc(100vh-8rem)]"
            style={{ zIndex: 10000 }}
          >
            <MapLegend
              visibleTypes={visibleTypes}
              onToggleType={handleToggleType}
              onShowAll={handleShowAll}
              onHideAll={handleHideAll}
            />
          </div>
        )}

        {/* Drawer des filtres */}
        <Drawer
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
          title="Filtres"
          side="left"
        >
          <FilterPanel />
        </Drawer>

        {/* Légende mobile en bottom sheet */}
        {typeof window !== 'undefined' && window.innerWidth < 768 && (
          <MapLegendMobile
            isOpen={showLegend}
            onClose={() => setShowLegend(false)}
            visibleTypes={visibleTypes}
            onToggleType={handleToggleType}
            onShowAll={handleShowAll}
            onHideAll={handleHideAll}
          />
        )}

        {/* Drawer pour les détails du centre */}
        <CenterDrawer
          center={selectedCenter}
          isOpen={!!selectedCenter}
          onClose={() => setSelectedCenter(null)}
        />
      </div>
    </>
  );
}

export default FullscreenMapModal;
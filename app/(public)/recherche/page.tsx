"use client";

export const dynamic = "force-dynamic";

import { useEffect, Suspense, useState } from "react";
import { NavigationOverlay } from '@/components/navigation/NavigationOverlay';
import { useSearchParams } from "next/navigation";
import { Loader2, MapIcon, ListIcon, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CenterCard } from "@/components/centres/CentreCard";
import { FilterPanel } from "@/components/centres/FilterPanel";
import { Map } from "@/components/ui/map";
import { FullscreenMapModal } from "@/components/ui/fullscreen-map-modal";
import { useSearchStore } from "@/lib/store";

function SearchContent() {
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [showFullscreenMap, setShowFullscreenMap] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [showNavigation, setShowNavigation] = useState(false);
  const [navigationDestination, setNavigationDestination] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const {
    centers,
    isLoading,
    error,
    currentPage,
    totalPages,
    totalResults,
    filters,
    sortBy,
    setFilters,
    setSortBy,
    searchCenters,
    searchCentersForMap,
    setPagination,
  } = useSearchStore();


  useEffect(() => {
    setIsHydrated(true);
    setIsMounted(true);
    
    if (typeof window !== 'undefined') {
  
      const savedViewMode = sessionStorage.getItem('searchViewMode');
      const savedFullscreen = sessionStorage.getItem('searchFullscreenMap');
      
      if (savedViewMode === 'map' || savedViewMode === 'list') {
        setViewMode(savedViewMode);
      }
      if (savedFullscreen === 'true') {
        setShowFullscreenMap(true);
      }
    }
  }, []);


  useEffect(() => {
    if (isMounted) {
      sessionStorage.setItem('searchViewMode', viewMode);
      sessionStorage.setItem('searchFullscreenMap', showFullscreenMap.toString());
    }
  }, [viewMode, showFullscreenMap, isMounted]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('searchPageTimestamp', Date.now().toString());
      
      const cleanupTimer = setTimeout(() => {
        const lastTimestamp = sessionStorage.getItem('searchPageTimestamp');
        if (lastTimestamp && (Date.now() - parseInt(lastTimestamp)) > 30000) {
          sessionStorage.removeItem('searchViewMode');
          sessionStorage.removeItem('searchFullscreenMap');
          sessionStorage.removeItem('searchPageTimestamp');
        }
      }, 30000);
      
      return () => {
        clearTimeout(cleanupTimer);
        sessionStorage.setItem('searchPageTimestamp', Date.now().toString());
      };
    }
  }, []);

  
  useEffect(() => {
   
    if (!isHydrated) return;
    
    const initialFilters = {
      query: searchParams.get("q") || "",
      city: "Fianarantsoa", // 
      center_type: searchParams.get("center_type") as any,
      emergency_24h: searchParams.get("emergency_24h") === "true",
      wheelchair_accessible: searchParams.get("wheelchair_accessible") === "true",
      services: searchParams.get("services")?.split(",").filter(Boolean).map(s => s.trim().toLowerCase()) || [],
    };

 

    setFilters(initialFilters);
    
 
    const triggerSearch = () => {
      
      if (viewMode === "map") {
        searchCentersForMap();
      } else {
        searchCenters();
      }
    };
    
 
    const timeoutId = setTimeout(triggerSearch, 100);
    
    return () => clearTimeout(timeoutId);
  }, [searchParams, viewMode, isHydrated]); 

  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'F11' || (event.altKey && event.key === 'Enter')) {
        event.preventDefault();
        setShowFullscreenMap(true);
      }
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, []);

  
  useEffect(() => {
    const handleOpenFullscreenMap = () => {
      setShowFullscreenMap(true);
    };

    const handleStartNavigation = (event: any) => {
      const destination = event.detail?.destination;
      if (destination) {
        setNavigationDestination(destination);
        setShowNavigation(true);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('openFullscreenMap', handleOpenFullscreenMap);
      window.addEventListener('startNavigation', handleStartNavigation);

      return () => {
        window.removeEventListener('openFullscreenMap', handleOpenFullscreenMap);
        window.removeEventListener('startNavigation', handleStartNavigation);
      };
    }
  }, []);

  const handlePageChange = (page: number) => {
    setPagination(page, totalPages, totalResults);
    searchCenters();
  };


  const handleSortChange = (newSortBy: "recent" | "distance" | "name") => {
    setSortBy(newSortBy);

    setTimeout(() => {
      if (viewMode === "map") {
        searchCentersForMap();
      } else {
        searchCenters();
      }
    }, 50);
  };


  return (
    <div className="bg-background">

      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Recherche des services d'urgences
          </h1>
          {totalResults > 0 && (
            <p className="text-muted-foreground">
              {totalResults} centre{totalResults > 1 ? "s" : ""} trouvé
              {totalResults > 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <FilterPanel />
            </div>
          </div>

        
          <div className="lg:col-span-3">
            
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}>
                  <ListIcon className="h-4 w-4 mr-2" />
                  Liste
                </Button>
                <Button
                  variant={viewMode === "map" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("map")}>
                  <MapIcon className="h-4 w-4 mr-2" />
                  Carte
                </Button>
              </div>

            
              <select 
                className="p-2 border border-border rounded-md text-sm bg-background"
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value as "recent" | "distance" | "name")}>
                <option value="recent">Plus récents</option>
                <option value="distance">Plus proches</option>
                <option value="name">Nom A-Z</option>
              </select>
            </div>

            
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">
                  Recherche en cours...
                </span>
              </div>
            )}

            {/* Erreur */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {!isLoading && !error && centers.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🏥</div>
                <h3 className="text-xl font-semibold mb-2">
                  Aucun centre trouvé
                </h3>
                <p className="text-muted-foreground mb-4">
                  Essayez de modifier vos critères de recherche
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    const { clearResults, setFilters } =
                      useSearchStore.getState();
                    setFilters({});
                    clearResults();
                  }}>
                  Effacer les filtres
                </Button>
              </div>
            )}

        
            {!isLoading && centers.length > 0 && viewMode === "map" && (
              <div className="space-y-4">
                <div className="relative">
                  <Map
                    centers={centers.map((center) => ({
                      id: center.id,
                      name: center.name,
                      latitude: center.latitude || 0,
                      longitude: center.longitude || 0,
                      center_type: center.center_type,
                      full_address: center.full_address,
                      city: center.city,
                      phone: center.phone,
                      photos: center.photos || [],
                    }))}
                    height="600px"
                    className="rounded-lg border border-border"
                    showFullscreenButton={true}
                    onFullscreenClick={() => setShowFullscreenMap(true)}
                  />
                  
                 
                  {showNavigation && navigationDestination && (
                    <NavigationOverlay
                      destination={navigationDestination}
                      onClose={() => {
                        setShowNavigation(false);
                        setNavigationDestination(null);
                      }}
                    />
                  )}
                </div>
                <div className="text-sm text-muted-foreground text-center">
                  {centers.length} centre{centers.length > 1 ? "s" : ""} affiché
                  {centers.length > 1 ? "s" : ""} sur la carte
                </div>
              </div>
            )}

           
            {!isLoading && centers.length > 0 && viewMode === "list" && (
              <>
                <div className="grid gap-4 mb-8">
                  {centers.map((center) => (
                    <CenterCard
                      key={center.id}
                      center={center}
                      showDistance={!!center.distance}
                    />
                  ))}
                </div>

               
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2">
                    <Button
                      variant="outline"
                      disabled={currentPage <= 1}
                      onClick={() => handlePageChange(currentPage - 1)}>
                      Précédent
                    </Button>

                    <div className="flex gap-1">
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          const page = Math.max(1, currentPage - 2) + i;
                          if (page > totalPages) return null;

                          return (
                            <Button
                              key={page}
                              variant={
                                page === currentPage ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => handlePageChange(page)}>
                              {page}
                            </Button>
                          );
                        }
                      )}
                    </div>

                    <Button
                      variant="outline"
                      disabled={currentPage >= totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}>
                      Suivant
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

     
      <FullscreenMapModal
        isOpen={showFullscreenMap}
        onClose={() => setShowFullscreenMap(false)}
        initialFilters={filters}
      />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }>
      <SearchContent />
    </Suspense>
  );
}

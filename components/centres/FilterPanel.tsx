"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Filter, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSearchStore } from "@/lib/store";
import {
  CENTER_TYPES,
  SERVICE_CATEGORIES,
  AVAILABLE_SERVICES,
  MADAGASCAR_CITIES,
} from "@/lib/constants";

export function FilterPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { filters, setFilters, searchCenters, isLoading } = useSearchStore();
  const [showAllFilters, setShowAllFilters] = useState(false);

  // Fonction pour mettre à jour l'URL avec les nouveaux filtres
  const updateURL = useCallback((newFilters: any) => {
    const params = new URLSearchParams();
    
    if (newFilters.query) params.set('q', newFilters.query);
    // Ville toujours fixée à Fianarantsoa - pas d'ajout dans l'URL
    if (newFilters.center_type) params.set('center_type', newFilters.center_type);
    if (newFilters.emergency_24h) params.set('emergency_24h', 'true');
    if (newFilters.wheelchair_accessible) params.set('wheelchair_accessible', 'true');
    if (newFilters.services?.length) params.set('services', newFilters.services.join(','));
    
    router.push(`/recherche?${params.toString()}`);
  }, [router]);

  const handleFilterChange = (key: string, value: any) => {
    // Convertir "all" en undefined pour center_type
    const processedValue = key === 'center_type' && value === 'all' ? undefined : value;
    setFilters({ [key]: processedValue });
    // Ne plus mettre à jour l'URL automatiquement
  };

  const handleServiceToggle = (service: string) => {
    const normalizedService = service.toLowerCase().trim();
    const currentServices = filters.services || [];
    const newServices = currentServices.includes(normalizedService)
      ? currentServices.filter((s) => s !== normalizedService)
      : [...currentServices, normalizedService];

    setFilters({ services: newServices });
    // Ne plus mettre à jour l'URL automatiquement
  };

  const resetFilters = () => {
    const emptyFilters = {
      query: "",
      city: "Fianarantsoa", // Toujours fixé à Fianarantsoa
      center_type: undefined,
      services: [],
      emergency_24h: false,
      wheelchair_accessible: false,
    };
    setFilters(emptyFilters);
    router.push('/recherche');
  };

  const handleSearch = () => {
    // Le tracking est maintenant fait automatiquement dans le store
    updateURL(filters);
    // Vérifier si on est dans une carte plein écran
    const isFullscreenMap = document.querySelector('.fullscreen-map-modal');
    if (isFullscreenMap) {
      console.log('🔍 FilterPanel: Launching fullscreen map search with filters:', filters);
      // Utiliser searchCentersForMap pour éviter la pagination avec délai pour synchronisation
      setTimeout(() => {
        useSearchStore.getState().searchCentersForMap();
      }, 50);
    } else {
      searchCenters();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtrer votre recherche
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Recherche textuelle */}
        <div>
          <label className="text-sm font-medium mb-2 block">Recherche</label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Nom du centre, spécialité..."
              value={filters.query || ""}
              onChange={(e) => handleFilterChange("query", e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Ville - Fixée à Fianarantsoa */}
        <div style={{ display: 'none' }}>
          <input type="hidden" value="Fianarantsoa" />
        </div>


        {/* Type de centre */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Type de centre
          </label>
          
          {/* Select natif pour le mode plein écran si Radix ne fonctionne pas */}
          {typeof window !== 'undefined' && document.querySelector('.fullscreen-map-modal') ? (
            <select
              value={filters.center_type || "all"}
              onChange={(e) => {
                console.log('🔧 Native select value changed:', e.target.value);
                handleFilterChange("center_type", e.target.value);
              }}
              className="w-full h-10 px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <option value="all">Tous les types</option>
              {Object.entries(CENTER_TYPES).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          ) : (
            <Select 
              value={filters.center_type || "all"} 
              onValueChange={(value) => {
                console.log('🔧 Select value changed:', value);
                handleFilterChange("center_type", value);
              }}
              onOpenChange={(open) => console.log('🔧 Select open state:', open)}
            >
              <SelectTrigger className="w-full" onClick={() => console.log('🔧 Select trigger clicked')}>
                <SelectValue placeholder="Tous les types" />
              </SelectTrigger>
              <SelectContent className="z-[10002]">
                <SelectItem value="all">Tous les types</SelectItem>
                {Object.entries(CENTER_TYPES).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Urgences 24h */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="urgences"
            checked={filters.emergency_24h || false}
            onChange={(e) =>
              handleFilterChange("emergency_24h", e.target.checked)
            }
            className="rounded border-border"
          />
          <label htmlFor="urgences" className="text-sm font-medium">
            Urgences 24h/24
          </label>
        </div>

        {/* Bouton pour afficher plus de filtres */}
        <Button
          variant="outline"
          onClick={() => setShowAllFilters(!showAllFilters)}
          className="w-full">
          {showAllFilters ? "Moins de filtres" : "Plus de filtres"}
        </Button>

        {/* Filtres avancés */}
        {showAllFilters && (
          <div className="space-y-4 pt-4">
            {/* Services */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Services recherchés
              </label>
              <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                {AVAILABLE_SERVICES.map((service) => (
                  <label
                    key={service}
                    className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={(filters.services || []).includes(service.toLowerCase().trim())}
                      onChange={() => handleServiceToggle(service)}
                      className="rounded border-border"
                    />
                    <span className="capitalize">{service}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Accessibilité */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="accessibilite"
                checked={filters.wheelchair_accessible || false}
                onChange={(e) =>
                  handleFilterChange("wheelchair_accessible", e.target.checked)
                }
                className="rounded border-border"
              />
              <label htmlFor="accessibilite" className="text-sm font-medium">
                Accessible aux personnes handicapées
              </label>
            </div>
          </div>
        )}

        {/* Bouton de recherche */}
        <div className="pt-4">
          <Button 
            onClick={handleSearch} 
            disabled={isLoading}
            className="w-full">
            <Search className="h-4 w-4 mr-2" />
            {isLoading ? "Recherche..." : "Rechercher"}
          </Button>
        </div>

        {/* Bouton Reset */}
        <div className="pt-0">
          <Button 
            variant="outline" 
            onClick={resetFilters} 
            disabled={isLoading}
            className="w-full">
            Réinitialiser les filtres
          </Button>
        </div>

      </CardContent>
    </Card>
  );
}

// Version mobile - Modal plein écran
export function FilterPanelMobile({ isOpen, onClose, onSearch }: { isOpen: boolean, onClose: () => void, onSearch?: () => void }) {
  const { filters, setFilters, searchCenters, isLoading } = useSearchStore();

  const handleFilterChange = (key: string, value: any) => {
    // Convertir "all" en undefined pour center_type
    const processedValue = key === 'center_type' && value === 'all' ? undefined : value;
    setFilters({ [key]: processedValue });
  };

  const handleServiceToggle = (service: string) => {
    const normalizedService = service.toLowerCase().trim();
    const currentServices = filters.services || [];
    const newServices = currentServices.includes(normalizedService)
      ? currentServices.filter((s) => s !== normalizedService)
      : [...currentServices, normalizedService];

    setFilters({ services: newServices });
  };

  const clearFilters = () => {
    const emptyFilters = {
      query: "",
      city: "Fianarantsoa",
      center_type: undefined,
      services: [],
      emergency_24h: false,
      wheelchair_accessible: false,
    };
    setFilters(emptyFilters);
  };

  const handleSearch = () => {
    // Vérifier si on est dans une carte plein écran
    const isFullscreenMap = document.querySelector('.fullscreen-map-modal');
    if (isFullscreenMap) {
      console.log('🔍 FilterPanelMobile: Launching fullscreen map search');
      // Utiliser searchCentersForMap pour éviter la pagination avec délai pour synchronisation
      setTimeout(() => {
        useSearchStore.getState().searchCentersForMap();
      }, 50);
    } else {
      searchCenters();
    }
    onSearch?.();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white z-[10001] overflow-y-auto">
      <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between">
        <button onClick={onClose} className="text-gray-600 hover:text-gray-900">✕</button>
        <h2 className="font-medium text-lg">Filtres de recherche</h2>
        <button onClick={clearFilters} className="text-sm text-gray-600 hover:text-gray-900">
          Effacer tout
        </button>
      </div>

      <div className="p-4 space-y-6">
        {/* Champs de filtre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
            Que recherchez-vous ?
          </label>
          <input
            type="text"
            placeholder="Nom du centre, spécialité..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-left"
            value={filters.query || ""}
            onChange={(e) => handleFilterChange("query", e.target.value)}
          />
        </div>

        {/* Type de centre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
            Type de centre
          </label>
          <Select value={filters.center_type || "all"} onValueChange={(value) => handleFilterChange("center_type", value)}>
            <SelectTrigger className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <SelectValue placeholder="Tous les types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              {Object.entries(CENTER_TYPES).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Services */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3 text-left">
            Services recherchés
          </label>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {AVAILABLE_SERVICES.map((service) => (
              <label key={service} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 text-left">
                <input
                  type="checkbox"
                  checked={(filters.services || []).includes(service.toLowerCase().trim())}
                  onChange={() => handleServiceToggle(service)}
                  className="w-4 h-4 mr-3"
                />
                <span className="text-sm text-left">{service}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Options spéciales */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3 text-left">
            Options spéciales
          </label>
          <div className="space-y-2">
            <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 text-left">
              <input
                type="checkbox"
                checked={filters.emergency_24h || false}
                onChange={(e) => handleFilterChange("emergency_24h", e.target.checked)}
                className="w-4 h-4 mr-3"
              />
              <span className="text-sm text-left">Urgences 24h/24</span>
            </label>
            <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 text-left">
              <input
                type="checkbox"
                checked={filters.wheelchair_accessible || false}
                onChange={(e) => handleFilterChange("wheelchair_accessible", e.target.checked)}
                className="w-4 h-4 mr-3"
              />
              <span className="text-sm text-left">Accessible aux personnes à mobilité réduite</span>
            </label>
          </div>
        </div>
      </div>

      {/* Bouton de recherche fixe en bas */}
      <div className="sticky bottom-0 bg-white border-t p-4">
        <button
          onClick={handleSearch}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-4 rounded-lg font-medium flex items-center justify-center transition-colors"
        >
          <Search className="h-5 w-5 mr-2" />
          Rechercher
        </button>
      </div>
    </div>
  );
}

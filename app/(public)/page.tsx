"use client";

// Force dynamic rendering
export const dynamic = "force-dynamic";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MADAGASCAR_CITIES } from "@/lib/constants";
import { Heart, MapPin, Phone, Search, Filter, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  CENTER_TYPES,
  SERVICE_CATEGORIES,
  AVAILABLE_SERVICES,
} from "@/lib/constants";
import { trackServiceClick, trackSearch } from "@/lib/tracking";

interface PopularService {
  name: string;
  centerCount: number;
  totalViews: number;
  popularityScore: number;
}

interface HomepageStats {
  totalCenters: number;
  citiesCovered: number;
  emergencyCenters: number;
}

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCenterType, setSelectedCenterType] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [emergency24h, setEmergency24h] = useState(false);
  const [wheelchairAccessible, setWheelchairAccessible] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [popularServices, setPopularServices] = useState<PopularService[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [homepageStats, setHomepageStats] = useState<HomepageStats>({
    totalCenters: 150, // Valeur par défaut
    citiesCovered: 15, // Valeur par défaut
    emergencyCenters: 42 // Valeur par défaut
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    const fetchPopularServices = async () => {
      try {
        const response = await fetch('/api/popular-services');
        if (response.ok) {
          const data = await response.json();
          setPopularServices(data.services || []);
        }
      } catch (error) {
        
      } finally {
        setIsLoadingServices(false);
      }
    };

    fetchPopularServices();
  }, []);

  useEffect(() => {
    const fetchHomepageStats = async () => {
      try {
        const response = await fetch('/api/homepage-stats');
        if (response.ok) {
          const data = await response.json();
          setHomepageStats(data.stats);
        }
      } catch (error) {
      
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchHomepageStats();
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.append("q", searchQuery);
    if (selectedCenterType) params.append("center_type", selectedCenterType);
    if (emergency24h) params.append("emergency_24h", "true");
    if (wheelchairAccessible) params.append("wheelchair_accessible", "true");
    if (selectedServices.length > 0) params.append("services", selectedServices.join(","));

   
    trackSearch({
      searchTerm: searchQuery || undefined,
      centerType: selectedCenterType || undefined,
      services: selectedServices.length > 0 ? selectedServices : undefined,
      emergency24h: emergency24h || undefined,
      wheelchairAccessible: wheelchairAccessible || undefined
    });

    router.push(`/recherche?${params.toString()}`);
  };

  const handleServiceToggle = (service: string) => {
    setSelectedServices(prev => 
      prev.includes(service)
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
  };

  const handleServiceClick = (service: string, source: 'homepage' | 'popular' = 'homepage') => {
    // Track le clic sur service
    trackServiceClick(service, source);
    
    const params = new URLSearchParams();
   
    let searchTerm = service.toLowerCase().trim();
   
    const serviceMapping: Record<string, string> = {
      'consultation': 'consultation générale',
      'urgence': 'urgences médicales', 
      'urgences': 'urgences médicales',
      'pharmacie': 'pharmacie',
      'laboratoire': 'laboratoire',
      'secours': 'premiers secours',
      'police': 'urgences policières',
      'pompier': 'intervention incendie',
      'pompiers': 'intervention incendie',
      'incendie': 'intervention incendie',
      'transport sanitaire': 'transport sanitaire',
      'évacuation': 'évacuation médicale',
      'maternité': 'maternité',
      'radiologie': 'radiologie',
      'soins infirmiers': 'soins infirmiers'
    };
    
 
    const mappedTerm = serviceMapping[searchTerm] || searchTerm;
    
    params.append("services", mappedTerm);
    router.push(`/recherche?${params.toString()}`);
  };

 
  const getServiceIcon = (serviceName: string): string => {
    const service = serviceName.toLowerCase();
    

    if (service.includes('urgence') || service.includes('emergency')) return '/icons/markers/firstaid.png';
    if (service.includes('maternité') || service.includes('maternity')) return '/icons/markers/breastfeeding.png';
    if (service.includes('laboratoire') || service.includes('lab')) return '/icons/markers/laboratory.svg';
    if (service.includes('pédiatrie') || service.includes('pediatr')) return '/icons/markers/breastfeeding.png';
    if (service.includes('pharmacie') || service.includes('pharmacy')) return '/icons/markers/medicalstore.png';
    if (service.includes('radiologie') || service.includes('radio')) return '/icons/markers/medicine.png';
    if (service.includes('dentaire') || service.includes('dental')) return '/icons/markers/medicine.png';
    if (service.includes('cardiologie') || service.includes('cardio')) return '/icons/markers/medicine.png';
    if (service.includes('ophtalmologie') || service.includes('ophtal')) return '/icons/markers/medicine.png';
    if (service.includes('chirurgie') || service.includes('surgery')) return '/icons/markers/hospital-building.png';
    if (service.includes('consultation')) return '/icons/markers/medical_office.svg';
    if (service.includes('gynécologie') || service.includes('gyneco')) return '/icons/markers/breastfeeding.png';
    if (service.includes('hospitalisation')) return '/icons/markers/hospital-building.png';
    if (service.includes('soins infirmiers')) return '/icons/markers/health_center.svg';
    if (service.includes('vaccination')) return '/icons/markers/medicine.png';
    
    // Services d'urgence et sécurité
    if (service.includes('pompier') || service.includes('incendie')) return '/icons/markers/firstaid.png';
    if (service.includes('police') || service.includes('urgences policières')) return '/icons/markers/emergencyphone.png';
    if (service.includes('gendarmerie')) return '/icons/markers/emergencyphone.png';
    if (service.includes('premiers secours') || service.includes('secours')) return '/icons/markers/firstaid.png';
    if (service.includes('samu') || service.includes('transport sanitaire')) return '/icons/markers/ambulance.png';
    if (service.includes('croix rouge') || service.includes('humanitaires')) return '/icons/markers/firstaid.png';
    if (service.includes('évacuation médicale')) return '/icons/markers/ambulance.png';
    
   
    if (service.includes('jirama') || service.includes('eau') || service.includes('électricité')) return '/icons/markers/pleasurepier.png';
    if (service.includes('dépannage')) return '/icons/markers/pleasurepier.png';
 
    return '/icons/markers/health_center.svg';
  };
  return (
    <div>
      
      <section className="bg-gradient-to-b from-primary/10 to-background py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Services d'urgences à votre disposition
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-12">
              Votre allié de confiance pour l'assistance d'urgence à
              Fianarantsoa
            </p>

           
            <div className="hidden md:block bg-white rounded-lg shadow-lg max-w-4xl mx-auto mb-12 overflow-hidden border">
              <div className="flex h-14">
               
                <div className="flex-1 flex items-center pl-4 pr-0 border-r border-gray-200">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500 mb-0.5 text-left">Que recherchez-vous ?</div>
                    <input
                      type="text"
                      placeholder="Nom du centre, spécialité..."
                      className="w-full text-sm bg-transparent border-0 focus:outline-none placeholder:text-gray-400 text-left"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

             
                <div className="flex items-center pl-4 pr-0 border-r border-gray-200 min-w-[180px]">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500 mb-0.5 text-left">Type de centre</div>
                    <Select value={selectedCenterType || undefined} onValueChange={(value) => setSelectedCenterType(value || "")}>
                      <SelectTrigger className="h-auto border-0 p-0 text-sm bg-transparent focus:ring-0 shadow-none">
                        <SelectValue placeholder="Tous les types" className="text-left" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(CENTER_TYPES).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

              
                <div 
                  className="flex items-center pl-4 pr-2 border-r border-gray-200 min-w-[140px] cursor-pointer hover:bg-gray-50"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500 mb-0.5 text-left">Services ({selectedServices.length})</div>
                    <div className="text-sm truncate text-left">
                      {selectedServices.length === 0 ? "Tous les services" : "Services sélectionnés"}
                    </div>
                  </div>
                  <ChevronDown className={`h-3 w-3 text-gray-400 ml-2 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
                </div>

               
                <button 
                  onClick={handleSearch}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 flex items-center justify-center font-medium transition-colors"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Rechercher
                </button>
              </div>

              {showAdvancedFilters && (
                <div className="border-t bg-gray-50 p-4">
                  <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                    {AVAILABLE_SERVICES.map((service) => (
                      <label key={service} className="flex items-center text-xs cursor-pointer hover:bg-white p-2 rounded">
                        <input
                          type="checkbox"
                          checked={selectedServices.includes(service)}
                          onChange={() => handleServiceToggle(service)}
                          className="w-3 h-3 mr-2"
                        />
                        {service}
                      </label>
                    ))}
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <div className="flex items-center space-x-6">
                      <label className="flex items-center text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={emergency24h}
                          onChange={(e) => setEmergency24h(e.target.checked)}
                          className="w-4 h-4 mr-2"
                        />
                        Urgences 24h/24
                      </label>
                      <label className="flex items-center text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={wheelchairAccessible}
                          onChange={(e) => setWheelchairAccessible(e.target.checked)}
                          className="w-4 h-4 mr-2"
                        />
                        Accessible PMR
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="md:hidden max-w-sm mx-auto mb-12">
              <button
                onClick={() => setShowAdvancedFilters(true)}
                className="w-full bg-white rounded-full shadow-lg border px-6 py-4 flex items-center justify-between text-left hover:shadow-xl transition-shadow"
              >
                <div>
                  <div className="font-medium text-gray-900">
                    {searchQuery || selectedCenterType || selectedServices.length > 0 
                      ? "Filtres appliqués" 
                      : "Rechercher un centre"
                    }
                  </div>
                  <div className="text-sm text-gray-500">
                    {searchQuery && `"${searchQuery}" • `}
                    {selectedCenterType && `${CENTER_TYPES[selectedCenterType as keyof typeof CENTER_TYPES]} • `}
                    {selectedServices.length > 0 && `${selectedServices.length} service${selectedServices.length > 1 ? 's' : ''} • `}
                    {emergency24h && "24h/24 • "}
                    {wheelchairAccessible && "Accessible PMR • "}
                    Fianarantsoa
                  </div>
                </div>
                <div className="bg-red-500 text-white p-2 rounded-full">
                  <Search className="h-4 w-4" />
                </div>
              </button>
            </div>

        
            {showAdvancedFilters && (
              <div className="md:hidden fixed inset-0 bg-white z-50 overflow-y-auto">
                <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between">
                  <button
                    onClick={() => setShowAdvancedFilters(false)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    ✕
                  </button>
                  <h2 className="font-medium text-lg">Filtres de recherche</h2>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCenterType("");
                      setSelectedServices([]);
                      setEmergency24h(false);
                      setWheelchairAccessible(false);
                    }}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Effacer tout
                  </button>
                </div>

                <div className="p-4 space-y-6">
            
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                      Que recherchez-vous ?
                    </label>
                    <input
                      type="text"
                      placeholder="Nom du centre, spécialité..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-left"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                 
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                      Type de centre
                    </label>
                    <Select value={selectedCenterType || undefined} onValueChange={(value) => setSelectedCenterType(value || "")}>
                      <SelectTrigger className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <SelectValue placeholder="Tous les types" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(CENTER_TYPES).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3 text-left">
                      Services recherchés
                    </label>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {AVAILABLE_SERVICES.map((service) => (
                        <label key={service} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 text-left">
                          <input
                            type="checkbox"
                            checked={selectedServices.includes(service)}
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
                          checked={emergency24h}
                          onChange={(e) => setEmergency24h(e.target.checked)}
                          className="w-4 h-4 mr-3"
                        />
                        <span className="text-sm text-left">Urgences 24h/24</span>
                      </label>
                      <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 text-left">
                        <input
                          type="checkbox"
                          checked={wheelchairAccessible}
                          onChange={(e) => setWheelchairAccessible(e.target.checked)}
                          className="w-4 h-4 mr-3"
                        />
                        <span className="text-sm text-left">Accessible aux personnes à mobilité réduite</span>
                      </label>
                    </div>
                  </div>
                </div>

                
                <div className="sticky bottom-0 bg-white border-t p-4">
                  <button
                    onClick={() => {
                      handleSearch();
                      setShowAdvancedFilters(false);
                    }}
                    className="w-full bg-red-500 hover:bg-red-600 text-white py-4 rounded-lg font-medium flex items-center justify-center transition-colors"
                  >
                    <Search className="h-5 w-5 mr-2" />
                    Rechercher
                  </button>
                </div>
              </div>
            )}
            

          
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="bg-card border border-border rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {isLoadingStats ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-16 mx-auto rounded"></div>
                  ) : (
                    `${homepageStats.totalCenters}+`
                  )}
                </div>
                <div className="text-muted-foreground">Centres d'urgences</div>
              </div>
              <div className="bg-card border border-border rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {isLoadingStats ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-12 mx-auto rounded"></div>
                  ) : (
                    homepageStats.citiesCovered
                  )}
                </div>
                <div className="text-muted-foreground">Villes couvertes</div>
              </div>
              <div className="bg-card border border-border rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {isLoadingStats ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-12 mx-auto rounded"></div>
                  ) : (
                    homepageStats.emergencyCenters > 0 ? homepageStats.emergencyCenters : "24/7"
                  )}
                </div>
                <div className="text-muted-foreground">Services d'urgence</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Comment ça fonctionne ?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Trouvez rapidement les services d'urgences adaptés à vos besoins
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Recherchez</h3>
              <p className="text-muted-foreground">
                Utilisez notre moteur de recherche pour trouver une spécialité
                ou services
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Localisez</h3>
              <p className="text-muted-foreground">
                Visualisez les services sur une carte interactive et trouvez le
                plus proche de vous
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Contactez</h3>
              <p className="text-muted-foreground">
                Accédez aux informations de contact et aux horaires d'ouverture
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Services les plus recherchés
            </h2>
            <p className="text-muted-foreground">
              Basé sur la popularité réelle des centres et leurs consultations
            </p>
          </div>

          {isLoadingServices ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
             
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-card border border-border rounded-lg p-4 animate-pulse"
                >
                 
                  <div className="mb-2 flex items-center justify-center">
                    <div className="w-8 h-8 bg-muted rounded"></div>
                  </div>
                  
                  <div className="mb-1">
                    <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
                  </div>
               
                  <div className="text-xs">
                    <div className="h-3 bg-muted rounded w-1/2 mx-auto"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {popularServices.slice(0, 8).map((service, index) => (
                <button
                  key={index}
                  onClick={() => handleServiceClick(service.name, 'popular')}
                  className="bg-card border border-border rounded-lg p-4 hover:bg-accent hover:shadow-md transition-all duration-200 text-center group"
                >
                  {/* Icône dynamique basée sur le nom du service */}
                  <div className="mb-2 group-hover:scale-110 transition-transform flex items-center justify-center">
                    <img 
                      src={getServiceIcon(service.name)} 
                      alt={service.name}
                      className="w-8 h-8 object-contain"
                      onError={(e) => {
                        
                        (e.target as HTMLImageElement).src = '/icons/markers/health_center.svg';
                      }}
                    />
                  </div>
                  <div className="font-medium text-sm mb-1 capitalize">
                    {service.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {service.centerCount} centre{service.centerCount > 1 ? "s" : ""}
                  </div>
                </button>
              ))}
            </div>
          )}

          {popularServices.length === 0 && !isLoadingServices && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🏥</div>
              <p className="text-muted-foreground mb-4">
                Services d'urgence les plus demandés à Fianarantsoa
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                {/* Services de base toujours affichés même sans données */}
                {[
                  { name: 'Urgences médicales', icon: '/icons/markers/firstaid.png' },
                  { name: 'Consultation générale', icon: '/icons/markers/medical_office.svg' },
                  { name: 'Pharmacie', icon: '/icons/markers/medicalstore.png' },
                  { name: 'Premiers secours', icon: '/icons/markers/firstaid.png' },
                  { name: 'Intervention incendie', icon: '/icons/markers/firstaid.png' },
                  { name: 'Urgences policières', icon: '/icons/markers/emergencyphone.png' },
                  { name: 'Transport sanitaire', icon: '/icons/markers/ambulance.png' },
                  { name: 'Maternité', icon: '/icons/markers/breastfeeding.png' }
                ].map((service, index) => (
                  <button
                    key={index}
                    onClick={() => handleServiceClick(service.name, 'homepage')}
                    className="bg-card border border-border rounded-lg p-4 hover:bg-accent hover:shadow-md transition-all duration-200 text-center group"
                  >
                    <div className="mb-2 group-hover:scale-110 transition-transform flex items-center justify-center">
                      <img 
                        src={service.icon} 
                        alt={service.name}
                        className="w-8 h-8 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/icons/markers/health_center.svg';
                        }}
                      />
                    </div>
                    <div className="font-medium text-sm mb-1">
                      {service.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Service essentiel
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

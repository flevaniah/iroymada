import { create } from 'zustand'
import { HealthCenter, SearchFilters } from '@/types/database'
import { trackSearch } from './tracking'

interface SearchState {
  // Search state
  centers: HealthCenter[]
  centres: HealthCenter[] // Backward compatibility
  isLoading: boolean
  error: string | null
  
  // Search filters
  filters: SearchFilters
  
  // Sorting
  sortBy: 'recent' | 'distance' | 'name'
  
  // Pagination
  currentPage: number
  totalPages: number
  totalResults: number
  
  // User position
  userLocation: { lat: number; lng: number } | null
  
  // Map state memory
  mapState: {
    center: [number, number]
    zoom: number
  }
  
  // Actions
  setCenters: (centers: HealthCenter[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setFilters: (filters: Partial<SearchFilters>) => void
  setSortBy: (sortBy: 'recent' | 'distance' | 'name') => void
  setUserLocation: (location: { lat: number; lng: number } | null) => void
  setPagination: (page: number, totalPages: number, totalResults: number) => void
  clearResults: () => void
  setMapState: (center: [number, number], zoom: number) => void
  
  // Async actions
  searchCenters: () => Promise<void>
  searchCentres: () => Promise<void> // Backward compatibility
  searchCentersForMap: () => Promise<void> // Pour la carte sans pagination
}

export const useSearchStore = create<SearchState>((set, get) => ({
  // Initial state
  centers: [],
  get centres() { return this.centers }, // Backward compatibility getter
  isLoading: false,
  error: null,
  filters: {
    query: "",
    city: "Fianarantsoa",
    center_type: undefined,
    emergency_24h: false,
    wheelchair_accessible: false,
    services: []
  },
  sortBy: 'recent',
  currentPage: 1,
  totalPages: 0,
  totalResults: 0,
  userLocation: null,
  mapState: {
    center: [-21.4536, 47.0854], // Fianarantsoa par défaut
    zoom: 12
  },

  // Sync actions
  setCenters: (centers) => set({ centers }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setFilters: (newFilters) => set(state => ({ 
    filters: { 
      ...state.filters, 
      ...newFilters,
      city: "Fianarantsoa" // Toujours forcer Fianarantsoa
    },
    currentPage: 1 // Reset page when changing filters
  })),
  setSortBy: (sortBy) => set({ sortBy, currentPage: 1 }), // Reset page when changing sort
  setUserLocation: (userLocation) => set({ userLocation }),
  setPagination: (currentPage, totalPages, totalResults) => 
    set({ currentPage, totalPages, totalResults }),
  clearResults: () => set({ 
    centers: [], 
    error: null, 
    currentPage: 1, 
    totalPages: 0, 
    totalResults: 0 
  }),
  setMapState: (center, zoom) => set(state => ({
    mapState: { center, zoom }
  })),

  // Async search action
  searchCenters: async () => {
    const { filters, currentPage, userLocation, sortBy } = get()
    
    set({ isLoading: true, error: null })

    try {
      const params = new URLSearchParams()
      
      // Search parameters
      if (filters.query) params.append('q', filters.query)
      if (filters.city) params.append('city', filters.city)
      if (filters.center_type) params.append('center_type', filters.center_type)
      if (filters.emergency_24h) params.append('emergency_24h', 'true')
      if (filters.wheelchair_accessible) params.append('wheelchair_accessible', 'true')
      if (filters.services?.length) params.append('services', filters.services.join(','))
      
      // Geographic position
      if (userLocation) {
        params.append('lat', userLocation.lat.toString())
        params.append('lng', userLocation.lng.toString())
        if (filters.radius) params.append('radius', filters.radius.toString())
      }
      
      // Sorting
      params.append('sortBy', sortBy)
      
      // Pagination
      params.append('page', currentPage.toString())

      const response = await fetch(`/api/centres?${params}`)
      
      if (!response.ok) {
        throw new Error('Search error')
      }

      const data = await response.json()
      
      // Tracker la recherche avec les résultats
      trackSearch({
        searchTerm: filters.query,
        centerType: filters.center_type,
        services: filters.services,
        emergency24h: filters.emergency_24h,
        wheelchairAccessible: filters.wheelchair_accessible,
        resultCount: data.pagination.total
      });
      
      set({
        centers: data.centers,
        currentPage: data.pagination.page,
        totalPages: data.pagination.pages,
        totalResults: data.pagination.total,
        isLoading: false
      })

    } catch (error) {
      
      set({
        error: error instanceof Error ? error.message : 'Search error',
        isLoading: false
      })
    }
  },

  // Search specifically for map (no pagination)
  searchCentersForMap: async () => {
    const { filters, userLocation, sortBy } = get()
    
    set({ isLoading: true, error: null })

    try {
      const params = new URLSearchParams()
      
      // Search parameters
      if (filters.query) params.append('q', filters.query)
      if (filters.city) params.append('city', filters.city)
      if (filters.center_type) params.append('center_type', filters.center_type)
      if (filters.emergency_24h) params.append('emergency_24h', 'true')
      if (filters.wheelchair_accessible) params.append('wheelchair_accessible', 'true')
      if (filters.services?.length) params.append('services', filters.services.join(','))
      
      // Geographic position
      if (userLocation) {
        params.append('lat', userLocation.lat.toString())
        params.append('lng', userLocation.lng.toString())
        if (filters.radius) params.append('radius', filters.radius.toString())
      }
      
      // Sorting
      params.append('sortBy', sortBy)
      
      // Disable pagination for map
      params.append('noPagination', 'true')

      const response = await fetch(`/api/centres?${params}`)
      
      if (!response.ok) {
        throw new Error('Search error')
      }

      const data = await response.json()
      
      // Tracker la recherche pour la carte avec les résultats
      trackSearch({
        searchTerm: filters.query,
        centerType: filters.center_type,
        services: filters.services,
        emergency24h: filters.emergency_24h,
        wheelchairAccessible: filters.wheelchair_accessible,
        resultCount: data.pagination.total
      });
      
      set({
        centers: data.centers,
        currentPage: data.pagination.page,
        totalPages: data.pagination.pages,
        totalResults: data.pagination.total,
        isLoading: false
      })

    } catch (error) {
      
      set({
        error: error instanceof Error ? error.message : 'Search error',
        isLoading: false
      })
    }
  },

  // Backward compatibility alias
  get searchCentres() { return this.searchCenters }
}))

// Store for individual center
interface CenterState {
  center: HealthCenter | null
  centre: HealthCenter | null // Backward compatibility
  isLoading: boolean
  error: string | null
  
  setCenter: (center: HealthCenter | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  fetchCenter: (id: string) => Promise<void>
  fetchCentre: (id: string) => Promise<void> // Backward compatibility
}

export const useCenterStore = create<CenterState>((set) => ({
  center: null,
  get centre() { return this.center }, // Backward compatibility getter
  isLoading: false,
  error: null,

  setCenter: (center) => set({ center }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  fetchCenter: async (id: string) => {
    set({ isLoading: true, error: null, center: null })

    try {
      const response = await fetch(`/api/centres/${id}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Centre non trouvé')
        }
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (!data.center) {
        throw new Error('Données du centre invalides')
      }
      
      set({ center: data.center, isLoading: false })

    } catch (error) {
      
      set({
        center: null,
        error: error instanceof Error ? error.message : 'Erreur de chargement',
        isLoading: false
      })
    }
  },

  // Backward compatibility alias
  get fetchCentre() { return this.fetchCenter }
}))

// Backward compatibility alias (to be removed after migration)
export const useCentreStore = useCenterStore
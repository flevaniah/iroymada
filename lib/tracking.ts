// Service de tracking des interactions utilisateur
import { supabase } from '@/lib/supabase'

// Configuration pour les vues éligibles
const VIEW_COOLDOWN_MINUTES = 5 // Minimum 5 minutes entre deux vues du même centre
const SESSION_STORAGE_KEY = 'center_views_session'

export type InteractionType = 
  | 'service_search'
  | 'service_filter' 
  | 'service_click'
  | 'popular_service_click'
  | 'center_type_filter'
  | 'emergency_filter'
  | 'accessibility_filter'
  | 'text_search'
  | 'center_view'
  | 'center_contact'

interface TrackInteractionParams {
  type: InteractionType
  serviceName?: string
  centerType?: string
  centerId?: string
  searchTerm?: string
  filterValues?: Record<string, any>
  resultCount?: number
  interactionValue?: number
}


function getSessionId(): string {
  let sessionId = sessionStorage.getItem('search_session_id')
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    sessionStorage.setItem('search_session_id', sessionId)
  }
  return sessionId
}


async function getClientIP(): Promise<string | null> {
  try {
    const response = await fetch('https://api.ipify.org?format=json')
    const data = await response.json()
    return data.ip
  } catch (error) {
    
    return null
  }
}


export async function trackInteraction(params: TrackInteractionParams) {
  try {
    
  
    const sessionId = getSessionId()
    const pageUrl = window.location.href
    const referrerUrl = document.referrer || null
    const userAgent = navigator.userAgent
    
  
    const { data: { user } } = await supabase.auth.getUser()
    
    
    let userPosition = null
    if (navigator.geolocation) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 5000,
            maximumAge: 300000 
          })
        })
        userPosition = `POINT(${position.coords.longitude} ${position.coords.latitude})`
      } catch (error) {
        
      }
    }

    const interactionData = {
      interaction_type: params.type,
      service_name: params.serviceName || null,
      center_type: params.centerType || null,
      center_id: params.centerId || null,
      search_term: params.searchTerm || null,
      filter_values: params.filterValues ? JSON.stringify(params.filterValues) : null,
      page_url: pageUrl,
      referrer_url: referrerUrl,
      session_id: sessionId,
      user_id: user?.id || null,
      user_agent: userAgent,
      user_position: userPosition,
      result_count: params.resultCount || null,
      interaction_value: params.interactionValue || 1,
      created_at: new Date().toISOString()
    }

 
    const { error, data } = await supabase
      .from('service_interactions')
      .insert([interactionData])
      .select()

    if (error) {
      
    } else {
     
    }
  } catch (error) {
    
  }
}


function isViewEligible(centerId: string): boolean {
  try {
    
    const sessionViews = sessionStorage.getItem(SESSION_STORAGE_KEY)
    const viewsData = sessionViews ? JSON.parse(sessionViews) : {}
    
   
    const lastViewTime = viewsData[centerId]
    if (!lastViewTime) {
      return true 
    }
    
  
    const now = Date.now()
    const timeDifference = now - lastViewTime
    const cooldownMs = VIEW_COOLDOWN_MINUTES * 60 * 1000
    
    return timeDifference >= cooldownMs
  } catch (error) {
  
    return true 
  }
}


function markCenterAsViewed(centerId: string): void {
  try {
    const sessionViews = sessionStorage.getItem(SESSION_STORAGE_KEY)
    const viewsData = sessionViews ? JSON.parse(sessionViews) : {}
    
   
    viewsData[centerId] = Date.now()
    

    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000)
    Object.keys(viewsData).forEach(key => {
      if (viewsData[key] < oneDayAgo) {
        delete viewsData[key]
      }
    })
    
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(viewsData))
  } catch (error) {

  }
}


export const trackServiceClick = (serviceName: string, source: 'homepage' | 'popular' = 'homepage') => {
  trackInteraction({
    type: source === 'popular' ? 'popular_service_click' : 'service_click',
    serviceName,
    interactionValue: source === 'popular' ? 3 : 2 
  })
}

export const trackSearch = (params: {
  searchTerm?: string
  centerType?: string
  services?: string[]
  emergency24h?: boolean
  wheelchairAccessible?: boolean
  resultCount?: number
}) => {
  const filterValues = {
    center_type: params.centerType,
    services: params.services,
    emergency_24h: params.emergency24h,
    wheelchair_accessible: params.wheelchairAccessible
  }

  // Vérifier s'il y a au moins un filtre actif
  const hasFilters = params.searchTerm || 
                     params.centerType || 
                     (params.services && params.services.length > 0) ||
                     params.emergency24h || 
                     params.wheelchairAccessible;


  if (!hasFilters) {
    trackInteraction({
      type: 'text_search', 
      searchTerm: 'recherche générale',
      filterValues,
      resultCount: params.resultCount,
      interactionValue: 1
    });
    return;
  }

 
  if (params.searchTerm) {
    trackInteraction({
      type: 'text_search',
      searchTerm: params.searchTerm,
      filterValues,
      resultCount: params.resultCount,
      interactionValue: 1
    })
  }

  
  if (params.centerType) {
    trackInteraction({
      type: 'center_type_filter',
      centerType: params.centerType,
      filterValues,
      resultCount: params.resultCount,
      interactionValue: 2
    })
  }

  if (params.services && params.services.length > 0) {
    params.services.forEach(service => {
      trackInteraction({
        type: 'service_filter',
        serviceName: service,
        filterValues,
        resultCount: params.resultCount,
        interactionValue: 3 
      })
    })
  }

  if (params.emergency24h) {
    trackInteraction({
      type: 'emergency_filter',
      filterValues,
      resultCount: params.resultCount,
      interactionValue: 2
    })
  }

  if (params.wheelchairAccessible) {
    trackInteraction({
      type: 'accessibility_filter',
      filterValues,
      resultCount: params.resultCount,
      interactionValue: 2
    })
  }
}

export const trackCenterView = async (centerId: string, centerType?: string) => {
  
  if (!isViewEligible(centerId)) {

    return
  }
  
 

  markCenterAsViewed(centerId)
  
  
  try {
    const response = await fetch(`/api/centres/${centerId}/view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const result = await response.json();
    if (result.counted) {
 
    } else {
     
    }
  } catch (error) {
    
  }
  
 
  trackInteraction({
    type: 'center_view',
    centerId,
    centerType,
    interactionValue: 1
  })
}

export const trackCenterContact = (centerId: string, centerType?: string) => {
  trackInteraction({
    type: 'center_contact',
    centerId,
    centerType,
    interactionValue: 5 
  })
}


export async function getServicePopularityStats(supabase: any, daysBack = 30) {
  const dateThreshold = new Date()
  dateThreshold.setDate(dateThreshold.getDate() - daysBack)
  
  const { data: interactions, error } = await supabase
    .from('service_interactions')
    .select('service_name, interaction_type, interaction_value, created_at')
    .gte('created_at', dateThreshold.toISOString())
    .not('service_name', 'is', null)

  if (error) {
  
    return []
  }

 
  const serviceStats: Record<string, number> = {}
  
  interactions?.forEach((interaction: any) => {
    const service = interaction.service_name
    if (!serviceStats[service]) {
      serviceStats[service] = 0
    }
    
    let weight = interaction.interaction_value
    switch (interaction.interaction_type) {
      case 'popular_service_click':
        weight *= 1.5 
        break
      case 'service_filter':
        weight *= 2 
        break
      case 'center_contact':
        weight *= 3 
        break
    }
    
    serviceStats[service] += weight
  })

  
  return Object.entries(serviceStats)
    .map(([service, score]) => ({
      name: service,
      popularityScore: score,
      interactionCount: interactions?.filter((i: any) => i.service_name === service).length || 0
    }))
    .sort((a, b) => b.popularityScore - a.popularityScore)
}
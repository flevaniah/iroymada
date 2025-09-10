import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { MOCK_HEALTH_CENTERS } from '@/lib/mock-data'
import { getServicePopularityStats } from '@/lib/tracking'


export const dynamic = 'force-dynamic'


async function isSupabaseConfigured() {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('health_centers')
      .select('id')
      .limit(1)
    return !error
  } catch (error) {
    
    return false
  }
}


const DEFAULT_POPULAR_SERVICES = [
  { name: 'Urgences médicales', centerCount: 15, totalViews: 1250, popularityScore: 185.0 },
  { name: 'Consultation générale', centerCount: 25, totalViews: 800, popularityScore: 330.0 },
  { name: 'Pharmacie', centerCount: 12, totalViews: 600, popularityScore: 180.0 },
  { name: 'Premiers secours', centerCount: 8, totalViews: 450, popularityScore: 125.0 },
  { name: 'Laboratoire d\'analyses', centerCount: 6, totalViews: 320, popularityScore: 92.0 },
  { name: 'Intervention incendie', centerCount: 5, totalViews: 200, popularityScore: 70.0 },
  { name: 'Urgences policières', centerCount: 4, totalViews: 180, popularityScore: 58.0 },
  { name: 'Transport sanitaire', centerCount: 7, totalViews: 150, popularityScore: 85.0 },
  { name: 'Maternité', centerCount: 8, totalViews: 300, popularityScore: 110.0 },
  { name: 'Radiologie', centerCount: 5, totalViews: 200, popularityScore: 70.0 },
  { name: 'Soins infirmiers', centerCount: 12, totalViews: 400, popularityScore: 160.0 },
  { name: 'Évacuation médicale', centerCount: 3, totalViews: 120, popularityScore: 42.0 }
]

export async function GET(request: NextRequest) {
  try {
   
    const supabaseConfigured = await isSupabaseConfigured()

    if (supabaseConfigured) {
      const supabase = createServerClient()
      
      try {
        
        const interactionStats = await getServicePopularityStats(supabase, 30)
        
        if (interactionStats.length > 0) {
        
          
   
          const { data: centers } = await supabase
            .from('health_centers')
            .select('services, view_count')
            .eq('status', 'approved')
            .not('services', 'is', null)

        
          const centerServiceStats: Record<string, { count: number; totalViews: number }> = {}
          centers?.forEach((center: any) => {
            const viewCount = center.view_count || 0
            if (Array.isArray(center.services)) {
              center.services.forEach((service: string) => {
                if (!centerServiceStats[service]) {
                  centerServiceStats[service] = { count: 0, totalViews: 0 }
                }
                centerServiceStats[service].count += 1
                centerServiceStats[service].totalViews += viewCount
              })
            }
          })

         
          const combinedStats = interactionStats.map(stat => {
            const centerStat = centerServiceStats[stat.name] || { count: 0, totalViews: 0 }
            return {
              name: stat.name,
              centerCount: centerStat.count,
              totalViews: centerStat.totalViews,
              interactionCount: stat.interactionCount,
           
              popularityScore: stat.popularityScore + (centerStat.count * 2)
            }
          })


          const finalServices = [...combinedStats]
          if (finalServices.length < 8) {
            const existingNames = new Set(finalServices.map(s => s.name))
            const additionalServices = DEFAULT_POPULAR_SERVICES
              .filter(service => !existingNames.has(service.name))
              .slice(0, 8 - finalServices.length)
              .map(service => ({ ...service, interactionCount: 0 }))
            finalServices.push(...additionalServices)
          }

          return NextResponse.json({ 
            services: finalServices.slice(0, 12),
            dataSource: 'interactions+defaults'
          })
        }
      } catch (trackingError) {
        
      }

    

      
      const { data: centers, error } = await supabase
        .from('health_centers')
        .select('services, view_count')
        .eq('status', 'approved')
        .not('services', 'is', null)

      if (error) {
      
       
        return NextResponse.json({ 
          services: DEFAULT_POPULAR_SERVICES,
          dataSource: 'defaults_only'
        })
      }

     
      const serviceStats: Record<string, { count: number; totalViews: number }> = {}
      
      centers?.forEach((center: any) => {
        const viewCount = center.view_count || 0
        if (Array.isArray(center.services)) {
          center.services.forEach((service: string) => {
            if (!serviceStats[service]) {
              serviceStats[service] = { count: 0, totalViews: 0 }
            }
            serviceStats[service].count += 1
            serviceStats[service].totalViews += viewCount
          })
        }
      })

      const popularServices = Object.entries(serviceStats)
        .map(([service, stats]) => ({
          name: service,
          centerCount: stats.count,
          totalViews: stats.totalViews,
          interactionCount: 0,
          popularityScore: stats.count * 10 + stats.totalViews * 0.1
        }))
        .sort((a, b) => b.popularityScore - a.popularityScore)

   
      const finalServices = [...popularServices]
      if (finalServices.length < 8) {
        const existingNames = new Set(finalServices.map(s => s.name))
        const additionalServices = DEFAULT_POPULAR_SERVICES
          .filter(service => !existingNames.has(service.name))
          .slice(0, 8 - finalServices.length)
          .map(service => ({ ...service, interactionCount: 0 }))
        finalServices.push(...additionalServices)
      }

      return NextResponse.json({ 
        services: finalServices.slice(0, 12),
        dataSource: 'centers+defaults'
      })

    } else {
      
      

      const serviceStats: Record<string, { count: number; totalViews: number }> = {}
      
      MOCK_HEALTH_CENTERS.forEach(center => {
        const viewCount = center.view_count || 0
        if (Array.isArray(center.services)) {
          center.services.forEach(service => {
            if (!serviceStats[service]) {
              serviceStats[service] = { count: 0, totalViews: 0 }
            }
            serviceStats[service].count += 1
            serviceStats[service].totalViews += viewCount
          })
        }
      })

      const popularServices = Object.entries(serviceStats)
        .map(([service, stats]) => ({
          name: service,
          centerCount: stats.count,
          totalViews: stats.totalViews,
          interactionCount: 0,
          popularityScore: stats.count * 10 + stats.totalViews * 0.1
        }))
        .sort((a, b) => b.popularityScore - a.popularityScore)


      const finalServices = [...popularServices]
      if (finalServices.length < 8) {
        const existingNames = new Set(finalServices.map(s => s.name))
        const additionalServices = DEFAULT_POPULAR_SERVICES
          .filter(service => !existingNames.has(service.name))
          .slice(0, 8 - finalServices.length)
          .map(service => ({ ...service, interactionCount: 0 }))
        finalServices.push(...additionalServices)
      }

      return NextResponse.json({ 
        services: finalServices.slice(0, 12),
        dataSource: 'mock+defaults'
      })
    }

  } catch (error) {
  
   
    return NextResponse.json({ 
      services: DEFAULT_POPULAR_SERVICES,
      dataSource: 'error_fallback'
    })
  }
}
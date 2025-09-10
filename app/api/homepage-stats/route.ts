import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

let cachedStats: {
  data: {
    totalCenters: number;
    citiesCovered: number;
    emergencyCenters: number;
  } | null;
  timestamp: number;
} = {
  data: null,
  timestamp: 0
};

const CACHE_DURATION = 24 * 60 * 60 * 1000; 

function isSupabaseConfigured() {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function GET(request: NextRequest) {
  try {
    const now = Date.now();
    
   
    if (cachedStats.data && (now - cachedStats.timestamp) < CACHE_DURATION) {
     
      return NextResponse.json({
        stats: cachedStats.data,
        cached: true,
        cacheTime: new Date(cachedStats.timestamp).toISOString()
      });
    }

    
    if (!isSupabaseConfigured()) {
      
      const mockStats = {
        totalCenters: 150,
        citiesCovered: 15,
        emergencyCenters: 42
      };
      
  
      cachedStats = {
        data: mockStats,
        timestamp: now
      };
      
      return NextResponse.json({
        stats: mockStats,
        cached: false,
        mock: true
      });
    }

    
    const supabase = createServerClient();
    

    
    const [centersResult, citiesResult, emergencyResult] = await Promise.all([
   
      supabase
        .from('health_centers')
        .select('id', { count: 'exact' })
        .eq('status', 'approved'),
      

      supabase
        .from('health_centers')
        .select('city', { count: 'exact' })
        .eq('status', 'approved')
        .not('city', 'is', null),
      
    
      supabase
        .from('health_centers')
        .select('id', { count: 'exact' })
        .eq('status', 'approved')
        .eq('emergency_24h', true)
    ]);

    if (centersResult.error) {

    }
    if (citiesResult.error) {
    
    }
    if (emergencyResult.error) {
     
    }

    const uniqueCities = new Set();
    if (citiesResult.data) {
      citiesResult.data.forEach((center: any) => {
        if (center.city) {
          uniqueCities.add(center.city.toLowerCase().trim());
        }
      });
    }

    const stats = {
      totalCenters: centersResult.count || 0,
      citiesCovered: uniqueCities.size,
      emergencyCenters: emergencyResult.count || 0
    };

   
    cachedStats = {
      data: stats,
      timestamp: now
    };

  

    return NextResponse.json({
      stats,
      cached: false,
      timestamp: new Date(now).toISOString()
    });

  } catch (error) {
   
    
   
    if (cachedStats.data) {
     
      return NextResponse.json({
        stats: cachedStats.data,
        cached: true,
        stale: true,
        error: 'Failed to fetch fresh data'
      });
    }
    

    return NextResponse.json({
      stats: {
        totalCenters: 150,
        citiesCovered: 15,
        emergencyCenters: 42
      },
      fallback: true,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 200 }); 
  }
}


export async function POST(request: NextRequest) {
  try {
   
    cachedStats = {
      data: null,
      timestamp: 0
    };
    

  
    return GET(request);
    
  } catch (error) {
    
    return NextResponse.json(
      { error: 'Failed to refresh stats' },
      { status: 500 }
    );
  }
}
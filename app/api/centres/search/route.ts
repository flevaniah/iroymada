import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Force dynamic API route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const limit = parseInt(searchParams.get('limit') || '5')

    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] })
    }

    // Search suggestions for autocompletion
    const { data, error } = await supabase
      .from('health_centers')
      .select('id, name, city, center_type')
      .eq('status', 'approved')
      .or(`name.ilike.%${query}%,city.ilike.%${query}%`)
      .limit(limit)

    if (error) {
      
      return NextResponse.json({ suggestions: [] })
    }

    const suggestions = (data || []).map(center => ({
      id: center.id,
      name: center.name,
      city: center.city,
      center_type: center.center_type,
      label: `${center.name} - ${center.city}`
    }))

    return NextResponse.json({ suggestions })

  } catch (error) {
    
    return NextResponse.json({ suggestions: [] })
  }
}
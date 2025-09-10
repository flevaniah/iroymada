import { NextRequest, NextResponse } from 'next/server'
import { createServerClientWithAuth, verifyAdminPermissions } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClientWithAuth()

    // Verify admin permissions
    const { user, profile, error: authError } = await verifyAdminPermissions(supabase)
    if (authError) {
      const status = authError === 'Unauthorized' ? 401 : authError === 'Insufficient permissions' ? 403 : 500
      return NextResponse.json({ error: authError }, { status })
    }

    // Calculate statistics directly from health_centers table
    const { count: total } = await supabase
      .from('health_centers')
      .select('*', { count: 'exact', head: true })

    const { count: approved } = await supabase
      .from('health_centers')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved')

    const { count: pending } = await supabase
      .from('health_centers')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    const { count: rejected } = await supabase
      .from('health_centers')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'rejected')

    // Calculate new centers this week
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const { count: thisWeek } = await supabase
      .from('health_centers')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', oneWeekAgo.toISOString())

    const stats = {
      total_centres: total || 0,
      centres_approuves: approved || 0,
      centres_en_attente: pending || 0,
      centres_rejetes: rejected || 0,
      nouveaux_cette_semaine: thisWeek || 0
    }

    // Get recent activity
    const { data: recentActivity } = await supabase
      .from('health_centers')
      .select('id, name, status, created_at, updated_at, city, center_type')
      .order('updated_at', { ascending: false })
      .limit(10)

    // Get centers by city for additional insights
    const { data: centersByCity } = await supabase
      .from('health_centers')
      .select('city')
      .eq('status', 'approved')

    const cityStats = centersByCity?.reduce((acc: Record<string, number>, center) => {
      acc[center.city] = (acc[center.city] || 0) + 1
      return acc
    }, {}) || {}

    return NextResponse.json({
      stats,
      recentActivity: recentActivity || [],
      cityStats
    })

  } catch (error) {
   
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
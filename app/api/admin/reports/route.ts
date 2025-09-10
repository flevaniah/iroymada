import { NextRequest, NextResponse } from 'next/server'
import { createServerClientWithAuth, verifyAdminPermissions } from '@/lib/auth-server'
import { CENTER_TYPES } from '@/lib/constants'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'json' // 'json' ou 'csv'
    
    const supabase = createServerClientWithAuth()

    // Verify admin permissions
    const { user, profile, error: authError } = await verifyAdminPermissions(supabase)
    if (authError) {
      const statusCode = authError === 'Unauthorized' ? 401 : authError === 'Insufficient permissions' ? 403 : 500
      return NextResponse.json({ error: authError }, { status: statusCode })
    }

    // Get all centers for analysis
    const { data: centers, error } = await supabase
      .from('health_centers')
      .select(`
        id,
        name,
        center_type,
        city,
        status,
        emergency_24h,
        wheelchair_accessible,
        services,
        specialties,
        view_count,
        created_at,
        updated_at
      `)

    if (error) {
      
      return NextResponse.json(
        { error: 'Error fetching data for reports' },
        { status: 500 }
      )
    }

    if (!centers) {
      return NextResponse.json({ error: 'No data found' }, { status: 404 })
    }

    // Calculate basic statistics
    const totalCenters = centers.length
    const approvedCenters = centers.filter(c => c.status === 'approved').length
    const pendingCenters = centers.filter(c => c.status === 'pending').length
    const rejectedCenters = centers.filter(c => c.status === 'rejected').length

    // Centers by type
    const centersByType = Object.keys(CENTER_TYPES).reduce((acc, type) => {
      acc[CENTER_TYPES[type as keyof typeof CENTER_TYPES]] = centers.filter(c => c.center_type === type).length
      return acc
    }, {} as Record<string, number>)

    // Centers by city
    const centersByCity = centers.reduce((acc, center) => {
      acc[center.city] = (acc[center.city] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Top cities (limit to top 10)
    const topCities = Object.entries(centersByCity)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .reduce((acc, [city, count]) => {
        acc[city] = count
        return acc
      }, {} as Record<string, number>)

    // Service analysis
    const servicesCounts = centers.reduce((acc, center) => {
      if (Array.isArray(center.services)) {
        center.services.forEach(service => {
          acc[service] = (acc[service] || 0) + 1
        })
      }
      return acc
    }, {} as Record<string, number>)

    const topServices = Object.entries(servicesCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .reduce((acc, [service, count]) => {
        acc[service] = count
        return acc
      }, {} as Record<string, number>)

    // Specialties analysis
    const specialtiesCounts = centers.reduce((acc, center) => {
      if (Array.isArray(center.specialties)) {
        center.specialties.forEach(specialty => {
          acc[specialty] = (acc[specialty] || 0) + 1
        })
      }
      return acc
    }, {} as Record<string, number>)

    const topSpecialties = Object.entries(specialtiesCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .reduce((acc, [specialty, count]) => {
        acc[specialty] = count
        return acc
      }, {} as Record<string, number>)

    // Accessibility statistics
    const emergencyCenters = centers.filter(c => c.emergency_24h).length
    const accessibleCenters = centers.filter(c => c.wheelchair_accessible).length

    // Growth analysis (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const monthlyGrowth = centers.reduce((acc, center) => {
      const createdDate = new Date(center.created_at)
      if (createdDate >= sixMonthsAgo) {
        const monthKey = `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, '0')}`
        acc[monthKey] = (acc[monthKey] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    // Most viewed centers (top 10)
    const mostViewed = centers
      .filter(c => c.status === 'approved')
      .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
      .slice(0, 10)
      .map(c => ({
        id: c.id,
        name: c.name,
        city: c.city,
        view_count: c.view_count || 0,
        center_type: CENTER_TYPES[c.center_type as keyof typeof CENTER_TYPES] || c.center_type
      }))

    // Recent activity (last 2 weeks)
    const twoWeeksAgo = new Date()
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)

    const recentActivity = centers
      .filter(c => new Date(c.updated_at) >= twoWeeksAgo)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 20)
      .map(c => ({
        id: c.id,
        name: c.name,
        city: c.city,
        status: c.status,
        center_type: CENTER_TYPES[c.center_type as keyof typeof CENTER_TYPES] || c.center_type,
        updated_at: c.updated_at
      }))

    const reports = {
      summary: {
        totalCenters,
        approvedCenters,
        pendingCenters,
        rejectedCenters,
        emergencyCenters,
        accessibleCenters,
        approvalRate: totalCenters > 0 ? Math.round((approvedCenters / totalCenters) * 100) : 0,
        accessibilityRate: totalCenters > 0 ? Math.round((accessibleCenters / totalCenters) * 100) : 0
      },
      distribution: {
        centersByType,
        centersByCity: topCities,
        topServices,
        topSpecialties
      },
      trends: {
        monthlyGrowth,
        mostViewed,
        recentActivity
      },
      generatedAt: new Date().toISOString(),
      period: {
        from: sixMonthsAgo.toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0]
      }
    }

    // Return CSV format if requested
    if (format === 'csv') {
      // Generate CSV content for centers data
      const csvHeaders = [
        'ID',
        'Nom',
        'Type',
        'Ville',
        'Statut',
        'Urgences 24h',
        'Accessible PMR',
        'Services',
        'Spécialités',
        'Vues',
        'Créé le',
        'Modifié le'
      ].join(',')

      const csvRows = centers.map(center => [
        center.id,
        `"${center.name.replace(/"/g, '""')}"`, // Échapper les guillemets
        `"${CENTER_TYPES[center.center_type as keyof typeof CENTER_TYPES] || center.center_type}"`,
        `"${center.city}"`,
        center.status,
        center.emergency_24h ? 'Oui' : 'Non',
        center.wheelchair_accessible ? 'Oui' : 'Non',
        `"${Array.isArray(center.services) ? center.services.join('; ') : ''}"`,
        `"${Array.isArray(center.specialties) ? center.specialties.join('; ') : ''}"`,
        center.view_count || 0,
        new Date(center.created_at).toLocaleDateString('fr-FR'),
        new Date(center.updated_at).toLocaleDateString('fr-FR')
      ].join(','))

      const csvContent = [csvHeaders, ...csvRows].join('\n')

      // Add BOM for proper UTF-8 encoding in Excel
      const csvWithBom = '\ufeff' + csvContent

      return new Response(csvWithBom, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="rapport-centres-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    }

    return NextResponse.json({ reports })

  } catch (error) {
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { createServerClientWithAuth, verifyAdminPermissions } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')
    
    const supabase = createServerClientWithAuth()

    // Verify admin permissions
    const { user, profile, error: authError } = await verifyAdminPermissions(supabase)
    if (authError) {
      const status = authError === 'Unauthorized' ? 401 : authError === 'Insufficient permissions' ? 403 : 500
      return NextResponse.json({ error: authError }, { status })
    }

    // Date threshold
    const dateThreshold = new Date()
    dateThreshold.setDate(dateThreshold.getDate() - days)

   
    const { data: interactions, error } = await supabase
      .from('service_interactions')
      .select('*')
      .gte('created_at', dateThreshold.toISOString())
      .order('created_at', { ascending: false })

    if (error) {
     
      return NextResponse.json(
        { error: 'Error fetching data for export' },
        { status: 500 }
      )
    }

   
    const headers = [
      'Date et Heure',
      'Type d\'Interaction',
      'Service',
      'Type de Centre',
      'Terme de Recherche',
      'Valeur Interaction',
      'Nombre Résultats',
      'Page URL',
      'Session ID',
      'User ID'
    ].join(',')

    const csvRows = interactions?.map((interaction: any) => {
      return [
        `"${new Date(interaction.created_at).toLocaleString('fr-FR')}"`,
        `"${interaction.interaction_type}"`,
        `"${interaction.service_name || ''}"`,
        `"${interaction.center_type || ''}"`,
        `"${interaction.search_term || ''}"`,
        interaction.interaction_value || 1,
        interaction.result_count || '',
        `"${interaction.page_url || ''}"`,
        `"${interaction.session_id || ''}"`,
        `"${interaction.user_id || 'Anonyme'}"`
      ].join(',')
    }) || []

    const csvContent = [headers, ...csvRows].join('\n')
    
    // Ajouter BOM pour Excel
    const csvWithBom = '\ufeff' + csvContent

    
    return new NextResponse(csvWithBom, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="analytics-${days}days-${new Date().toISOString().split('T')[0]}.csv"`,
        'Cache-Control': 'no-cache'
      }
    })

  } catch (error) {
   
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
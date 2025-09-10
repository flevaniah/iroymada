import { NextRequest, NextResponse } from 'next/server'
import { createServerClientWithAuth, verifyAdminPermissions } from '@/lib/auth-server'
import { CENTER_TYPES } from '@/lib/constants'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClientWithAuth()
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'csv' // csv, pdf
    const status = searchParams.get('status') || 'all'
    const city = searchParams.get('city') || 'all'

    // Verify admin permissions
    const { user, profile, error: authError } = await verifyAdminPermissions(supabase)
    if (authError) {
      const statusCode = authError === 'Unauthorized' ? 401 : authError === 'Insufficient permissions' ? 403 : 500
      return NextResponse.json({ error: authError }, { status: statusCode })
    }

    // Build query
    let query = supabase
      .from('health_centers')
      .select(`
        id,
        name,
        center_type,
        service_category,
        status,
        full_address,
        city,
        district,
        phone,
        secondary_phone,
        whatsapp,
        email,
        website,
        services,
        specialties,
        emergency_24h,
        wheelchair_accessible,
        parking_available,
        public_transport,
        description,
        created_at,
        updated_at,
        view_count,
        admin_notes
      `)
      .order('created_at', { ascending: false })

  
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }
    if (city && city !== 'all') {
      query = query.eq('city', city)
    }

    const { data: centers, error } = await query

    if (error) {
 
      return NextResponse.json(
        { error: 'Error fetching data for export' },
        { status: 500 }
      )
    }

    
    const exportData = centers?.map(center => ({
      'ID': center.id,
      'Nom': center.name,
      'Type': CENTER_TYPES[center.center_type as keyof typeof CENTER_TYPES] || center.center_type,
      'Ville': center.city,
      'Quartier': center.district || '',
      'Adresse': center.full_address || '',
      'Téléphone': center.phone || '',
      'WhatsApp': center.whatsapp || '',
      'Email': center.email || '',
      'Site Web': center.website || '',
      'Services': Array.isArray(center.services) ? center.services.join('; ') : '',
      'Spécialités': Array.isArray(center.specialties) ? center.specialties.join('; ') : '',
      'Urgences 24h': center.emergency_24h ? 'Oui' : 'Non',
      'Accessible PMR': center.wheelchair_accessible ? 'Oui' : 'Non',
      'Parking': center.parking_available ? 'Oui' : 'Non',
      'Transport Public': center.public_transport ? 'Oui' : 'Non',
      'Statut': center.status === 'approved' ? 'Approuvé' : center.status === 'pending' ? 'En attente' : 'Rejeté',
      'Vues': center.view_count || 0,
      'Date Création': center.created_at ? new Date(center.created_at).toLocaleDateString('fr-FR') : '',
      'Dernière MAJ': center.updated_at ? new Date(center.updated_at).toLocaleDateString('fr-FR') : '',
      'Notes Admin': center.admin_notes || ''
    })) || []

    if (format === 'pdf') {
      // Pour l'instant, on va retourner une version HTML imprimable
      // L'utilisateur peut faire Ctrl+P pour imprimer en PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Services d'Urgence Madagascar - ${new Date().toLocaleDateString('fr-FR')}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              font-size: 14px;
              line-height: 1.4;
            }
            h1 { 
              color: #dc2626; 
              text-align: center; 
              margin-bottom: 30px; 
              font-size: 24px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 20px; 
              font-size: 12px;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 8px; 
              text-align: left; 
              word-wrap: break-word;
            }
            th { 
              background-color: #f5f5f5; 
              font-weight: bold; 
            }
            .summary { 
              background: #f9f9f9; 
              padding: 15px; 
              margin-bottom: 20px; 
              border-radius: 5px; 
              border: 1px solid #ddd;
            }
            .footer { 
              text-align: center; 
              color: #666; 
              font-size: 10px; 
              margin-top: 30px;
              border-top: 1px solid #ddd;
              padding-top: 10px;
            }
            @media print { 
              body { margin: 10px; font-size: 12px; } 
              .summary { break-inside: avoid; }
              table { break-inside: avoid; }
            }
            @page { 
              margin: 1cm; 
              size: A4; 
            }
          </style>
        </head>
        <body>
          <h1>Services d'Urgence du Madagascar</h1>
          <div class="summary">
            <h3>Résumé de l'export</h3>
            <p><strong>Total des services:</strong> ${exportData.length}</p>
            <p><strong>Date d'export:</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
            <p><strong>Instructions:</strong> Utilisez Ctrl+P pour imprimer ce document en PDF</p>
          </div>
          <table>
            <thead>
              <tr>
                <th width="25%">Nom</th>
                <th width="15%">Type</th>
                <th width="15%">Ville</th>
                <th width="15%">Téléphone</th>
                <th width="10%">24h/24</th>
                <th width="10%">Statut</th>
                <th width="10%">Vues</th>
              </tr>
            </thead>
            <tbody>
              ${exportData.map(row => `
                <tr>
                  <td>${row['Nom'] || 'N/A'}</td>
                  <td>${row['Type'] || 'N/A'}</td>
                  <td>${row['Ville'] || 'N/A'}</td>
                  <td>${row['Téléphone'] || 'N/A'}</td>
                  <td>${row['Urgences 24h'] || 'Non'}</td>
                  <td>${row['Statut'] || 'N/A'}</td>
                  <td>${row['Vues'] || '0'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer">
            <p>Généré le ${new Date().toLocaleString('fr-FR')} - Services d'Urgence Madagascar</p>
            <p>Total: ${exportData.length} services répertoriés</p>
          </div>
          <script>
            // Auto-print dialog on load (optionnel)
            // window.onload = function() { window.print(); }
          </script>
        </body>
        </html>
      `
      
      return new NextResponse(htmlContent, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      })
    } else {
      // Export as CSV
      if (exportData.length === 0) {
        return NextResponse.json({ error: 'No data to export' }, { status: 400 })
      }

      const headers = Object.keys(exportData[0])
      const csvContent = [
        headers.join(','),
        ...exportData.map(row => 
          headers.map(header => {
            const value = row[header as keyof typeof row] || ''
            // Escape CSV values
            if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
              return `"${value.replace(/"/g, '""')}"`
            }
            return value
          }).join(',')
        )
      ].join('\n')

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="services-urgence-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      })
    }

  } catch (error) {
   
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
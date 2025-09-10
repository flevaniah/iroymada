import { NextRequest, NextResponse } from 'next/server'
import { createServerClientWithAuth, verifyAdminPermissions } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClientWithAuth()

    // Verify admin permissions
    const { user, profile, error: authError } = await verifyAdminPermissions(supabase)
    if (authError) {
      const status = authError === 'Unauthorized' ? 401 : authError === 'Insufficient permissions' ? 403 : 500
      return NextResponse.json({ error: authError }, { status })
    }

    const { action, centerIds } = await request.json()

    if (!action || !Array.isArray(centerIds) || centerIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid action or center IDs' },
        { status: 400 }
      )
    }

    let updateData: any = {
      updated_at: new Date().toISOString()
    }

    let actionDescription = ''

    switch (action) {
      case 'approve':
        updateData = {
          ...updateData,
          status: 'approved',
          approved_by: user.id,
          approved_at: new Date().toISOString()
        }
        actionDescription = 'approve centers'
        break

      case 'reject':
        updateData = {
          ...updateData,
          status: 'rejected',
          approved_by: null,
          approved_at: null
        }
        actionDescription = 'reject centers'
        break

      case 'delete':
        // Only admin and super_admin can delete
        if (!['admin', 'super_admin'].includes(profile.role)) {
          return NextResponse.json({ error: 'Insufficient permissions for deletion' }, { status: 403 })
        }

        
        const { error: deleteError } = await supabase
          .from('health_centers')
          .delete()
          .in('id', centerIds)

        if (deleteError) {
        
          return NextResponse.json(
            { error: 'Error deleting centers' },
            { status: 500 }
          )
        }

        
        await supabase.from('admin_logs').insert({
          admin_id: user.id,
          action: 'bulk_delete_centers',
          affected_table: 'health_centers',
          comment: `Bulk deleted ${centerIds.length} centers`
        })

        return NextResponse.json({ 
          success: true, 
          message: `${centerIds.length} centers deleted successfully` 
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    
    const { data: updatedCenters, error } = await supabase
      .from('health_centers')
      .update(updateData)
      .in('id', centerIds)
      .select('id, name')

    if (error) {
  
      return NextResponse.json(
        { error: 'Error updating centers' },
        { status: 500 }
      )
    }

  
    await supabase.from('admin_logs').insert({
      admin_id: user.id,
      action: `bulk_${action}_centers`,
      affected_table: 'health_centers',
      comment: `Bulk ${actionDescription}: ${centerIds.length} centers`
    })

    return NextResponse.json({
      success: true,
      message: `${centerIds.length} centers ${action}d successfully`,
      updatedCenters
    })

  } catch (error) {
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
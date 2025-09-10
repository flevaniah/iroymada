import { NextRequest, NextResponse } from 'next/server'
import { createServerClientWithAuth, verifyAdminPermissions } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

// Get single center for admin
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClientWithAuth()

    // Verify admin permissions
    const { user, profile, error: authError } = await verifyAdminPermissions(supabase)
    if (authError) {
      const status = authError === 'Unauthorized' ? 401 : authError === 'Insufficient permissions' ? 403 : 500
      return NextResponse.json({ error: authError }, { status })
    }

    const { data: center, error } = await supabase
      .from('health_centers')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
     
      return NextResponse.json(
        { error: 'Center not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ center })

  } catch (error) {
  
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Update center
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClientWithAuth()

    // Verify admin permissions
    const { user, profile, error: authError } = await verifyAdminPermissions(supabase)
    if (authError) {
      const status = authError === 'Unauthorized' ? 401 : authError === 'Insufficient permissions' ? 403 : 500
      return NextResponse.json({ error: authError }, { status })
    }

    const body = await request.json()

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString(),
      ...body
    }

    // Handle status changes
    if (body.status === 'approved' && body.status !== body.previousStatus) {
      updateData.approved_by = user.id
      updateData.approved_at = new Date().toISOString()
    } else if (body.status === 'rejected' && body.status !== body.previousStatus) {
      updateData.approved_by = null
      updateData.approved_at = null
    }

    
    delete updateData.previousStatus

    const { data: center, error } = await supabase
      .from('health_centers')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {

      return NextResponse.json(
        { error: 'Error updating center' },
        { status: 500 }
      )
    }

 
    await supabase.from('admin_logs').insert({
      admin_id: user.id,
      action: 'update_center',
      affected_table: 'health_centers',
      record_id: params.id,
      new_values: updateData,
      comment: `Center updated: ${center.name}`
    })

    return NextResponse.json({ center })

  } catch (error) {
  
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClientWithAuth()

    // Verify admin authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin role (only admin and super_admin can delete)
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || !['admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get center details before deletion for logging
    const { data: centerToDelete } = await supabase
      .from('health_centers')
      .select('name')
      .eq('id', params.id)
      .single()

    const { error } = await supabase
      .from('health_centers')
      .delete()
      .eq('id', params.id)

    if (error) {
     
      return NextResponse.json(
        { error: 'Error deleting center' },
        { status: 500 }
      )
    }

   
    await supabase.from('admin_logs').insert({
      admin_id: user.id,
      action: 'delete_center',
      affected_table: 'health_centers',
      record_id: params.id,
      comment: `Center deleted: ${centerToDelete?.name || 'Unknown'}`
    })

    return NextResponse.json({ success: true })

  } catch (error) {

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
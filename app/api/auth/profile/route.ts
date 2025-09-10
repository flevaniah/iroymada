import { NextRequest, NextResponse } from 'next/server'
import { createServerClientWithAuth, verifyAdminPermissions } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClientWithAuth()
    
    // Verify admin permissions
    const { user, profile, error: authError } = await verifyAdminPermissions(supabase)
    if (authError) {
      const statusCode = authError === 'Unauthorized' ? 401 : authError === 'Insufficient permissions' ? 403 : 500
      return NextResponse.json({ error: authError }, { status: statusCode })
    }

    return NextResponse.json({
      email: user.email,
      role: profile.role
    })

  } catch (error) {
   
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
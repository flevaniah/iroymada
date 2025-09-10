import { NextRequest, NextResponse } from 'next/server'
import { createServerClientWithAuth } from '@/lib/auth-server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClientWithAuth()
    
    const { error } = await supabase.auth.signOut()
    
    if (error) {
  
      return NextResponse.json({ error: 'Failed to logout' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Logged out successfully' })

  } catch (error) {
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
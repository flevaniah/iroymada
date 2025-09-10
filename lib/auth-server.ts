import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'

// Helper pour créer un client Supabase avec authentification dans les API routes
export function createServerClientWithAuth() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
        
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            
          }
        },
      },
    }
  )
}


export async function verifyAdminPermissions(supabase: any) {
  try {

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { user: null, profile: null, error: 'Unauthorized' }
    }

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || !['admin', 'super_admin', 'moderator'].includes(profile.role)) {
      return { user: null, profile: null, error: 'Insufficient permissions' }
    }

    return { user, profile, error: null }
  } catch (error) {
    return { user: null, profile: null, error: 'Authentication error' }
  }
}
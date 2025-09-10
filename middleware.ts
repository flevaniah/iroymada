import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith('/admin')) {

    const authToken = req.cookies.get('sb-access-token') || 
                     req.cookies.get('supabase-auth-token') ||
                     req.cookies.get('sb-refresh-token') ||
                     req.cookies.get('supabase.auth.token') ||
                     req.cookies.get('sb-hfzqgcstpwjvcrttgodo-auth-token') || 
                     Array.from(req.cookies.getAll()).find(cookie => 
                       cookie.name.includes('auth-token') || cookie.name.includes('sb-')
                     )
    
    
    
    if (!authToken) {
      
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/login'
      redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

 
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}
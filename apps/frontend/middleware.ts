import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  try {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req, res })

    const { data: { session } } = await supabase.auth.getSession()

    // Unprotected routes
    const publicRoutes = ['/login', '/signup', '/forgot-password', '/auth/callback']
    const isPublicRoute = publicRoutes.includes(req.nextUrl.pathname)

    if (!session && !isPublicRoute) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    if (session && isPublicRoute && req.nextUrl.pathname !== '/auth/callback') {
      return NextResponse.redirect(new URL('/', req.url))
    }

    return res
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.redirect(new URL('/login', req.url))
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
} 
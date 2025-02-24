import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  try {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req, res })

    const { data: { session } } = await supabase.auth.getSession()

    // Unprotected routes that don't require auth
    const publicRoutes = ['/', '/login', '/signup', '/forgot-password', '/auth/callback']
    const isPublicRoute = publicRoutes.includes(req.nextUrl.pathname)

    // Protected routes that require auth
    const protectedRoutes = ['/dashboard', '/settings', '/onboarding']
    const isProtectedRoute = protectedRoutes.some(route => req.nextUrl.pathname.startsWith(route))

    if (!session && isProtectedRoute) {
      return NextResponse.redirect(new URL('/login', req.url))
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
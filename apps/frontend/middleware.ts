import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { clerkClient } from '@clerk/nextjs/server';

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your middleware
export default authMiddleware({
  // Routes that can be accessed while signed out
  publicRoutes: ["/"],
  // Routes that can always be accessed, and have
  // no authentication information
  ignoredRoutes: ["/api/webhook"],
  async afterAuth(auth, req) {
    console.log('🔍 Middleware: afterAuth called for path:', req.nextUrl.pathname);
    console.log('🔍 Middleware: Auth state:', { 
      isPublicRoute: auth.isPublicRoute, 
      hasUserId: !!auth.userId,
      isApiRoute: req.nextUrl.pathname.startsWith('/api')
    });
    
    // Allow public routes
    if (auth.isPublicRoute) {
      console.log('✅ Middleware: Public route, proceeding without auth');
      return NextResponse.next();
    }

    // Handle users who aren't authenticated
    if (!auth.userId) {
      console.log('❌ Middleware: No userId, redirecting to sign-in');
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }

    // For authenticated routes, attach the Clerk user ID to the request headers
    // This can be used by API routes to bypass RLS if needed
    console.log('🔍 Middleware: Creating new headers with clerk-user-id');
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-clerk-user-id', auth.userId);
    
    console.log('✅ Middleware: Headers set:', {
      'x-clerk-user-id': auth.userId,
      headerCount: [...requestHeaders.keys()].length
    });
    
    // Create a new request with the modified headers
    console.log('🔍 Middleware: Creating response with modified headers');
    const response = NextResponse.next({
      request: {
        // Clone the headers to avoid mutation issues
        headers: requestHeaders,
      },
    });

    // Only check onboarding status for dashboard routes
    if (req.nextUrl.pathname.startsWith('/dashboard')) {
      try {
        console.log('🔍 Middleware: Checking onboarding status for dashboard route');
        const user = await clerkClient.users.getUser(auth.userId);
        const hasCompletedOnboarding = user.unsafeMetadata.hasCompletedOnboarding;
        console.log('🔍 Middleware: hasCompletedOnboarding:', hasCompletedOnboarding);

        if (!hasCompletedOnboarding) {
          console.log('🔍 Middleware: Onboarding not completed, redirecting');
          const redirectResponse = NextResponse.redirect(new URL('/onboarding/desktop', req.url));
          // Copy the headers to the redirect response
          console.log('🔍 Middleware: Copying headers to redirect response');
          requestHeaders.forEach((value, key) => {
            redirectResponse.headers.set(key, value);
          });
          return redirectResponse;
        }
        console.log('✅ Middleware: Onboarding completed, proceeding to dashboard');
      } catch (error) {
        console.error('❌ Middleware: Error checking onboarding status:', error);
      }
    }

    console.log('✅ Middleware: Returning response with modified headers');
    return response;
  }
});

// Stop Middleware running on static files and public folder
export const config = {
  matcher: [
    // Exclude files with extensions like images, videos, fonts, etc.
    "/((?!.*\\.[\\w]+$|_next).*)",
    // Include root route
    "/",
    // Include /api routes
    "/(api|trpc)(.*)"
  ]
}; 
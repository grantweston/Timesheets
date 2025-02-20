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
    // Allow public routes
    if (auth.isPublicRoute) {
      return NextResponse.next();
    }

    // Handle users who aren't authenticated
    if (!auth.userId) {
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }

    // Only check onboarding status for dashboard routes
    if (req.nextUrl.pathname.startsWith('/dashboard')) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_CLERK_FRONTEND_API}/users/${auth.userId}`, {
          headers: {
            Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
          },
        });
        const user = await response.json();
        const hasCompletedOnboarding = user.unsafe_metadata?.hasCompletedOnboarding;

        if (!hasCompletedOnboarding) {
          return NextResponse.redirect(new URL('/onboarding/desktop', req.url));
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        return NextResponse.next();
      }
    }

    return NextResponse.next();
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
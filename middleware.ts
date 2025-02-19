import { authMiddleware, clerkClient } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your middleware
export default authMiddleware({
  // Routes that can be accessed while signed out
  publicRoutes: ["/", "/sign-in", "/sign-up"],
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
        const user = await clerkClient.users.getUser(auth.userId);
        const hasCompletedOnboarding = user.publicMetadata.hasCompletedOnboarding;

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
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
}; 
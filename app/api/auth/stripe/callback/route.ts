import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { auth } from '@clerk/nextjs';

export async function GET(request: Request) {
  try {
    console.log('Stripe callback received:', {
      url: request.url,
      headers: Object.fromEntries(request.headers.entries())
    });

    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    
    console.log('Parsed callback params:', {
      code,
      searchParams: Object.fromEntries(url.searchParams.entries())
    });
    
    if (!code) {
      console.log('No code found in callback');
      return NextResponse.redirect(new URL('/onboarding/integrations?error=missing_code', request.url));
    }

    // Exchange the authorization code for an access token
    console.log('Exchanging code for token...');
    const response = await stripe.oauth.token({
      grant_type: 'authorization_code',
      code,
    });

    console.log('Token exchange response:', {
      hasStripeUserId: !!response.stripe_user_id,
      hasAccessToken: !!response.access_token,
      hasRefreshToken: !!response.refresh_token
    });

    // Store these tokens securely - in production, save to your database
    const connectedAccountId = response.stripe_user_id;
    const accessToken = response.access_token;
    const refreshToken = response.refresh_token;

    // For now, we'll store in cookies (not recommended for production)
    const responseWithCookies = NextResponse.redirect(new URL('/onboarding/integrations?success=stripe', request.url));
    
    if (connectedAccountId) {
      responseWithCookies.cookies.set('stripe_account_id', connectedAccountId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    console.log('Redirecting to success page');
    return responseWithCookies;
  } catch (error) {
    console.error('Stripe Connect error:', error);
    return NextResponse.redirect(new URL('/onboarding/integrations?error=stripe', request.url));
  }
} 
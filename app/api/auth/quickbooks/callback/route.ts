import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const realmId = url.searchParams.get('realmId'); // QuickBooks company ID
    
    if (!code || !realmId) {
      return NextResponse.redirect(new URL('/onboarding/integrations?error=quickbooks', request.url));
    }

    // Exchange the authorization code for tokens
    const tokenResponse = await fetch('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${process.env.QUICKBOOKS_CLIENT_ID}:${process.env.QUICKBOOKS_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.QUICKBOOKS_REDIRECT_URI!,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange authorization code');
    }

    const tokens = await tokenResponse.json();

    // In production, you would save these to your database:
    // await db.user.update({
    //   where: { id: userId },
    //   data: {
    //     quickbooksRealmId: realmId,
    //     quickbooksAccessToken: tokens.access_token,
    //     quickbooksRefreshToken: tokens.refresh_token,
    //     quickbooksTokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1000),
    //   },
    // });

    // For now, we'll store in cookies (not recommended for production)
    const responseWithCookies = NextResponse.redirect(new URL('/onboarding/integrations?success=quickbooks', request.url));
    
    responseWithCookies.cookies.set('quickbooks_account_id', realmId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return responseWithCookies;
  } catch (error) {
    console.error('QuickBooks Connect error:', error);
    return NextResponse.redirect(new URL('/onboarding/integrations?error=quickbooks', request.url));
  }
} 
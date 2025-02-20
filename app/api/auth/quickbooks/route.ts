import { NextResponse } from 'next/server';
import { quickbooks } from '@/lib/quickbooks';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const realmId = url.searchParams.get('realmId');

  if (!code || !realmId) {
    return NextResponse.redirect(new URL('/dashboard/invoices?error=missing_params', request.url));
  }

  try {
    const token = await quickbooks.createToken(code);
    
    // Store the token securely - in this example we're using cookies
    // In production, you should store this in a database
    const response = NextResponse.redirect(new URL('/dashboard/invoices', request.url));
    
    response.cookies.set('qb_access_token', token.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 2 // 2 hours
    });
    
    response.cookies.set('qb_realm_id', realmId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 2 // 2 hours
    });

    return response;
  } catch (error) {
    console.error('QuickBooks OAuth error:', error);
    return NextResponse.redirect(new URL('/dashboard/invoices?error=oauth_failed', request.url));
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { createClient } from '@/app/lib/supabase/server';

const OAUTH_CONFIG = {
  outlook: {
    tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    clientId: process.env.OUTLOOK_CLIENT_ID,
    clientSecret: process.env.OUTLOOK_CLIENT_SECRET,
    redirectUri: process.env.OUTLOOK_REDIRECT_URI,
  },
  gmail: {
    tokenUrl: 'https://oauth2.googleapis.com/token',
    clientId: process.env.GMAIL_CLIENT_ID,
    clientSecret: process.env.GMAIL_CLIENT_SECRET,
    redirectUri: process.env.GMAIL_REDIRECT_URI,
  },
  docusign: {
    tokenUrl: 'https://account-d.docusign.com/oauth/token',
    clientId: process.env.DOCUSIGN_CLIENT_ID,
    clientSecret: process.env.DOCUSIGN_CLIENT_SECRET,
    redirectUri: process.env.DOCUSIGN_REDIRECT_URI,
  },
  stripe: {
    tokenUrl: 'https://connect.stripe.com/oauth/token',
    clientId: process.env.STRIPE_CLIENT_ID,
    clientSecret: process.env.STRIPE_CLIENT_SECRET,
    redirectUri: process.env.STRIPE_REDIRECT_URI,
  },
  quickbooks: {
    tokenUrl: 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
    clientId: process.env.QUICKBOOKS_CLIENT_ID,
    clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET,
    redirectUri: process.env.QUICKBOOKS_REDIRECT_URI,
  },
};

export async function GET(
  request: NextRequest,
  { params }: { params: { provider: keyof typeof OAUTH_CONFIG } }
) {
  const { userId } = auth();
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const provider = params.provider;
  const config = OAUTH_CONFIG[provider];
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (!config) {
    return new NextResponse('Invalid provider', { status: 400 });
  }

  if (!code) {
    return new NextResponse('No code provided', { status: 400 });
  }

  // Verify state here if you implemented state storage in connect route

  try {
    // Exchange code for token
    const tokenResponse = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: config.clientId!,
        client_secret: config.clientSecret!,
        redirect_uri: config.redirectUri!,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error(`Token exchange failed: ${await tokenResponse.text()}`);
    }

    const tokenData = await tokenResponse.json();

    // Update user's integration status in database
    const supabase = createClient();
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('integration_statuses')
      .eq('clerk_user_id', userId)
      .single();

    if (userError) {
      throw userError;
    }

    const currentStatuses = userData.integration_statuses || {};
    const updatedStatuses = {
      ...currentStatuses,
      [provider]: {
        connected: true,
        token: tokenData,
      },
    };

    const { error: updateError } = await supabase
      .from('users')
      .update({ integration_statuses: updatedStatuses })
      .eq('clerk_user_id', userId);

    if (updateError) {
      throw updateError;
    }

    // Redirect back to settings page
    return NextResponse.redirect(new URL('/dashboard/settings', request.url));
  } catch (error) {
    console.error('Error in OAuth callback:', error);
    // Redirect to settings page with error
    return NextResponse.redirect(
      new URL('/dashboard/settings?error=integration_failed', request.url)
    );
  }
} 
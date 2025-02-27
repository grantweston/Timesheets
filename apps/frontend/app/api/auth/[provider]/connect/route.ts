import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';

const OAUTH_CONFIG = {
  outlook: {
    clientId: process.env.OUTLOOK_CLIENT_ID,
    redirectUri: process.env.OUTLOOK_REDIRECT_URI,
    scope: 'openid profile email https://graph.microsoft.com/calendars.read',
    authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
  },
  gmail: {
    clientId: process.env.GMAIL_CLIENT_ID,
    redirectUri: process.env.GMAIL_REDIRECT_URI,
    scope: 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/calendar.readonly',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
  },
  docusign: {
    clientId: process.env.DOCUSIGN_CLIENT_ID,
    redirectUri: process.env.DOCUSIGN_REDIRECT_URI,
    scope: 'signature',
    authUrl: 'https://account-d.docusign.com/oauth/auth',
  },
  stripe: {
    clientId: process.env.STRIPE_CLIENT_ID,
    redirectUri: process.env.STRIPE_REDIRECT_URI,
    scope: 'read_write',
    authUrl: 'https://connect.stripe.com/oauth/authorize',
  },
  quickbooks: {
    clientId: process.env.QUICKBOOKS_CLIENT_ID,
    redirectUri: process.env.QUICKBOOKS_REDIRECT_URI,
    scope: 'com.intuit.quickbooks.accounting',
    authUrl: 'https://appcenter.intuit.com/connect/oauth2',
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

  if (!config) {
    return new NextResponse('Invalid provider', { status: 400 });
  }

  if (!config.clientId || !config.redirectUri) {
    console.error(`Missing configuration for ${provider}`);
    return new NextResponse('Provider configuration error', { status: 500 });
  }

  // Generate a random state
  const state = Math.random().toString(36).substring(7);

  // Store the state in the user's session or database
  // This should be implemented based on your session management strategy

  const queryParams = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: config.scope,
    state: state,
  });

  // Redirect to the provider's authorization URL
  return NextResponse.redirect(`${config.authUrl}?${queryParams.toString()}`);
} 
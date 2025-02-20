import { auth } from "@clerk/nextjs"

const GOOGLE_OAUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
const MICROSOFT_OAUTH_URL = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize"
const DOCUSIGN_OAUTH_URL = "https://account-d.docusign.com/oauth/auth" // Use account.docusign.com for production

export const SCOPES = {
  GOOGLE: [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/userinfo.email'
  ],
  MICROSOFT: [
    'offline_access',
    'User.Read',
    'Mail.Read',
    'Calendars.Read'
  ],
  DOCUSIGN: [
    'signature',
    'impersonation'
  ]
}

export function generateState() {
  return Math.random().toString(36).substring(7)
}

export function getGoogleAuthUrl() {
  const state = generateState()
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
    response_type: 'code',
    scope: SCOPES.GOOGLE.join(' '),
    access_type: 'offline',
    state,
    prompt: 'consent'
  })
  
  return `${GOOGLE_OAUTH_URL}?${params.toString()}`
}

export function getMicrosoftAuthUrl() {
  const state = generateState()
  const params = new URLSearchParams({
    client_id: process.env.MICROSOFT_CLIENT_ID!,
    redirect_uri: process.env.MICROSOFT_REDIRECT_URI!,
    response_type: 'code',
    scope: SCOPES.MICROSOFT.join(' '),
    state,
    prompt: 'consent'
  })
  
  return `${MICROSOFT_OAUTH_URL}?${params.toString()}`
}

export function getDocuSignAuthUrl() {
  const state = generateState()
  const params = new URLSearchParams({
    client_id: process.env.DOCUSIGN_CLIENT_ID!,
    redirect_uri: process.env.DOCUSIGN_REDIRECT_URI!,
    response_type: 'code',
    scope: SCOPES.DOCUSIGN.join(' '),
    state,
    prompt: 'login'
  })
  
  return `${DOCUSIGN_OAUTH_URL}?${params.toString()}`
}

export async function exchangeCodeForTokens(provider: 'google' | 'microsoft' | 'docusign', code: string) {
  const { userId } = auth()
  if (!userId) throw new Error('User not authenticated')

  const tokenEndpoints = {
    google: 'https://oauth2.googleapis.com/token',
    microsoft: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    docusign: 'https://account-d.docusign.com/oauth/token' // Use account.docusign.com for production
  }

  const clientId = process.env[`${provider.toUpperCase()}_CLIENT_ID`]!
  const clientSecret = process.env[`${provider.toUpperCase()}_CLIENT_SECRET`]!
  const redirectUri = process.env[`${provider.toUpperCase()}_REDIRECT_URI`]!

  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    code,
    grant_type: 'authorization_code'
  })

  const response = await fetch(tokenEndpoints[provider], {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params.toString()
  })

  if (!response.ok) {
    throw new Error(`Failed to exchange code for tokens: ${await response.text()}`)
  }

  const tokens = await response.json()
  
  // TODO: Store tokens securely in your database
  // await db.tokens.upsert({
  //   where: { userId_provider: { userId, provider } },
  //   update: { accessToken: tokens.access_token, refreshToken: tokens.refresh_token },
  //   create: { userId, provider, accessToken: tokens.access_token, refreshToken: tokens.refresh_token }
  // })

  return tokens
} 
import { exchangeCodeForTokens } from "@/app/lib/oauth"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      throw new Error(`OAuth error: ${error}`)
    }

    if (!code) {
      throw new Error('No code provided')
    }

    const tokens = await exchangeCodeForTokens('microsoft', code)
    
    // Redirect back to the integrations page with success
    return NextResponse.redirect(new URL('/onboarding/integrations?success=outlook', req.url))
  } catch (error) {
    console.error('Microsoft OAuth callback error:', error)
    // Redirect back to the integrations page with error
    return NextResponse.redirect(new URL('/onboarding/integrations?error=outlook', req.url))
  }
} 
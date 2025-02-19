import { getGoogleAuthUrl } from "@/lib/oauth"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const authUrl = getGoogleAuthUrl()
    return NextResponse.json({ url: authUrl })
  } catch (error) {
    console.error('Failed to generate Google auth URL:', error)
    return NextResponse.json(
      { error: 'Failed to initiate Google OAuth' },
      { status: 500 }
    )
  }
} 
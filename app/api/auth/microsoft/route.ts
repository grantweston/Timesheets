import { getMicrosoftAuthUrl } from "@/lib/oauth"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const authUrl = getMicrosoftAuthUrl()
    return NextResponse.json({ url: authUrl })
  } catch (error) {
    console.error('Failed to generate Microsoft auth URL:', error)
    return NextResponse.json(
      { error: 'Failed to initiate Microsoft OAuth' },
      { status: 500 }
    )
  }
} 
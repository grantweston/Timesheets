import { getDocuSignAuthUrl } from "@/app/lib/oauth"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const authUrl = getDocuSignAuthUrl()
    return NextResponse.json({ url: authUrl })
  } catch (error) {
    console.error('Failed to generate DocuSign auth URL:', error)
    return NextResponse.json(
      { error: 'Failed to initiate DocuSign OAuth' },
      { status: 500 }
    )
  }
} 
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Clerk webhook test endpoint is working!' });
}

export async function POST(req: Request) {
  // Log webhook data for testing purposes
  console.log('🔍 TEST: Clerk webhook test endpoint received a POST request');
  
  try {
    // Get the raw body
    const body = await req.text();
    console.log('📝 TEST: Webhook body:', body);
    
    // Get headers
    const headerEntries = [...req.headers.entries()];
    const headers = Object.fromEntries(headerEntries);
    console.log('📝 TEST: Webhook headers:', JSON.stringify(headers));
    
    return NextResponse.json({ 
      message: 'Webhook test received!',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ TEST: Error processing test webhook:', error);
    return NextResponse.json({ error: 'Error processing webhook' }, { status: 500 });
  }
} 
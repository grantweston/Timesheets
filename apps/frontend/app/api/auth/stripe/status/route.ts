import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { auth } from '@clerk/nextjs';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // In production, you would check your database:
    // const user = await db.user.findUnique({ where: { id: userId } });
    // return NextResponse.json({ isConnected: !!user.stripeConnectedAccountId });

    // For now, we'll check cookies
    const cookieStore = await cookies();
    const stripeAccountId = cookieStore.get('stripe_account_id')?.value;

    return NextResponse.json({ isConnected: !!stripeAccountId });
  } catch (error) {
    console.error('Error checking Stripe status:', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 
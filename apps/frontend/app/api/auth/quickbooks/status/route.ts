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
    // return NextResponse.json({ isConnected: !!user.quickbooksConnectedAccountId });

    // For now, we'll check cookies
    const cookieStore = await cookies();
    const quickbooksAccountId = cookieStore.get('quickbooks_account_id')?.value;

    return NextResponse.json({ isConnected: !!quickbooksAccountId });
  } catch (error) {
    console.error('Error checking QuickBooks status:', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/app/lib/stripe';
import Stripe from 'stripe';

export async function POST(req: Request) {
  console.log('🔍 Stripe webhook: POST request received');
  
  try {
    const body = await req.text();
    console.log('🔍 Stripe webhook: Request body received, length:', body.length);
    
    console.log('🔍 Stripe webhook: Getting headers');
    const headersList = await headers();
    console.log('🔍 Stripe webhook: Headers retrieved');
    
    const signature = headersList.get('stripe-signature');
    console.log('🔍 Stripe webhook: Signature present:', !!signature);
    console.log('🔍 Stripe webhook: STRIPE_WEBHOOK_SECRET present:', !!process.env.STRIPE_WEBHOOK_SECRET);

    if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
      console.log('❌ Stripe webhook: Missing signature or webhook secret');
      return new NextResponse('Webhook signature missing', { status: 400 });
    }

    console.log('🔍 Stripe webhook: Constructing event from signature');
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log('✅ Stripe webhook: Event constructed successfully, type:', event.type);

    switch (event.type) {
      case 'invoice.paid':
        const invoice = event.data.object as Stripe.Invoice;
        console.log('✅ Stripe webhook: Invoice paid:', invoice.id);
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice;
        console.log('❌ Stripe webhook: Invoice payment failed:', failedInvoice.id);
        break;
        
      default:
        console.log('🔍 Stripe webhook: Unhandled event type:', event.type);
    }

    console.log('✅ Stripe webhook: Processing completed successfully');
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('❌ Stripe webhook error:', error);
    console.log('❌ Stripe webhook error details:', error instanceof Error ? error.stack : String(error));
    return new NextResponse('Webhook error', { status: 400 });
  }
} 
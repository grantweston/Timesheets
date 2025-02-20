import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getQuickBooksClient } from '@/lib/quickbooks';
import { auth } from '@clerk/nextjs';

// GET endpoint to fetch invoices
export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const invoices = await stripe.invoices.list({
      limit: 100,
      expand: ['data.customer'],
    });

    // Transform Stripe invoices into our format
    const formattedInvoices = invoices.data.map(invoice => ({
      id: invoice.number || invoice.id,
      client: (invoice.customer as any)?.name || 'Unknown Client',
      amount: invoice.amount_due / 100, // Convert from cents to dollars
      hours: 0, // We'll need to store this separately or calculate it
      status: invoice.status === 'paid' ? 'paid' : invoice.status === 'draft' ? 'draft' : 'sent',
      date: new Date(invoice.created * 1000).toISOString().split('T')[0],
    }));

    return NextResponse.json(formattedInvoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

// POST endpoint to create invoice
export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { 
      amount,
      description,
      customer,
      quickbooksRealmId,
      quickbooksAccessToken
    } = body;

    // Create Stripe invoice
    const stripeInvoice = await stripe.invoices.create({
      customer,
      collection_method: 'send_invoice',
      days_until_due: 30,
    });

    await stripe.invoiceItems.create({
      customer,
      amount,
      currency: 'usd',
      invoice: stripeInvoice.id,
      description,
    });

    await stripe.invoices.sendInvoice(stripeInvoice.id);

    // Create QuickBooks invoice if credentials are provided
    let quickbooksInvoice;
    if (quickbooksRealmId && quickbooksAccessToken) {
      const qbo = getQuickBooksClient(quickbooksRealmId, quickbooksAccessToken);
      quickbooksInvoice = await qbo.createInvoice({
        Line: [{
          Amount: amount / 100,
          Description: description,
          DetailType: 'SalesItemLineDetail',
          SalesItemLineDetail: {
            ItemRef: {
              value: '1',
              name: 'Services'
            }
          }
        }],
        CustomerRef: {
          value: customer
        }
      });
    }

    return NextResponse.json({
      stripeInvoiceId: stripeInvoice.id,
      quickbooksInvoiceId: quickbooksInvoice?.Id,
      status: 'success'
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 
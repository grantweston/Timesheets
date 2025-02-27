export interface Invoice {
  id: string;                    // uuid NOT NULL DEFAULT gen_random_uuid()
  user_id: string;               // uuid NOT NULL
  organization_id: string | null; // uuid
  client_name: string;           // text NOT NULL
  status: "draft" | "sent" | "paid"; // text NOT NULL DEFAULT 'draft'
  total_amount: number;          // numeric DEFAULT 0
  created_at: string | null;     // timestamp without time zone DEFAULT now()
  updated_at: string | null;     // timestamp without time zone
}

export interface InvoiceItem {
  id: string;                    // uuid NOT NULL DEFAULT gen_random_uuid()
  invoice_id: string;            // uuid NOT NULL
  time_block_id: string | null;  // uuid
  description: string | null;    // text
  rate: number | null;          // numeric
  hours: number | null;         // numeric
  amount: number | null;        // numeric
  created_at: string | null;    // timestamp without time zone DEFAULT now()
}

// Helper function to create a new Invoice with defaults
export function createDefaultInvoice(userId: string): Omit<Invoice, 'id'> {
  return {
    user_id: userId,
    organization_id: null,
    client_name: '',
    status: 'draft',
    total_amount: 0,
    created_at: null,  // Will be set by DB
    updated_at: null   // Will be set by DB
  };
}

// Helper function to create a new InvoiceItem with defaults
export function createDefaultInvoiceItem(invoiceId: string): Omit<InvoiceItem, 'id'> {
  return {
    invoice_id: invoiceId,
    time_block_id: null,
    description: null,
    rate: null,
    hours: null,
    amount: null,
    created_at: null  // Will be set by DB
  };
} 
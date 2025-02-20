Backend Document
1. Overview & Goals
Web App Architecture
We will build a Next.js web application that connects to Supabase for data access.
The web app focuses on displaying and managing timesheet data, and handling invoice generation.
Speed to Market
Minimize complexity: no direct file handling in web app.
All raw data (screenshots/audio) is handled by the desktop app via Google Cloud.
Key Functionalities
Data Access: Read timesheet data from Supabase that was processed by the desktop app pipeline.
Non-Billable Tagging & Overrides: Update time blocks in Supabase, allowing user-defined toggles.
Invoice Generation: Summarize unbilled time blocks, allow final review, send via Stripe or QuickBooks.

2. Technologies
Next.js (TypeScript)
Provides the front-end pages and minimal API routes for the web app.
Located in the /app/api/... directory (Next.js 13+ App Router).
Supabase (Postgres)
Stores user data (with references to Clerk), time blocks, invoice data, etc.
A small lib/supabase.ts sets up the client for server usage.
Desktop app pipeline writes the processed data here.
Clerk for Auth
The web app uses Clerk for authentication.
Supabase RLS policies are configured to use Clerk user IDs.
Stripe / QuickBooks
For invoice sending and payment tracking.
Invoices are stored in Supabase with status changes from "draft" → "sent" → "paid."

3. API Routes & Structure
Consider a Next.js 13 App Router approach:
less
Copy
my-app/
  ├─ app/
  │   ├─ page.tsx        // Landing page
  │   └─ api/
  │       ├─ timesheets/
  │       │   ├─ [blockId]/route.ts  // PATCH: update a block
  │       │   └─ route.ts            // GET: list time blocks
  │       ├─ invoices/
  │       │   ├─ [invoiceId]/
  │       │   │  ├─ send/
  │       │   │  │  └─ route.ts      // POST: finalize & send invoice
  │       │   │  └─ route.ts         // GET or PATCH an invoice
  │       │   └─ unbilled/
  │       │      └─ route.ts         // GET unbilled time blocks
  │       └─ auth/
  │          └─ route.ts             // (Optional) Auth endpoints if needed

4. Database Schema (Supabase)
sql
Copy
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT,
  display_name TEXT,
  is_desktop_setup BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now()
);

-- TimeBlocks (populated by desktop app pipeline)
CREATE TABLE time_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  task_label TEXT,
  is_billable BOOLEAN DEFAULT TRUE,
  classification JSONB,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP
);

-- Invoices
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'draft',  -- 'draft', 'sent', 'paid'
  total_amount NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP
);

-- InvoiceItems
CREATE TABLE invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id),
  time_block_id UUID REFERENCES time_blocks(id),
  description TEXT,
  rate NUMERIC(10,2),
  hours NUMERIC(6,2),
  amount NUMERIC(10,2),
  created_at TIMESTAMP DEFAULT now()
);

Notes:
users.is_desktop_setup: If false, block usage.
time_blocks: Populated by the desktop app pipeline via Google Cloud.
invoice_items: Link time blocks to invoice line items with custom rate/hours.

5. Implementation Details
Authentication (Clerk)
Each request from the web app includes a Clerk token.
In your Next.js API route, use a middleware or code snippet to verify the user.
Check users.is_desktop_setup; if false, return a 403.
Supabase RLS Policies
Configure Row Level Security to use clerk_user_id:
sql
Copy
CREATE POLICY "Users can only access their own time blocks"
ON time_blocks
FOR ALL
USING (user_id IN (
  SELECT id FROM users WHERE clerk_user_id = auth.uid()
));

Invoice Workflow
The front end calls GET /api/invoices/unbilled to retrieve all time blocks with is_billed = false.
The user picks a subset or merges them into an invoice.
POST /api/invoices/[invoiceId]/send: updates the DB row, calls Stripe or QuickBooks.
After success, status = 'sent'. If Stripe notifies payment, set status = 'paid'.

6. Performance & Scalability
MVP Approach
Focus on efficient Supabase queries and caching strategies.
Use Supabase real-time features for live updates.
Deployment
Deploy your Next.js web app.
Ensure proper environment variables for Supabase, Clerk, and payment providers.

7. Error Handling & Logging
Try/Catch in API routes
If Supabase or payment provider calls fail, return a 500 with a clear message.
Logging
Use console logs or a minimal library like pino or Winston.
Track important user actions and errors.
Retries
For critical operations (like finalizing invoices), implement retry logic with exponential backoff.



Backend Document
1. Overview & Goals
Monolithic MVP
We will build a single codebase for both server and front-end using Next.js (in the same project).
The server functionality (for time capture, invoice generation, and AI calls) will live in Next.js API routes.
Speed to Market
Minimize complexity: no separate microservices.
Rely on ephemeral file storage for screenshots/audio so we can quickly transcribe/classify them.
Key Functionalities
Electron App Ingestion: Desktop captures screenshots/audio and sends them to the Next.js backend.
Non-Billable Tagging & Overrides: Store time blocks in Supabase, allowing user-defined toggles.
Invoice Generation: Summarize unbilled time blocks, allow final review, send via Stripe or QuickBooks.
Ephemeral Data Deletion: Immediately delete raw files once classification or transcription is complete.

2. Technologies
Next.js (TypeScript)
Provides both the front-end pages and the API routes for the MVP.
Located in the /app/api/... directory (Next.js 13+ App Router) or /pages/api/... if using the Pages Router.
Supabase (Postgres)
Stores user data (with references to Clerk), time blocks, invoice data, etc.
A small lib/supabase.ts sets up the client for server usage.
Clerk for Auth
The Electron app and the Next.js front end each pass a Clerk token to the backend.
The backend verifies the token, ensures the user is onboarded (has installed the desktop app), and proceeds or blocks the request.
Whisper (External STT) & Gemini (Classification)
Audio chunks are sent to Whisper for transcription.
The resulting text + other metadata is passed to Gemini for classification (time block labeling, client matching, etc.).
Stripe / QuickBooks
For invoice sending and payment tracking.
Invoices are stored in Supabase with status changes from “draft” → “sent” → “paid.”

3. API Routes & Structure
Consider a Next.js 13 App Router approach:
less
Copy
my-app/
  ├─ app/
  │   ├─ page.tsx        // Landing page
  │   └─ api/
  │       ├─ timesheets/
  │       │   ├─ capture-chunk/route.ts
  │       │   ├─ [blockId]/route.ts
  │       ├─ invoices/
  │       │   ├─ [invoiceId]/send/route.ts
  │       │   ├─ [invoiceId]/route.ts
  │       │   ├─ unbilled/route.ts
  │       └─ ...
  ├─ lib/
  │   ├─ supabase.ts
  │   ├─ ephemeral.ts   // ephemeral file handling
  │   ├─ ai.ts          // calls to Whisper/Gemini
  │   └─ ...
  └─ ...

3.1 Timesheet Endpoints
POST /api/timesheets/capture-chunk
From Electron app:
Receives screenshots/audio as a multipart or JSON with Base64.
Immediately writes them to ephemeral storage (memory/disk).
Calls Whisper → transcript.
Calls Gemini → classification.
Saves final “time blocks” to Supabase.
Deletes raw ephemeral files.
Response: 201 + message “Chunk processed.”
GET /api/timesheets?date=...
From Next.js front end: fetch user’s time blocks for a given day or range.
Response: Array of time blocks (start_time, end_time, is_billable, task_label, etc.).
PATCH /api/timesheets/[blockId]
Front end toggles is_billable, merges, or updates the label.
Response: updated block data or success message.
3.2 Invoice Endpoints
GET /api/invoices/unbilled
Returns a summary of unbilled time blocks, grouped by client.
POST /api/invoices/[invoiceId]/send
When user clicks “Final Review & Send,” create or update an invoice in Supabase.
If user chooses Stripe or QuickBooks, make an external API call.
Update invoice status in Supabase to “sent.”

4. Ephemeral Storage & Deletion Criteria
Flow:
Electron app uploads chunk → Next.js ephemeral code writes to memory or a temp folder (e.g., /tmp/).
Immediately process with Whisper & Gemini.
Once the time blocks are successfully stored in Supabase, delete ephemeral files.
Success Criteria
Data is considered safe once:
The transcript from Whisper is obtained.
Gemini classification is complete.
A successful DB commit is done (time blocks are saved).
After that, ephemeral files are purged.
If an error occurs, ephemeral files are still removed eventually so they don’t persist (to maintain privacy).
Implementation
lib/ephemeral.ts:
ts
Copy
export async function saveToTemp(fileBuffer): Promise<string> {
  // writes to /tmp/..., returns path
}
export async function deleteTempFile(path: string) {
  // remove from disk
}


Called from inside your route handler.

5. Database Schema (Supabase)
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

-- TimeBlocks
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
time_blocks.classification: Optionally store raw AI output from Gemini.
invoice_items: Link time blocks to invoice line items with custom rate/hours.

6. Implementation Details
Authentication (Clerk)
Each request from Electron or Next.js front end includes a Clerk token.
In your Next.js API route, use a middleware or code snippet to verify the user.
Check users.is_desktop_setup; if false, return a 403.
Whisper & Gemini (in lib/ai.ts)
ts
Copy
export async function transcribeAudio(tempFilePath: string): Promise<string> {
  // Call external Whisper endpoint, pass file, get transcript
}

export async function classifyTranscript(transcript: string, userContext: any): Promise<any> {
  // Call Gemini 2.0 with transcript + context
  // Returns structured tasks, e.g. { blocks: [...] }
}


Saving & Merging Time Blocks
The classification might yield multiple blocks. For each block, insert a time_blocks record.
If you want to merge with existing partial blocks, do some logic in the route or a service function.
Invoice Workflow
The front end calls GET /api/invoices/unbilled to retrieve all time blocks with is_billed = false.
The user picks a subset or merges them into an invoice.
POST /api/invoices/[invoiceId]/send: updates the DB row, calls Stripe or QuickBooks.
After success, status = 'sent'. If Stripe notifies payment, set status = 'paid'.

7. Performance & Scalability
MVP Approach
You can process each chunk synchronously in the route, or use a short asynchronous call.
The next step for scale might be queue-based or background workers if concurrency is high.
Deployment
Deploy your Next.js monolith.
Because ephemeral data is stored on local disk, if you run multiple container instances, each instance has its own ephemeral storage. That’s typically okay for an MVP. Just ensure no single chunk is spread across different instances. The Electron app can pick any instance, but each chunk is processed in full by whichever instance receives it.

8. Error Handling & Logging
Try/Catch in API routes
If Whisper or Gemini calls fail, return a 500 with a clear message.
Clean up ephemeral files if the process fails mid-way.
Logging
Use console logs or a minimal library like pino or Winston.
Track when ephemeral files are created/deleted.
Retries
If an AI call times out or hits a rate limit, consider a small retry logic, but for MVP you can keep it simple.



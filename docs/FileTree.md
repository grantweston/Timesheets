Full Repository File Tree
graphql
Copy
my-mvp-project/                   # Web App (Next.js)
├─ README.md                      # High-level project overview, setup instructions
├─ .gitignore                     # Ignore node_modules, dist, .env, etc.
├─ .env.example                   # Example env variables (Supabase, Clerk, etc.)
├─ package.json                   # Dependencies for the web app
├─ tsconfig.json                  # TS config for Next.js project
├─ app/                          # Next.js 13 App Router
│  ├─ layout.tsx                 # Root layout (header, nav, etc.)
│  ├─ page.tsx                   # Landing page (marketing, sign in link)
│  ├─ dashboard/
│  │  └─ page.tsx                # The timesheet "Dashboard" UI
│  ├─ invoices/
│  │  └─ page.tsx                # Main invoice overview page
│  └─ api/                       # API routes (server logic)
│     ├─ timesheets/
│     │  ├─ [blockId]/
│     │  │  └─ route.ts          # PATCH route: toggle or update a block
│     │  └─ route.ts             # GET route for listing time blocks
│     ├─ invoices/
│     │  ├─ [invoiceId]/
│     │  │  ├─ send/
│     │  │  │  └─ route.ts       # POST: finalize & send invoice
│     │  │  └─ route.ts          # GET or PATCH an invoice
│     │  └─ unbilled/
│     │     └─ route.ts          # GET unbilled time blocks
│     └─ auth/
│        └─ route.ts             # (Optional) Auth endpoints if needed
├─ components/
│  ├─ TimesheetView.tsx          # UI for listing time blocks
│  ├─ InvoiceList.tsx            # UI listing invoices or unbilled items
│  └─ ...
├─ lib/
│  ├─ supabase.ts                # Supabase client init
│  ├─ clerkAuth.ts               # Clerk token verification logic
│  ├─ db.ts                      # Helper DB queries
│  └─ types.ts                   # Shared TypeScript interfaces
├─ public/
│  └─ logo.png
├─ middleware.ts                 # Next.js global route-based middleware
└─ scripts/                      # (Optional) DB migrations or utility scripts
   ├─ migrate.ts
   └─ seed.ts


Explanation
Top-Level:
my-mvp-project/: The Next.js web application.
README.md: Basic instructions to set up the web app.
.env.example: Environment variables for Supabase, Clerk, payment providers, etc.

Web App Structure:
app/: Next.js 13 App Router.
page.tsx: The landing page.
dashboard/page.tsx: Timesheet UI.
invoices/page.tsx: Invoices UI.
api/ subfolders for timesheets, invoices, etc.

components/: Reusable UI components.
TimesheetView.tsx: Main timesheet display component.
InvoiceList.tsx: Invoice management component.
Other UI components as needed.

lib/: Shared logic between routes.
supabase.ts: Supabase client setup and queries.
clerkAuth.ts: Authentication logic.
db.ts: Database helper functions.
types.ts: TypeScript type definitions.

scripts/ (Optional):
Could hold DB migration or seeding scripts for Supabase.
If your MVP is minimal, you might skip this and do migrations via Supabase UI.


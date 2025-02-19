Full Repository File Tree
graphql
Copy
my-mvp-project/
├─ README.md                      # High-level project overview, setup instructions
├─ .gitignore                     # Ignore node_modules, dist, .env, etc.
├─ .env.example                   # Example env variables for both web & electron if needed
├─ package.json                   # (OPTIONAL) Root-level package.json if you do a Yarn workspace or PNPM
├─ web/                           # Next.js monolith (front + back)
│  ├─ next.config.js              # Next.js config
│  ├─ package.json                # Dependencies for the web part (next, react, supabase, etc.)
│  ├─ tsconfig.json               # TS config for Next.js project
│  ├─ .env.example                # Web-specific env if you prefer separate from root
│  ├─ app/                        # Next.js 13 App Router
│  │  ├─ layout.tsx               # Root layout (header, nav, etc.)
│  │  ├─ page.tsx                 # Landing page (marketing, sign in link)
│  │  ├─ dashboard/
│  │  │  └─ page.tsx              # The timesheet “Dashboard” UI
│  │  ├─ invoices/
│  │  │  └─ page.tsx              # Main invoice overview page
│  │  └─ api/                     # API routes (server logic)
│  │     ├─ timesheets/
│  │     │  ├─ capture-chunk/
│  │     │  │  └─ route.ts        # POST from Electron for ephemeral data
│  │     │  ├─ [blockId]/
│  │     │  │  └─ route.ts        # PATCH route: toggle or update a block
│  │     │  └─ route.ts           # (Optional) GET route for listing time blocks
│  │     ├─ invoices/
│  │     │  ├─ [invoiceId]/
│  │     │  │  ├─ send/
│  │     │  │  │  └─ route.ts     # POST: finalize & send invoice
│  │     │  │  └─ route.ts        # GET or PATCH an invoice
│  │     │  └─ unbilled/
│  │     │     └─ route.ts        # GET unbilled time blocks
│  │     └─ auth/
│  │        └─ route.ts           # (Optional) Auth endpoints if needed
│  ├─ components/
│  │  ├─ TimesheetView.tsx        # UI for listing time blocks
│  │  ├─ InvoiceList.tsx          # UI listing invoices or unbilled items
│  │  └─ ...
│  ├─ lib/
│  │  ├─ supabase.ts              # Supabase client init
│  │  ├─ ephemeral.ts             # Logic for ephemeral file storage
│  │  ├─ ai.ts                    # Whisper/Gemini calls
│  │  ├─ clerkAuth.ts             # Clerk token verification logic
│  │  ├─ db.ts                    # Helper DB queries (insert time blocks, create invoices, etc.)
│  │  └─ types.ts                 # Shared TypeScript interfaces
│  ├─ public/
│  │  └─ logo.png
│  ├─ middleware.ts               # (Optional) Next.js global route-based middleware
│  └─ ...
├─ electron-app/                  # The native desktop capture client
│  ├─ package.json                # Dependencies for Electron (electron, electron-builder, etc.)
│  ├─ tsconfig.json               # TS config for Electron code
│  ├─ main.ts                     # Main process entry (creates BrowserWindow if needed, or background only)
│  ├─ preload.ts                  # (Optional) Preload script if you use one
│  ├─ tray.ts                     # Code handling tray icon (Windows/macOS)
│  ├─ capture/
│  │  ├─ screenCapture.ts         # Logic for screenshot capture on each OS
│  │  ├─ audioCapture.ts          # Logic for WASAPI (Windows) or virtual driver (macOS) capturing
│  │  └─ appDetection.ts          # Logic detecting Zoom, Slack, Teams processes
│  ├─ ipcHandlers.ts              # If using IPC for main<->renderer comm
│  └─ ...
└─ scripts/                       # (Optional) DB migrations or utility scripts
   ├─ migrate.ts
   └─ seed.ts


Explanation
Top-Level:
my-mvp-project/: The overall repo root.
README.md: Basic instructions to set up both web/ and electron-app/.
.env.example: High-level example of environment variables. In practice, you might keep a separate .envinside web/ and one inside electron-app/.
web/ (The Next.js Monolith):
Contains everything needed for the front end (landing page, timesheet UI, invoice UI) and API routes(server logic for ephemeral file ingestion, invoice creation, etc.).
app/: Next.js 13 App Router.
page.tsx: The landing page.
dashboard/page.tsx: Timesheet UI.
invoices/page.tsx: Invoices UI.
api/ subfolders for timesheets, invoices, etc.
components/: Reusable UI components.
lib/: Shared logic between routes, e.g., ephemeral file management (ephemeral.ts), AI calls (ai.ts), DB queries (db.ts), etc.
middleware.ts: (Optional) If you want to block routes globally unless the user is logged in or has desktop setup.
electron-app/:
A separate Node/Electron project for the native desktop client.
package.json: Dependencies like electron, electron-builder, etc.
main.ts: The main process entry point. Sets up the tray, handles events, and orchestrates captures.
capture/: Modules for capturing screen snapshots, audio, detecting calls (Zoom/Slack).
You’d have a build script that packages this app for Windows/macOS with electron-builder.
scripts/ (Optional):
Could hold DB migration or seeding scripts for Supabase.
If your MVP is minimal, you might skip this and do migrations via Supabase UI or a simple external tool.


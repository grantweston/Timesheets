Front-End Guidelines Document
1. Overall Framework & Architecture
Next.js + React
Next.js provides server-side rendering (SSR), file-based routing, and automatic code splitting.
React is used for building UI components, with hooks for state management.
Ensure each page is a self-contained route in the /pages directory, possibly using dynamic routes if needed.
TypeScript
All front-end code is written in TypeScript for type safety.
Ensure tsconfig.json is properly configured (strict mode, no implicit any, etc.).
Use interfaces/types for component props, global data structures (e.g., timesheet blocks, invoice items).
File & Folder Structure (Example)
plaintext
Copy
/app
  /pages
    index.tsx         // Landing page
    dashboard.tsx     // Or timesheet.tsx for main timesheet
    invoices.tsx      // Invoice page
    api/              // Serverless functions if needed
  /components
    LandingHero.tsx
    SignInButton.tsx
    TimesheetView.tsx
    InvoiceList.tsx
    ...
  /styles
    globals.css       // global CSS or tailwind imports
    ...
  /hooks
    useRealtime.ts    // custom hook for SSE/websockets
    ...
  /utils
    formatTime.ts     // utility functions
    ...

Guideline: Keep components modular—each with a single responsibility. Larger features (like the timesheet) can have a subfolder (/components/timesheet/) to organize child components.

2. Authentication & Clerk Integration
Clerk
For user sign-in, use Clerk’s prebuilt React components or minimal custom forms.
Typically, you place <ClerkProvider> at the root of your application (e.g., _app.tsx in Next.js).
After sign-in (Google/Microsoft), Clerk returns the user’s profile, which you can store in a React context or fetch from Clerk’s hooks (useUser, useAuth).
Protected Routes
For pages that require authentication (e.g., /dashboard, /invoices), you can wrap them in a middleware or add checks in getServerSideProps to ensure the user is logged in.
If the user isn’t authenticated, redirect them to the landing page or sign-in page.
User Session
For SSR, you can retrieve Clerk session tokens in getServerSideProps.
On client side, use useUser() or useAuth() to know if the user is signed in.
If the user has not completed desktop setup, show a blocking UI (or direct them to a setup page).

3. Landing Page & Onboarding
Landing Page (Static/SSR)
Sections: Hero area, product demos/testimonials, CTA (“Sign In” / “Create Account”).
Minimal or no dynamic data needed—can be statically generated or lightly SSR’d.
Onboarding Flow
If you want a multi-step flow in the front end, e.g., docuSign connect → desktop app install instructions → non-billable setup, store user progress in a local state or in Supabase (server side).
Provide a clear path:
Connect Desktop App: Show OS detection, link to the correct installer, instructions on permissions.
DocuSign: If user opts in, open an OAuth pop-up or redirect.
Non-Billable Chat (optional): Could be a wizard or a small form.
Block Access
If the user’s profile.isAppInstalled is false or profile.permissionsGranted is false, the timesheet or invoice pages should redirect to an “App Setup Required” page.

4. Styling & UI Framework
Styling Approach
Tailwind CSS is a popular choice for Next.js if you want utility-based styling. Alternatively, you can use a component library (Material UI, Chakra UI, Ant Design).
If you keep it simpler, just plain CSS modules or global styles in globals.css can suffice.
Design Consistency
Use consistent spacing, colors, fonts across pages.
Define a theming approach or simple style tokens (like colors.ts) to keep brand consistency.
Responsive Design
The timesheet view, invoice list, etc., should scale well from desktop to mobile if you need mobile support.
Next.js + React will handle responsive best practices, but you must ensure your components are fluid/flexible.

5. Timesheet Page
Timesheet Data Flow
The user’s time blocks come from the backend (Supabase) via an API route or serverless function in Next.js.
On mount, fetch the blocks for the selected date range (e.g., “today” or a calendar range).
Use React state or a global store (Redux, Zustand, or Context) to hold the blocks.
Real-Time Updates
A custom hook, e.g. useRealtime, can subscribe to WebSockets or SSE from the server, pushing new blocks or changes to the front end.
When a new block arrives, merge it into local state so the UI updates without refresh.
UI Components
Macro Timeline: A day or week overview with colored blocks.
Detail Panel: On click, opens a panel to show transcript snippet, “billable vs. non-billable,” and start/end times.
Possibly allow “split” or “merge” actions with minimal UI complexity.
User Overrides
Toggling “non-billable” or editing the block’s client assignment triggers a PUT or PATCH request to the server.
Wait for success to update local state, or do optimistic updates for snappier feel.

6. Invoice Page
Invoices Dashboard
A top-level route (e.g., /invoices) listing all clients with unbilled time.
Summarize total hours/amount for each client. Provide “Edit Items” and “Review & Send” buttons.
Editing Unbilled Items
Clicking “Edit Items” shows a line item list: each timesheet block or aggregated block for that client.
Let the user rename tasks, toggle billable, adjust hours, or discard line items.
The page recalculates the total in real time.
Final Review & Send
Clicking “Review & Send” displays a modal or a separate sub-route showing the invoice preview.
On confirmation, calls an API to finalize the invoice and integrate with Stripe/QuickBooks.
The page updates the invoice status to “Sent” or “Paid” once the backend receives a webhook or confirmation.

7. Real-Time Mechanisms
SSE or WebSockets
If using SSE:
A dedicated endpoint /api/stream that maintains an open HTTP connection.
The front-end uses EventSource or a library like react-use-websocket for simpler logic.
If using WebSockets (Socket.IO):
The Next.js server can spin up a Socket.IO server.
The React app registers event handlers (e.g., socket.on("new_time_block", ...)) to update the store.
Implementation
For timesheet: upon capturing a new block or updated block, the server emits an event.
The front end receives it and merges it into local state.
For invoice changes, similarly, if a user toggles a line item from another tab or user, it can reflect across sessions in real time (if multi-user scenarios become relevant).

8. Performance & Caching
SSR vs. Client-Side Fetch
For pages like /invoices, you may do SSR (using getServerSideProps) to render initial data. Then switch to client-side queries for real-time updates.
Next.js automatically code-splits your components. Keep an eye on the bundle size for pages with heavy libraries.
Caching
React Query or SWR can help cache API responses.
Real-time events override or invalidate the cache.
Lazy Loading
For large, rarely used components (like a big invoice editor or advanced charts), consider lazy loading with dynamic(() => import("./HeavyComponent"), ...).

9. Error Handling & User Feedback
Error Boundaries
If a React component throws, have a fallback UI to keep the app from crashing.
Notifications
Use a toast library (e.g., react-hot-toast) for success/failure messages (e.g., “Time block updated,” “Invoice sent successfully”).
Forms & Validation
For user input (like renaming tasks or editing line items), be sure to validate before sending to the backend.
Show inline errors or highlight fields on failure.

10. Quality & Best Practices
Code Style
Enforce ESLint + Prettier for formatting and linting.
Keep consistent naming conventions and file structure.
Reusable UI Components
Avoid duplication by extracting common layout elements (headers, footers, sidebars) into shared components.
Accessibility (a11y)
Use semantic HTML (headings, lists, labels) and aria attributes for interactive elements.
Test keyboard navigation for essential flows (timesheet editing, invoice generation).
Testing
Unit Tests with Jest or Vitest for small components/utilities.
Integration/E2E Tests with Cypress or Playwright to verify flows (e.g., sign in, timesheet block update, invoice creation).

Summary
Implementation Guidelines:
File Organization: Next.js pages in /pages, shared React components in /components, style with your chosen approach (e.g., Tailwind), and keep logic DRY.
Clerk OAuth: Provide a seamless sign-in experience. If the user is not fully onboarded, block them from main app pages.
Timesheet & Invoice: Two main pages. Both integrate with real-time streams to reflect updates from the desktop app. Provide robust editing and override options.
Styling & UX: Keep a consistent design system, minimal friction for the user to see/edit tasks, and a clean “Review & Send” invoice flow.
Error Handling & Testing: Use best practices, with clear errors, notifications, and thorough test coverage for key flows.
Following these front-end guidelines ensures a coherent, maintainable codebase and a smooth user experience—fully aligned with the product’s requirement of real-time timesheet updates, invoice creation, and tight integration with the Electron desktop capture app.


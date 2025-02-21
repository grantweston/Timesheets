PRODUCT REQUIREMENTS DOCUMENT (PRD)
1. Overview
Product Name
Automated AI-Driven Timesheet & Invoice Manager
High-Level Description
This system automates time capture for knowledge workers by capturing screenshots, application metadata, and (optionally) audio for calls. It classifies tasks using AI (Gemini) and references engagement letters fetched from Google/Outlook or DocuSign. Users override any auto-detected items (including non-billable time), and the system generates invoices (via Stripe or QuickBooks). The entire flow is blocked if the user fails to install and grant permissions to the desktop capture app.
Key Updates
Landing Page with marketing content + sign-in/create account.
Strict requirement: The user cannot proceed if they do not install the desktop capture app and grant permissions.
Non-Billable logic: The system tags short breaks, certain tasks, or idle times as non-billable by default, but the user can override them before sending invoices.
Dedicated Invoices Page: Real-time, always-updated invoice for each client’s unbilled items. A final “Review & Send” step finalizes and dispatches the invoice.

2. Goals & Objectives
Streamlined Onboarding
Provide a landing page that explains the product and prompts users to sign in or create an account.
Leverage OAuth (via Clerk) with Google/Microsoft for sign-up.
Prompt for DocuSign authorization if the user wants engagement letters automatically parsed.
Mandatory Desktop Capture Installation
The entire app is blocked until the user installs the Electron-based capture app on Windows/macOS and grants screen/audio permissions.
The user is guided step by step on how to do so.
Automated Time & Task Classification
Capture screens (1/sec or adaptive), detect calls from Zoom, Slack, Teams, etc.
Apply AI classification via Gemini, referencing engagement letters for client/project context.
Automatically tag certain durations (idle, short breaks, user-defined tasks) as non-billable.
Real-Time Timesheets & Invoices
A single web UI for daily/weekly timesheet reviews (with toggles for billable/non-billable).
An “Invoices” page that always shows unbilled hours for each client.
Users can finalize line items, then “Review & Send” via Stripe or QuickBooks.
User Overrides
At any point, the user can override the AI classification, marking tasks as billable or non-billable.
Engagement letters from DocuSign or Google can clarify which tasks are in scope.

3. User Personas
Freelance Consultants
Need easy time capture to invoice multiple clients.
Typically rely on Google/Outlook for email and DocuSign for contracts.
Knowledge Workers (Attorneys, Accountants, etc.)
Switch contexts often between different clients/projects.
Benefit from auto-tagging non-billable tasks like short breaks or administrative overhead.
Small/Medium-Sized Agencies
May have multiple staff who each track time separately. (Future multi-user expansions possible.)
Primarily need robust invoice generation and minimal overhead.

4. Key Features & Requirements
4.1 Landing Page & Registration
Landing Page:
A static marketing section with demos/testimonials.
Prominent “Sign In” or “Create Account” button.
Once clicked, triggers OAuth with Clerk (Google or Microsoft).
Blocking:
If a user tries to proceed after login but hasn’t finished desktop app setup, show a “Setup Required” screen. No further pages accessible.
4.2 DocuSign & Google Engagement Letters
Optional DocuSign Integration:
Prompt user to connect DocuSign after initial OAuth.
If authorized, fetch relevant engagement letters.
Scraping Logic:
(Out of scope for this PRD, but the system should parse the documents to identify project codes, billing scope, etc.)
4.3 Desktop App & Permissions
Electron-Based for Windows & macOS:
Must be installed, or the user can’t proceed with the web app.
If installed but permissions (screen/mic) are denied, no new data is captured.
Installation Flow:
Download from the web app (detect OS if possible).
Run installer (.exe on Windows, .dmg/.pkg on macOS).
Grant screen/audio permissions on first launch.
Tray Icon:
States: Idle, capturing screen only, capturing screen + audio.
User can pause or resume capture if needed (though the system then won’t gather new data).
4.4 Time Capture & Non-Billable Logic
Screen Capture: 1 screenshot/sec (configurable/adaptive).
Audio Capture: Loopback only when a recognized conferencing app is detected.
Non-Billable:
The system auto-tags short breaks, idle periods, or user-defined “non-billable tasks.”
The user can override each block in the timesheet or invoice phase to become billable if they wish.
4.5 Timesheet (Web UI)
Single-Page Timesheet:
Day/week calendar or timeline with color-coded blocks.
Clicking a block → detail panel with transcript snippet, start/end times, billable toggle.
Engagement Letter Context:
If the AI sees mention of a project code from DocuSign letters, it labels the block accordingly.
User can correct if AI mismatch occurs.
4.6 Invoice Generation (Dedicated Page)
Always-Ready Invoices:
A list of all clients with unbilled tasks.
For each client: total unbilled hours/dollars, an “Edit Items” button to expand line items, and a “Final Review & Send” button.
Live Invoice Items:
Expanding a client shows line items (blocks) that are not invoiced yet.
The user can toggle billable vs. non-billable or rename tasks. The total updates automatically.
Final Review & Send:
Presents a preview of the invoice (line items, total).
After confirmation, the invoice is sent via Stripe or QuickBooks (user’s choice).
Status changes to “Sent,” and when paid (in Stripe or QuickBooks), it updates to “Paid.”

5. Onboarding & Usage Flow
Landing Page → Sign In (OAuth w/ Clerk).
DocuSign Prompt (optional, for engagement letters).
Desktop App Required:
Download & install Electron app.
Grant screen/microphone.
Log in or link code to user’s account.
If not done, the web app remains blocked.
Timesheet / Invoice:
Once connected, user sees an automated day/week timesheet.
Unbilled items show up in the Invoice page. The user can finalize them at will.
Non-Billable Setup (e.g., a short chatbot or preference page):
Define short breaks, idle thresholds, or certain tasks that are typically not billed.
Daily Use: Desktop capture runs in the background, user occasionally reviews timesheet blocks.
Invoice: Access the “Invoices” page, see clients with unbilled time, edit items, and send final invoice.

6. Security & Privacy
Desktop/Server Communication:
All data sent over TLS (HTTPS).
The Gemini API key is held server-side so it’s never exposed to the user’s device.
Data Retention:
Raw screenshots/audio are discarded once classified or transcribed.
Only final timesheet data, transcripts, or invoice info is stored long-term.
Consent & Permissions:
The user must explicitly grant OS-level screen and audio permission for the desktop app to function.
If they revoke it later, new data capture stops.

7. Non-Functional Requirements
Performance
Up to 1 screenshot/sec, maintain real-time or near-real-time updates.
The web app should render timesheets/invoices quickly for daily usage.
Scalability
Containerized microservices to handle ingestion, AI classification, invoicing.
Potential for multi-user teams in the future.
Reliability
If the connection drops or permissions are revoked, the app caches data locally until reconnected or permissions are restored.
Desktop app includes a small queue for offline mode.
Usability
The landing page is marketing-driven yet straightforward for sign in.
The user is blocked if the desktop app isn’t installed or permissions aren’t granted, with clear error messages and instructions.
Auto-Updating Desktop Client
Windows: Squirrel or MSIX
macOS: Sparkle or built-in Electron update solution.


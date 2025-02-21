APP FLOW DOCUMENT
1. Landing Page & Registration
Landing Page (Static)
Layout: Explains how the application works, includes demos/testimonials or marketing copy.
Main Call to Action: "Sign In" or "Create Account."
OAuth Integration: Clicking "Sign In" triggers Clerk flows to sign in with Google or Microsoft (Outlook).
User Choice: Either create a brand-new account (via OAuth) or sign into an existing one.
Blocking Without Desktop Setup
If the user logs in but hasn't completed the mandatory desktop setup (indicated by Supabase flag), we block access to timesheet features.
A message states: "You must finish connecting your desktop app to proceed."

2. Onboarding & Desktop Connection
OAuth via Clerk
After clicking "Sign In," the user chooses Google or Microsoft.
The application obtains basic profile info (name, email).
Once authenticated, the user is recognized in the system.
DocuSign Authorization (Optional Step Here)
(Depending on your final placement) The user is prompted to connect DocuSign if they want engagement letters fetched.
If they skip, they can add it later, but we mention that analyzing engagement letters for billing context might be less accurate.
Desktop App Setup
The user cannot proceed to the timesheet features unless they install and set up the desktop app.
We show a blocking screen: "Please install the Desktop App to enable automatic time capture."
Download Instructions
The page detects OS (macOS or Windows) if possible.
Mac: .dmg or .pkg, plus instructions to grant Screen Recording & Microphone permissions.
Windows: .exe installer, instructing them to grant microphone and screen capture permissions if needed.
Desktop App Configuration
The user configures the desktop app with their Google Cloud credentials.
Once configured, the desktop app will handle all data capture and processing.
The web app checks Supabase for the is_desktop_setup flag before allowing access.
Outcome: The user has an account (via OAuth) and the desktop app is configured to send data through Google Cloud to Supabase.

3. Non-Billable Preferences & Chatbot (Optional Variation)
Chatbot / Setup Flow
After the user successfully sets up the desktop app, they return to the web app for a short preferences setup.
The system or a chat-like interface explains how non-billable time is identified (idle periods, certain tasks, etc.).
Toggling Non-Billable
The user can define activities or scenarios typically "not billed" (e.g., lunch breaks, writing engagement letters, short idle times).
These preferences are stored in Supabase and referenced when displaying timesheet data.
User Override
Later (in timesheet or invoice review), the user can override non-billable items if they actually want to bill them (or vice versa).
Outcome: The app sets internal rules for displaying non-billable tasks. The user sees an overview of what will be flagged.

4. Timesheet Review
Web App Dashboard
Once the desktop app is configured and sending data through Google Cloud to Supabase, the user can see their timesheet in the web UI.
Typically a day/week view with color-coded blocks for each recognized task/meeting.
Block Details
Clicking a block: reveals details about the captured time block, including start/end times, and a "billable" toggle.
Non-billable segments are labeled "Non-billable," but the user can override to "Billable" if needed.
User Edits
The user can merge or split blocks, adjust times, or rename tasks.
All edits are stored in Supabase and don't affect the original captured data.
Outcome: A verified timesheet emerges, ready for billing. All blocked (non-billable) segments remain as "$0" unless overridden.

5. Invoice Creation (Separate Page)
Navigation
There's an "Invoices" link or button in the top/side navigation.
Clicking it leads to a dedicated /invoices page.
Always-Ready Invoices
On the invoices page, the system shows each client that has unbilled time blocks.
For each client:
Name
Total Duration / Unbilled Amount
Buttons:
"Edit Items": Expands a list of line items (each block or date range). The user can make final changes.
"Final Review & Send": Moves to a confirmation screen with a preview of the final invoice.
Invoice Detail & Editing
If the user clicks "Edit Items", they see a real-time list of all blocks in the unbilled timeframe. They can toggle billable vs. non-billable, change descriptions, etc.
The total updates automatically.
Review & Send Flow
The user clicks "Final Review & Send," seeing exactly how the invoice appears to the client (line items, rates, total).
They confirm or abort. If confirmed:
The invoice is sent via either Stripe (creates a payment link) or QuickBooks (an official invoice record).
The invoice status changes from "Draft" to "Sent."
If using Stripe, once the client pays, it updates the status to "Paid."
If QuickBooks, the user can track payments through QuickBooks or within your app if integrated.
Outcome: The user can view, edit, and send invoices from a dedicated page, always reflecting the most recent timesheet changes for each client.

6. Blocking & Error Handling
No Desktop App Setup
User cannot proceed to timesheet or invoice pages until the desktop app setup is confirmed via Supabase flag.
They are shown a wizard or blocking screen: "Complete Desktop Setup."
Data Sync Issues
If there are issues with data syncing (Google Cloud → Supabase), the user is notified.
The user can still see old data in the timesheet or invoice pages, but is informed of the sync delay.
The UI shows a warning: "Some recent data may be delayed. Please check desktop app status."

Overall Flow Summary
Landing Page:
Static marketing content, "Sign In / Create Account" button.
OAuth with Clerk (Google/Microsoft).
Desktop Setup:
Download and install desktop app.
Configure Google Cloud credentials.
Wait for setup confirmation in Supabase.
Non-Billable Setup (Optional):
User configures break rules, typical non-billable tasks.
Timesheet:
Web UI shows data from Supabase that was processed by desktop app.
User can override or finalize block statuses.
Invoices (Dedicated Page):
Lists each client with unbilled time.
"Edit Items" to refine line items.
"Review & Send" to finalize and dispatch invoice (Stripe or QuickBooks).
Future Use:
Once set up, everything is automatic unless there are sync issues between Google Cloud and Supabase.


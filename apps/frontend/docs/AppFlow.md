APP FLOW DOCUMENT
1. Landing Page & Registration
Landing Page (Static)
Layout: Explains how the application works, includes demos/testimonials or marketing copy.
Main Call to Action: “Sign In” or “Create Account.”
OAuth Integration: Clicking “Sign In” triggers Clerk flows to sign in with Google or Microsoft (Outlook).
User Choice: Either create a brand-new account (via OAuth) or sign into an existing one.
Blocking Without Onboarding
If the user logs in but hasn’t completed the mandatory onboarding (desktop app installation, permissions), we completely block the app from further use.
A message states: “You must finish connecting your desktop app to proceed.”

2. Onboarding: OAuth & Desktop Connection
OAuth via Clerk
After clicking “Sign In,” the user chooses Google or Microsoft.
The application obtains basic profile info (name, email).
Once authenticated, the user is recognized in the system.
DocuSign Authorization (Optional Step Here)
(Depending on your final placement) The user is prompted to connect DocuSign if they want engagement letters fetched.
If they skip, they can add it later, but we mention that analyzing engagement letters for billing context might be less accurate.
Immediate Desktop App Requirement
The user cannot proceed to the web dashboard unless they install and link the desktop app.
We show a blocking screen: “Please install the Desktop App to enable automatic time capture.”
Download Electron App
The page detects OS (macOS or Windows) if possible.
Mac: .dmg or .pkg, plus instructions to grant Screen Recording & Microphone permissions.
Windows: .exe installer, instructing them to grant microphone and screen capture permissions if needed.
Linking the Desktop App
The user either logs in with the same Google/Microsoft account inside the Electron app or enters a short code to link the app to their account.
If the user fails to complete this step, the web app remains blocked.
Once the app is detected or verified, the user can proceed.
Permissions
On first launch, the Electron app prompts for necessary OS-level permissions (Screen Recording, Microphone).
If the user denies, the desktop app notifies them they must enable it or they can’t capture data.
Until they grant permissions, the web app is still blocked for new data capture.
Outcome: The user has an account (via OAuth), the desktop app is installed and linked, and all required permissionsare granted.

3. Non-Billable Preferences & Chatbot (Optional Variation)
Chatbot / Setup Flow
After the user successfully installs and links the desktop app, they return to the web app for a short preferences setup.
The system or a chat-like interface explains how non-billable time is identified (idle periods, certain tasks, etc.).
Toggling Non-Billable
The user can define activities or scenarios typically “not billed” (e.g., lunch breaks, writing engagement letters, short idle times).
The system automatically tags these blocks as “non-billable.”
User Override
Later (in timesheet or invoice review), the user can override non-billable items if they actually want to bill them (or vice versa).
Outcome: The app sets internal rules for auto-tagging non-billable tasks. The user sees an overview of what will be flagged.

4. Desktop App Data Capture
Running in the Background
The Electron app places an icon in the menu bar (macOS) or system tray (Windows).
It periodically captures screenshots (1/sec or adaptive), application metadata, and audio only during recognized conferencing (Zoom, Slack calls, Teams, etc.).
Tray Icon States
Idle: Gray icon if no data is currently captured or if the user paused it.
Screen Only: Blue camera icon.
Screen + Audio: Blue camera with red dot (indicating active audio capture).
Rechecking Permissions
If at any point the user revokes screen or microphone permission, the Electron app stops capturing.
The web app remains accessible to view existing data, but it can’t record new data until permissions are restored.
Non-Billable Tagging
The system notes idle times, breaks, or user-defined “non-billable” categories.
These blocks are flagged accordingly in the uploaded data.
Uploads
Data is compressed, encrypted (TLS), and sent to the server for classification (Gemini), transcript analysis, and timesheet generation.
Outcome: The user’s work sessions are automatically tracked, with the user’s prior preferences for non-billable tasks applied in real time.

5. Timesheet Review
Web App Dashboard
Once the desktop app is connected and capturing data, the user can see a timesheet overview in the web UI.
Typically a day/week view with color-coded blocks for each recognized task/meeting.
Block Details
Clicking a block: reveals transcript snippets (if audio was captured), start/end times, and a “billable” toggle.
Non-billable segments are labeled “Non-billable,” but the user can override to “Billable” if needed.
User Edits
The user can merge or split blocks, adjust times, or rename tasks.
They can confirm or override any auto-detected category from the desktop app or from AI classification.
Outcome: A verified timesheet emerges, ready for billing. All blocked (non-billable) segments remain as “$0” unless overridden.

6. Invoice Creation (Separate Page)
Navigation
There’s an “Invoices” link or button in the top/side navigation.
Clicking it leads to a dedicated /invoices page.
Always-Ready Invoices
On the invoices page, the system shows each client that has unbilled time blocks.
For each client:
Name
Total Duration / Unbilled Amount
Buttons:
“Edit Items”: Expands a list of line items (each block or date range). The user can make final changes.
“Final Review & Send”: Moves to a confirmation screen with a preview of the final invoice.
Invoice Detail & Editing
If the user clicks “Edit Items”, they see a real-time list of all blocks in the unbilled timeframe. They can toggle billable vs. non-billable, change descriptions, etc.
The total updates automatically.
Review & Send Flow
The user clicks “Final Review & Send,” seeing exactly how the invoice appears to the client (line items, rates, total).
They confirm or abort. If confirmed:
The invoice is sent via either Stripe (creates a payment link) or QuickBooks (an official invoice record).
The invoice status changes from “Draft” to “Sent.”
If using Stripe, once the client pays, it updates the status to “Paid.”
If QuickBooks, the user can track payments through QuickBooks or within your app if integrated.
Outcome: The user can view, edit, and send invoices from a dedicated page, always reflecting the most recent timesheet changes for each client.

7. Blocking & Error Handling
No Desktop App Linked
User cannot proceed to timesheet or invoice pages until the desktop app is installed, permissioned, and linked.
They are shown a wizard or blocking screen: “Complete Desktop Setup.”
Revoked Permissions
If the user later revokes screen/microphone permissions, new data capture stops.
The user can still see old data in the timesheet or invoice pages, but no new tasks or calls are recorded.
The UI shows a warning: “Permissions revoked. Resume capturing by enabling them again.”

Overall Flow Summary
Landing Page:
Static marketing content, “Sign In / Create Account” button.
OAuth with Clerk (Google/Microsoft).
Onboarding Block:
Must install/link the Electron desktop app.
Must grant OS permissions for capturing.
If not done, user can’t proceed.
Non-Billable Chatbot Setup (Optional):
User configures break rules, typical non-billable tasks.
Desktop Capture:
Electron app runs in tray, capturing screen metadata & audio.
Non-billable is auto-flagged.
Timesheet:
Web UI shows a day/week timeline.
User can override or finalize block statuses.
Invoices (Dedicated Page):
Lists each client with unbilled time.
“Edit Items” to refine line items.
“Review & Send” to finalize and dispatch invoice (Stripe or QuickBooks).
Future Use:
Once set up, everything is automatic unless permissions are revoked or the user uninstalls the app.


PRODUCT REQUIREMENTS DOCUMENT (PRD)
1. Overview
Product Name
Automated AI-Driven Timesheet & Invoice Manager
High-Level Description
This system consists of two main components:
1. A desktop app that captures screenshots, application metadata, and (optionally) audio for calls. It processes this data using AI (Gemini) and uploads the results to Supabase via Google Cloud.
2. A web application that displays the processed time data, allows manual adjustments, and generates invoices.
The web app references engagement letters (from Google/Outlook or DocuSign) for client context. Users can override any auto-detected items (including non-billable time), and the system generates invoices (via Stripe or QuickBooks).
Key Updates
Landing Page with marketing content + sign-in/create account.
Desktop App Requirement: Users must install and configure the desktop capture app to access timesheet features.
Non-Billable Logic: The system displays certain tasks as non-billable by default, but users can override them before sending invoices.
Dedicated Invoices Page: Real-time, always-updated invoice for each client's unbilled items.

2. Goals & Objectives
Streamlined Onboarding
Provide a landing page that explains the product and prompts users to sign in or create an account.
Leverage OAuth (via Clerk) with Google/Microsoft for sign-up.
Prompt for DocuSign authorization if the user wants engagement letters automatically parsed.
Desktop App Integration
Guide users through desktop app installation and setup.
Track setup status in Supabase to control web app access.
Monitor data flow from Google Cloud to Supabase.
Time Classification & Display
Display processed time blocks from Supabase, including AI classifications.
Allow manual overrides and adjustments.
Automatically tag certain durations as non-billable based on user preferences.
Real-Time Timesheets & Invoices
A single web UI for daily/weekly timesheet reviews (with toggles for billable/non-billable).
An "Invoices" page that always shows unbilled hours for each client.
Users can finalize line items, then "Review & Send" via Stripe or QuickBooks.
User Overrides
At any point, the user can override the displayed classification, marking tasks as billable or non-billable.
Engagement letters from DocuSign or Google can clarify which tasks are in scope.

3. User Personas
Freelance Consultants
Need easy time tracking and invoice generation for multiple clients.
Typically rely on Google/Outlook for email and DocuSign for contracts.
Knowledge Workers (Attorneys, Accountants, etc.)
Switch contexts often between different clients/projects.
Benefit from auto-tagging non-billable tasks like short breaks or administrative overhead.
Small/Medium-Sized Agencies
May have multiple staff who each track time separately.
Primarily need robust invoice generation and minimal overhead.

4. Key Features & Requirements
4.1 Landing Page & Registration
Landing Page:
A static marketing section with demos/testimonials.
Prominent "Sign In" or "Create Account" button.
Once clicked, triggers OAuth with Clerk (Google or Microsoft).
Blocking:
If a user tries to proceed after login but hasn't completed desktop app setup, show a "Setup Required" screen.
4.2 DocuSign & Google Engagement Letters
Optional DocuSign Integration:
Prompt user to connect DocuSign after initial OAuth.
If authorized, fetch relevant engagement letters.
Letter Processing:
Store engagement letter data in Supabase for reference during time classification.
4.3 Desktop App Integration
Setup Flow:
Provide clear download instructions for Windows & macOS.
Track setup progress in Supabase.
Block web app features until setup is complete.
Data Pipeline:
Desktop app handles all capture and processing.
Data flows through Google Cloud to Supabase.
Web app monitors sync status and displays warnings if needed.
4.4 Time Display & Non-Billable Logic
Time Blocks:
Display processed time blocks from Supabase.
Show AI classifications and suggested billing status.
Non-Billable Rules:
Users can define rules for what's typically non-billable.
Rules are stored in Supabase and applied when displaying data.
4.5 Timesheet (Web UI)
Single-Page Timesheet:
Day/week calendar or timeline with color-coded blocks.
Click blocks to see details, toggle billable status, edit descriptions.
Engagement Letter Context:
If AI found project codes from letters, show the context.
Allow manual corrections and overrides.
4.6 Invoice Generation
Always-Ready Invoices:
List all clients with unbilled tasks.
For each client: total unbilled hours/dollars, "Edit Items" and "Final Review & Send" options.
Live Invoice Items:
Expanding a client shows line items not yet invoiced.
Toggle billable status, rename tasks, adjust hours.
Final Review & Send:
Preview the invoice before sending.
Integration with Stripe or QuickBooks.
Status tracking in Supabase (draft → sent → paid).

5. Onboarding & Usage Flow
Landing Page → Sign In (OAuth w/ Clerk)
DocuSign Prompt (optional)
Desktop App Setup:
Download & install app
Configure Google Cloud credentials
Wait for setup confirmation in Supabase
Non-Billable Setup:
Define rules for breaks, idle time, non-billable tasks
Daily Use:
View processed time blocks
Review and adjust as needed
Invoice:
Access Invoices page
Review unbilled time
Send via Stripe/QuickBooks

6. Security & Privacy
Data Processing:
All raw capture data stays in desktop app pipeline.
Only processed time blocks reach Supabase.
Authentication:
Clerk handles web app authentication.
Supabase RLS policies enforce data access control.
Permissions:
Desktop app handles its own permissions.
Web app checks setup status via Supabase.

7. Non-Functional Requirements
Performance
Fast timesheet and invoice page loads.
Efficient Supabase queries and caching.
Scalability
Supabase handles data storage and real-time updates.
Web app scales independently of desktop capture.
Reliability
Clear error handling for sync issues.
Fallback views for delayed data.
Usability
Clear setup instructions and progress tracking.
Intuitive timesheet and invoice management.
Updates
Web app deploys independently.
Desktop app handles its own update process.


'use client';

import { useUser } from "@/app/hooks/use-user";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import Image from "next/image";
import { ExternalLink } from "lucide-react";

// Define the proper types for integration statuses
interface IntegrationToken {
  access_token?: string;
  refresh_token?: string;
  expires_at?: string;
  [key: string]: any;
}

interface Integration {
  connected: boolean;
  token?: IntegrationToken | null;
}

interface IntegrationStatuses {
  outlook?: Integration;
  gmail?: Integration;
  docusign?: Integration;
  stripe?: Integration;
  quickbooks?: Integration;
  [key: string]: Integration | undefined;
}

// Extended User type that matches what we actually get from the backend
interface ExtendedUser {
  id?: string;
  clerk_user_id: string;
  email: string | null;
  display_name: string | null;
  timezone?: string | null;
  integration_statuses?: IntegrationStatuses;
  is_desktop_setup?: boolean;
  created_at?: string | null;
  [key: string]: any; // Allow for any other properties
}

function IntegrationStatusBadge({ connected }: { connected: boolean }) {
  return (
    <span className={`px-2 py-1 text-sm rounded-full ${
      connected 
        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    }`}>
      {connected ? 'Connected' : 'Not Connected'}
    </span>
  );
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | boolean | null | undefined }) {
  if (value === undefined || value === null) return null;
  return (
    <div className="flex items-center py-3 border-b last:border-0 border-gray-100 dark:border-gray-800">
      <span className="text-sm text-gray-500 dark:text-gray-400 w-1/3">{label}</span>
      <span className="text-sm flex-1">{String(value)}</span>
    </div>
  );
}

function IntegrationRow({ 
  name, 
  description, 
  connected,
  logoSrc
}: { 
  name: string; 
  description: string;
  connected: boolean;
  logoSrc: string;
}) {
  return (
    <div className="p-4 border rounded-lg border-gray-100 dark:border-gray-800 hover:border-violet-200 dark:hover:border-violet-800 transition-all duration-200">
      <div className="flex items-center gap-4">
        <div className="relative h-12 w-12 flex-shrink-0">
          <Image
            src={logoSrc}
            alt={`${name} logo`}
            fill
            className="object-contain"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium">{name}</span>
            <IntegrationStatusBadge connected={connected} />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <Button 
          variant={connected ? "outline" : "default"} 
          size="sm"
          className="gap-1"
        >
          {connected ? 'Manage Connection' : 'Connect'} 
          <ExternalLink className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { user: originalUser, loading, error } = useUser();
  // Cast the user to our extended type safely
  const user = originalUser as unknown as ExtendedUser | null;
  
  console.log('🔍 SettingsPage render state:', {
    hasUser: !!user,
    loading,
    hasError: !!error,
    userData: user ? {
      clerk_user_id: user.clerk_user_id,
      display_name: user.display_name,
      integration_statuses: user.integration_statuses
    } : null
  });

  if (loading) {
    return (
      <main className="flex w-full flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Loading your settings...</p>
        </div>
        <Card className="p-6">
          <div className="h-32 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
          </div>
        </Card>
      </main>
    );
  }

  if (error) {
    console.error('❌ SettingsPage error:', error);
    return (
      <main className="flex w-full flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-red-500">Error loading settings: {error}</p>
        </div>
        <Card className="p-6">
          <div className="text-center text-red-500">
            Failed to load settings. Please try refreshing the page.
          </div>
        </Card>
      </main>
    );
  }

  if (!user) {
    console.warn('⚠️ SettingsPage: No user data found');
    return (
      <main className="flex w-full flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">No user data found</p>
        </div>
        <Card className="p-6">
          <div className="text-center text-muted-foreground">
            Could not find your user settings. Please try signing out and back in.
          </div>
        </Card>
      </main>
    );
  }

  console.log('✅ SettingsPage: User data received, rendering settings');
  
  // Ensure integration_statuses exists to prevent errors
  const integrationStatuses = user.integration_statuses || {
    docusign: { connected: false },
    quickbooks: { connected: false },
    stripe: { connected: false },
    gmail: { connected: false },
    outlook: { connected: false }
  };

  // Integration data with logos and descriptions
  const integrations = [
    {
      id: "docusign",
      name: "DocuSign",
      description: "Connect to automatically generate and send engagement letters for signature",
      logoSrc: "/logos/DocuSign-Symbol.png",
      connected: integrationStatuses.docusign?.connected || false
    },
    {
      id: "quickbooks",
      name: "QuickBooks",
      description: "Sync your time entries and invoices with QuickBooks Online",
      logoSrc: "/logos/quickbooks.webp",
      connected: integrationStatuses.quickbooks?.connected || false
    },
    {
      id: "stripe",
      name: "Stripe",
      description: "Process payments and manage subscriptions",
      logoSrc: "/logos/498440.webp",
      connected: integrationStatuses.stripe?.connected || false
    },
    {
      id: "gmail",
      name: "Gmail",
      description: "Connect Gmail for email and calendar tracking",
      logoSrc: "/logos/gmail.png",
      connected: integrationStatuses.gmail?.connected || false
    },
    {
      id: "outlook",
      name: "Outlook",
      description: "Connect Outlook for email and calendar tracking",
      logoSrc: "/logos/microsoft.png",
      connected: integrationStatuses.outlook?.connected || false
    }
  ];

  return (
    <main className="flex w-full flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and integrations.</p>
      </div>

      <div className="grid gap-8 grid-cols-1">
        <Card className="p-6">
          <SettingsSection title="Profile Information">
            <div className="space-y-1">
              <InfoRow label="Display Name" value={user.display_name} />
              <InfoRow label="Email" value={user.email} />
              <InfoRow label="Timezone" value={user.timezone || 'Not set'} />
              <InfoRow label="Desktop App" value={user.is_desktop_setup ? 'Installed' : 'Not installed'} />
              <InfoRow label="Member Since" value={
                user.created_at 
                  ? new Date(user.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : 'Unknown'
              } />
            </div>
          </SettingsSection>
        </Card>

        <Card className="p-6">
          <SettingsSection title="Connected Services">
            <div className="mt-4 grid gap-4 grid-cols-1">
              {integrations.map((integration) => (
                <IntegrationRow 
                  key={integration.id}
                  name={integration.name}
                  description={integration.description}
                  connected={integration.connected}
                  logoSrc={integration.logoSrc}
                />
              ))}
            </div>
          </SettingsSection>
        </Card>
      </div>
    </main>
  );
} 
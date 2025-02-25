'use client';

import { useUser } from "@/app/hooks/use-user";
import { Card } from "@/app/components/ui/card";

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
  connected 
}: { 
  name: string; 
  description: string;
  connected: boolean;
}) {
  return (
    <div className="py-4 border-b last:border-0 border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between mb-1">
        <span className="font-medium">{name}</span>
        <IntegrationStatusBadge connected={connected} />
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
    </div>
  );
}

export default function SettingsPage() {
  const { user, loading, error } = useUser();
  
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

  return (
    <main className="flex w-full flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and integrations.</p>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
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
            <div className="space-y-4">
              <IntegrationRow 
                name="DocuSign"
                description="Connect to automatically generate and send engagement letters for signature"
                connected={integrationStatuses.docusign?.connected || false}
              />
              <IntegrationRow 
                name="QuickBooks"
                description="Sync your time entries and invoices with QuickBooks Online"
                connected={integrationStatuses.quickbooks?.connected || false}
              />
              <IntegrationRow 
                name="Stripe"
                description="Process payments and manage subscriptions"
                connected={integrationStatuses.stripe?.connected || false}
              />
            </div>
          </SettingsSection>
        </Card>
      </div>
    </main>
  );
} 
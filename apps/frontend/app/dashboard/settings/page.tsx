'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs"
import { Card } from "@/app/components/ui/card"
import { Label } from "@/app/components/ui/label"
import { Input } from "@/app/components/ui/input"
import { Button } from "@/app/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select"
import { Separator } from "@/app/components/ui/separator"
import { Badge } from "@/app/components/ui/badge"
import { 
  Mail, 
  Calendar,
  FileText,
  CreditCard,
  Calculator
} from "lucide-react"
import { useUser } from "@/app/hooks/use-user"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/app/providers/supabase-provider"
import { useState } from "react"
import { useUser as useClerkUser } from "@clerk/nextjs";

export default function SettingsPage() {
  const { user, loading, error } = useUser();
  const { user: clerkUser } = useClerkUser();
  const router = useRouter();
  const { supabase } = useSupabase();
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Get email accounts from Clerk
  const connectedEmails = clerkUser?.emailAddresses || [];
  const hasGmail = connectedEmails.some(email => email.emailAddress.endsWith('@gmail.com'));
  const hasOutlook = connectedEmails.some(email => 
    email.emailAddress.endsWith('@outlook.com') || 
    email.emailAddress.endsWith('@hotmail.com') || 
    email.emailAddress.endsWith('@live.com')
  );

  const handleIntegrationClick = async (integrationKey: string, isConnected: boolean) => {
    if (isConnected) {
      try {
        setIsUpdating(integrationKey);
        // Show confirmation dialog
        const confirmed = window.confirm(`Are you sure you want to disconnect ${integrationKey}?`);
        if (!confirmed) {
          setIsUpdating(null);
          return;
        }

        // Update the integration status in the database
        const { error: updateError } = await supabase
          .from('users')
          .update({
            integration_statuses: {
              ...user?.integration_statuses,
              [integrationKey]: {
                connected: false,
                token: null
              }
            }
          })
          .eq('clerk_user_id', user?.clerk_user_id);

        if (updateError) throw updateError;

        toast.success(`Successfully disconnected ${integrationKey}`);
        router.refresh();
      } catch (err) {
        console.error(`Error disconnecting ${integrationKey}:`, err);
        toast.error(`Failed to disconnect ${integrationKey}. Please try again.`);
      } finally {
        setIsUpdating(null);
      }
      return;
    }

    try {
      setIsUpdating(integrationKey);
      // Handle connection based on integration type
      switch (integrationKey) {
        case 'docusign':
          window.location.href = `/api/auth/docusign/connect`;
          break;
        case 'stripe':
          window.location.href = `/api/auth/stripe/connect`;
          break;
        case 'quickbooks':
          window.location.href = `/api/auth/quickbooks/connect`;
          break;
        default:
          throw new Error(`Unknown integration: ${integrationKey}`);
      }
    } catch (err) {
      console.error(`Error connecting ${integrationKey}:`, err);
      toast.error(`Failed to connect ${integrationKey}. Please try again.`);
      setIsUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="text-red-500">
          {error.message || 'An error occurred while loading user data'}
        </div>
        <Button 
          onClick={() => router.refresh()}
          className="bg-violet-600 hover:bg-violet-700 text-white"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <main className="flex w-full flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="bg-violet-50/50 dark:bg-violet-900/10">
          <TabsTrigger 
            value="profile"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-violet-900/20 data-[state=active]:text-violet-600 dark:data-[state=active]:text-violet-300"
          >
            Profile
          </TabsTrigger>
          <TabsTrigger 
            value="integrations"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-violet-900/20 data-[state=active]:text-violet-600 dark:data-[state=active]:text-violet-300"
          >
            Integrations
          </TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile">
          <Card className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-2xl font-semibold">
                  {user?.display_name?.charAt(0) || 'U'}
                </div>
              </div>

              <Separator className="bg-zinc-200 dark:bg-zinc-800" />

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input 
                    id="name" 
                    defaultValue={user?.display_name || ''} 
                    className="border-zinc-200 dark:border-zinc-800 focus-visible:ring-violet-500"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    defaultValue={user?.email || ''} 
                    className="border-zinc-200 dark:border-zinc-800 focus-visible:ring-violet-500"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select defaultValue={user?.timezone || 'UTC'}>
                    <SelectTrigger 
                      id="timezone"
                      className="border-zinc-200 dark:border-zinc-800 focus-visible:ring-violet-500"
                    >
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                      <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25">
                Save Changes
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Integrations Settings */}
        <TabsContent value="integrations">
          <Card className="p-6 space-y-6">
            <div className="space-y-4">
              {/* Email Accounts Section */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Email Accounts</h3>
                <div className="space-y-4">
                  {connectedEmails.map((email) => (
                    <div key={email.id} className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="rounded-full bg-violet-100 dark:bg-violet-900/20 p-2">
                          <Mail className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                        </div>
                        <div>
                          <p className="font-medium">{email.emailAddress}</p>
                          <p className="text-sm text-muted-foreground">
                            {email.verification.status === "verified" ? "Verified" : "Unverified"}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                        Connected
                      </Badge>
                    </div>
                  ))}
                  <Button
                    onClick={() => router.push('/user/email-addresses')}
                    className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700"
                  >
                    Add Email Account
                  </Button>
                </div>
              </div>

              {/* Other Integrations */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Service Integrations</h3>
                {[
                  {
                    icon: FileText,
                    name: "DocuSign",
                    key: "docusign",
                    description: "Integrate with DocuSign for seamless document signing.",
                  },
                  {
                    icon: CreditCard,
                    name: "Stripe",
                    key: "stripe",
                    description: "Connect Stripe for payment processing and invoicing.",
                  },
                  {
                    icon: Calculator,
                    name: "QuickBooks",
                    key: "quickbooks",
                    description: "Sync your financial data with QuickBooks.",
                  },
                ].map((integration) => {
                  const status = user?.integration_statuses?.[integration.key as keyof typeof user.integration_statuses];
                  const isConnected = status?.connected || false;
                  const isUpdatingThis = isUpdating === integration.key;

                  return (
                    <div key={integration.name} className="flex items-start justify-between p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                      <div className="flex items-start gap-4">
                        <div className="rounded-full bg-violet-100 dark:bg-violet-900/20 p-2">
                          <integration.icon className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{integration.name}</h3>
                            {isConnected && (
                              <Badge className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                                Connected
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{integration.description}</p>
                        </div>
                      </div>
                      <Button 
                        variant={isConnected ? "outline" : "default"}
                        className={isConnected ? 
                          "hover:bg-violet-50 dark:hover:bg-violet-900/10 hover:text-violet-600 dark:hover:text-violet-300" :
                          "bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25"
                        }
                        onClick={() => handleIntegrationClick(integration.key, isConnected)}
                        disabled={isUpdatingThis}
                      >
                        {isUpdatingThis ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                            {isConnected ? "Disconnecting..." : "Connecting..."}
                          </div>
                        ) : (
                          isConnected ? "Disconnect" : "Connect"
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  )
} 
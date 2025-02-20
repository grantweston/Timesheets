"use client"

import { InvoiceList } from "@/components/invoice-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function InvoicesPage() {
  const [isStripeConnected, setIsStripeConnected] = useState(false);

  useEffect(() => {
    // Check if user has connected Stripe
    const checkStripeConnection = async () => {
      try {
        const response = await fetch('/api/auth/stripe/status');
        const data = await response.json();
        setIsStripeConnected(data.isConnected);
      } catch (error) {
        console.error('Error checking Stripe connection:', error);
      }
    };

    checkStripeConnection();
  }, []);

  const handleStripeConnect = () => {
    const clientId = process.env.NEXT_PUBLIC_STRIPE_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_STRIPE_CONNECT_REDIRECT_URI;
    
    if (!clientId || !redirectUri) {
      toast.error('Stripe configuration missing');
      return;
    }

    const state = Math.random().toString(36).substring(7);
    const stripeUrl = `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${clientId}&scope=read_write&redirect_uri=${redirectUri}&state=${state}`;
    
    window.location.href = stripeUrl;
  };

  const handleQuickBooksConnect = () => {
    const clientId = process.env.NEXT_PUBLIC_QUICKBOOKS_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_QUICKBOOKS_REDIRECT_URI;
    
    if (!clientId || !redirectUri) {
      toast.error('QuickBooks configuration missing');
      return;
    }

    const state = Math.random().toString(36).substring(7);
    const authUrl = `https://appcenter.intuit.com/connect/oauth2?client_id=${clientId}&response_type=code&scope=com.intuit.quickbooks.accounting&redirect_uri=${redirectUri}&state=${state}`;
    
    window.location.href = authUrl;
  };

  return (
    <main className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
        <div className="flex gap-2">
          {!isStripeConnected && (
            <Button
              onClick={handleStripeConnect}
              className="bg-violet-600 hover:bg-violet-700 text-white"
            >
              Connect Stripe
            </Button>
          )}
          <Button
            onClick={handleQuickBooksConnect}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Connect QuickBooks
          </Button>
        </div>
      </div>
      {!isStripeConnected ? (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">Connect your Stripe account to start managing invoices.</p>
        </Card>
      ) : (
        <Tabs defaultValue="current" className="space-y-4">
          <TabsList className="bg-violet-50/50 dark:bg-violet-900/10">
            <TabsTrigger 
              value="current"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-violet-900/20 data-[state=active]:text-violet-600 dark:data-[state=active]:text-violet-300"
            >
              Current
            </TabsTrigger>
            <TabsTrigger 
              value="archive"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-violet-900/20 data-[state=active]:text-violet-600 dark:data-[state=active]:text-violet-300"
            >
              Archive
            </TabsTrigger>
          </TabsList>
          <TabsContent value="current" className="space-y-4">
            <Card className="p-6">
              <InvoiceList type="current" />
            </Card>
          </TabsContent>
          <TabsContent value="archive" className="space-y-4">
            <Card className="p-6">
              <InvoiceList type="archive" />
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </main>
  )
} 
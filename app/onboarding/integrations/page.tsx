"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

const integrations = [
  {
    id: "stripe",
    title: "Stripe Integration",
    description: "Process payments and manage invoices",
    logo: "/logos/498440.webp",
    connectLabel: "Connect"
  },
  {
    id: "quickbooks",
    title: "QuickBooks Integration",
    description: "Sync invoices and track accounting",
    logo: "/logos/quickbooks.webp",
    connectLabel: "Connect"
  },
  {
    id: "docusign",
    title: "DocuSign Integration",
    description: "Automatically import client contracts and engagement letters",
    logo: "/logos/DocuSign-Symbol.png",
    connectLabel: "Connect"
  },
  {
    id: "gmail",
    title: "Gmail Integration",
    description: "Connect Gmail for email and calendar tracking",
    logo: "/logos/gmail.png",
    connectLabel: "Connect"
  },
  {
    id: "outlook",
    title: "Outlook Integration",
    description: "Connect Outlook for email and calendar tracking",
    logo: "/logos/microsoft.png",
    connectLabel: "Connect"
  }
]

export default function IntegrationsPage() {
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const { user } = useUser()
  const [connecting, setConnecting] = useState<string | null>(null)
  const [connected, setConnected] = useState<string[]>([])
  const router = useRouter()

  useEffect(() => {
    const checkConnections = async () => {
      if (user) {
        const connectedProviders: string[] = []
        
        // Check if user has connected Google
        const googleAccount = user.externalAccounts.find(
          account => account.provider === 'google' && 
          account.verification?.status === 'verified'
        )
        if (googleAccount) {
          connectedProviders.push('gmail')
        }

        // Check if user has connected Microsoft
        const microsoftAccount = user.externalAccounts.find(
          account => account.provider === 'microsoft' && 
          account.verification?.status === 'verified'
        )
        if (microsoftAccount) {
          connectedProviders.push('outlook')
        }

        // Check Stripe connection
        try {
          const stripeResponse = await fetch('/api/auth/stripe/status')
          const stripeData = await stripeResponse.json()
          if (stripeData.isConnected) {
            connectedProviders.push('stripe')
          }
        } catch (error) {
          console.error('Error checking Stripe status:', error)
        }

        // Check QuickBooks connection
        try {
          const qbResponse = await fetch('/api/auth/quickbooks/status')
          const qbData = await qbResponse.json()
          if (qbData.isConnected) {
            connectedProviders.push('quickbooks')
          }
        } catch (error) {
          console.error('Error checking QuickBooks status:', error)
        }

        setConnected(connectedProviders)
      }
    }

    checkConnections()
  }, [user])

  useEffect(() => {
    const params = new URLSearchParams(searchParams?.toString() || '')
    const success = params.get('success')
    const error = params.get('error')

    if (success) {
      setConnected(prev => [...prev, success])
      toast({
        title: "Integration connected",
        description: `Your ${success} integration has been set up successfully.`,
      })
      // Navigate to engagement letters page after successful integration
      router.push('/onboarding/engagement-letters')
    } else if (error) {
      toast({
        title: "Connection failed",
        description: `There was an error connecting your ${error} integration. Please try again.`,
        variant: "destructive"
      })
    }
  }, [searchParams, toast, router])

  const handleConnect = async (integrationId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in first to connect your account.",
        variant: "destructive"
      })
      return
    }

    setConnecting(integrationId)
    
    try {
      switch (integrationId) {
        case 'stripe': {
          const clientId = process.env.NEXT_PUBLIC_STRIPE_CLIENT_ID;
          const redirectUri = process.env.NEXT_PUBLIC_STRIPE_CONNECT_REDIRECT_URI;
          
          console.log('Stripe Connect Initialization:', {
            clientId,
            redirectUri,
            envVars: process.env
          });

          if (!clientId || !redirectUri) {
            throw new Error('Stripe configuration missing');
          }

          const state = Math.random().toString(36).substring(7);
          const stripeUrl = `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${clientId}&scope=read_write&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;
          console.log('Generated Stripe URL:', stripeUrl);
          
          window.location.href = stripeUrl;
          break;
        }
        
        case 'quickbooks': {
          const clientId = process.env.NEXT_PUBLIC_QUICKBOOKS_CLIENT_ID;
          const redirectUri = process.env.NEXT_PUBLIC_QUICKBOOKS_REDIRECT_URI;
          
          if (!clientId || !redirectUri) {
            throw new Error('QuickBooks configuration missing');
          }

          const state = Math.random().toString(36).substring(7);
          const authUrl = `https://appcenter.intuit.com/connect/oauth2?client_id=${clientId}&response_type=code&scope=com.intuit.quickbooks.accounting&redirect_uri=${redirectUri}&state=${state}`;
          window.location.href = authUrl;
          break;
        }

        case 'docusign': {
          const response = await fetch('/api/auth/docusign')
          const { url } = await response.json()
          
          if (url) {
            window.location.href = url
          } else {
            throw new Error('No authorization URL returned')
          }
          break;
        }

        case 'gmail':
        case 'outlook': {
          // For Gmail/Outlook, trigger Clerk's OAuth flow
          toast({
            title: "Already handled by sign-in",
            description: "Email and calendar access is granted during sign-in.",
          })
          setConnecting(null)
          break;
        }
      }
    } catch (error) {
      console.error('Failed to initiate OAuth:', error)
      toast({
        title: "Connection failed",
        description: error instanceof Error ? error.message : "There was an error connecting your integration. Please try again.",
        variant: "destructive"
      })
      setConnecting(null)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {integrations.map((integration, index) => (
          <motion.div
            key={integration.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="p-6">
              <div className="flex flex-col items-center gap-4 text-center h-[280px]">
                <div className="relative h-20 w-20 p-2">
                  <Image
                    src={integration.logo}
                    alt={integration.title}
                    fill
                    className={`object-contain ${
                      integration.id === 'quickbooks' ? 'mix-blend-multiply' : ''
                    } ${
                      integration.id === 'docusign' || integration.id === 'outlook' ? 'p-0' : 'p-2'
                    }`}
                    priority
                  />
                </div>
                <div className="space-y-2 flex-1">
                  <h3 className="font-semibold">{integration.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {integration.description}
                  </p>
                </div>
                <Button
                  variant={connected.includes(integration.id) ? "outline" : "default"}
                  className="w-full mt-auto"
                  onClick={() => handleConnect(integration.id)}
                  disabled={connecting === integration.id || connected.includes(integration.id)}
                >
                  {connecting === integration.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting
                    </>
                  ) : connected.includes(integration.id) ? (
                    "Connected"
                  ) : (
                    "Connect"
                  )}
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}


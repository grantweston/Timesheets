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
    id: "docusign",
    title: "DocuSign Integration",
    description: "Automatically import client contracts and engagement letters",
    logo: "/logos/docusign.png",
    connectLabel: "Connect DocuSign"
  },
  {
    id: "gmail",
    title: "Gmail Integration",
    description: "Connect Gmail for email and calendar tracking",
    logo: "/logos/gmail.png",
    connectLabel: "Connect Gmail"
  },
  {
    id: "outlook",
    title: "Outlook Integration",
    description: "Connect Outlook for email and calendar tracking",
    logo: "/logos/microsoft.webp",
    connectLabel: "Connect Outlook"
  }
]

export default function IntegrationsPage() {
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const { user } = useUser()
  const [connecting, setConnecting] = useState<string | null>(null)
  const [connected, setConnected] = useState<string[]>([])
  const router = useRouter()

  // Check which providers the user is already connected with via Clerk
  useEffect(() => {
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

      setConnected(connectedProviders)
    }
  }, [user])

  useEffect(() => {
    const success = searchParams.get('success')
    const error = searchParams.get('error')

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
    // For Gmail and Outlook, redirect to Clerk OAuth if not already connected
    if ((integrationId === 'gmail' || integrationId === 'outlook') && !user) {
      toast({
        title: "Authentication required",
        description: "Please sign in first to connect your account.",
        variant: "destructive"
      })
      return
    }

    setConnecting(integrationId)
    
    try {
      // Only use our custom OAuth for DocuSign
      if (integrationId === 'docusign') {
        const response = await fetch('/api/auth/docusign')
        const { url } = await response.json()
        
        if (url) {
          window.location.href = url
        } else {
          throw new Error('No authorization URL returned')
        }
      } else {
        // For Gmail/Outlook, trigger Clerk's OAuth flow
        // This should be handled by your sign-in flow instead
        toast({
          title: "Already handled by sign-in",
          description: "Email and calendar access is granted during sign-in.",
        })
        setConnecting(null)
      }
    } catch (error) {
      console.error('Failed to initiate OAuth:', error)
      toast({
        title: "Connection failed",
        description: "There was an error connecting your integration. Please try again.",
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
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="relative h-20 w-20 p-2">
                  <Image
                    src={integration.logo}
                    alt={integration.title}
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">{integration.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {integration.description}
                  </p>
                </div>
                <Button
                  variant={connected.includes(integration.id) ? "outline" : "default"}
                  className="w-full"
                  onClick={() => handleConnect(integration.id)}
                  disabled={connecting === integration.id || connected.includes(integration.id)}
                >
                  {connecting === integration.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : connected.includes(integration.id) ? (
                    "Connected"
                  ) : (
                    integration.connectLabel
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


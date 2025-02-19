"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useState } from "react"
import { FileText, Mail, Calendar, MessageSquare, Loader2 } from "lucide-react"

const integrations = [
  {
    id: "docusign",
    title: "DocuSign Integration",
    description: "Automatically import client contracts and engagement letters",
    icon: FileText,
    connectLabel: "Connect DocuSign"
  },
  {
    id: "email",
    title: "Email Integration",
    description: "Connect your email to track time spent on client communications",
    icon: Mail,
    connectLabel: "Connect Email"
  },
  {
    id: "calendar",
    title: "Calendar Integration",
    description: "Track time spent in meetings and appointments automatically",
    icon: Calendar,
    connectLabel: "Connect Calendar"
  },
  {
    id: "slack",
    title: "Slack Integration",
    description: "Track time spent in team communications and client channels",
    icon: MessageSquare,
    connectLabel: "Connect Slack"
  }
]

export default function IntegrationsPage() {
  const { toast } = useToast()
  const [connecting, setConnecting] = useState<string | null>(null)
  const [connected, setConnected] = useState<string[]>([])

  const handleConnect = async (integrationId: string) => {
    setConnecting(integrationId)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    setConnecting(null)
    setConnected(prev => [...prev, integrationId])
    
    toast({
      title: "Integration connected",
      description: "Your integration has been set up successfully.",
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="grid gap-4 md:grid-cols-2">
        {integrations.map((integration, index) => (
          <motion.div
            key={integration.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-primary/10 p-2">
                  <integration.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold">{integration.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {integration.description}
                  </p>
                  <Button
                    variant={connected.includes(integration.id) ? "outline" : "default"}
                    className="mt-2"
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
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}


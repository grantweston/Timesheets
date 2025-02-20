"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useState } from "react"
import { Loader2, Download, Monitor, CheckCircle2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

const steps = [
  {
    title: "Download",
    description: "Download the TimeTrack AI desktop app",
  },
  {
    title: "Install",
    description: "Run the installer on your computer",
  },
  {
    title: "Connect",
    description: "Link the app to your account",
  },
]

export default function DesktopPage() {
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(0)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [pairingCode, setPairingCode] = useState<string | null>(null)

  const handleDownload = async () => {
    setIsDownloading(true)
    // Simulate download progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200))
      setDownloadProgress(i)
    }
    setIsDownloading(false)
    setCurrentStep(1)
    toast({
      title: "Download complete",
      description: "Please run the installer to continue.",
    })
  }

  const generatePairingCode = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    setPairingCode(code)
    toast({
      title: "Pairing code generated",
      description: `Your code is: ${code}`,
    })
    setCurrentStep(2)
  }

  const verifyInstallation = async () => {
    setIsVerifying(true)
    // Simulate verification
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsVerifying(false)
    setIsVerified(true)
    toast({
      title: "Success!",
      description: "Desktop app connected successfully.",
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <div className="grid gap-6">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: index * 0.1 }}
          >
            <Card className={`p-8 ${currentStep === index ? 'ring-2 ring-primary' : 'opacity-80'}`}>
              <div className="flex items-start gap-6">
                <div className="rounded-full h-10 w-10 flex items-center justify-center bg-primary/10 text-primary shrink-0">
                  {currentStep > index ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : (
                    <span className="text-lg font-medium">{index + 1}</span>
                  )}
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                  
                  {index === 0 && currentStep === 0 && (
                    <div className="space-y-4">
                      {isDownloading ? (
                        <div className="space-y-3">
                          <Progress value={downloadProgress} className="w-full h-2" />
                          <p className="text-sm text-muted-foreground">Downloading... {downloadProgress}%</p>
                        </div>
                      ) : (
                        <div className="flex flex-col sm:flex-row gap-4">
                          <Button onClick={handleDownload} size="lg" className="gap-2 w-full sm:w-auto">
                            <Download className="h-5 w-5" />
                            Download for macOS
                          </Button>
                          <Button variant="outline" size="lg" className="gap-2 w-full sm:w-auto">
                            <Download className="h-5 w-5" />
                            Download for Windows
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {index === 1 && currentStep === 1 && (
                    <div className="space-y-6">
                      <Alert className="bg-muted">
                        <Monitor className="h-5 w-5" />
                        <AlertTitle className="text-base font-medium">Installation Instructions</AlertTitle>
                        <AlertDescription className="mt-2 space-y-2">
                          <p>1. Open the downloaded file</p>
                          <p>2. Follow the installation wizard</p>
                          <p>3. Grant necessary permissions when prompted</p>
                        </AlertDescription>
                      </Alert>
                      <Button onClick={generatePairingCode} size="lg" className="w-full sm:w-auto">
                        I've installed the app
                      </Button>
                    </div>
                  )}

                  {index === 2 && currentStep === 2 && (
                    <div className="space-y-6">
                      {pairingCode && (
                        <Alert className="bg-muted border-primary/20">
                          <AlertTitle className="text-2xl font-mono tracking-wider text-center py-2">
                            {pairingCode}
                          </AlertTitle>
                          <AlertDescription className="text-center text-muted-foreground">
                            Enter this code in your desktop app to connect it to your account
                          </AlertDescription>
                        </Alert>
                      )}
                      <Button 
                        onClick={verifyInstallation} 
                        disabled={isVerifying || isVerified}
                        size="lg"
                        className="w-full sm:w-auto"
                      >
                        {isVerifying ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Verifying...
                          </>
                        ) : isVerified ? (
                          <>
                            <CheckCircle2 className="mr-2 h-5 w-5" />
                            Connected!
                          </>
                        ) : (
                          "Verify Connection"
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}


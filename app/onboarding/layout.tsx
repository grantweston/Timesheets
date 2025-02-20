"use client"

import type React from "react"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { Clock, ArrowLeft, User, CreditCard, Plug, Monitor, Check, ChevronRight, FileText } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { useUser } from "@clerk/nextjs"

export const steps = [
  {
    path: "/onboarding/profile",
    title: "Profile Setup",
    description: "Tell us about yourself and your work",
    required: true,
    icon: "User"
  },
  {
    path: "/onboarding/billing",
    title: "Billing Setup",
    description: "Configure your billing preferences",
    required: true,
    icon: "CreditCard"
  },
  {
    path: "/onboarding/integrations",
    title: "Integrations",
    description: "Connect your tools and services",
    required: false,
    icon: "Plug"
  },
  {
    path: "/onboarding/engagement-letters",
    title: "Engagement Letters",
    description: "Upload any additional engagement letters",
    required: false,
    icon: "FileText"
  },
  {
    path: "/onboarding/non-billable",
    title: "Non-Billable Time",
    description: "Configure non-billable time tracking",
    required: false,
    icon: "Clock"
  },
  {
    path: "/onboarding/desktop",
    title: "Desktop App",
    description: "Set up automatic time tracking",
    required: false,
    icon: "Monitor"
  }
]

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useUser()
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  const currentStepIndex = steps.findIndex(step => step.path === pathname)
  const progress = ((currentStepIndex + 1) / steps.length) * 100
  const currentStep = steps[currentStepIndex] || steps[0] // Fallback to first step if not found
  const nextStep = steps[currentStepIndex + 1]
  const prevStep = steps[currentStepIndex - 1]

  // Load progress
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedProgress = localStorage.getItem('onboardingProgress')
        if (savedProgress) {
          const progress = JSON.parse(savedProgress)
          setCompletedSteps(progress.completedSteps || [])
          // If user tries to skip required steps, redirect them back
          if (currentStepIndex > progress.lastCompletedStep + 1 && steps[progress.lastCompletedStep + 1]?.required) {
            router.push(steps[progress.lastCompletedStep + 1].path)
          }
        } else {
          localStorage.setItem('onboardingProgress', JSON.stringify({
            lastCompletedStep: -1,
            completedSteps: []
          }))
        }
        setIsInitialized(true)
      } catch (error) {
        console.error('Error loading onboarding progress:', error)
        setIsInitialized(true)
      }
    }
  }, [currentStepIndex, router])

  // Don't render until we've initialized from localStorage
  if (!isInitialized) {
    return null
  }

  const markOnboardingComplete = async () => {
    try {
      const response = await fetch('/api/complete-onboarding', {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark onboarding as complete');
      }
    } catch (error) {
      console.error('Error updating onboarding status:', error)
    }
  }

  const handleNext = async () => {
    // Save progress before moving to next step
    const newCompletedSteps = [...new Set([...completedSteps, currentStepIndex])]
    setCompletedSteps(newCompletedSteps)
    
    const progress = {
      lastCompletedStep: Math.max(currentStepIndex, completedSteps.length ? Math.max(...completedSteps) : -1),
      completedSteps: newCompletedSteps
    }
    localStorage.setItem('onboardingProgress', JSON.stringify(progress))

    if (nextStep) {
      router.push(nextStep.path)
    } else {
      localStorage.removeItem('onboardingProgress') // Clear progress on completion
      await markOnboardingComplete()
      router.push('/dashboard/overview')
    }
  }

  const handleBack = () => {
    if (prevStep) {
      router.push(prevStep.path)
    } else {
      router.push('/')
    }
  }

  const handleSkip = async () => {
    // Find next required step or finish
    const nextRequiredStep = steps.find((step, index) => 
      index > currentStepIndex && step.required
    )
    
    if (nextRequiredStep) {
      router.push(nextRequiredStep.path)
    } else {
      localStorage.removeItem('onboardingProgress') // Clear progress since we're finishing
      await markOnboardingComplete()
      router.push('/dashboard/overview')
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-zinc-50 via-white to-zinc-50/80 dark:from-background dark:via-background/95 dark:to-background/90">
      <div className="absolute inset-0 bg-[url(/grid.svg)] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBack}
              className="mr-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <div className="rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 p-1.5 text-white shadow-md">
                <Clock className="h-4 w-4" />
              </div>
              <span>TimeTrack AI</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Step {currentStepIndex + 1} of {steps.length}
            </div>
            <Progress value={progress} className="w-32 h-2 bg-violet-100 dark:bg-violet-950">
              <div 
                className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 transition-all" 
                style={{ width: `${progress}%` }} 
              />
            </Progress>
          </div>
        </div>
      </header>

      <div className="container flex-1 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-transparent to-violet-500/5 pointer-events-none" />
        <div className="max-w-[1200px] mx-auto py-10 relative">
          <div className="grid grid-cols-1 md:grid-cols-[220px_640px_220px] gap-10 justify-center">
            <nav className="hidden md:block">
              <div className="sticky top-24 space-y-1.5">
                {steps.map((step, index) => {
                  const isComplete = completedSteps.includes(index)
                  const isCurrent = currentStepIndex === index
                  const isDisabled = index > Math.max(...completedSteps, currentStepIndex)

                  return (
                    <div
                      key={step.path}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg text-sm",
                        isCurrent && "bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-300 shadow-sm",
                        isComplete && "text-violet-600 dark:text-violet-400",
                        isDisabled && "opacity-40",
                        !isDisabled && "hover:bg-violet-50 dark:hover:bg-violet-900/10 hover:shadow-sm cursor-pointer",
                        "transition-all duration-200"
                      )}
                      onClick={() => !isDisabled && router.push(step.path)}
                    >
                      <div className={cn(
                        "h-5 w-5 rounded-full border flex items-center justify-center text-xs shrink-0 shadow-sm transition-colors",
                        isCurrent && "border-violet-600 bg-violet-50 dark:bg-violet-900/20 shadow-violet-500/10",
                        isComplete && "border-violet-600 bg-violet-600 text-white shadow-violet-500/20",
                        !isCurrent && !isComplete && "border-border/50 bg-background"
                      )}>
                        {isComplete ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <span>{index + 1}</span>
                        )}
                      </div>
                      <span>{step.title}</span>
                    </div>
                  )
                })}
              </div>
            </nav>

            <div>
              <div className="mb-8 space-y-2">
                <h1 className="text-3xl font-bold bg-gradient-to-br from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                  {currentStep.title}
                </h1>
                <p className="text-muted-foreground/80">{currentStep.description}</p>
              </div>

              <div className="space-y-8">
                <div className="relative bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 shadow-lg shadow-violet-500/5 p-8">
                  {children}
                </div>

                <div className="flex justify-between items-center">
                  <Button
                    variant="ghost"
                    onClick={handleBack}
                    className="min-w-[100px] hover:bg-violet-50 dark:hover:bg-violet-900/10"
                  >
                    Back
                  </Button>

                  <div className="flex items-center gap-4">
                    {!currentStep.required && (
                      <Button
                        variant="ghost"
                        onClick={handleSkip}
                        className="min-w-[100px] hover:bg-violet-50 dark:hover:bg-violet-900/10"
                      >
                        Skip step
                      </Button>
                    )}
                    <Button
                      onClick={handleNext}
                      className="min-w-[100px] bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-violet-500/25"
                    >
                      {nextStep ? (
                        <span className="flex items-center gap-2">
                          Continue <ChevronRight className="h-4 w-4" />
                        </span>
                      ) : (
                        'Finish Setup'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Spacer column */}
            <div className="hidden md:block" />
          </div>
        </div>
      </div>
    </div>
  )
}


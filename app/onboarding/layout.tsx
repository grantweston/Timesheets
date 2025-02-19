"use client"

import type React from "react"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { Clock, ArrowLeft, User, CreditCard, Plug, Monitor, Check, ChevronRight } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useEffect } from "react"
import { cn } from "@/lib/utils"

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
    required: true,
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
  const currentStepIndex = steps.findIndex(step => step.path === pathname)
  const progress = ((currentStepIndex + 1) / steps.length) * 100
  const currentStep = steps[currentStepIndex]
  const nextStep = steps[currentStepIndex + 1]
  const prevStep = steps[currentStepIndex - 1]

  // Load and save progress
  useEffect(() => {
    const savedProgress = localStorage.getItem('onboardingProgress')
    if (savedProgress) {
      const progress = JSON.parse(savedProgress)
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
  }, [currentStepIndex, router])

  // Get completed steps from localStorage
  const completedSteps = JSON.parse(
    localStorage.getItem('onboardingProgress') || '{"completedSteps":[]}'
  ).completedSteps

  const handleNext = () => {
    // Save progress before moving to next step
    const progress = JSON.parse(localStorage.getItem('onboardingProgress') || '{"lastCompletedStep":-1,"completedSteps":[]}')
    progress.lastCompletedStep = Math.max(currentStepIndex, progress.lastCompletedStep)
    progress.completedSteps = [...new Set([...progress.completedSteps, currentStepIndex])]
    localStorage.setItem('onboardingProgress', JSON.stringify(progress))

    if (nextStep) {
      router.push(nextStep.path)
    } else {
      localStorage.removeItem('onboardingProgress') // Clear progress on completion
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

  const handleSkip = () => {
    // Find next required step or finish
    const nextRequiredStep = steps.find((step, index) => 
      index > currentStepIndex && step.required
    )
    
    if (nextRequiredStep) {
      router.push(nextRequiredStep.path)
    } else {
      router.push('/dashboard/overview')
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBack}
              className="mr-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Link href="/" className="flex items-center gap-2 font-semibold transition-colors hover:text-primary">
              <Clock className="h-5 w-5" />
              <span>TimeTrack AI</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Step {currentStepIndex + 1} of {steps.length}
            </div>
            <Progress value={progress} className="w-32 h-2" />
          </div>
        </div>
      </header>

      <div className="container max-w-5xl py-10 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-10">
          <nav className="hidden md:block space-y-2">
            {steps.map((step, index) => {
              const isComplete = completedSteps.includes(index)
              const isCurrent = currentStepIndex === index
              const isDisabled = index > Math.max(...completedSteps, currentStepIndex)

              return (
                <div
                  key={step.path}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
                    isCurrent && "bg-primary/10 text-primary",
                    isComplete && "text-primary",
                    isDisabled && "opacity-50",
                    !isDisabled && "hover:bg-muted cursor-pointer",
                    "transition-all duration-200"
                  )}
                  onClick={() => !isDisabled && router.push(step.path)}
                >
                  <div className="flex items-center gap-3">
                    {isComplete ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <div className={cn(
                        "h-4 w-4 rounded-full border",
                        isCurrent && "border-primary",
                        "flex items-center justify-center text-xs"
                      )}>
                        {index + 1}
                      </div>
                    )}
                    <span>{step.title}</span>
                  </div>
                </div>
              )
            })}
          </nav>

          <div className="flex-1">
            <div className="mb-8 space-y-2">
              <h1 className="text-2xl font-bold">{currentStep.title}</h1>
              <p className="text-muted-foreground">{currentStep.description}</p>
            </div>

            <div className="space-y-8">
              <div className="relative bg-card rounded-lg border p-6">
                {children}
              </div>

              <div className="flex justify-between items-center">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  className="min-w-[100px]"
                >
                  Back
                </Button>

                <div className="flex items-center gap-4">
                  {!currentStep.required && (
                    <Button
                      variant="ghost"
                      onClick={handleSkip}
                      className="min-w-[100px]"
                    >
                      Skip step
                    </Button>
                  )}
                  <Button
                    onClick={handleNext}
                    className="min-w-[100px]"
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
        </div>
      </div>
    </div>
  )
}


"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, ArrowUpRight, Loader2 } from "lucide-react"
import Link from "next/link"
import { steps } from '../onboarding/layout'

function getOnboardingProgress() {
  if (typeof window === 'undefined') return { progress: 0, hasStarted: false, nextStep: '/onboarding/profile' }
  
  const savedProgress = localStorage.getItem('onboardingProgress')
  if (!savedProgress) return { progress: 0, hasStarted: false, nextStep: '/onboarding/profile' }
  
  const { lastCompletedStep, completedSteps } = JSON.parse(savedProgress)
  const progress = Math.round(((lastCompletedStep + 1) / steps.length) * 100)
  return { 
    progress,
    hasStarted: true,
    nextStep: steps[lastCompletedStep + 1]?.path ?? '/dashboard/overview'
  }
}

export function OnboardingButton() {
  const { progress, hasStarted, nextStep } = getOnboardingProgress()
  const hasCompletedOnboarding = progress === 100
  const isLoading = false

  if (hasCompletedOnboarding) {
    return (
      <Button size="lg" className="gap-2" asChild>
        <Link href="/dashboard/overview">
          Open Dashboard <ArrowUpRight className="h-4 w-4" />
        </Link>
      </Button>
    )
  }

  return (
    <Button size="lg" className="gap-2" asChild disabled={isLoading}>
      <Link href={hasStarted ? nextStep : "/onboarding/profile"}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </>
        ) : hasStarted ? (
          <>
            Continue Setup <ArrowRight className="h-4 w-4" />
          </>
        ) : (
          <>
            Start Setup <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Link>
    </Button>
  )
} 
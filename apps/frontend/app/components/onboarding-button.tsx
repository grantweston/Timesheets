"use client"

import { Button } from "@/app/components/ui/button"
import { ArrowRight, ArrowUpRight, Loader2 } from "lucide-react"
import Link from "next/link"
import { steps } from '@/app/lib/onboarding-steps'

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
      <Button size="lg" className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-violet-500/25" asChild>
        <Link href="/dashboard/overview">
          Open Dashboard <ArrowUpRight className="h-4 w-4" />
        </Link>
      </Button>
    )
  }

  return (
    <Button 
      size="lg" 
      className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-violet-500/25" 
      asChild 
      disabled={isLoading}
    >
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
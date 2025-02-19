"use client"

import { OnboardingProgress } from "./onboarding-header"
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

export function OnboardingStatus() {
  const { progress, hasStarted, nextStep } = getOnboardingProgress()
  const hasCompletedOnboarding = progress === 100
  const isLoading = false

  if (!hasStarted || hasCompletedOnboarding) return null

  return (
    <OnboardingProgress 
      progress={progress} 
      isLoading={isLoading}
      nextStep={nextStep}
    />
  )
} 
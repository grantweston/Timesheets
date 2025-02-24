"use client"

import { OnboardingProgress } from "./onboarding-header"
import { steps } from '@/app/lib/onboarding-steps'
import { useEffect, useState } from 'react'

interface OnboardingState {
  progress: number
  hasStarted: boolean
  nextStep: string
}

const defaultState = {
  progress: 0,
  hasStarted: false,
  nextStep: '/onboarding/profile'
}

function getOnboardingProgress(): OnboardingState {
  if (typeof window === 'undefined') return defaultState
  
  const savedProgress = localStorage.getItem('onboardingProgress')
  if (!savedProgress) return defaultState
  
  try {
    const { lastCompletedStep, completedSteps } = JSON.parse(savedProgress)
    const progress = Math.round(((lastCompletedStep + 1) / steps.length) * 100)
    return { 
      progress,
      hasStarted: true,
      nextStep: steps[lastCompletedStep + 1]?.path ?? '/dashboard/overview'
    }
  } catch {
    return defaultState
  }
}

export function OnboardingStatus() {
  const [state, setState] = useState<OnboardingState>(defaultState)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setState(getOnboardingProgress())
    setIsLoading(false)
  }, [])

  const hasCompletedOnboarding = state.progress === 100

  if (isLoading || !state.hasStarted || hasCompletedOnboarding) return null

  return (
    <OnboardingProgress 
      progress={state.progress} 
      isLoading={isLoading}
      nextStep={state.nextStep}
    />
  )
} 
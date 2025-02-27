'use client';

import { Button } from '@/app/components/ui/button';
import { ArrowRight, ArrowUpRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { steps } from '@/app/lib/onboarding-steps';
import { useEffect, useState } from 'react';

interface OnboardingState {
  progress: number;
  hasStarted: boolean;
  nextStep: string;
  isLoading: boolean;
}

const defaultState: OnboardingState = {
  progress: 0,
  hasStarted: false,
  nextStep: '/onboarding/profile',
  isLoading: true,
};

export function OnboardingButton() {
  const [state, setState] = useState<OnboardingState>(defaultState);

  // Move localStorage access to useEffect to avoid hydration mismatch
  useEffect(() => {
    try {
      const savedProgress = localStorage.getItem('onboardingProgress');

      if (!savedProgress) {
        setState({
          ...defaultState,
          isLoading: false,
        });
        return;
      }

      const { lastCompletedStep, completedSteps } = JSON.parse(savedProgress);
      const progress = Math.round(
        ((lastCompletedStep + 1) / steps.length) * 100
      );

      setState({
        progress,
        hasStarted: true,
        nextStep: steps[lastCompletedStep + 1]?.path ?? '/dashboard/overview',
        isLoading: false,
      });
    } catch (error) {
      console.error('Error loading onboarding progress:', error);
      setState({
        ...defaultState,
        isLoading: false,
      });
    }
  }, []);

  // Show loading state during hydration
  if (state.isLoading) {
    return (
      <Button
        size="lg"
        className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-violet-500/25"
        disabled={true}
      >
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </Button>
    );
  }

  // After hydration, show the appropriate button
  const hasCompletedOnboarding = state.progress === 100;

  if (hasCompletedOnboarding) {
    return (
      <Button
        size="lg"
        className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-violet-500/25"
        asChild
      >
        <Link href="/dashboard/overview">
          Open Dashboard <ArrowUpRight className="h-4 w-4" />
        </Link>
      </Button>
    );
  }

  return (
    <Button
      size="lg"
      className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-violet-500/25"
      asChild
      disabled={state.isLoading}
    >
      <Link href={state.hasStarted ? state.nextStep : '/onboarding/profile'}>
        {state.isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </>
        ) : state.hasStarted ? (
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
  );
}

'use client';

import { Button } from "@/app/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { SignUpButton } from "@clerk/nextjs"
import { OnboardingButton } from "./onboarding-button"
import { useAuth } from "@clerk/nextjs"

export function AuthCTA() {
  const { userId } = useAuth();

  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
      {!userId ? (
        <SignUpButton mode="modal" redirectUrl="/onboarding/profile">
          <Button size="lg" className="w-full sm:w-auto gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-violet-500/25">
            Start Free Trial <ArrowRight className="h-4 w-4" />
          </Button>
        </SignUpButton>
      ) : (
        <OnboardingButton />
      )}
      <Button variant="outline" size="lg" className="w-full sm:w-auto border-zinc-200 dark:border-zinc-800" asChild>
        <Link href="#features">See How It Works</Link>
      </Button>
    </div>
  );
} 
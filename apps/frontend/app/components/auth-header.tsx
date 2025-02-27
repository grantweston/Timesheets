'use client';

import { Button } from "@/app/components/ui/button"
import { Clock } from "lucide-react"
import Link from "next/link"
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs"
import { OnboardingStatus } from "./onboarding-status"
import { useAuth } from "@clerk/nextjs"

export function AuthHeader() {
  const { userId } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <div className="rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 p-1.5 text-white shadow-md">
            <Clock className="h-4 w-4" />
          </div>
          <span>TimeTrack AI</span>
        </Link>
        <div className="flex items-center gap-4">
          {userId ? (
            <>
              <OnboardingStatus />
              <UserButton afterSignOutUrl="/" />
            </>
          ) : (
            <SignInButton mode="modal" redirectUrl="/onboarding/profile">
              <Button variant="ghost" className="hover:bg-zinc-100 dark:hover:bg-zinc-800">
                Sign In
              </Button>
            </SignInButton>
          )}
        </div>
      </div>
    </header>
  );
} 
"use client"

import { Button } from "@/app/components/ui/button"
import Link from "next/link"
import { SignInButton } from "@clerk/nextjs"

export function OnboardingStatus({ userId }: { userId: string | null }) {
  if (!userId) return null
  return null
} 
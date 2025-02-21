"use client"

import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Clock } from "lucide-react"

interface OnboardingHeaderProps {
  progress: number
  isLoading: boolean
  nextStep: string
}

export function OnboardingProgress({ progress, isLoading, nextStep }: OnboardingHeaderProps) {
  return (
    <div className="flex items-center gap-2">
      <Progress value={progress} className="w-32 h-2" />
      <span className="text-sm text-muted-foreground">Setup {progress}%</span>
      <Button variant="outline" size="sm" asChild>
        <Link href={nextStep}>Continue Setup</Link>
      </Button>
    </div>
  )
}

export function OnboardingHeader() {
  return (
    <div className="space-y-2">
      <h1 className="text-3xl font-bold">Welcome to TimeTrack AI</h1>
      <p className="text-muted-foreground">Let's get you set up with your account</p>
    </div>
  )
} 
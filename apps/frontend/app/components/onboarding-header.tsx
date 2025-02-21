"use client"

import { Progress } from "@/app/components/ui/progress"
import { Button } from "@/app/components/ui/button"
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
      <Progress value={progress} className="w-32 h-2 bg-violet-100 dark:bg-violet-950">
        <div 
          className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 transition-all" 
          style={{ width: `${progress}%` }} 
        />
      </Progress>
      <span className="text-sm text-muted-foreground">Setup {progress}%</span>
      <Button 
        variant="outline" 
        size="sm" 
        className="border-violet-200 dark:border-violet-800 hover:bg-violet-50 dark:hover:bg-violet-900" 
        asChild
      >
        <Link href={nextStep}>Continue Setup</Link>
      </Button>
    </div>
  )
}

export function OnboardingHeader() {
  return (
    <div className="space-y-2">
      <h1 className="text-3xl font-bold bg-gradient-to-br from-violet-600 to-indigo-600 bg-clip-text text-transparent">
        Welcome to TimeTrack AI
      </h1>
      <p className="text-muted-foreground">Let's get you set up with your account</p>
    </div>
  )
} 
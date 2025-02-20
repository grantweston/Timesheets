import { Clock } from "lucide-react"
import Link from "next/link"
import { UserNav } from "./user-nav"

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-2 font-semibold">
          <Clock className="h-5 w-5" />
          <Link href="/dashboard">TimeTrack AI</Link>
        </div>
        <UserNav />
      </div>
    </header>
  )
}


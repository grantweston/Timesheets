import { TimeGrid } from "@/app/components/features/timesheet/time-grid"
import { Button } from "@/app/components/ui/button"
import { Card } from "@/app/components/ui/card"
import { CalendarDays, RefreshCw } from "lucide-react"
import Link from "next/link"

export const dynamic = 'force-dynamic';

export default async function TimesheetPage() {
  return (
    <main className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Timesheet</h1>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon"
            className="hover:bg-violet-50 dark:hover:bg-violet-900/10 hover:text-violet-600 dark:hover:text-violet-300"
            title="Date Selection"
          >
            <CalendarDays className="h-4 w-4" />
          </Button>
          
          {/* Refresh button */}
          <Button
            variant="outline"
            size="icon"
            className="hover:bg-violet-50 dark:hover:bg-violet-900/10 hover:text-violet-600 dark:hover:text-violet-300"
            title="Refresh Time Blocks"
            id="refresh-button"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          
          {/* Debug page link */}
          <Link href="/dashboard/debug/time-blocks">
            <Button
              variant="outline"
              size="sm"
              className="hover:bg-violet-50 dark:hover:bg-violet-900/10 hover:text-violet-600 dark:hover:text-violet-300"
            >
              API Debug
            </Button>
          </Link>
        </div>
      </div>
      <Card className="p-6">
        <TimeGrid />
      </Card>
    </main>
  )
}


import { TimeGrid } from "@/app/components/features/timesheet/time-grid"
import { DatePickerWithRange } from "@/app/components/features/timesheet/date-range-picker"
import { Button } from "@/app/components/ui/button"
import { Card } from "@/app/components/ui/card"
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react"

export default function TimesheetPage() {
  return (
    <main className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Timesheet</h1>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon"
            className="hover:bg-violet-50 dark:hover:bg-violet-900/10 hover:text-violet-600 dark:hover:text-violet-300"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <DatePickerWithRange />
          <Button 
            variant="outline" 
            size="icon"
            className="hover:bg-violet-50 dark:hover:bg-violet-900/10 hover:text-violet-600 dark:hover:text-violet-300"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            className="hover:bg-violet-50 dark:hover:bg-violet-900/10 hover:text-violet-600 dark:hover:text-violet-300"
          >
            <CalendarDays className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <Card className="p-6">
        <TimeGrid />
      </Card>
    </main>
  )
}


'use client'

import { Card } from "@/app/components/ui/card"
import { Badge } from "@/app/components/ui/badge"
import { useTimeBlocks } from "@/app/hooks/use-time-blocks"
import { format } from "date-fns"

export function TimelineView() {
  const { timeBlocks, loading, error } = useTimeBlocks('today')

  if (loading) {
    return <div className="text-center text-muted-foreground">Loading time blocks...</div>
  }

  if (error) {
    return <div className="text-center text-red-500">Error loading time blocks: {error}</div>
  }

  if (!timeBlocks.length) {
    return <div className="text-center text-muted-foreground">No time blocks found for today</div>
  }

  return (
    <div className="space-y-4">
      {timeBlocks.map((block) => (
        <Card key={block.id} className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{block.task_label}</h3>
                <Badge variant={block.is_billable ? "default" : "secondary"}>
                  {block.is_billable ? "Billable" : "Non-Billable"}
                </Badge>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              {format(new Date(block.start_time), "h:mm a")} - {format(new Date(block.end_time), "h:mm a")}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}


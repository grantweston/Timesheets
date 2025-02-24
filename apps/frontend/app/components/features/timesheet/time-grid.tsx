"use client"

import * as React from "react"
import { cn } from "@/app/lib/utils"
import { TimeBlockDialog } from "./time-block-dialog"
import { TimeBlock } from "@/types/time-block"
import { Button } from "@/app/components/ui/button"
import { Plus, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Clock, Chrome, Slack, Mail, Code, FileCode, Monitor } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/app/components/ui/tooltip"
import { Calendar } from "@/app/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/ui/popover"
import { format, addDays, subDays } from "date-fns"
import { Badge } from "@/app/components/ui/badge"
import { ScrollArea } from "@/app/components/ui/scroll-area"
import { useTimeBlocks } from "@/app/hooks/use-time-blocks"
import { useTimeBlockMutations } from "@/app/hooks/use-time-block-mutations"

const categoryColors: Record<string, { bg: string; border: string }> = {
  meeting: { bg: "bg-blue-500/10", border: "border-blue-500/20" },
  development: { bg: "bg-green-500/10", border: "border-green-500/20" },
  planning: { bg: "bg-purple-500/10", border: "border-purple-500/20" },
  break: { bg: "bg-orange-500/10", border: "border-orange-500/20" },
  admin: { bg: "bg-gray-500/10", border: "border-gray-500/20" },
}

// Add app icon mapping after categoryColors
const appIcons: Record<string, React.ReactNode> = {
  "VS Code": <Code className="h-3 w-3" />,
  "Chrome": <Chrome className="h-3 w-3" />,
  "Slack": <Slack className="h-3 w-3" />,
  "Gmail": <Mail className="h-3 w-3" />,
  "Zoom": <Monitor className="h-3 w-3" />,
  "Figma": <FileCode className="h-3 w-3" />,
}

interface DailySummary {
  totalHours: number
  billableHours: number
  categories: Record<string, number>
}

export function TimeGrid() {
  const hours = Array.from({ length: 13 }, (_, i) => i + 8) as number[]
  const [selectedBlock, setSelectedBlock] = React.useState<TimeBlock | null>(null)
  const [hoveredBlock, setHoveredBlock] = React.useState<string | null>(null)
  const [zoomLevel, setZoomLevel] = React.useState<number>(1)
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date())
  const [view, setView] = React.useState<"day" | "week">("day")
  const [isDatePickerOpen, setIsDatePickerOpen] = React.useState(false)

  // Fetch time blocks from Supabase
  const { timeBlocks, loading, error } = useTimeBlocks(view === 'day' ? 'today' : 'week')
  const { createTimeBlock, updateTimeBlock } = useTimeBlockMutations()

  // Calculate daily summary
  const dailySummary = React.useMemo(() => {
    if (!timeBlocks) return { totalHours: 0, billableHours: 0, categories: {} }

    return timeBlocks.reduce<DailySummary>((acc, block) => {
      const startTime = new Date(block.start_time)
      const endTime = new Date(block.end_time)
      const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)

      acc.totalHours += duration
      if (block.is_billable) {
        acc.billableHours += duration
      }
      const category = block.classification.category.toLowerCase()
      acc.categories[category] = (acc.categories[category] || 0) + duration
      return acc
    }, { totalHours: 0, billableHours: 0, categories: {} })
  }, [timeBlocks])

  // Base height calculations
  const baseHourHeight = 60
  const hourHeight = baseHourHeight * zoomLevel
  const minBlockDuration = 0.25 // 15 minutes
  const minBlockSpacing = 4 // Minimum pixels between blocks

  const handleBlockUpdate = async (updatedBlock: TimeBlock) => {
    try {
      // Only send fields that can be updated
      const updateFields = {
        task_label: updatedBlock.task_label,
        description: updatedBlock.description,
        color: updatedBlock.color,
        is_recurring: updatedBlock.is_recurring,
        recurrence_pattern: updatedBlock.recurrence_pattern,
        is_billable: updatedBlock.is_billable,
        classification: updatedBlock.classification,
        start_time: updatedBlock.start_time,
        end_time: updatedBlock.end_time
      }
      await updateTimeBlock(updatedBlock.id, updateFields)
      setSelectedBlock(null)
    } catch (error) {
      console.error('Failed to update time block:', error)
    }
  }

  const handleAddBlock = async () => {
    try {
      const now = new Date()
      const startTime = new Date(now.setHours(12, 0, 0)).toISOString()
      const endTime = new Date(now.setHours(13, 0, 0)).toISOString()

      await createTimeBlock({
        task_label: "New Time Block",
        start_time: startTime,
        end_time: endTime,
        is_billable: true,
        classification: {
          category: "development",
          confidence: 1.0
        }
      })
    } catch (error) {
      console.error('Failed to create time block:', error)
    }
  }

  if (loading) {
    return <div className="text-center text-muted-foreground">Loading time blocks...</div>
  }

  if (error) {
    return <div className="text-center text-red-500">Error loading time blocks: {error}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setZoomLevel((prev) => Math.max(0.5, prev - 0.25))}
            className="hover:bg-violet-50 dark:hover:bg-violet-900/10"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setZoomLevel((prev) => Math.min(2, prev + 0.25))}
            className="hover:bg-violet-50 dark:hover:bg-violet-900/10"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setSelectedDate(subDays(selectedDate, 1))}
            className="hover:bg-violet-50 dark:hover:bg-violet-900/10"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  setSelectedDate(date || new Date())
                  setIsDatePickerOpen(false)
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button
            variant="outline"
            onClick={() => setSelectedDate(addDays(selectedDate, 1))}
            className="hover:bg-violet-50 dark:hover:bg-violet-900/10"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <Button
          onClick={handleAddBlock}
          className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Time Block
        </Button>
      </div>

      <div className="grid grid-cols-[auto,1fr] gap-4">
        <div className="space-y-4">
          <div className="text-sm font-medium">Hours</div>
          <div
            className="space-y-4 pr-2"
            style={{ height: `${hours.length * hourHeight}px` }}
          >
            {hours.map((hour) => (
              <div
                key={hour}
                className="flex items-center justify-end h-[60px]"
                style={{ height: `${hourHeight}px` }}
              >
                {format(new Date().setHours(hour), "h a")}
              </div>
            ))}
          </div>
        </div>

        <ScrollArea className="rounded-lg border bg-muted/50">
          <div
            className="relative"
            style={{ height: `${hours.length * hourHeight}px` }}
          >
            {timeBlocks?.map((block) => {
              const startTime = new Date(block.start_time)
              const endTime = new Date(block.end_time)
              const startHour = startTime.getHours() + (startTime.getMinutes() / 60)
              const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)
              const category = block.classification.category.toLowerCase()

              const top = ((startHour - hours[0]) * hourHeight)
              const height = Math.max(duration * hourHeight, minBlockDuration * hourHeight)

              return (
                <div
                  key={block.id}
                  className={cn(
                    "absolute left-0 right-0 mx-2 rounded-lg border transition-all cursor-pointer group",
                    categoryColors[category]?.bg || "bg-gray-500/10",
                    categoryColors[category]?.border || "border-gray-500/20",
                    hoveredBlock === block.id && "ring-2 ring-violet-500/50 shadow-lg",
                  )}
                  style={{
                    top: `${top}px`,
                    height: `${height}px`,
                    minHeight: `${minBlockDuration * hourHeight}px`,
                    marginTop: `${minBlockSpacing}px`,
                    marginBottom: `${minBlockSpacing}px`,
                  }}
                  onClick={() => setSelectedBlock(block)}
                  onMouseEnter={() => setHoveredBlock(block.id)}
                  onMouseLeave={() => setHoveredBlock(null)}
                >
                  <div className="p-2 h-full">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-medium line-clamp-1">{block.task_label}</div>
                        {block.description && (
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {block.description}
                          </div>
                        )}
                      </div>
                      <Badge
                        variant={block.is_billable ? "default" : "secondary"}
                        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {block.is_billable ? "Billable" : "Non-Billable"}
                      </Badge>
                    </div>

                    {block.classification.applications && block.classification.applications.length > 0 && (
                      <div className="absolute bottom-2 left-2 right-2">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          {block.classification.applications.map((app) => (
                            <TooltipProvider key={app.name}>
                              <Tooltip>
                                <TooltipTrigger>
                                  <div className="p-1 rounded-sm hover:bg-violet-500/10">
                                    {appIcons[app.name] || <Clock className="h-3 w-3" />}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="text-xs">
                                    {app.name}: {Math.round(app.timeSpent / 60 * 10) / 10}h
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </div>

      <TimeBlockDialog
        block={selectedBlock}
        onClose={() => setSelectedBlock(null)}
        onUpdate={handleBlockUpdate}
      />
    </div>
  )
}


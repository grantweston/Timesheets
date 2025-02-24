"use client"

import * as React from "react"
import { cn } from "@/app/lib/utils"
import { TimeBlock, transformDatabaseToUI, transformUIToDatabase, categoryColors } from "@/app/types/time-block"
import { TimeBlockDialog } from "./time-block-dialog"
import { Button } from "@/app/components/ui/button"
import { Plus, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Clock, Chrome, Slack, Mail, Code, FileCode, Monitor, Minus } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/app/components/ui/tooltip"
import { Calendar } from "@/app/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/ui/popover"
import { format, addDays, subDays } from "date-fns"
import { Badge } from "@/app/components/ui/badge"
import { ScrollArea } from "@/app/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select"
import { useTimeBlocks } from "@/app/hooks/use-time-blocks"
import { useTimeBlockMutations } from "@/app/hooks/use-time-block-mutations"
import { useUser } from "@/app/hooks/use-user"

// Add app icon mapping
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

  const { user } = useUser()
  const { timeBlocks: dbBlocks, loading, error } = useTimeBlocks(view === 'day' ? 'today' : 'week')
  const { createTimeBlock, updateTimeBlock } = useTimeBlockMutations()

  // Convert database blocks to UI format
  const timeBlocks = React.useMemo(() => {
    if (!dbBlocks) return []
    return dbBlocks.map(transformDatabaseToUI)
  }, [dbBlocks])

  // Calculate daily summary
  const dailySummary = React.useMemo(() => {
    return timeBlocks.reduce<DailySummary>(
      (acc, block) => {
        const startDate = new Date(block.start_time)
        const endDate = new Date(block.end_time)
        const duration = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60)
        
        acc.totalHours += duration
        if (block.is_billable) {
          acc.billableHours += duration
        }
        const category = block.ui?.classification?.category || 'admin'
        acc.categories[category] = (acc.categories[category] || 0) + duration
        return acc
      },
      { totalHours: 0, billableHours: 0, categories: {} },
    )
  }, [timeBlocks])

  // Base height calculations
  const baseHourHeight = 60
  const hourHeight = baseHourHeight * zoomLevel
  const minBlockDuration = 0.25
  const minBlockSpacing = 4 // Minimum pixels between blocks

  const handleBlockUpdate = async (updatedBlock: TimeBlock) => {
    try {
      const dbBlock = transformUIToDatabase(updatedBlock)
      await updateTimeBlock(updatedBlock.time_block_id, dbBlock)
      setSelectedBlock(null)
    } catch (error) {
      console.error('Failed to update time block:', error)
    }
  }

  const handleAddBlock = async () => {
    try {
      if (!user?.id) throw new Error('No user ID found')

      const now = new Date()
      const startTime = new Date(now.setHours(12, 0, 0))
      const endTime = new Date(now.setHours(13, 0, 0))

      const newBlock: Partial<TimeBlock> = {
        user_id: user.id,
        client_id: 'default', // You'll need to implement proper client selection
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        time_block_label: "New Time Block",
        description: null,
        is_billable: true,
        in_scope: true
      }

      const data = await createTimeBlock(newBlock)
      setSelectedBlock(transformDatabaseToUI(data))
    } catch (error) {
      console.error('Failed to create time block:', error)
    }
  }

  const handleDateChange = (direction: "prev" | "next") => {
    setSelectedDate((current) => (direction === "prev" ? subDays(current, 1) : addDays(current, 1)))
  }

  const renderTimeBlock = (block: TimeBlock, index: number, column: number, totalColumns: number) => {
    const startDate = new Date(block.start_time)
    const endDate = new Date(block.end_time)
    const start = startDate.getHours() + startDate.getMinutes() / 60
    const duration = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60)
    
    const top = ((start - hours[0]) * hourHeight).toFixed(2)
    const height = (duration * hourHeight).toFixed(2)
    const width = `calc(${100 / totalColumns}% - ${minBlockSpacing}px)`
    const left = `${(column * 100) / totalColumns}%`

    return (
      <div
        key={block.time_block_id}
        className={cn(
          "absolute rounded-lg border p-2 transition-all cursor-pointer hover:shadow-md",
          block.ui?.color || categoryColors.admin.bg,
          hoveredBlock === block.time_block_id && "ring-2 ring-primary",
        )}
        style={{
          top: `${top}px`,
          height: `${height}px`,
          width,
          left,
        }}
        onClick={() => setSelectedBlock(block)}
        onMouseEnter={() => setHoveredBlock(block.time_block_id)}
        onMouseLeave={() => setHoveredBlock(null)}
      >
        <div className="font-medium truncate">{block.time_block_label}</div>
        <div className="text-xs text-muted-foreground">
          {format(startDate, "h:mm a")} - {format(endDate, "h:mm a")}
        </div>
        {block.ui?.classification?.applications?.map((app) => (
          <div key={app.name} className="flex items-center gap-1 text-xs text-muted-foreground">
            {appIcons[app.name] || <Clock className="h-3 w-3" />}
            <span>{app.name}</span>
          </div>
        ))}
      </div>
    )
  }

  // Group overlapping blocks and render them in columns
  const renderTimeBlocks = () => {
    // Sort blocks by start time
    const sortedBlocks = [...timeBlocks].sort((a, b) => a.start_time.localeCompare(b.start_time))
    const processedBlocks: { block: TimeBlock; column: number; totalColumns: number }[] = []
    
    sortedBlocks.forEach((block) => {
      // Find blocks that overlap with current block
      const overlappingBlocks = processedBlocks.filter(
        (pb) => 
          (block.start_time >= pb.block.start_time && block.start_time < pb.block.start_time + pb.block.duration) || // Current block starts during another block
          (pb.block.start_time >= block.start_time && pb.block.start_time < block.start_time + block.duration) // Another block starts during current block
      )

      if (overlappingBlocks.length === 0) {
        // No overlap - single column
        processedBlocks.push({ block, column: 0, totalColumns: 1 })
      } else {
        // Find the first available column
        const usedColumns = overlappingBlocks.map(b => b.column)
        let column = 0
        while (usedColumns.includes(column)) {
          column++
        }
        
        // Update total columns for all overlapping blocks
        const newTotalColumns = Math.max(...overlappingBlocks.map(b => b.totalColumns), column + 1)
        overlappingBlocks.forEach(b => {
          b.totalColumns = newTotalColumns
        })
        
        processedBlocks.push({ block, column, totalColumns: newTotalColumns })
      }
    })

    // Render all blocks
    return processedBlocks.map(({ block, column, totalColumns }, index) => 
      renderTimeBlock(block, index, column, totalColumns)
    )
  }

  if (loading) {
    return <div className="text-center text-muted-foreground">Loading time blocks...</div>
  }

  if (error) {
    return <div className="text-center text-red-500">Error loading time blocks: {error}</div>
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Select value={view} onValueChange={(value: "day" | "week") => setView(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>View</SelectLabel>
                  <SelectItem value="day">Day View</SelectItem>
                  <SelectItem value="week">Week View</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => handleDateChange("prev")}
                className="hover:bg-violet-50 dark:hover:bg-violet-900/10 hover:text-violet-600 dark:hover:text-violet-300"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="min-w-[240px] justify-start text-left font-normal hover:bg-violet-50 dark:hover:bg-violet-900/10 hover:text-violet-600 dark:hover:text-violet-300"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{format(selectedDate, "EEEE")}</span>
                      <span className="text-xs text-muted-foreground">{format(selectedDate, "MMMM d, yyyy")}</span>
                    </div>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date: Date | undefined) => {
                      if (date) setSelectedDate(date)
                    }}
                    className="rounded-md border"
                  />
                </PopoverContent>
              </Popover>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => handleDateChange("next")}
                className="hover:bg-violet-50 dark:hover:bg-violet-900/10 hover:text-violet-600 dark:hover:text-violet-300"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.5))}
              className="hover:bg-violet-50 dark:hover:bg-violet-900/10 hover:text-violet-600 dark:hover:text-violet-300"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setZoomLevel((z) => Math.min(2, z + 0.5))}
              className="hover:bg-violet-50 dark:hover:bg-violet-900/10 hover:text-violet-600 dark:hover:text-violet-300"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button 
              onClick={handleAddBlock}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25"
            >
              Add Time Block
            </Button>
          </div>
        </div>

        <div className="rounded-lg border bg-card">
          {/* Summary */}
          <div className="p-4 border-b space-y-2">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-sm font-medium">Daily Summary</div>
                <div className="text-2xl font-bold">
                  {dailySummary.totalHours.toFixed(1)}h{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    ({dailySummary.billableHours.toFixed(1)}h billable)
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                {Object.entries(dailySummary.categories).map(([category, hours]) => (
                  <div
                    key={category}
                    className={cn(
                      "px-2 py-1 rounded-md text-xs font-medium",
                      categoryColors[category as TimeBlock["category"]].bg,
                      categoryColors[category as TimeBlock["category"]].border,
                    )}
                  >
                    {category}: {hours.toFixed(1)}h
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Time labels */}
            <div className="absolute left-0 top-0 flex h-full flex-col border-r bg-background/95">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="flex items-center border-b px-4 text-sm text-muted-foreground"
                  style={{ height: `${hourHeight}px` }}
                >
                  {format(new Date().setHours(hour, 0), "h:mm a")}
                </div>
              ))}
            </div>

            {/* Grid */}
            <ScrollArea className="ml-[100px]" style={{ height: `${hourHeight * hours.length}px` }}>
              <div className="relative min-w-[800px]">
                {/* Grid lines */}
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="border-b border-dashed transition-colors hover:border-primary/50"
                    style={{ height: `${hourHeight}px` }}
                  />
                ))}

                {/* Current time indicator */}
                <div
                  className="absolute left-0 right-0 border-t-2 border-primary z-50"
                  style={{
                    top: `${((new Date().getHours() + new Date().getMinutes() / 60 - hours[0]) * hourHeight).toFixed(
                      2,
                    )}px`,
                  }}
                >
                  <div className="absolute -left-[100px] -top-2.5 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-md">
                    {format(new Date(), "h:mm a")}
                  </div>
                </div>

                {/* Time blocks */}
                <div className="absolute inset-x-4 top-0">{renderTimeBlocks()}</div>
              </div>
            </ScrollArea>
          </div>
        </div>

        <TimeBlockDialog block={selectedBlock} onClose={() => setSelectedBlock(null)} onUpdate={handleBlockUpdate} />
      </div>
    </TooltipProvider>
  )
}


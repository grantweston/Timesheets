"use client"

import * as React from "react"
import { cn } from "@/app/lib/utils"
import { TimeBlockDialog } from "./time-block-dialog"
import type { TimeBlock } from "@/types/time-block"
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

// Mock data with categories and colors
const initialTimeBlocks: TimeBlock[] = [
  {
    id: 1,
    start: 9,
    duration: 1.5,
    title: "Client Meeting - Project Review",
    client: "Acme Corp",
    billable: true,
    category: "meeting",
    description: ["Reviewed project milestones", "Discussed requirements"],
    applications: [
      { name: "Zoom", timeSpent: 85 },
      { name: "Figma", timeSpent: 15 },
    ],
  },
  {
    id: 2,
    start: 10.5,
    duration: 0.25,
    title: "Quick Email Response",
    client: "TechStart Inc",
    billable: true,
    category: "admin",
    applications: [{ name: "Gmail", timeSpent: 15 }],
  },
  {
    id: 3,
    start: 10.5,
    duration: 0.5,
    title: "Code Review",
    client: "Acme Corp",
    billable: true,
    category: "development",
    applications: [{ name: "VS Code", timeSpent: 30 }],
  },
  {
    id: 4,
    start: 11.25,
    duration: 0.75,
    title: "Sprint Planning",
    client: "TechStart Inc",
    billable: true,
    category: "planning",
    description: ["Planned next sprint tasks", "Assigned tickets"],
    applications: [
      { name: "Zoom", timeSpent: 40 },
      { name: "Notion", timeSpent: 5 },
    ],
  },
  {
    id: 5,
    start: 13,
    duration: 2.5,
    title: "Development Work",
    client: "TechStart Inc",
    billable: true,
    category: "development",
    description: ["Implemented new features", "Fixed bugs", "Code review and documentation"],
    applications: [
      { name: "VS Code", timeSpent: 120 },
      { name: "Chrome", timeSpent: 25 },
      { name: "Slack", timeSpent: 5 },
    ],
  },
  {
    id: 6,
    start: 15.5,
    duration: 0.25,
    title: "Bug Fix - Authentication",
    client: "Acme Corp",
    billable: true,
    category: "development",
    applications: [{ name: "VS Code", timeSpent: 15 }],
  },
  {
    id: 7,
    start: 15.5,
    duration: 0.5,
    title: "Team Sync",
    client: "TechStart Inc",
    billable: true,
    category: "meeting",
    description: ["Daily standup", "Blockers discussion"],
    applications: [
      { name: "Zoom", timeSpent: 25 },
      { name: "Slack", timeSpent: 5 },
    ],
  },
  {
    id: 8,
    start: 16.25,
    duration: 1.75,
    title: "Documentation Update",
    client: "TechStart Inc",
    billable: true,
    category: "development",
    description: ["API documentation", "Updated README"],
    applications: [
      { name: "VS Code", timeSpent: 60 },
      { name: "Chrome", timeSpent: 45 },
    ],
  }
]

const categoryColors: Record<TimeBlock["category"], { bg: string; border: string }> = {
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
  const [hoveredBlock, setHoveredBlock] = React.useState<number | null>(null)
  const [zoomLevel, setZoomLevel] = React.useState<number>(1)
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date())
  const [view, setView] = React.useState<"day" | "week">("day")
  const [isDatePickerOpen, setIsDatePickerOpen] = React.useState(false)

  // Fetch time blocks from Supabase
  const { timeBlocks: supabaseBlocks, loading, error } = useTimeBlocks(view === 'day' ? 'today' : 'week')

  const { createTimeBlock, updateTimeBlock } = useTimeBlockMutations()

  // Convert Supabase time blocks to our TimeBlock format
  const timeBlocks = React.useMemo(() => {
    if (!supabaseBlocks) return []
    
    return supabaseBlocks.map(block => {
      const startDate = new Date(block.start_time)
      const endDate = new Date(block.end_time)
      const start = startDate.getHours() + startDate.getMinutes() / 60
      const duration = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60) // Convert to hours

      return {
        id: parseInt(block.id),
        start,
        duration,
        title: block.task_label,
        client: "", // We'll need to fetch this from the project
        billable: block.is_billable,
        category: (block.classification?.category?.toLowerCase() || "development") as TimeBlock["category"],
        description: [],
        applications: [],
      }
    })
  }, [supabaseBlocks])

  // Calculate daily summary
  const dailySummary = React.useMemo(() => {
    return timeBlocks.reduce<DailySummary>(
      (acc, block) => {
        acc.totalHours += block.duration
        if (block.billable) {
          acc.billableHours += block.duration
        }
        acc.categories[block.category] = (acc.categories[block.category] || 0) + block.duration
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
      // Convert our TimeBlock format back to Supabase format
      const startDate = new Date()
      startDate.setHours(Math.floor(updatedBlock.start))
      startDate.setMinutes((updatedBlock.start % 1) * 60)
      
      const endDate = new Date(startDate)
      endDate.setTime(startDate.getTime() + updatedBlock.duration * 60 * 60 * 1000)

      await updateTimeBlock(updatedBlock.id.toString(), {
        task_label: updatedBlock.title,
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        is_billable: updatedBlock.billable,
        classification: { category: updatedBlock.category, confidence: 1.0 }
      })

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

      const data = await createTimeBlock({
        task_label: "New Time Block",
        start_time: startTime,
        end_time: endTime,
        is_billable: true,
        classification: { category: "Development", confidence: 1.0 }
      })

      // Convert the new block to our TimeBlock format
      const newBlock: TimeBlock = {
        id: parseInt(data.id),
        start: 12,
        duration: 1,
        title: data.task_label,
        client: "",
        billable: data.is_billable,
        category: "development",
        description: [],
        applications: [],
      }

      setSelectedBlock(newBlock)
    } catch (error) {
      console.error('Failed to create time block:', error)
    }
  }

  const handleDateChange = (direction: "prev" | "next") => {
    setSelectedDate((current) => (direction === "prev" ? subDays(current, 1) : addDays(current, 1)))
  }

  const renderTimeBlock = (block: TimeBlock, index: number, columnIndex: number, totalColumns: number) => {
    const roundedStart = Math.floor(block.start * 4) / 4
    const top = (roundedStart - hours[0]) * hourHeight
    const displayDuration = Math.max(block.duration, minBlockDuration)
    const height = displayDuration * hourHeight
    const isSelected = selectedBlock?.id === block.id
    const isHovered = hoveredBlock === block.id
    const isSmall = height < 60 // Changed from duration-based to pixel-height-based
    const isMedium = height < 90 // New size category for medium height blocks

    // Calculate width and position based on columns
    const columnWidth = `calc((100% - 32px - ${(totalColumns - 1) * minBlockSpacing}px) / ${totalColumns})`
    const left = `calc(16px + ${columnIndex} * (${columnWidth} + ${minBlockSpacing}px))`

    return (
      <Tooltip key={block.id}>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "absolute cursor-pointer rounded-lg transition-all duration-200 overflow-hidden border",
              categoryColors[block.category].bg,
              categoryColors[block.category].border,
              !block.billable && "opacity-60 saturate-50",
              (isSelected || isHovered) && "ring-2 ring-primary shadow-lg scale-[1.02]",
              "animate-slide-up hover:-translate-x-1",
              isSmall ? "p-1" : "p-2",
            )}
            style={{
              top: `${top}px`,
              height: `${height}px`,
              left,
              width: columnWidth,
              animationDelay: `${index * 50}ms`,
              zIndex: isSelected || isHovered ? 50 : 10 + index,
            }}
            onClick={() => setSelectedBlock(block)}
            onMouseEnter={() => setHoveredBlock(block.id)}
            onMouseLeave={() => setHoveredBlock(null)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                setSelectedBlock(block)
              }
            }}
          >
            <div className={cn(
              "flex h-full",
              isSmall ? "items-center justify-between gap-2" : 
              isMedium ? "items-center justify-between gap-2" : "flex-col gap-1"
            )}>
              <div className={cn("min-w-0", !isSmall && !isMedium && "flex-1")}>
                <div className="font-medium truncate leading-none text-sm">{block.title}</div>
                {!isSmall && !isMedium && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                    <span className="truncate max-w-[100px]">{block.client}</span>
                    <span>•</span>
                    <span className="capitalize">{block.category}</span>
                  </div>
                )}
              </div>
              
              {/* Right side info for small/medium blocks */}
              {(isSmall || isMedium) && (
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-muted-foreground truncate max-w-[80px]">{block.client}</span>
                  {block.applications && block.applications.length > 0 && (
                    <div className="flex gap-1 items-center">
                      <Badge variant="outline" className="text-xs py-0 h-5 px-1.5 flex items-center gap-1">
                        {appIcons[block.applications[0].name] || block.applications[0].name[0]}
                      </Badge>
                      {block.applications.length > 1 && (
                        <Badge variant="outline" className="text-xs py-0 h-5">
                          +{block.applications.length - 1}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Bottom applications for full-size blocks */}
              {block.applications && block.applications.length > 0 && !isSmall && !isMedium && (
                <div className="flex gap-1 flex-wrap mt-1">
                  {block.applications.slice(0, 3).map((app: { name: string; timeSpent: number }) => (
                    <Badge key={app.name} variant="outline" className="text-xs py-0 h-5 px-1.5 flex items-center gap-1">
                      {appIcons[app.name] || app.name[0]}
                    </Badge>
                  ))}
                  {block.applications.length > 3 && (
                    <Badge variant="outline" className="text-xs py-0 h-5">
                      +{block.applications.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <div className="font-medium">{block.title}</div>
            <div className="text-xs space-y-1">
              <div>{block.client}</div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize">
                  {block.category}
                </Badge>
              </div>
              <div className="text-muted-foreground">
                {format(new Date().setHours(Math.floor(block.start), (block.start % 1) * 60), "h:mm a")} -{" "}
                {format(
                  new Date().setHours(
                    Math.floor(block.start + block.duration),
                    ((block.start + block.duration) % 1) * 60,
                  ),
                  "h:mm a",
                )}
                {block.duration < 0.25 && " (Minimum display: 15 minutes)"}
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    )
  }

  // Group overlapping blocks and render them in columns
  const renderTimeBlocks = () => {
    // Sort blocks by start time
    const sortedBlocks = [...timeBlocks].sort((a, b) => a.start - b.start)
    const processedBlocks: { block: TimeBlock; column: number; totalColumns: number }[] = []
    
    sortedBlocks.forEach((block) => {
      // Find blocks that overlap with current block
      const overlappingBlocks = processedBlocks.filter(
        (pb) => 
          (block.start >= pb.block.start && block.start < pb.block.start + pb.block.duration) || // Current block starts during another block
          (pb.block.start >= block.start && pb.block.start < block.start + block.duration) // Another block starts during current block
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


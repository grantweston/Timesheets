"use client"

import * as React from "react"
import { cn } from "@/app/lib/utils"
import { TimeBlock, transformDatabaseToUI, transformUIToDatabase, categoryColors } from "@/app/types/time-block"
import { TimeBlockDialog } from "./time-block-dialog"
import { Button } from "@/app/components/ui/button"
import { Plus, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Clock, Chrome, Slack, Mail, Code, FileCode, Monitor, Minus, RefreshCw } from "lucide-react"
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
import { useTimeBlockMutations, UpdateTimeBlockInput } from "@/app/hooks/use-time-block-mutations"
import { useUser } from "@/app/hooks/use-user"
import { supabase } from "@/app/lib/supabase"

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
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date('2025-02-24T12:00:00Z'))
  const [view, setView] = React.useState<"day" | "week">("day")
  const [isDatePickerOpen, setIsDatePickerOpen] = React.useState(false)
  const [forceCreate, setForceCreate] = React.useState(false)
  const [useHardcodedId, setUseHardcodedId] = React.useState(false)
  const [showAllBlocks, setShowAllBlocks] = React.useState(false)
  const HARDCODED_USER_ID = "user_2tExBCPQtiCFy1EMr1EJ76rZGgK" // The ID we found in our database
  const [diagnosticLogs, setDiagnosticLogs] = React.useState<any[]>([])
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [showDebugPanel, setShowDebugPanel] = React.useState(false)

  const { user, loading: userLoading } = useUser()
  const { timeBlocks: dbBlocks, loading: blocksLoading, error, usingApiRoute } = useTimeBlocks(
    showAllBlocks ? 'all' : (view === 'day' ? 'today' : 'week'), 
    selectedDate,
    { useHardcodedId, hardcodedId: HARDCODED_USER_ID, showAllBlocks }
  )
  const { createTimeBlock, updateTimeBlock, deleteTimeBlock } = useTimeBlockMutations()
  
  // Streamlined diagnostic query function
  const runDiagnosticQuery = React.useCallback(async () => {
    try {
      const { supabase } = await import('@/app/lib/supabase')
      
      // Query with no filters to see ALL time blocks
      const { data: allBlocks, error: allError } = await supabase
        .from('time_blocks')
        .select('time_block_id, time_block_label, start_time, end_time, clerk_user_id')
        .order('created_at', { ascending: false })
        .limit(20)
      
      // Try specifically for the user ID
      const { data: userBlocks, error: userError } = await supabase
        .from('time_blocks')
        .select('time_block_id, time_block_label, start_time, end_time')
        .eq('clerk_user_id', user?.clerk_user_id || HARDCODED_USER_ID)
        .order('created_at', { ascending: false })
        .limit(20)
      
      // Store logs for display in debug panel
      setDiagnosticLogs([
        { type: 'ALL', count: allBlocks?.length || 0, error: allError ? String(allError.message) : null },
        { type: 'USER', count: userBlocks?.length || 0, error: userError ? String(userError.message) : null }
      ])
    } catch (err) {
      console.error("Error in diagnostic query:", err)
    }
  }, [user?.clerk_user_id, HARDCODED_USER_ID])
  
  // Streamlined refresh function
  const refreshData = React.useCallback(async () => {
    try {
      setIsRefreshing(true)
      
      // Force a new date object for proper re-rendering
      setSelectedDate(new Date(selectedDate.getTime()))
      
      // Run diagnostic queries
      await runDiagnosticQuery()
    } catch (err) {
      console.error("Error refreshing data:", err)
    } finally {
      // Clear refreshing state after a delay to show animation
      setTimeout(() => setIsRefreshing(false), 500)
    }
  }, [selectedDate, runDiagnosticQuery])

  // Connect the refresh button in the page header
  React.useEffect(() => {
    const refreshButton = document.getElementById('refresh-button');
    if (refreshButton) {
      const handleRefresh = () => refreshData();
      refreshButton.addEventListener('click', handleRefresh);
      return () => {
        refreshButton.removeEventListener('click', handleRefresh);
      };
    }
  }, [refreshData]);

  // Run diagnostic on mount
  React.useEffect(() => {
    // Small delay to ensure auth is ready
    const timer = setTimeout(() => {
      runDiagnosticQuery()
    }, 2000)
    return () => clearTimeout(timer)
  }, [runDiagnosticQuery])

  // Clean timeBlocks memo
  const timeBlocks = React.useMemo(() => {
    if (!dbBlocks) return []
    return dbBlocks
  }, [dbBlocks])
  
  // Simplified test block creation
  const handleCreateTestBlock = React.useCallback(async () => {
    const userId = useHardcodedId ? HARDCODED_USER_ID : user?.clerk_user_id;
    
    if (!userId) {
      console.error("No user ID available, cannot create test block");
      return;
    }
    
    try {
      // Get the first active client 
      const { data: clients } = await supabase
        .from('clients')
        .select('*')
        .eq('status', 'active')
        .order('name')
        .limit(1);
        
      if (!clients?.length) {
        console.error("No active clients found");
        return;
      }
      
      // Create a block using the selected date but ensuring we use the right day
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      const day = selectedDate.getDate();
      
      // Creating the dates for the block ensuring we keep the same day regardless of timezone
      const startTime = new Date(year, month, day, 10, 0, 0);
      const endTime = new Date(year, month, day, 12, 0, 0);
      
      const newBlock = {
        clerk_user_id: userId,
        client_id: clients[0].client_id,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        time_block_label: "Test Block - Auto Created",
        description: "This block was automatically created for testing",
        is_billable: true,
        in_scope: true
      };
      
      const { data, error } = await supabase
        .from('time_blocks')
        .insert([newBlock])
        .select()
        .single();
        
      if (error) {
        console.error("Error creating test block:", error);
      } else {
        refreshData(); // Refresh to show the new block
      }
    } catch (err) {
      console.error("Error in handleCreateTestBlock:", err);
    }
  }, [user?.clerk_user_id, selectedDate, refreshData, useHardcodedId, HARDCODED_USER_ID]);
  
  // Simplified direct fetch function
  const fetchBlocksDirectly = React.useCallback(async () => {
    try {
      const now = selectedDate || new Date('2025-02-24T12:00:00Z');
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      
      const { data: directBlocks, error } = await supabase
        .from('time_blocks')
        .select(`
          *,
          client:clients (
            client_id,
            name,
            billing_rate,
            email,
            status
          )
        `)
        .eq('clerk_user_id', HARDCODED_USER_ID)
        .gte('start_time', startOfDay.toISOString())
        .lt('start_time', endOfDay.toISOString())
        .order('start_time', { ascending: true });
        
      if (error) {
        console.error("Error fetching blocks directly:", error);
      }
    } catch (err) {
      console.error("Error in fetchBlocksDirectly:", err);
    }
  }, [selectedDate, HARDCODED_USER_ID]);

  // Simplified user check effect
  React.useEffect(() => {
    // Create a test block if user exists, we've loaded but have no blocks, or force create is true
    if ((useHardcodedId || user?.clerk_user_id) && !userLoading && !blocksLoading && 
       (forceCreate || (!timeBlocks || timeBlocks.length === 0))) {
      handleCreateTestBlock();
      if (forceCreate) {
        setForceCreate(false);
      }
    }
  }, [user, userLoading, blocksLoading, timeBlocks, handleCreateTestBlock, forceCreate, useHardcodedId, HARDCODED_USER_ID]);

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
      // Extract only the fields needed for update
      const updateData: UpdateTimeBlockInput = {
        time_block_id: updatedBlock.time_block_id,
        client_id: updatedBlock.client_id,
        start_time: updatedBlock.start_time,
        end_time: updatedBlock.end_time,
        time_block_label: updatedBlock.time_block_label,
        description: updatedBlock.description || '',
        is_billable: updatedBlock.is_billable,
        in_scope: updatedBlock.in_scope
      }
      
      await updateTimeBlock(updateData)
      setSelectedBlock(null)
      refreshData()
    } catch (error) {
      console.error('Failed to update time block:', error)
    }
  }

  const handleAddBlock = async () => {
    try {
      const userId = useHardcodedId ? HARDCODED_USER_ID : user?.clerk_user_id;
      
      if (!userId) {
        throw new Error('No user ID found');
      }
      
      console.log("Adding time block for user:", {
        userId,
        usingHardcoded: useHardcodedId,
        selectedDate: selectedDate.toISOString()
      });

      // Get the first active client as default
      const { data: clients } = await supabase
        .from('clients')
        .select('*')
        .eq('status', 'active')
        .order('name')
        .limit(1)

      if (!clients?.length) {
        throw new Error('No active clients found')
      }

      // Create a block using the selected date but ensuring we use the right day
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      const day = selectedDate.getDate();
      
      // Creating the dates for the block ensuring we keep the same day regardless of timezone
      const startTime = new Date(year, month, day, 12, 0, 0);
      const endTime = new Date(year, month, day, 13, 0, 0);
      
      console.log("Creating time block with times:", {
        startTimeISO: startTime.toISOString(),
        endTimeISO: endTime.toISOString(),
        selectedDateISO: selectedDate.toISOString()
      });

      const newBlock = {
        client_id: clients[0].client_id,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        time_block_label: "New Time Block",
        description: "",
        is_billable: true,
        in_scope: true
      }

      const createdBlock = await createTimeBlock(newBlock)
      if (createdBlock) {
        setSelectedBlock(createdBlock)
      }
      
      // Force refresh after creating new block
      console.log("Time block created, refreshing data");
      refreshData()
    } catch (error) {
      console.error('Failed to create time block:', error)
    }
  }

  // Calculate duration for a time block
  const getBlockDuration = (block: TimeBlock) => {
    const startDate = new Date(block.start_time)
    const endDate = new Date(block.end_time)
    return (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60)
  }

  const handleDateChange = (direction: "prev" | "next") => {
    setSelectedDate((current) => (direction === "prev" ? subDays(current, 1) : addDays(current, 1)))
  }

  // Simplified renderTimeBlock with color based on billable/admin status
  const renderTimeBlock = (block: TimeBlock, index: number, column: number, totalColumns: number) => {
    const startDate = new Date(block.start_time)
    const endDate = new Date(block.end_time)
    
    // Calculate position
    const startHour = startDate.getHours() + startDate.getMinutes() / 60
    const endHour = endDate.getHours() + endDate.getMinutes() / 60
    const top = (startHour - hours[0]) * hourHeight
    const height = Math.max((endHour - startHour) * hourHeight, 45) // Enforce minimum height of 45px
    const columnWidth = `calc((100% - 20px) / ${totalColumns})`
    const left = `calc(${column} * ${columnWidth} + 10px)`
    const width = columnWidth
    
    const isPast = endDate < new Date()
    const isActive = startDate <= new Date() && endDate >= new Date()
    
    // Simple color logic based on billable status and category
    const isAdmin = block.ui?.classification?.category === 'admin'
    const isBreak = block.ui?.classification?.category === 'break'
    
    let blockColorClass = ""
    if (block.is_billable) {
      // Green for billable work
      blockColorClass = "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700 border-l-green-500"
    } else if (isBreak || (!isAdmin && !block.is_billable)) {
      // Red for non-billable non-work (like breaks)
      blockColorClass = "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 border-l-red-500"
    } else {
      // Grey for non-billable admin work
      blockColorClass = "bg-slate-50 dark:bg-slate-900/20 border-slate-300 dark:border-slate-700 border-l-slate-500"
    }
    
    // Determine how much content to show based on block height
    const isSmallBlock = height < 60 // Less than 1 hour
    const isTinyBlock = height < 50 // Very small blocks
    
    return (
      <div
        key={block.time_block_id}
        className={cn(
          "absolute rounded-lg border transition-all cursor-pointer border-l-4",
          blockColorClass,
          isPast ? "hover:shadow-md" : "hover:shadow-lg",
          hoveredBlock === block.time_block_id && "ring-2 ring-primary",
          isActive && "animate-pulse-subtle"
        )}
        style={{
          top: `${top}px`,
          height: `${height}px`,
          width,
          left,
          boxShadow: hoveredBlock === block.time_block_id ? '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        }}
        onClick={() => setSelectedBlock(block)}
        onMouseEnter={() => setHoveredBlock(block.time_block_id)}
        onMouseLeave={() => setHoveredBlock(null)}
        title={`${block.time_block_label} (${format(startDate, "h:mm a")} - ${format(endDate, "h:mm a")})`}
      >
        {isTinyBlock ? (
          // Minimal content for very small blocks
          <div className="flex items-center justify-between p-1.5 h-full overflow-hidden">
            <span className="font-medium text-xs truncate flex-1">{block.time_block_label}</span>
            {block.is_billable && <span className="text-xs px-1 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full ml-1 flex-shrink-0">$</span>}
          </div>
        ) : isSmallBlock ? (
          // Compact layout for small blocks
          <div className="flex flex-col p-2 h-full justify-between overflow-hidden">
            <div className="flex justify-between items-start">
              <span className="font-medium text-xs truncate flex-1">{block.time_block_label}</span>
              {block.is_billable && <span className="text-xs px-1 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full ml-1 flex-shrink-0">$</span>}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {format(startDate, "h:mm a")} - {format(endDate, "h:mm a")}
            </div>
          </div>
        ) : (
          // Full content for regular blocks
          <div className="flex flex-col h-full p-3">
            <div className="flex justify-between items-start mb-1">
              <div className="font-medium truncate text-sm">{block.time_block_label}</div>
              {block.is_billable && (
                <div className="text-xs px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full ml-1 flex-shrink-0">
                  $
                </div>
              )}
            </div>
            <div className="text-xs text-muted-foreground flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {format(startDate, "h:mm a")} - {format(endDate, "h:mm a")}
            </div>
            {block.client && height > 80 && (
              <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <span className="truncate font-medium">{block.client.name}</span>
                {block.is_billable && block.client.billing_rate && (
                  <span className="text-xs px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full ml-1 flex-shrink-0">
                    ${block.client.billing_rate}/hr
                  </span>
                )}
              </div>
            )}
            {block.ui?.classification?.applications && block.ui.classification.applications.length > 0 && height > 120 && (
              <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                {block.ui.classification.applications.map((app) => (
                  <div key={app.name} className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <div className="h-5 w-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      {appIcons[app.name] || <Clock className="h-3 w-3" />}
                    </div>
                    <span>{app.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // Group overlapping blocks and render them in columns
  const renderTimeBlocks = () => {
    if (timeBlocks.length === 0) {
      return (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
          No time blocks for the selected date
        </div>
      );
    }
    
    // Sort blocks by start time
    const sortedBlocks = [...timeBlocks].sort((a, b) => a.start_time.localeCompare(b.start_time))
    const processedBlocks: { block: TimeBlock; column: number; totalColumns: number }[] = []
    
    sortedBlocks.forEach((block) => {
      // Find blocks that overlap with current block
      const blockDuration = getBlockDuration(block)
      const overlappingBlocks = processedBlocks.filter(
        (pb) => {
          const pbDuration = getBlockDuration(pb.block)
          return (
            (block.start_time >= pb.block.start_time && block.start_time < pb.block.end_time) || // Current block starts during another block
            (pb.block.start_time >= block.start_time && pb.block.start_time < block.end_time) // Another block starts during current block
          )
        }
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

  if (userLoading || blocksLoading) {
    return <div className="text-center text-muted-foreground">Loading...</div>
  }

  if (!user) {
    return <div className="text-center text-red-500">Please sign in to view your timesheet</div>
  }

  if (error) {
    return <div className="text-center text-red-500">Error loading time blocks: {error}</div>
  }

  return (
    <div className="flex flex-col">
      {/* Timesheet Controls */}
      <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleDateChange("prev")}
            title="Previous Day"
            className="hover:bg-violet-50 dark:hover:bg-violet-900/10 hover:text-violet-600 dark:hover:text-violet-300"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="min-w-36 font-medium">
                {format(selectedDate, "EEEE, MMM d, yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (date) {
                    setSelectedDate(date)
                    setIsDatePickerOpen(false)
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleDateChange("next")}
            title="Next Day"
            className="hover:bg-violet-50 dark:hover:bg-violet-900/10 hover:text-violet-600 dark:hover:text-violet-300"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          
          {/* Add the refresh button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={refreshData}
                  disabled={isRefreshing || blocksLoading}
                  className="relative hover:bg-violet-50 dark:hover:bg-violet-900/10 hover:text-violet-600 dark:hover:text-violet-300"
                >
                  <RefreshCw className={cn(
                    "h-4 w-4", 
                    isRefreshing && "animate-spin"
                  )} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh time blocks{usingApiRoute ? ' via API' : ' via direct DB'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
            <Plus className="h-4 w-4 mr-1" /> Add Time Block
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden shadow-sm">
        {/* Summary */}
        <div className="p-6 border-b bg-card bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-950/30 dark:to-indigo-950/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium uppercase tracking-wide text-violet-600 dark:text-violet-400">Daily Summary</div>
              <div className="flex items-end gap-2">
                <div className="text-3xl font-bold">
                  {dailySummary.totalHours.toFixed(1)}h
                </div>
                <div className="text-sm font-medium text-muted-foreground pb-1">
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400">
                    <span className="mr-1">•</span>
                    {dailySummary.billableHours.toFixed(1)}h billable
                  </span>
                </div>
              </div>
              {/* Debug info */}
              <div className="text-xs text-muted-foreground mt-1">
                User: {user?.clerk_user_id?.slice(0, 10)}... | 
                Date: {format(selectedDate, "yyyy-MM-dd")} | 
                Blocks: {timeBlocks.length}
              </div>
            </div>
            
            {/* Simple color legend */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-sm bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700 border-l-4 border-l-green-500 mr-2"></div>
                <span className="text-sm">Billable</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-sm bg-slate-50 dark:bg-slate-900/20 border border-slate-300 dark:border-slate-700 border-l-4 border-l-slate-500 mr-2"></div>
                <span className="text-sm">Non-billable Admin</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-sm bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 border-l-4 border-l-red-500 mr-2"></div>
                <span className="text-sm">Non-billable Other</span>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Time labels */}
          <div className="absolute left-0 top-0 flex h-full flex-col border-r bg-background/95 z-10">
            {hours.map((hour) => (
              <div
                key={hour}
                className="flex items-center border-b px-4 text-sm font-medium"
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
                  className={cn(
                    "border-b border-dashed transition-colors hover:border-primary/50",
                    hour % 2 === 0 ? "bg-slate-50/50 dark:bg-slate-900/10" : ""
                  )}
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
                <div className="absolute -left-[100px] -top-2.5 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-md shadow-md">
                  {format(new Date(), "h:mm a")}
                </div>
              </div>

              {/* Time blocks */}
              <div className="absolute inset-x-4 top-0 bottom-0">{renderTimeBlocks()}</div>
            </div>
          </ScrollArea>
        </div>
      </div>

      <TimeBlockDialog block={selectedBlock} onClose={() => setSelectedBlock(null)} onUpdate={handleBlockUpdate} />

      {/* Debug Panel - Collapsible */}
      {process.env.NODE_ENV !== 'production' && (
        <div className="mt-6">
          <Button
            variant="outline"
            size="sm"
            className="w-full flex items-center justify-between text-xs border-yellow-300 dark:border-yellow-700 bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
            onClick={() => setShowDebugPanel(!showDebugPanel)}
          >
            <span>Debug Panel</span>
            <span>{showDebugPanel ? '▲' : '▼'}</span>
          </Button>
          
          {showDebugPanel && (
            <div className="mt-2 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-300 dark:border-yellow-700 rounded-md p-3 text-xs shadow-md animate-fade-in">
              <h3 className="font-semibold mb-1 text-base text-yellow-700 dark:text-yellow-300">Debug Options</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>User ID: {user?.clerk_user_id?.slice(0, 10) || "NO USER"}...</div>
                <div>Date: {selectedDate.toLocaleDateString()}</div>
                <div>Blocks: {timeBlocks?.length || 0}</div>
                <div>Data Source: {usingApiRoute ? 'API Route' : 'Direct DB'}</div>
              </div>
              
              {/* Diagnostic Results */}
              {diagnosticLogs.length > 0 && (
                <div className="mt-2 p-2 bg-orange-100 dark:bg-orange-900/20 rounded border border-orange-300 dark:border-orange-700">
                  <h4 className="font-medium mb-1 text-orange-700 dark:text-orange-300">Diagnostic Results</h4>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="font-medium">Query Type</div>
                    <div className="font-medium">Count</div>
                    <div className="font-medium">Status</div>
                    {diagnosticLogs.map((log, i) => (
                      <React.Fragment key={i}>
                        <div>{log.type}</div>
                        <div>{log.count}</div>
                        <div className={log.error ? "text-red-600" : "text-green-600"}>
                          {log.error ? "Error" : "Success"}
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Toggle options */}
              <div className="mt-3 flex flex-wrap gap-2">
                <label className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    checked={useHardcodedId} 
                    onChange={() => setUseHardcodedId(!useHardcodedId)}
                    className="rounded text-violet-600"
                  />
                  <span>Use Hardcoded ID</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    checked={showAllBlocks} 
                    onChange={() => setShowAllBlocks(!showAllBlocks)}
                    className="rounded text-violet-600"
                  />
                  <span>Show All Blocks</span>
                </label>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}


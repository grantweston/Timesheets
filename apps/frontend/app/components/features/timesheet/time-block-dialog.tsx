"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { Switch } from "@/app/components/ui/switch"
import { Button } from "@/app/components/ui/button"
import { Separator } from "@/app/components/ui/separator"
import { Progress } from "@/app/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select"
import { Clock, Trash2, DollarSign, Calendar, Check, Ban, BarChart3, Bookmark, FileText, AlertCircle } from "lucide-react"
import { Badge } from "@/app/components/ui/badge"
import { format } from "date-fns"
import { TimeBlock, Client, categoryColors } from "@/app/types/time-block"
import { useSupabase } from "@/app/providers/supabase-provider"
import { cn } from "@/app/lib/utils"

interface TimeBlockDialogProps {
  block: TimeBlock | null
  onClose: () => void
  onUpdate: (block: TimeBlock) => void
}

const categoryIcons: Record<string, React.ReactNode> = {
  meeting: "👥",
  development: "💻",
  planning: "📋",
  break: "☕",
  admin: "📝",
}

export function TimeBlockDialog({ block, onClose, onUpdate }: TimeBlockDialogProps) {
  const [editedBlock, setEditedBlock] = React.useState<TimeBlock | null>(null)
  const [newDescription, setNewDescription] = React.useState("")
  const [clients, setClients] = React.useState<Client[]>([])
  const { supabase } = useSupabase()

  React.useEffect(() => {
    setEditedBlock(block)
  }, [block])

  React.useEffect(() => {
    const fetchClients = async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('status', 'active')
        .order('name')

      if (!error && data) {
        setClients(data)
      }
    }

    fetchClients()
  }, [supabase])

  if (!editedBlock) return null

  const totalTime = editedBlock.ui?.classification?.applications?.reduce((sum, app) => sum + app.timeSpent, 0) || 0

  const handleInputChange = (field: keyof TimeBlock, value: any) => {
    setEditedBlock((prev) => {
      if (!prev) return null
      return {
        ...prev,
        [field]: value,
      }
    })
  }

  const handleClientChange = (clientId: string) => {
    const selectedClient = clients.find(c => c.client_id === clientId)
    setEditedBlock((prev) => {
      if (!prev) return null
      return {
        ...prev,
        client_id: clientId,
        client: selectedClient
      }
    })
  }

  const handleAddDescription = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDescription.trim()) return

    const currentDescription = editedBlock.description || ""
    setEditedBlock((prev) => {
      if (!prev) return null
      return {
        ...prev,
        description: currentDescription ? `${currentDescription}\n${newDescription.trim()}` : newDescription.trim(),
      }
    })
    setNewDescription("")
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins}m`
    return mins === 0 ? `${hours}h` : `${hours}h ${mins}m`
  }

  // Calculate duration between start and end time in hours
  const startDate = new Date(editedBlock.start_time)
  const endDate = new Date(editedBlock.end_time)
  const durationInHours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60)
  const durationHours = Math.floor(durationInHours)
  const durationMinutes = Math.round((durationInHours - durationHours) * 60)
  const durationFormatted = durationHours > 0 
    ? `${durationHours}h ${durationMinutes > 0 ? `${durationMinutes}m` : ''}`
    : `${durationMinutes}m`

  // Calculate billable amount if applicable
  const billableAmount = editedBlock.is_billable && editedBlock.client?.billing_rate
    ? (durationInHours * Number(editedBlock.client.billing_rate)).toFixed(2)
    : null

  return (
    <Dialog open={!!block} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center",
              editedBlock.ui?.color || categoryColors.admin.bg
            )}>
              {categoryIcons[editedBlock.ui?.classification?.category || 'admin']}
            </div>
            <span>Edit Time Block</span>
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Top Card with Key Information */}
          <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-950/30 dark:to-indigo-950/30 p-4 border-b">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-medium text-muted-foreground flex items-center">
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    <span>Date</span>
                  </div>
                  <div className="font-medium">{format(startDate, "MMM d, yyyy")}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-medium text-muted-foreground flex items-center">
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    <span>Duration</span>
                  </div>
                  <div className="font-medium">{durationFormatted}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-medium text-muted-foreground flex items-center">
                    <DollarSign className="h-3.5 w-3.5 mr-1" />
                    <span>Billable</span>
                  </div>
                  <div className="font-medium flex items-center">
                    {editedBlock.is_billable ? (
                      <>
                        <Check className="h-3.5 w-3.5 mr-1 text-green-600 dark:text-green-400" />
                        {billableAmount && <span>${billableAmount}</span>}
                      </>
                    ) : (
                      <span className="flex items-center">
                        <Ban className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                        <span className="text-muted-foreground">No</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4">
              <Input
                id="title"
                value={editedBlock.time_block_label}
                onChange={(e) => handleInputChange("time_block_label", e.target.value)}
                className="font-medium text-lg border-0 bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                placeholder="Enter a title for this time block"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="client" className="text-sm font-medium flex items-center">
                  <Bookmark className="h-4 w-4 mr-1 text-blue-600 dark:text-blue-400" />
                  Client
                </Label>
                <Select value={editedBlock.client_id} onValueChange={handleClientChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Select a client</SelectLabel>
                      {clients.map((client) => (
                        <SelectItem key={client.client_id} value={client.client_id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{client.name}</span>
                            <span className="text-muted-foreground text-sm">
                              ${client.billing_rate}/hr
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {editedBlock.client && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <DollarSign className="h-4 w-4" />
                    <span>Billing rate: ${editedBlock.client.billing_rate}/hr</span>
                  </div>
                )}
              </div>

              <div className="grid gap-2">
                <Label className="text-sm font-medium flex items-center">
                  <Clock className="h-4 w-4 mr-1 text-violet-600 dark:text-violet-400" />
                  Time & Duration
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border rounded-md p-3 shadow-sm">
                    <div className="text-xs text-muted-foreground mb-1">Start Time</div>
                    <div className="font-medium text-sm">
                      {format(new Date(editedBlock.start_time), "h:mm a")}
                    </div>
                  </div>
                  <div className="border rounded-md p-3 shadow-sm">
                    <div className="text-xs text-muted-foreground mb-1">End Time</div>
                    <div className="font-medium text-sm">
                      {format(new Date(editedBlock.end_time), "h:mm a")}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1 text-amber-600 dark:text-amber-400" />
                  Status
                </Label>
                <div className="flex items-center gap-4 border rounded-md p-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="billable"
                      checked={editedBlock.is_billable}
                      onCheckedChange={(checked) => handleInputChange("is_billable", checked)}
                    />
                    <Label htmlFor="billable" className="cursor-pointer">Billable</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="in-scope"
                      checked={editedBlock.in_scope}
                      onCheckedChange={(checked) => handleInputChange("in_scope", checked)}
                    />
                    <Label htmlFor="in-scope" className="cursor-pointer">In Scope</Label>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-sm font-medium flex items-center">
                <FileText className="h-4 w-4 mr-1 text-green-600 dark:text-green-400" />
                Work Description
              </Label>
              <div className="rounded-lg border bg-background shadow-sm">
                {editedBlock.description?.split('\n').map((point, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 group border-b last:border-b-0 hover:bg-muted/30">
                    <span className="text-primary mt-1">•</span>
                    <span className="flex-1 text-sm">{point}</span>
                  </div>
                ))}
                <form onSubmit={handleAddDescription} className="p-2">
                  <Input
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Add a description point..."
                    className="text-sm"
                  />
                </form>
              </div>
            </div>
          </div>

          {editedBlock.ui?.classification?.applications && editedBlock.ui.classification.applications.length > 0 && (
            <>
              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  Application Usage
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {editedBlock.ui.classification.applications.map((app) => (
                    <div key={app.name} className="space-y-2 border rounded-md p-3 shadow-sm">
                      <div className="flex items-center justify-between text-sm">
                        <Badge variant="outline" className="font-normal bg-background shadow-sm">
                          {app.name}
                        </Badge>
                        <div className="flex items-center gap-4">
                          <span className="tabular-nums w-16 text-right">{formatTime(app.timeSpent)}</span>
                          <span className="text-muted-foreground w-12 text-right bg-muted/50 rounded-full px-2 py-0.5 text-xs">
                            {Math.round((app.timeSpent / totalTime) * 100)}%
                          </span>
                        </div>
                      </div>
                      <Progress
                        value={(app.timeSpent / totalTime) * 100}
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="flex justify-between">
            <Button
              variant="outline"
              type="button"
              className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/50"
              onClick={() => onClose()}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => onClose()}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={() => onUpdate(editedBlock)}
                className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25"
              >
                <Check className="h-4 w-4 mr-1" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


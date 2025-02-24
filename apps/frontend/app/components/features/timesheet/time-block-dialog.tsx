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
import { Clock, Trash2 } from "lucide-react"
import { Badge } from "@/app/components/ui/badge"
import { format } from "date-fns"
import { TimeBlock } from "@/types/time-block"

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

  React.useEffect(() => {
    setEditedBlock(block ? { ...block } : null)
  }, [block])

  if (!editedBlock) return null

  const totalTime = editedBlock.classification?.applications?.reduce((sum, app) => sum + app.timeSpent, 0) || 0

  const handleInputChange = (field: keyof TimeBlock, value: any) => {
    setEditedBlock((prev) => {
      if (!prev) return null
      return {
        ...prev,
        [field]: value,
      }
    })
  }

  const handleClassificationChange = (field: keyof typeof editedBlock.classification, value: any) => {
    setEditedBlock((prev) => {
      if (!prev) return null
      return {
        ...prev,
        classification: {
          ...prev.classification,
          [field]: value,
        }
      }
    })
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins}m`
    return mins === 0 ? `${hours}h` : `${hours}h ${mins}m`
  }

  return (
    <Dialog open={!!block} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            {categoryIcons[editedBlock.classification.category.toLowerCase()]}
            Edit Time Block
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="task_label">Title</Label>
              <Input
                id="task_label"
                value={editedBlock.task_label || ''}
                onChange={(e) => handleInputChange("task_label", e.target.value)}
                className="font-medium"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={editedBlock.description || ''}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Enter description"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={editedBlock.classification.category.toLowerCase()} 
                onValueChange={(value) => handleClassificationChange("category", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Select a category</SelectLabel>
                    {Object.entries(categoryIcons).map(([category, icon]) => (
                      <SelectItem key={category} value={category}>
                        <div className="flex items-center gap-2">
                          <span>{icon}</span>
                          <span className="capitalize">{category}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="grid gap-1">
                <Label>Billable Time</Label>
                <span className="text-sm text-muted-foreground">Should this time be billed to the client?</span>
              </div>
              <Switch
                checked={editedBlock.is_billable}
                onCheckedChange={(checked) => handleInputChange("is_billable", checked)}
              />
            </div>

            <div className="grid gap-2">
              <Label>Time & Duration</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Start Time</div>
                  <div className="font-medium">
                    {format(new Date(editedBlock.start_time), "h:mm a")}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">End Time</div>
                  <div className="font-medium">
                    {format(new Date(editedBlock.end_time), "h:mm a")}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {editedBlock.classification?.applications && editedBlock.classification.applications.length > 0 && (
            <>
              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Application Usage
                </h4>
                <div className="space-y-4">
                  {editedBlock.classification.applications.map((app) => (
                    <div key={app.name} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <Badge variant="outline">{app.name}</Badge>
                        <div className="flex items-center gap-4">
                          <span className="tabular-nums w-16">{formatTime(app.timeSpent)}</span>
                          <span className="text-muted-foreground w-12 text-right">
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
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Total tracked time: {formatTime(totalTime)}</span>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end gap-4">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="hover:bg-violet-50 dark:hover:bg-violet-900/10 hover:text-violet-600 dark:hover:text-violet-300"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => onUpdate(editedBlock)}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


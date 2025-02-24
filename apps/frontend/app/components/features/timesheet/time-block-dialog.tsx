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
import { TimeBlock, categoryColors } from "@/app/types/time-block"

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

  React.useEffect(() => {
    setEditedBlock(block)
  }, [block])

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

  return (
    <Dialog open={!!block} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            {categoryIcons[editedBlock.ui?.classification?.category || 'admin']}
            Edit Time Block
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={editedBlock.time_block_label}
                onChange={(e) => handleInputChange("time_block_label", e.target.value)}
                className="font-medium"
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

            <div className="space-y-2">
              <Label>Work Description</Label>
              <div className="rounded-lg border bg-muted/50">
                {editedBlock.description?.split('\n').map((point, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 group border-b last:border-b-0">
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

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="billable"
                  checked={editedBlock.is_billable}
                  onCheckedChange={(checked) => handleInputChange("is_billable", checked)}
                />
                <Label htmlFor="billable">Billable</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="in-scope"
                  checked={editedBlock.in_scope}
                  onCheckedChange={(checked) => handleInputChange("in_scope", checked)}
                />
                <Label htmlFor="in-scope">In Scope</Label>
              </div>
            </div>
          </div>

          {editedBlock.ui?.classification?.applications && editedBlock.ui.classification.applications.length > 0 && (
            <>
              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Application Usage
                </h4>
                <div className="space-y-4">
                  {editedBlock.ui.classification.applications.map((app) => (
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

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={() => onUpdate(editedBlock)}>
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


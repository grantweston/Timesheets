"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Clock, Trash2 } from "lucide-react"
import { Badge } from "./ui/badge"
import { format } from "date-fns"
import type { TimeBlock } from "@/types/time-block"

interface TimeBlockDialogProps {
  block: TimeBlock | null
  onClose: () => void
  onUpdate: (block: TimeBlock) => void
}

const categoryIcons: Record<TimeBlock["category"], React.ReactNode> = {
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

  const totalTime = editedBlock.applications?.reduce((sum, app) => sum + app.timeSpent, 0) || 0

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

    setEditedBlock((prev) => {
      if (!prev) return null
      return {
        ...prev,
        description: [...(prev.description || []), newDescription.trim()],
      }
    })
    setNewDescription("")
  }

  const handleRemoveDescription = (index: number) => {
    setEditedBlock((prev) => {
      if (!prev) return null
      const newDescription = [...(prev.description || [])]
      newDescription.splice(index, 1)
      return {
        ...prev,
        description: newDescription,
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
            {categoryIcons[editedBlock.category]}
            Edit Time Block
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={editedBlock.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="font-medium"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="client">Client</Label>
              <Input
                id="client"
                value={editedBlock.client || ""}
                onChange={(e) => handleInputChange("client", e.target.value)}
                placeholder="Enter client name"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select value={editedBlock.category} onValueChange={(value) => handleInputChange("category", value)}>
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
                checked={editedBlock.billable}
                onCheckedChange={(checked) => handleInputChange("billable", checked)}
              />
            </div>

            <div className="grid gap-2">
              <Label>Time & Duration</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Start Time</div>
                  <div className="font-medium">
                    {format(new Date().setHours(Math.floor(editedBlock.start), (editedBlock.start % 1) * 60), "h:mm a")}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Duration</div>
                  <div className="font-medium">{editedBlock.duration.toFixed(2)} hours</div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Work Description</Label>
              <div className="rounded-lg border bg-muted/50 divide-y">
                {editedBlock.description?.map((point, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 group">
                    <span className="text-primary mt-1">•</span>
                    <span className="flex-1 text-sm">{point}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveDescription(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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

          {editedBlock.applications && editedBlock.applications.length > 0 && (
            <>
              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Application Usage
                </h4>
                <div className="space-y-4">
                  {editedBlock.applications.map((app) => (
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


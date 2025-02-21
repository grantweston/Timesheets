"use client"

import { motion } from "framer-motion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useState } from "react"

const activities = [
  {
    id: "internal-meetings",
    title: "Internal Meetings",
    description: "Team meetings and company updates"
  },
  {
    id: "admin-work",
    title: "Administrative Work",
    description: "Emails, scheduling, and organization"
  },
  {
    id: "training",
    title: "Training & Learning",
    description: "Professional development activities"
  }
]

const thresholdOptions = [
  { value: "2", label: "2 minutes" },
  { value: "5", label: "5 minutes" },
  { value: "10", label: "10 minutes" },
  { value: "15", label: "15 minutes" }
]

const breakDurationOptions = [
  { value: "15", label: "15 minutes" },
  { value: "30", label: "30 minutes" },
  { value: "45", label: "45 minutes" },
  { value: "60", label: "1 hour" }
]

export default function NonBillablePage() {
  const [enabledActivities, setEnabledActivities] = useState<string[]>([])
  const [idleThreshold, setIdleThreshold] = useState("5")
  const [breakDuration, setBreakDuration] = useState("30")

  const toggleActivity = (activityId: string) => {
    setEnabledActivities(prev => 
      prev.includes(activityId)
        ? prev.filter(id => id !== activityId)
        : [...prev, activityId]
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <div className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label>Idle Time Threshold</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Time without activity before marking as non-billable
            </p>
            <Select 
              value={idleThreshold} 
              onValueChange={setIdleThreshold}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select threshold" />
              </SelectTrigger>
              <SelectContent>
                {thresholdOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Default Break Duration</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Standard duration for breaks and lunch
            </p>
            <Select 
              value={breakDuration} 
              onValueChange={setBreakDuration}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {breakDurationOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Non-Billable Activities</h3>
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.1 }}
                className="flex items-center justify-between space-x-2 rounded-lg border p-4"
              >
                <div className="space-y-0.5">
                  <Label>{activity.title}</Label>
                  <p className="text-sm text-muted-foreground">
                    {activity.description}
                  </p>
                </div>
                <Switch
                  checked={enabledActivities.includes(activity.id)}
                  onCheckedChange={() => toggleActivity(activity.id)}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}


'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Badge } from "@/app/components/ui/badge"
import { Separator } from "@/app/components/ui/separator"
import { Circle, CheckCircle2, Clock, AlertCircle } from "lucide-react"

const timelineItems = [
  {
    project: "Website Redesign",
    event: "Design Review",
    date: "Today, 2:00 PM",
    status: "upcoming",
    description: "Review new homepage designs with the client"
  },
  {
    project: "Mobile App Dev",
    event: "Sprint Demo",
    date: "Today, 4:00 PM",
    status: "upcoming",
    description: "Present sprint progress to stakeholders"
  },
  {
    project: "API Integration",
    event: "Testing Complete",
    date: "Yesterday",
    status: "completed",
    description: "All integration tests passed successfully"
  },
  {
    project: "Website Redesign",
    event: "Content Migration",
    date: "2 days ago",
    status: "completed",
    description: "Migrated content to new CMS"
  },
  {
    project: "Mobile App Dev",
    event: "Backend Issue",
    date: "3 days ago",
    status: "issue",
    description: "Authentication service intermittent failures"
  }
]

const statusIcons = {
  upcoming: Clock,
  completed: CheckCircle2,
  issue: AlertCircle
}

const statusColors = {
  upcoming: "text-blue-500",
  completed: "text-green-500",
  issue: "text-red-500"
}

export function ProjectTimeline() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Project Timeline</h2>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-500" />
            <span>Upcoming</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span>Issues</span>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
        
        <div className="space-y-8 relative">
          {timelineItems.map((item, index) => {
            const StatusIcon = statusIcons[item.status]
            return (
              <div key={index} className="relative pl-8">
                <div className="absolute left-0 top-2 flex items-center justify-center">
                  <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-background border">
                    <StatusIcon className={`h-4 w-4 ${statusColors[item.status]}`} />
                  </div>
                </div>
                
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{item.event}</CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{item.project}</span>
                          <Circle className="h-1 w-1 fill-current" />
                          <span>{item.date}</span>
                        </div>
                      </div>
                      <Badge 
                        variant={
                          item.status === "completed" 
                            ? "default" 
                            : item.status === "issue" 
                            ? "destructive" 
                            : "secondary"
                        }
                      >
                        {item.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
} 
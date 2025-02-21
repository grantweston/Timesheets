'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Progress } from "@/app/components/ui/progress"
import { Badge } from "@/app/components/ui/badge"

const teamMembers = [
  {
    name: "John Developer",
    role: "Frontend Engineer",
    avatar: "/avatars/john.png",
    initials: "JD",
    projects: ["Website Redesign", "Mobile App"],
    hoursThisWeek: 38.5,
    utilization: 96.25,
    status: "active"
  },
  {
    name: "Sarah Manager",
    role: "Project Manager",
    avatar: "/avatars/sarah.png",
    initials: "SM",
    projects: ["Website Redesign", "API Integration"],
    hoursThisWeek: 42,
    utilization: 105,
    status: "active"
  },
  {
    name: "Mike Engineer",
    role: "Backend Engineer",
    avatar: "/avatars/mike.png",
    initials: "ME",
    projects: ["API Integration"],
    hoursThisWeek: 35,
    utilization: 87.5,
    status: "active"
  }
]

export function TeamOverview() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {teamMembers.map((member) => (
          <Card key={member.name}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback>{member.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">{member.name}</CardTitle>
                    <div className="text-sm text-muted-foreground">{member.role}</div>
                  </div>
                </div>
                <Badge 
                  variant={member.status === "active" ? "default" : "secondary"}
                  className="capitalize"
                >
                  {member.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Projects</div>
                  <div className="flex flex-wrap gap-2">
                    {member.projects.map((project) => (
                      <Badge key={project} variant="outline">
                        {project}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Hours This Week</span>
                    <span>{member.hoursThisWeek}h</span>
                  </div>
                  <Progress 
                    value={member.utilization} 
                    className="h-2"
                    indicatorClassName={
                      member.utilization > 100
                        ? "bg-yellow-500"
                        : member.utilization < 80
                        ? "bg-red-500"
                        : undefined
                    }
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Utilization</span>
                    <span>{member.utilization}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 
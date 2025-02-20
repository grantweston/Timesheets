"use client"

import * as React from "react"
import { Clock, DollarSign, MoreVertical, PieChart, Timer, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import type { TimeBlock } from "@/types/time-block"

// Mock data for projects
const allProjects = [
  {
    client: "Acme Corp",
    projects: [
      {
        id: 1,
        name: "Website Redesign",
        description: "Complete overhaul of company website",
        progress: 65,
        hoursLogged: 45.5,
        budget: 80,
        rate: 150,
        team: 3,
        status: "active",
        lastActive: "2 hours ago",
      },
      {
        id: 2,
        name: "Mobile App Development",
        description: "iOS and Android app development",
        progress: 30,
        hoursLogged: 24,
        budget: 120,
        rate: 150,
        team: 4,
        status: "active",
        lastActive: "1 hour ago",
      },
    ],
  },
  {
    client: "TechStart Inc",
    projects: [
      {
        id: 3,
        name: "Cloud Migration",
        description: "AWS infrastructure setup and migration",
        progress: 85,
        hoursLogged: 92,
        budget: 100,
        rate: 175,
        team: 2,
        status: "active",
        lastActive: "30 minutes ago",
      },
    ],
  },
  {
    client: "Global Solutions",
    projects: [
      {
        id: 4,
        name: "CRM Integration",
        description: "Custom CRM implementation and training",
        progress: 15,
        hoursLogged: 12,
        budget: 60,
        rate: 165,
        team: 2,
        status: "active",
        lastActive: "5 hours ago",
      },
    ],
  },
]

const categoryColors: Record<TimeBlock["category"], { bg: string; border: string }> = {
  meeting: { bg: "bg-violet-500/10", border: "border-violet-500/20" },
  development: { bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
  planning: { bg: "bg-violet-400/10", border: "border-violet-400/20" },
  break: { bg: "bg-violet-300/10", border: "border-violet-300/20" },
  admin: { bg: "bg-indigo-400/10", border: "border-indigo-400/20" },
}

export function ProjectList() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const search = searchParams.get("search") || ""
  const [filteredProjects, setFilteredProjects] = React.useState(allProjects)
  const [hoveredProject, setHoveredProject] = React.useState<number | null>(null)
  const [progress, setProgress] = React.useState<{ [key: number]: number }>({})

  React.useEffect(() => {
    // Filter projects based on search
    const filtered = allProjects
      .filter((client) => {
        const matchesClient = client.client.toLowerCase().includes(search.toLowerCase())
        const matchesProjects = client.projects.some(
          (project) =>
            project.name.toLowerCase().includes(search.toLowerCase()) ||
            project.description.toLowerCase().includes(search.toLowerCase()),
        )
        return matchesClient || matchesProjects
      })
      .map((client) => ({
        ...client,
        projects: client.projects.filter(
          (project) =>
            search === "" ||
            project.name.toLowerCase().includes(search.toLowerCase()) ||
            project.description.toLowerCase().includes(search.toLowerCase()),
        ),
      }))

    setFilteredProjects(filtered)
  }, [search])

  React.useEffect(() => {
    // Animate progress bars on mount
    allProjects.forEach((client) => {
      client.projects.forEach((project) => {
        setTimeout(() => {
          setProgress((prev) => ({
            ...prev,
            [project.id]: project.progress,
          }))
        }, 100 * project.id)
      })
    })
  }, [])

  const updateSearch = (value: string) => {
    const params = new URLSearchParams(searchParams?.toString())
    if (value) {
      params.set("search", value)
    } else {
      params.delete("search")
    }
    router.replace(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {filteredProjects.map((client, index) => (
        <div
          key={client.client}
          className={cn("space-y-4 animate-slide-up", search && "transition-all duration-300")}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{client.client}</h2>
            <Button 
              variant="ghost" 
              size="sm" 
              className="transition-colors hover:bg-violet-50 dark:hover:bg-violet-900/10 hover:text-violet-600 dark:hover:text-violet-300"
            >
              View All
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {client.projects.map((project) => (
              <Card
                key={project.id}
                className={cn(
                  "hover-card overflow-hidden transition-all duration-300",
                  search && "animate-scale-up",
                  hoveredProject === project.id && "ring-2 ring-violet-500/50 shadow-lg shadow-violet-500/10"
                )}
                onMouseEnter={() => setHoveredProject(project.id)}
                onMouseLeave={() => setHoveredProject(null)}
              >
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div className="space-y-1">
                    <CardTitle className="transition-colors hover:text-violet-600 dark:hover:text-violet-300">
                      {project.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="transition-colors hover:bg-violet-50 dark:hover:bg-violet-900/10 hover:text-violet-600 dark:hover:text-violet-300"
                      >
                        <span className="sr-only">Open menu</span>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="animate-scale-up">
                      <DropdownMenuItem>View details</DropdownMenuItem>
                      <DropdownMenuItem>View timesheet</DropdownMenuItem>
                      <DropdownMenuItem>Generate report</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span
                        className={cn(
                          "font-medium transition-colors",
                          progress[project.id] >= 100
                            ? "text-violet-600 dark:text-violet-400"
                            : hoveredProject === project.id
                              ? "text-violet-600 dark:text-violet-400"
                              : "text-foreground"
                        )}
                      >
                        {progress[project.id] || 0}%
                      </span>
                    </div>
                    <Progress 
                      value={progress[project.id] || 0} 
                      className="h-2 transition-all duration-500"
                    >
                      <div 
                        className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 transition-all" 
                        style={{ width: `${progress[project.id] || 0}%` }} 
                      />
                    </Progress>
                  </div>
                  <Separator className="bg-zinc-200 dark:bg-zinc-800" />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2 transition-colors hover:text-violet-600 dark:hover:text-violet-300">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        Hours Logged
                      </div>
                      <div className="font-medium">{project.hoursLogged}h</div>
                    </div>
                    <div className="space-y-2 transition-colors hover:text-violet-600 dark:hover:text-violet-300">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Timer className="h-4 w-4" />
                        Budget
                      </div>
                      <div className="font-medium">{project.budget}h</div>
                    </div>
                    <div className="space-y-2 transition-colors hover:text-violet-600 dark:hover:text-violet-300">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        Rate
                      </div>
                      <div className="font-medium">${project.rate}/h</div>
                    </div>
                    <div className="space-y-2 transition-colors hover:text-violet-600 dark:hover:text-violet-300">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        Team
                      </div>
                      <div className="font-medium">{project.team} people</div>
                    </div>
                  </div>
                  <Separator className="bg-zinc-200 dark:bg-zinc-800" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 transition-colors hover:text-violet-600 dark:hover:text-violet-300">
                      <PieChart className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Last active {project.lastActive}</span>
                    </div>
                    <Badge
                      variant={project.status === "active" ? "default" : "secondary"}
                      className={cn(
                        "transition-all hover:scale-105",
                        project.status === "active" && "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
                      )}
                    >
                      {project.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
      {filteredProjects.length === 0 && (
        <div className="text-center py-12 text-muted-foreground animate-fade-in">
          No projects found matching your search.
        </div>
      )}
    </div>
  )
}


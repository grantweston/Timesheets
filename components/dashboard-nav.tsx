"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Clock, FileText, LayoutDashboard, Settings, Briefcase } from "lucide-react"
import { cn } from "@/lib/utils"

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-2 p-4">
      <div className="space-y-1">
        {[
          {
            href: "/dashboard/overview",
            icon: LayoutDashboard,
            label: "Overview",
          },
          {
            href: "/dashboard/timesheet",
            icon: Clock,
            label: "Timesheet",
          },
          {
            href: "/dashboard/wip",
            icon: Briefcase,
            label: "Work in Progress",
          },
          {
            href: "/dashboard/invoices",
            icon: FileText,
            label: "Invoices",
          },
          {
            href: "/dashboard/settings",
            icon: Settings,
            label: "Settings",
          },
        ].map((item) => (
          <Button
            key={item.href}
            variant="ghost"
            className={cn(
              "w-full justify-start transition-all hover:bg-violet-50 dark:hover:bg-violet-900/10",
              pathname === item.href && "bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/30",
            )}
            asChild
          >
            <Link href={item.href} className="flex items-center gap-2">
              <item.icon className={cn(
                "h-4 w-4",
                pathname === item.href ? "text-violet-600 dark:text-violet-400" : "text-muted-foreground"
              )} />
              <span className={cn(
                pathname === item.href ? "font-medium" : "text-muted-foreground"
              )}>
                {item.label}
              </span>
            </Link>
          </Button>
        ))}
      </div>
    </nav>
  )
}


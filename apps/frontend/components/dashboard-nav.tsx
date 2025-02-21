"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Clock, FileText, LayoutDashboard, Settings, Briefcase } from "lucide-react"
import { cn } from "@/lib/utils"

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="hidden w-[220px] flex-col md:flex lg:w-[240px]">
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
            href: "/invoices",
            icon: FileText,
            label: "Invoices",
          },
          {
            href: "/settings",
            icon: Settings,
            label: "Settings",
          },
        ].map((item) => (
          <Button
            key={item.href}
            variant="ghost"
            className={cn(
              "w-full justify-start transition-all hover:scale-105",
              pathname === item.href && "bg-primary/10 text-primary hover:bg-primary/20",
            )}
            asChild
          >
            <Link href={item.href}>
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </Link>
          </Button>
        ))}
      </div>
    </nav>
  )
}


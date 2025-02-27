'use client'

import { Button } from "@/app/components/ui/button"
import { Card } from "@/app/components/ui/card"
import { PlusCircle, Clock, FileText, BarChart, Settings } from "lucide-react"
import Link from "next/link"

export function QuickActions() {
  const actions = [
    {
      label: 'Track Time',
      icon: <Clock className="h-4 w-4" />,
      href: '/dashboard/timesheet',
    },
    {
      label: 'New Invoice',
      icon: <FileText className="h-4 w-4" />,
      href: '/dashboard/invoices/new',
    },
    {
      label: 'Add Client',
      icon: <PlusCircle className="h-4 w-4" />,
      href: '/dashboard/clients/new',
    },
    {
      label: 'Reports',
      icon: <BarChart className="h-4 w-4" />,
      href: '/dashboard/reports',
    },
    {
      label: 'Settings',
      icon: <Settings className="h-4 w-4" />,
      href: '/dashboard/settings',
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {actions.map((action, index) => (
        <Link href={action.href} key={index}>
          <Card className="flex flex-col items-center justify-center py-4 h-full cursor-pointer transition-colors border-[#f5f2f9] bg-[#f9f8fc] hover:bg-[#f5f2f9] dark:bg-violet-900/5 dark:hover:bg-violet-900/10">
            <div className="text-violet-600 mb-2">
              {action.icon}
            </div>
            <span className="text-xs text-violet-700 font-medium">{action.label}</span>
          </Card>
        </Link>
      ))}
    </div>
  )
} 
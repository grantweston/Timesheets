'use client'

import { Card, CardContent } from "@/app/components/ui/card"

// Sample data focused on billable/non-billable metrics
const billingData = [
  { 
    label: 'Billable Utilization', 
    value: 67, 
    description: '27.0h of 40.5h total (67%)',
    trend: 'up',
    color: 'bg-violet-500'
  },
  { 
    label: 'Billable Rate', 
    value: 72, 
    description: 'Average $72/hour across clients',
    trend: 'neutral',
    color: 'bg-violet-500'
  },
  { 
    label: 'Weekly Target Progress', 
    value: 81, 
    description: '27.0h of 33.0h billable target',
    trend: 'up',
    color: 'bg-violet-500'
  },
  { 
    label: 'Work-Life Balance', 
    value: 92, 
    description: 'Only 3.5h of non-work time logged',
    trend: 'down',
    color: 'bg-violet-500'
  }
]

export function BillingMetrics() {
  return (
    <div className="space-y-6">
      {billingData.map((item, index) => (
        <div key={index} className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="text-sm font-medium">{item.label}</div>
            <div className="flex items-center">
              <span className="text-sm font-semibold mr-1">
                {item.label === 'Billable Rate' ? `$${item.value}` : `${item.value}%`}
              </span>
              {item.trend === 'up' && (
                <span className="text-violet-500 text-sm">↑</span>
              )}
              {item.trend === 'down' && (
                <span className="text-red-500 text-sm">↓</span>
              )}
            </div>
          </div>
          
          <div className="relative w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`absolute top-0 left-0 h-full ${item.color} transition-all`} 
              style={{ width: `${item.value}%` }}
            />
          </div>
          
          <div className="text-xs text-muted-foreground">
            {item.description}
          </div>
        </div>
      ))}
    </div>
  )
} 
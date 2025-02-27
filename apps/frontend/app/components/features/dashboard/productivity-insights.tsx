'use client'

import { Card, CardContent } from "@/app/components/ui/card"

// Sample data focused on billable/non-billable metrics
const billingData = [
  { 
    label: 'Billable Utilization', 
    value: 67, 
    description: '27.0h of 40.5h total (67%)',
    trend: 'up',
    color: 'bg-green-500'
  },
  { 
    label: 'Billable Rate', 
    value: 72, 
    description: 'Average $72/hour across clients',
    trend: 'neutral',
    color: 'bg-blue-500'
  },
  { 
    label: 'Weekly Target Progress', 
    value: 81, 
    description: '27.0h of 33.0h billable target',
    trend: 'up',
    color: 'bg-purple-500'
  },
  { 
    label: 'Work-Life Balance', 
    value: 92, 
    description: 'Only 3.5h of non-work time logged',
    trend: 'down',
    color: 'bg-orange-500'
  }
]

export function BillingMetrics() {
  return (
    <div className="space-y-4">
      {billingData.map((item, index) => (
        <Card key={index} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="font-medium">{item.label}</div>
              <div className="text-sm font-semibold">
                {item.label === 'Billable Rate' ? `$${item.value}` : `${item.value}%`}
                {item.trend === 'up' && (
                  <span className="text-green-500 ml-1">↑</span>
                )}
                {item.trend === 'down' && (
                  <span className="text-red-500 ml-1">↓</span>
                )}
              </div>
            </div>
            <div className="relative w-full h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className={`absolute top-0 left-0 h-full ${item.color} transition-all`} 
                style={{ width: `${item.value}%` }}
              />
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              {item.description}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 
'use client'

import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

// Sample data - would be replaced with actual data from API
const sampleData = [
  { name: 'Billable', value: 27.0, color: '#22c55e' }, // Green
  { name: 'Non-Billable', value: 10.0, color: '#3b82f6' }, // Blue
  { name: 'Non-Work', value: 3.5, color: '#6b7280' }, // Gray
]

export function TimeDistribution() {
  const [data, setData] = useState(sampleData)
  const [isLoading, setIsLoading] = useState(false)

  // In a real implementation, you would fetch actual data here
  useEffect(() => {
    // Example of how you would fetch real data:
    // const fetchData = async () => {
    //   setIsLoading(true)
    //   try {
    //     const response = await fetch('/api/time-blocks/time-distribution')
    //     const data = await response.json()
    //     setData(transformApiDataToChartData(data))
    //   } catch (error) {
    //     console.error('Error fetching time distribution:', error)
    //   } finally {
    //     setIsLoading(false)
    //   }
    // }
    // 
    // fetchData()
  }, [])

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading chart data...</div>
  }

  const totalHours = data.reduce((sum, item) => sum + item.value, 0)
  const billablePercentage = Math.round((data[0].value / totalHours) * 100)

  return (
    <div className="h-72 w-full">
      <div className="text-center mb-2">
        <div className="text-2xl font-bold">{totalHours.toFixed(1)}h</div>
        <p className="text-xs text-muted-foreground">{billablePercentage}% billable time</p>
      </div>
      <ResponsiveContainer width="100%" height="80%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            label={({ name, value, percent }) => `${name}: ${value}h (${(percent * 100).toFixed(0)}%)`}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => [`${value}h`, 'Hours']}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
} 
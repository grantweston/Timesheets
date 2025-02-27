'use client'

import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

// Sample data - would be replaced with actual data from API
const sampleData = [
  { name: 'Billable', value: 27.0, color: '#8b5cf6' }, // Violet
  { name: 'Non-Billable', value: 10.0, color: '#9ca3af' }, // Grey
  { name: 'Non-Work', value: 3.5, color: '#ef4444' }, // Red
]

// Custom legend component that matches the design
const CustomizedLegend = (props: any) => {
  const { payload } = props;
  
  return (
    <ul className="flex flex-wrap gap-4 justify-center text-xs mt-4">
      {payload.map((entry: any, index: number) => (
        <li key={`item-${index}`} className="flex items-center">
          <span 
            className="inline-block w-3 h-3 rounded-full mr-1"
            style={{ backgroundColor: entry.color }}
          />
          <span>{entry.value}</span>
        </li>
      ))}
    </ul>
  );
};

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
    <div className="h-[220px] w-full">
      <div className="text-center mb-2">
        <div className="text-3xl font-semibold">{totalHours.toFixed(1)}h</div>
        <p className="text-sm text-muted-foreground">{billablePercentage}% billable time</p>
      </div>
      <ResponsiveContainer width="100%" height="80%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            strokeWidth={0}
            label={false}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => [`${value}h`, 'Hours']}
            contentStyle={{ 
              backgroundColor: 'white', 
              borderColor: 'rgba(139, 92, 246, 0.1)',
              borderRadius: '0.375rem',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
            }}
          />
          <Legend 
            content={<CustomizedLegend />}
            verticalAlign="bottom"
            align="center"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
} 
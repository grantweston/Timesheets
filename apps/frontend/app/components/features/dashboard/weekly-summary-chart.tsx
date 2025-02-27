'use client'

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

// Sample data structured around billable, non-billable, and non-work categories
const sampleData = [
  { day: 'Mon', Billable: 5.5, 'Non-Billable': 2.0, 'Non-Work': 0.5 },
  { day: 'Tue', Billable: 6.0, 'Non-Billable': 1.5, 'Non-Work': 0.5 },
  { day: 'Wed', Billable: 4.5, 'Non-Billable': 2.5, 'Non-Work': 1.0 },
  { day: 'Thu', Billable: 5.0, 'Non-Billable': 2.0, 'Non-Work': 0.5 },
  { day: 'Fri', Billable: 5.5, 'Non-Billable': 1.5, 'Non-Work': 1.0 },
  { day: 'Sat', Billable: 0.5, 'Non-Billable': 0.5, 'Non-Work': 0.0 },
  { day: 'Sun', Billable: 0.0, 'Non-Billable': 0.0, 'Non-Work': 0.0 },
]

// Custom legend that matches the design in the screenshot
const CustomizedLegend = (props: any) => {
  const { payload } = props;
  
  return (
    <ul className="flex flex-wrap gap-4 justify-center text-xs mt-2">
      {payload.map((entry: any, index: number) => (
        <li key={`item-${index}`} className="flex items-center">
          <span 
            className="inline-block w-3 h-3 mr-1"
            style={{ backgroundColor: entry.color }}
          />
          <span>{entry.value}</span>
        </li>
      ))}
    </ul>
  );
};

export function WeeklySummaryChart() {
  const [chartData, setChartData] = useState(sampleData)
  const [isLoading, setIsLoading] = useState(false)

  // In a real implementation, you would fetch actual data here
  useEffect(() => {
    // Example of how you would fetch real data:
    // const fetchData = async () => {
    //   setIsLoading(true)
    //   try {
    //     const response = await fetch('/api/time-blocks/weekly-summary')
    //     const data = await response.json()
    //     setChartData(transformApiDataToChartData(data))
    //   } catch (error) {
    //     console.error('Error fetching weekly summary:', error)
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

  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
          <XAxis 
            dataKey="day" 
            axisLine={false} 
            tickLine={false}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            tickFormatter={(value) => `${value}h`}
            domain={[0, 'auto']}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11 }}
          />
          <Tooltip 
            formatter={(value) => [`${value}h`, '']}
            labelFormatter={(label) => `${label}`}
            contentStyle={{ 
              backgroundColor: 'white', 
              borderColor: 'rgba(34, 197, 94, 0.1)',
              borderRadius: '0.375rem',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
            }}
          />
          <Legend content={<CustomizedLegend />} />
          <Bar dataKey="Billable" stackId="a" fill="rgba(34, 197, 94, 0.75)" radius={[4, 4, 0, 0]} /> {/* Green */}
          <Bar dataKey="Non-Billable" stackId="a" fill="rgba(156, 163, 175, 0.6)" radius={[0, 0, 0, 0]} /> {/* Grey */}
          <Bar dataKey="Non-Work" stackId="a" fill="rgba(239, 68, 68, 0.6)" radius={[0, 0, 0, 0]} /> {/* Red */}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
} 
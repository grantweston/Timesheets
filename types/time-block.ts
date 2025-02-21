export interface TimeBlock {
  id: number
  start: number
  duration: number
  title: string
  client: string
  billable: boolean
  category: "meeting" | "development" | "planning" | "break" | "admin"
  description?: string[]
  applications?: {
    name: string
    timeSpent: number
  }[]
} 
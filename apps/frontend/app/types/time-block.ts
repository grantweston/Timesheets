export interface TimeBlock {
  id: string
  clerk_id: string
  start_time: string
  end_time: string
  task_label: string
  description?: string
  color?: string
  is_recurring?: boolean
  recurrence_pattern?: string
  is_billable: boolean
  classification?: {
    category?: string
    applications?: {
      name: string
      timeSpent: number
    }[]
  }
  created_at?: string
  updated_at?: string
} 
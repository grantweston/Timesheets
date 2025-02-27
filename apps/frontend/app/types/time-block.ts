export interface Client {
  client_id: string
  name: string
  billing_rate: string
  email: string
  status: string
}

export interface TimeBlock {
  // Core fields (matching backend exactly)
  time_block_id: string
  clerk_user_id: string
  client_id: string
  start_time: string
  end_time: string
  description: string | null
  time_block_label: string
  is_billable: boolean
  in_scope: boolean
  created_at: string
  updated_at: string | null

  // Join fields
  client?: Client

  // UI-specific fields in a separate interface
  ui?: {
    color?: string
    is_recurring?: boolean
    recurrence_pattern?: string
    classification?: {
      category?: string
      applications?: {
        name: string
        timeSpent: number
      }[]
    }
  }
}

// Categories and their styling
export const categoryColors: Record<string, { bg: string; border: string }> = {
  meeting: { bg: "bg-blue-500/10", border: "border-blue-500/20" },
  development: { bg: "bg-green-500/10", border: "border-green-500/20" },
  planning: { bg: "bg-purple-500/10", border: "border-purple-500/20" },
  break: { bg: "bg-orange-500/10", border: "border-orange-500/20" },
  admin: { bg: "bg-gray-500/10", border: "border-gray-500/20" },
};

// Helper functions for transformations
export function transformDatabaseToUI(dbBlock: TimeBlock): TimeBlock {
  return {
    ...dbBlock,
    ui: {
      color: categoryColors[inferCategoryFromLabel(dbBlock.time_block_label)]?.bg || categoryColors.admin.bg,
      is_recurring: false,
      classification: {
        category: inferCategoryFromLabel(dbBlock.time_block_label),
        applications: []
      }
    }
  }
}

export function transformUIToDatabase(uiBlock: TimeBlock): Omit<TimeBlock, 'ui' | 'client'> {
  const {
    time_block_id,
    clerk_user_id,
    client_id,
    start_time,
    end_time,
    description,
    time_block_label,
    is_billable,
    in_scope,
    created_at,
    updated_at
  } = uiBlock;

  return {
    time_block_id,
    clerk_user_id,
    client_id,
    start_time,
    end_time,
    description,
    time_block_label,
    is_billable,
    in_scope,
    created_at,
    updated_at
  };
}

// Helper function to infer category from label
function inferCategoryFromLabel(label: string): string {
  const lowercaseLabel = label.toLowerCase();
  if (lowercaseLabel.includes('meeting') || lowercaseLabel.includes('sync')) return 'meeting';
  if (lowercaseLabel.includes('dev') || lowercaseLabel.includes('code')) return 'development';
  if (lowercaseLabel.includes('plan')) return 'planning';
  if (lowercaseLabel.includes('break') || lowercaseLabel.includes('lunch')) return 'break';
  return 'admin';
} 
export interface TimeBlock {
  id: string;                                    // uuid
  user_id: string;                              // uuid NOT NULL
  start_time: string;                           // timestamp with time zone NOT NULL
  end_time: string;                             // timestamp with time zone NOT NULL
  task_label: string | null;                    // text
  description: string | null;                   // text
  color: string | null;                         // text
  is_recurring: boolean;                        // boolean DEFAULT false
  recurrence_pattern: string | null;            // text
  is_billable: boolean;                         // boolean DEFAULT true
  classification: {                             // jsonb
    category: string;                           // DEFAULT development
    confidence: number;                         // DEFAULT 1.0
    applications?: Array<{
      name: string;
      timeSpent: number;
    }>;
  };
  created_at: string | null;                    // timestamp with time zone DEFAULT now()
  updated_at: string | null;                    // timestamp with time zone DEFAULT now()
}

// Helper function to create a new TimeBlock with defaults
export function createDefaultTimeBlock(userId: string): Omit<TimeBlock, 'id'> {
  return {
    user_id: userId,
    start_time: new Date().toISOString(),
    end_time: new Date().toISOString(),
    task_label: null,
    description: null,
    color: null,
    is_recurring: false,
    recurrence_pattern: null,
    is_billable: true,
    classification: {
      category: 'development',
      confidence: 1.0
    },
    created_at: null,  // Will be set by DB
    updated_at: null   // Will be set by DB
  };
} 
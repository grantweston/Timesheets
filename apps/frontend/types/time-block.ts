// Database type (matches Supabase schema)
export interface TimeBlock {
  id: string;
  clerk_id: string;
  start_time: string;
  end_time: string;
  task_label: string;
  description: string | null;
  color: string | null;
  is_billable: boolean;
  is_recurring: boolean;
  recurrence_pattern: string | null;
  classification: {
    category: string;
    confidence: number;
    applications?: Array<{
      name: string;
      timeSpent: number;
    }>;
  };
  created_at: string;
  updated_at: string | null;
}

// Categories and their styling
export const categoryColors: Record<string, { bg: string; border: string }> = {
  meeting: { bg: "bg-blue-500/10", border: "border-blue-500/20" },
  development: { bg: "bg-green-500/10", border: "border-green-500/20" },
  planning: { bg: "bg-purple-500/10", border: "border-purple-500/20" },
  break: { bg: "bg-orange-500/10", border: "border-orange-500/20" },
  admin: { bg: "bg-gray-500/10", border: "border-gray-500/20" },
};

// Helper function to transform DB type to UI type
export function transformBlockForUI(block: TimeBlock): TimeBlockUI {
  const startDate = new Date(block.start_time);
  const endDate = new Date(block.end_time);
  
  // Convert to hours (e.g., 9.5 for 9:30)
  const start = startDate.getHours() + (startDate.getMinutes() / 60);
  
  // Calculate duration in hours
  const duration = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);

  return {
    id: parseInt(block.id, 16) % 1000000, // Convert UUID to a smaller number
    start,
    duration,
    title: block.task_label,
    client: "", // We could add this to the DB schema later if needed
    billable: block.is_billable,
    category: block.classification.category.toLowerCase(),
    description: block.description ? [block.description] : [],
    applications: block.classification.applications || [],
  };
}

// Helper function to transform UI type to DB type
export function transformBlockForDB(block: Partial<TimeBlockUI>, clerkId: string): Omit<TimeBlock, 'id' | 'created_at' | 'updated_at'> {
  const startDate = new Date();
  startDate.setHours(Math.floor(block.start!));
  startDate.setMinutes((block.start! % 1) * 60);
  
  const endDate = new Date(startDate);
  endDate.setTime(startDate.getTime() + (block.duration! * 60 * 60 * 1000));

  return {
    clerk_id: clerkId,
    start_time: startDate.toISOString(),
    end_time: endDate.toISOString(),
    task_label: block.title!,
    description: block.description?.join('\n') || null,
    color: null,
    is_billable: block.billable!,
    is_recurring: false,
    recurrence_pattern: null,
    classification: {
      category: block.category!,
      confidence: 1.0,
      applications: block.applications
    }
  };
} 
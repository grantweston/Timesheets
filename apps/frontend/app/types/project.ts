export interface Project {
  id: string;                    // uuid NOT NULL DEFAULT uuid_generate_v4()
  organization_id: string | null; // uuid
  name: string;                  // text NOT NULL
  client_name: string | null;    // text
  billing_rate: number | null;   // numeric
  status: string;                // text DEFAULT 'active'
  created_at: string | null;     // timestamp with time zone DEFAULT now()
  updated_at: string | null;     // timestamp with time zone DEFAULT now()
}

// Helper function to create a new Project with defaults
export function createDefaultProject(): Omit<Project, 'id'> {
  return {
    organization_id: null,
    name: '',
    client_name: null,
    billing_rate: null,
    status: 'active',
    created_at: null,  // Will be set by DB
    updated_at: null   // Will be set by DB
  };
} 
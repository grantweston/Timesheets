export interface Organization {
  id: string;                // uuid NOT NULL DEFAULT uuid_generate_v4()
  name: string;             // text NOT NULL
  created_at: string | null; // timestamp with time zone DEFAULT now()
  updated_at: string | null; // timestamp with time zone DEFAULT now()
}

// Helper function to create a new Organization with defaults
export function createDefaultOrganization(): Omit<Organization, 'id'> {
  return {
    name: '',
    created_at: null,  // Will be set by DB
    updated_at: null   // Will be set by DB
  };
} 
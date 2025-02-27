export interface User {
  id: string;                    // uuid NOT NULL DEFAULT gen_random_uuid()
  clerk_user_id: string;         // text NOT NULL
  email: string | null;          // text
  display_name: string | null;   // text
  is_desktop_setup: boolean;     // boolean DEFAULT false
  created_at: string | null;     // timestamp without time zone DEFAULT now()
  organization_id: string | null; // uuid
}

// Helper function to create a new User with defaults
export function createDefaultUser(clerkUserId: string): Omit<User, 'id'> {
  return {
    clerk_user_id: clerkUserId,
    email: null,
    display_name: null,
    is_desktop_setup: false,
    created_at: null,  // Will be set by DB
    organization_id: null
  };
} 
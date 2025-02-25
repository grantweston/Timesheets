import { createClient } from '@supabase/supabase-js';
import type { NextRequest } from 'next/server';

/**
 * Creates an authenticated Supabase client that can be used in API routes
 * This bypasses RLS by using the clerk_user_id in the WHERE clause
 */
export async function getAuthenticatedClient(req: NextRequest) {
  // Get the Clerk user ID from the headers
  const clerkUserId = req.headers.get('x-clerk-user-id');
  
  if (!clerkUserId) {
    throw new Error('Unauthorized: No Clerk user ID found in request headers');
  }
  
  // Create a Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  return {
    supabase,
    clerkUserId
  };
}

/**
 * Example usage in an API route:
 * 
 * import { getAuthenticatedClient } from '@/lib/supabase-auth';
 * 
 * export async function GET(req: NextRequest) {
 *   try {
 *     const { supabase, clerkUserId } = await getAuthenticatedClient(req);
 *     
 *     // Query data using the Clerk user ID directly
 *     const { data, error } = await supabase
 *       .from('time_blocks')
 *       .select('*')
 *       .eq('clerk_user_id', clerkUserId);
 *       
 *     // Handle response...
 *   } catch (error) {
 *     // Handle error...
 *   }
 * }
 */ 
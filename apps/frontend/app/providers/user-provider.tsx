'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';

// Define the context type
interface UserContext {
  supabaseUser: any;
  isLoading: boolean;
  error: string | null;
}

// Create the context with default values
const UserContext = createContext<UserContext>({
  supabaseUser: null,
  isLoading: true,
  error: null,
});

/**
 * Provider component that ensures a Supabase user exists for the authenticated Clerk user
 *
 * NOTE: This provider now serves as a fallback mechanism. The primary method for user creation
 * is through Clerk webhooks, which automatically create/update users in Supabase when events
 * occur in Clerk (user.created, user.updated, etc.). This provider ensures users are still
 * created even if webhooks are delayed or failed to process.
 */
export function UserProvider({ children }: { children: React.ReactNode }) {
  const { userId, isLoaded, isSignedIn } = useAuth();
  const [supabaseUser, setSupabaseUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Skip if Clerk auth is not loaded or user is not signed in
    if (!isLoaded || !isSignedIn || !userId) {
      setIsLoading(false);
      return;
    }

    const ensureSupabaseUser = async () => {
      try {
        console.log(
          '🔍 UserProvider: Ensuring Supabase user exists for Clerk user:',
          userId
        );
        setIsLoading(true);

        // Call the get-user API which will create a user if one doesn't exist
        // This acts as a fallback in case the Clerk webhook hasn't processed yet
        const response = await fetch('/api/auth/get-user');

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `API error (${response.status})`);
        }

        const data = await response.json();

        if (!data.user) {
          throw new Error('No user returned from API');
        }

        console.log('✅ UserProvider: Supabase user ensured:', data.user);
        setSupabaseUser(data.user);
        setError(null);
      } catch (err) {
        console.error('❌ UserProvider: Failed to ensure Supabase user:', err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setIsLoading(false);
      }
    };

    ensureSupabaseUser();
  }, [userId, isLoaded, isSignedIn]);

  return (
    <UserContext.Provider value={{ supabaseUser, isLoading, error }}>
      {children}
    </UserContext.Provider>
  );
}

/**
 * Hook to access user information from the UserContext
 */
export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

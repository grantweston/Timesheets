'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';

/**
 * Custom hook to ensure a user exists in Supabase for the current Clerk user
 * This hook can be used in any component where you need to ensure the user exists
 * before proceeding with operations that require a Supabase user.
 */
export function useEnsureSupabaseUser() {
  const { userId, isLoaded, isSignedIn } = useAuth();
  const [supabaseUser, setSupabaseUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only run when auth is loaded and user is signed in
    if (!isLoaded || !isSignedIn || !userId) {
      setIsLoading(false);
      return;
    }

    const ensureUser = async () => {
      try {
        console.log('🔍 Hook: Ensuring Supabase user exists for Clerk user:', userId);
        setIsLoading(true);
        
        // Call the get-user API which will create a user if one doesn't exist
        const response = await fetch('/api/auth/get-user');
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to get/create user');
        }
        
        const data = await response.json();
        console.log('✅ Hook: Supabase user:', data.user);
        setSupabaseUser(data.user);
        setError(null);
      } catch (err) {
        console.error('❌ Hook: Error ensuring Supabase user:', err);
        setError(err instanceof Error ? err.message : String(err));
        setSupabaseUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    ensureUser();
  }, [userId, isLoaded, isSignedIn]);

  return { supabaseUser, isLoading, error };
} 
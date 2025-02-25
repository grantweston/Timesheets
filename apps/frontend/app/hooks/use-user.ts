'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';

// Define the User type
export type User = {
  id: string;
  email: string;
  display_name: string;
  created_at: string;
  updated_at: string;
  clerk_user_id: string;
  onboarded: boolean;
  clerk_sub_id: string | null;
  integration_statuses: {
    google_calendar?: {
      status: 'connected' | 'disconnected' | 'error';
      last_sync?: string;
      error?: string;
    };
    calendly?: {
      status: 'connected' | 'disconnected' | 'error';
      last_sync?: string;
      error?: string;
    };
  } | null;
};

export const useUser = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1500; // 1.5 seconds
    let retryCount = 0;

    const fetchUser = async () => {
      console.log('🔍 useUser: Fetching user data from API route');
      if (!isLoaded || !isSignedIn) {
        console.log('⏳ useUser: Auth not loaded or user not signed in yet, waiting...');
        setLoading(true);
        return;
      }

      try {
        console.log('🔍 useUser: Starting API fetch for user data');
        const response = await fetch('/api/auth/get-user');
        console.log(`✅ useUser: API response status: ${response.status}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ useUser: API error: ${response.status} - ${errorText}`);
          
          if (response.status === 404) {
            console.log('⚠️ useUser: User not found (404)');
            setUser(null);
            setLoading(false);
            return;
          }
          
          throw new Error(`API error: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log('✅ useUser: API data received:', data ? 'data exists' : 'data is null/empty');
        
        if (!data.user) {
          console.log('⚠️ useUser: No user data in API response');
          setUser(null);
          setLoading(false);
          return;
        }
        
        // Process the user data
        const userData = data.user;
        
        // Ensure integration_statuses has a default structure if null
        if (userData.integration_statuses === null) {
          userData.integration_statuses = {
            google_calendar: { status: 'disconnected' },
            calendly: { status: 'disconnected' }
          };
        }
        
        console.log('✅ useUser: Setting user state with data');
        setUser(userData);
        setError(null);
        setLoading(false);
      } catch (err: any) {
        console.error('❌ useUser: Error fetching user:', err);
        
        // Retry logic
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          console.log(`⏳ useUser: Retrying fetch (${retryCount}/${MAX_RETRIES}) in ${RETRY_DELAY}ms`);
          
          setTimeout(() => {
            fetchUser();
          }, RETRY_DELAY);
          return;
        }
        
        console.error(`❌ useUser: Max retries (${MAX_RETRIES}) reached, giving up`);
        setError(err instanceof Error ? err : new Error(String(err)));
        setLoading(false);
      }
    };

    if (isLoaded && isSignedIn) {
      fetchUser();
    } else if (isLoaded && !isSignedIn) {
      console.log('✅ useUser: User is not signed in, setting user to null');
      setUser(null);
      setLoading(false);
    }
  }, [isLoaded, isSignedIn]);

  return { user, loading, error };
}; 
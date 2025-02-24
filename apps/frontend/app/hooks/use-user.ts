'use client';

import { useEffect, useState } from 'react';
import { useSupabase } from '@/app/providers/supabase-provider';
import { useAuth } from '@clerk/nextjs';

interface IntegrationToken {
  access_token?: string;
  refresh_token?: string;
  expires_at?: string;
  [key: string]: any; // Allow for flexible token structure
}

interface Integration {
  connected: boolean;
  token: IntegrationToken | null;
}

interface IntegrationStatuses {
  outlook?: Integration;
  gmail?: Integration;
  docusign?: Integration;
  stripe?: Integration;
  quickbooks?: Integration;
}

interface User {
  id: string;
  clerk_user_id: string;
  email: string | null;
  display_name: string | null;
  timezone: string | null;
  integration_statuses: IntegrationStatuses;
  is_desktop_setup: boolean;
  created_at: string;
}

export function useUser() {
  const { supabase } = useSupabase();
  const { userId: clerkUserId, isLoaded: isClerkLoaded } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [lastAttemptTime, setLastAttemptTime] = useState(0);

  useEffect(() => {
    const fetchUser = async () => {
      console.log('=== fetchUser Start ===', {
        isClerkLoaded,
        clerkUserId,
        lastAttemptTime,
        currentTime: Date.now()
      });

      // Don't fetch until Clerk is loaded and we have a userId
      if (!isClerkLoaded || !clerkUserId) {
        console.log('Skipping fetch - Clerk not ready', { isClerkLoaded, clerkUserId });
        setLoading(true);
        return;
      }

      // Prevent rapid retries
      const now = Date.now();
      if (now - lastAttemptTime < 1000) {
        console.log('Skipping fetch - Too soon', { 
          timeSinceLastAttempt: now - lastAttemptTime 
        });
        return;
      }
      setLastAttemptTime(now);

      // Default integration statuses
      const defaultIntegrationStatuses: IntegrationStatuses = {
        outlook: { connected: false, token: null },
        gmail: { connected: false, token: null },
        docusign: { connected: false, token: null },
        stripe: { connected: false, token: null },
        quickbooks: { connected: false, token: null },
      };

      try {
        // First try our new function
        console.log('Attempting to fetch user with new RPC function...');
        const { data: rpcData, error: rpcError } = await supabase
          .rpc('get_user_with_transaction', { 
            p_clerk_user_id: clerkUserId 
          });
        
        console.log('RPC Result:', { 
          success: !rpcError, 
          hasData: !!rpcData,
          error: rpcError?.message,
          data: rpcData 
        });

        // If RPC fails, try the old way as fallback
        if (rpcError) {
          console.log('RPC failed, trying old method...');
          
          console.log('Setting transaction mode...');
          await supabase.rpc('set_transaction_mode', { mode: 'read write' });

          console.log('Fetching user data...');
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('clerk_user_id', clerkUserId)
            .single();

          console.log('Old method result:', {
            success: !error,
            hasData: !!data,
            error: error?.message
          });

          if (error) throw error;

          setUser({
            ...data,
            integration_statuses: data.integration_statuses || defaultIntegrationStatuses,
          });
        } else {
          // Use RPC data
          setUser({
            ...rpcData,
            integration_statuses: rpcData.integration_statuses || defaultIntegrationStatuses,
          });
        }
        
        setError(null);
      } catch (err: any) {
        console.error('Error in fetchUser:', err);
        setError({
          message: err.message || 'Failed to load user data',
          details: err.details,
          code: err.code
        });
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [clerkUserId, supabase, isClerkLoaded, lastAttemptTime]);

  return { user, loading, error };
} 
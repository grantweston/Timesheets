'use client';

import { useEffect, useState } from 'react';
import { useSupabase } from '@/app/providers/supabase-provider';
import { useAuth } from '@clerk/nextjs';

interface IntegrationToken {
  access_token?: string;
  refresh_token?: string;
  expires_at?: string;
  [key: string]: any;
}

interface IntegrationStatus {
  connected: boolean;
  token: IntegrationToken | null;
}

interface IntegrationStatuses {
  outlook: IntegrationStatus;
  gmail: IntegrationStatus;
  docusign: IntegrationStatus;
  stripe: IntegrationStatus;
  quickbooks: IntegrationStatus;
}

interface User {
  id: string;
  clerk_user_id: string;
  display_name?: string;
  email?: string;
  timezone?: string;
  integration_statuses: IntegrationStatuses;
  created_at?: string;
  updated_at?: string;
}

export function useUser() {
  console.log('=== USE USER HOOK START ===');
  const { supabase } = useSupabase();
  const { userId: clerkUserId } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('useUser Hook Initial State:', {
    hasSupabase: !!supabase,
    hasClerkUserId: !!clerkUserId,
    clerkUserIdValue: clerkUserId,
    currentUser: user,
    isLoading: loading,
    currentError: error,
    timestamp: new Date().toISOString()
  });

  useEffect(() => {
    const fetchUser = async () => {
      console.log('Fetching user data:', {
        clerkUserId,
        timestamp: new Date().toISOString()
      });

      if (!clerkUserId) {
        console.log('No Clerk user ID available, skipping fetch');
        setLoading(false);
        return;
      }

      try {
        console.log('Executing Supabase query...');
        const { data, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('clerk_user_id', clerkUserId)
          .single();

        console.log('Supabase query result:', {
          hasData: !!data,
          error: userError,
          timestamp: new Date().toISOString()
        });

        if (userError) {
          console.error('Error fetching user:', {
            code: userError.code,
            message: userError.message,
            details: userError.details,
            hint: userError.hint
          });
          throw userError;
        }

        // Ensure integration_statuses has default structure if null
        const defaultIntegrationStatuses: IntegrationStatuses = {
          outlook: { connected: false, token: null },
          gmail: { connected: false, token: null },
          docusign: { connected: false, token: null },
          stripe: { connected: false, token: null },
          quickbooks: { connected: false, token: null },
        };

        const userData = {
          ...data,
          integration_statuses: data.integration_statuses || defaultIntegrationStatuses,
        };

        console.log('Setting user data:', {
          userId: userData.id,
          hasIntegrationStatuses: !!userData.integration_statuses,
          timestamp: new Date().toISOString()
        });

        setUser(userData);
      } catch (err: any) {
        console.error('Error in fetchUser:', {
          error: err,
          message: err.message,
          code: err.code,
          details: err.details,
          hint: err.hint,
          stack: err.stack,
          timestamp: new Date().toISOString()
        });
        setError(err.message);
      } finally {
        setLoading(false);
        console.log('Fetch user complete:', {
          success: !error,
          hasUser: !!user,
          timestamp: new Date().toISOString()
        });
      }
    };

    fetchUser();
  }, [clerkUserId, supabase]);

  console.log('=== USE USER HOOK END ===');
  return { user, loading, error };
} 
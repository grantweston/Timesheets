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
  clerk_sub_id?: string;
  display_name?: string;
  email?: string;
  timezone?: string;
  is_desktop_setup: boolean;
  integration_statuses: IntegrationStatuses;
  created_at?: string;
  updated_at?: string;
}

export function useUser() {
  const { supabase } = useSupabase();
  const { userId: clerkUserId } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!clerkUserId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('clerk_user_id', clerkUserId)
          .single();

        if (userError) {
          console.error('Error fetching user:', userError);
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

        // Only log on successful user fetch
        console.log('User data loaded:', {
          id: userData.id,
          clerk_user_id: userData.clerk_user_id,
          email: userData.email
        });

        setUser(userData);
      } catch (err: any) {
        console.error('Error in fetchUser:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [clerkUserId, supabase]);

  return { user, loading, error };
} 
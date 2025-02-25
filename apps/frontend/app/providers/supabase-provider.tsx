'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { useAuth, useUser } from '@clerk/nextjs';
import { jwtDecode } from 'jwt-decode';

interface CustomJwtPayload {
  role?: string;
  aud?: string;
  sub?: string;
}

interface SupabaseContext {
  supabase: SupabaseClient;
}

const SupabaseContext = createContext<SupabaseContext | undefined>(undefined);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const { getToken, userId } = useAuth();
  const { user: clerkUser } = useUser();
  const [supabase] = useState(() => {
    console.log('🔍 Creating Supabase client with URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false
        }
      }
    );
  });

  useEffect(() => {
    const ensureUserExists = async () => {
      console.log('🔍 ensureUserExists called with userId:', userId, 'clerkUser:', !!clerkUser);
      
      if (!userId || !clerkUser) {
        console.log('❌ No Clerk user data available');
        return;
      }

      console.log('✅ Starting auth flow...', { 
        hasUserId: !!userId, 
        hasClerkUser: !!clerkUser,
        clerkUserId: userId,
        clerkUserEmail: clerkUser?.emailAddresses[0]?.emailAddress
      });

      try {
        // Get JWT token from Clerk for sub claim extraction
        console.log('🔍 Getting token from Clerk with template "supabase"');
        const token = await getToken({ template: 'supabase' });
        if (!token) {
          console.log('❌ No token available from Clerk');
          return;
        }
        console.log('✅ Received token from Clerk:', token.substring(0, 20) + '...');

        // Extract sub claim from JWT
        let subId: string | null = null;
        try {
          console.log('🔍 Decoding JWT token');
          const decoded = jwtDecode<CustomJwtPayload>(token);
          console.log('✅ Decoded JWT token:', decoded);
          subId = decoded.sub || null;
          console.log('🔍 Extracted subId:', subId);
        } catch (error) {
          console.error('❌ Error decoding JWT:', error);
        }

        // Always use API route for user creation
        console.log('🔍 Using API route for user creation');
        await tryApiUserCreation(userId, clerkUser, subId);
      } catch (error) {
        console.error('❌ Error in ensureUserExists:', error);
      }
    };

    async function tryApiUserCreation(clerkUserId: string, user: any, subId: string | null) {
      console.log('🔍 Trying user creation via API route');
      
      try {
        const defaultIntegrationStatuses = {
          outlook: { connected: false, token: null },
          gmail: { connected: false, token: null },
          docusign: { connected: false, token: null },
          stripe: { connected: false, token: null },
          quickbooks: { connected: false, token: null },
        };
        
        const userData = {
          clerk_user_id: clerkUserId,
          clerk_sub_id: subId,
          email: user.emailAddresses[0]?.emailAddress || null,
          display_name: user.firstName && user.lastName 
            ? `${user.firstName} ${user.lastName}`
            : user.firstName || user.lastName || null,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || null,
          is_desktop_setup: false,
          integration_statuses: defaultIntegrationStatuses
        };
        
        console.log('🔍 Sending API request to create user with data:', userData);
        
        const response = await fetch('/api/auth/create-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });
        
        console.log('🔍 API response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('❌ API user creation failed:', errorData);
          console.log('❌ API error details:', JSON.stringify(errorData));
        } else {
          const data = await response.json();
          console.log('✅ API user creation succeeded:', data);
        }
      } catch (error) {
        console.error('❌ Error in API user creation:', error);
        console.log('❌ API error details:', error instanceof Error ? error.message : String(error));
      }
    }

    console.log('🔍 SupabaseProvider useEffect triggered');
    ensureUserExists();
  }, [getToken, userId, clerkUser]);

  return (
    <SupabaseContext.Provider value={{ supabase }}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
} 
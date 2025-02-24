'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { useAuth, useUser } from '@clerk/nextjs';
import { v5 as uuidv5 } from 'uuid';

// Namespace UUID for consistent UUID v5 generation
const CLERK_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

// Convert Clerk user ID to UUID format
function convertClerkIdToUUID(clerkId: string): string {
  return uuidv5(clerkId, CLERK_NAMESPACE);
}

interface SupabaseContext {
  supabase: SupabaseClient;
}

const SupabaseContext = createContext<SupabaseContext | undefined>(undefined);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const { getToken, userId } = useAuth();
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
  const [supabaseClient, setSupabaseClient] = useState<SupabaseClient | null>(null);
  const [isUpdatingMetadata, setIsUpdatingMetadata] = useState(false);
  const [transactionModeSet, setTransactionModeSet] = useState(false);

  // Handle auth state changes and client setup
  useEffect(() => {
    const setupClient = async () => {
      try {
        console.log('Auth State Change:', {
          userId,
          isClerkLoaded,
          hasClerkUser: !!clerkUser,
          transactionModeSet
        });

        // Wait for Clerk to be fully loaded
        if (!isClerkLoaded || !userId || !clerkUser) {
          console.log('Waiting for Clerk to load completely...');
          return;
        }

        console.log('=== SUPABASE CLIENT SETUP START ===');
        const setupStartTime = Date.now();

        // Get JWT token from Clerk
        console.log('Fetching JWT token...');
        const token = await getToken({ template: 'supabase' });

        if (!token) {
          throw new Error('Failed to get auth token');
        }

        // Decode token to verify claims
        const [, payload] = token.split('.');
        const decodedPayload = JSON.parse(atob(payload));
        console.log('JWT payload:', {
          sub: decodedPayload.sub,
          role: decodedPayload.role,
          user_metadata: decodedPayload.user_metadata,
          tokenTime: Date.now() - setupStartTime
        });

        const authedClient = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            global: {
              headers: {
                Authorization: `Bearer ${token}`,
                'x-clerk-user-id': userId
              }
            },
            auth: {
              persistSession: false
            },
            db: { schema: 'public' }
          }
        );

        // Set transaction mode
        try {
          console.log('Setting transaction mode...');
          await authedClient.rpc('set_transaction_mode', { mode: 'read write' });
          setTransactionModeSet(true);
          console.log('Transaction mode set successfully');
          
          // Only set the client after transaction mode is set
          setSupabaseClient(authedClient);
          console.log('Setup Timing - Complete:', {
            totalTime: Date.now() - setupStartTime,
            transactionModeSet: true
          });
        } catch (error) {
          console.error('Failed to set transaction mode:', error);
          setTransactionModeSet(false);
        }
      } catch (error) {
        console.error('Failed to setup authenticated Supabase client:', error);
      }
    };

    setupClient();
  }, [getToken, userId, isClerkLoaded, clerkUser]);

  // Don't render anything until we have a client
  if (!supabaseClient) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  return (
    <SupabaseContext.Provider value={{ supabase: supabaseClient }}>
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
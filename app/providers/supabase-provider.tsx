'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { useAuth } from '@clerk/nextjs';

interface SupabaseContext {
  supabase: SupabaseClient;
}

const SupabaseContext = createContext<SupabaseContext | undefined>(undefined);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const { userId } = useAuth();
  const [supabaseClient, setSupabaseClient] = useState<SupabaseClient | null>(null);

  useEffect(() => {
    const setupClient = async () => {
      try {
        console.log('Setting up Supabase client:', { hasUserId: !!userId });
        
        const client = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            global: userId ? {
              headers: { 'x-clerk-user-id': userId }
            } : undefined,
            auth: {
              persistSession: false,
              autoRefreshToken: false
            },
            db: { schema: 'public' }
          }
        );

        // Test connection
        try {
          const { data, error } = await client
            .from('users')
            .select('user_id')
            .limit(1);
            
          if (error) throw error;
          console.log('Supabase connection test:', { success: true });
        } catch (e) {
          console.error('Supabase connection test failed:', e);
        }

        setSupabaseClient(client);
      } catch (e) {
        console.error('Failed to setup Supabase client:', e);
      }
    };

    setupClient();
  }, [userId]);

  if (!supabaseClient) {
    return (
      <div className="flex items-center justify-center h-full">
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

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
}; 
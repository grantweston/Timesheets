'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { useAuth } from '@clerk/nextjs';

interface SupabaseContext {
  supabase: SupabaseClient;
}

const SupabaseContext = createContext<SupabaseContext | undefined>(undefined);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const { getToken, userId } = useAuth();
  const [supabase] = useState(() =>
    createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  );

  useEffect(() => {
    const updateSupabaseAuth = async () => {
      try {
        console.log('Updating Supabase auth...');
        const token = await getToken({ template: 'supabase' });
        
        if (!token) {
          console.log('No Supabase token available');
          return;
        }

        console.log('Setting Supabase session with token');
        await supabase.auth.setSession({
          access_token: token,
          refresh_token: '',
        });

        if (!userId) {
          console.log('No Clerk user ID available');
          return;
        }

        console.log('Checking for existing user in Supabase:', userId);
        const { data: existingUser, error: checkError } = await supabase
          .from('users')
          .select('*')  // Select all fields for debugging
          .eq('clerk_user_id', userId)
          .single();

        if (checkError) {
          console.log('Check error:', checkError);
          
          if (checkError.code === 'PGRST116') {
            console.log('No user found, attempting to create...');
            const { data: newUser, error: createError } = await supabase
              .from('users')
              .insert([{  // Use array syntax for consistency
                clerk_user_id: userId,
                email: 'grantmweston@gmail.com', // Add required fields
                display_name: 'Grant Weston',
                is_desktop_setup: false,
                organization_id: null, // We'll set this later
              }])
              .select()
              .single();

            if (createError) {
              console.error('Failed to create user:', createError);
              throw createError;
            }

            console.log('Successfully created user:', newUser);
          } else {
            console.error('Unexpected error checking user:', checkError);
            throw checkError;
          }
        } else {
          console.log('Found existing user:', existingUser);
        }
      } catch (error) {
        console.error('Error in updateSupabaseAuth:', error);
      }
    };

    updateSupabaseAuth();
  }, [getToken, supabase, userId]);

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
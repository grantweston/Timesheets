'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { useAuth, useUser } from '@clerk/nextjs';

interface SupabaseContext {
  supabase: SupabaseClient;
}

const SupabaseContext = createContext<SupabaseContext | undefined>(undefined);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();
  const { user, isLoaded, isSignedIn } = useUser();
  const [userChecked, setUserChecked] = useState(false);
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
        },
        global: {
          headers: {
            // We'll set the Authorization header dynamically in the useEffect
          }
        }
      }
    );
  });

  useEffect(() => {
    let isActive = true;
    // Store the original fetch for restoration later
    const originalFetch = window.fetch;
    let fetchModified = false;

    // Create a user record in Supabase when user logs in with Clerk
    const ensureUserExists = async () => {
      if (!isLoaded || !isSignedIn || !user || userChecked) return;
      
      try {
        console.log('🔍 Checking if user exists in Supabase for:', user.id);
        
        const response = await fetch('/api/auth/create-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            display_name: user.fullName || user.username || 'New User',
            email: user.primaryEmailAddress?.emailAddress,
          }),
        });
        
        if (!response.ok) {
          console.error('❌ Error creating/verifying user in Supabase:', 
            await response.text());
        } else {
          const data = await response.json();
          console.log('✅ User exists in Supabase:', data.user ? 'Created' : 'Already exists');
        }
      } catch (error) {
        console.error('❌ Error in ensureUserExists:', error);
      } finally {
        if (isActive) {
          setUserChecked(true);
        }
      }
    };

    const setupSupabaseAuth = async () => {
      try {
        // Get JWT token from Clerk for Supabase
        console.log('🔍 Getting token from Clerk for Supabase auth');
        const token = await getToken({ template: 'supabase' });
        
        if (!token) {
          console.log('❌ No token available from Clerk for Supabase auth');
          return;
        }
        
        console.log('✅ Received token from Clerk');
        
        if (isActive) {
          // Set the Auth session in the Supabase client
          console.log('🔍 Setting Supabase auth session with Clerk token');
          
          const { error } = await supabase.auth.setSession({
            access_token: token,
            refresh_token: token // Using the same token for both since Clerk doesn't provide a refresh token
          });
          
          if (error) {
            console.log('❌ Error setting session directly, using authorization header method');
            
            // Use fetch interceptor to add the authorization header to all requests
            // This is a more reliable approach that works with RLS
            window.fetch = function(input: RequestInfo | URL, init?: RequestInit) {
              const url = input.toString();
              
              // Only intercept Supabase API requests
              if (url.includes(process.env.NEXT_PUBLIC_SUPABASE_URL!)) {
                init = init || {};
                init.headers = init.headers || {};
                
                // Set the Authorization header with the JWT token
                Object.assign(init.headers, {
                  Authorization: `Bearer ${token}`
                });
              }
              
              return originalFetch(input, init);
            } as typeof originalFetch;
            
            fetchModified = true;
            console.log('✅ Set up fetch interceptor for Supabase requests');
          } else {
            console.log('✅ Successfully set Supabase auth session');
          }
          
          // Test query to verify direct access works
          console.log('🔍 Testing direct access to users table');
          const { data, error: queryError } = await supabase
            .from('users')
            .select('clerk_user_id, email')
            .limit(1);
            
          if (queryError) {
            console.log('❌ Test query failed:', queryError.message);
          } else {
            console.log('✅ Test query succeeded! Direct access is working');
            if (data && data.length > 0) {
              console.log('✅ Found user data:', data.length > 0 ? 'Yes' : 'No');
            }
          }
        }
      } catch (error) {
        console.error('❌ Error in setupSupabaseAuth:', error);
      }
    };

    ensureUserExists();
    setupSupabaseAuth();

    return () => {
      isActive = false;
      // If we modified fetch, we should restore it
      if (fetchModified) {
        window.fetch = originalFetch;
      }
    };
  }, [getToken, supabase, user, isLoaded, isSignedIn, userChecked]);

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
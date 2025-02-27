'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect } from 'react';

const AuthContext = createContext({});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') router.refresh();
      if (event === 'SIGNED_OUT') router.refresh();
    });

    return () => subscription.unsubscribe();
  }, [router, supabase]);

  return children;
}

'use client';

import React, { useState, useEffect } from 'react';
import { useUser as useClerkUser } from '@clerk/nextjs';

// Define the type for our user object
export interface User {
  user_id: string;
  clerk_user_id: string;
  name: string;
  email: string;
  created_at: string;
}

export function useUser() {
  const { user: clerkUser, isLoaded: clerkLoaded, isSignedIn } = useClerkUser();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Don't try to fetch user data until Clerk has loaded
    if (!clerkLoaded) return;

    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);

        // If not signed in, clear user and return
        if (!isSignedIn || !clerkUser) {
          setUser(null);
          setLoading(false);
          return;
        }

        // Fetch user data from our API
        const response = await fetch('/api/user');

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }

        setUser(data.user);
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching user data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [clerkUser, clerkLoaded, isSignedIn]);

  return { user, loading, error };
} 
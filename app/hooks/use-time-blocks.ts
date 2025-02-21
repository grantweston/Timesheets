'use client';

import { useEffect, useState } from 'react';
import { useSupabase } from '@/app/providers/supabase-provider';
import { useAuth } from '@clerk/nextjs';

export interface TimeBlock {
  id: string;
  user_id: string;
  project_id: string | null;
  start_time: string;
  end_time: string;
  task_label: string;
  is_billable: boolean;
  classification: any;
  created_at: string;
  updated_at: string | null;
}

export function useTimeBlocks(period: 'today' | 'week' | 'month' = 'today') {
  const { supabase } = useSupabase();
  const { userId: clerkUserId } = useAuth();
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTimeBlocks = async () => {
      console.log('Starting fetchTimeBlocks...', { period, clerkUserId });
      
      if (!clerkUserId) {
        console.log('No Clerk user ID found, returning early');
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log('Fetching Supabase user ID for Clerk ID:', clerkUserId);
        // First, get the Supabase user ID that matches the Clerk user ID
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('clerk_user_id', clerkUserId)
          .single();

        if (userError) {
          console.error('Error fetching user:', userError);
          throw new Error('Failed to find user');
        }

        if (!userData) {
          console.error('No user found for Clerk ID:', clerkUserId);
          throw new Error('User not found');
        }

        console.log('Found Supabase user:', userData);

        // Add date filtering based on period
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())).toISOString();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

        let startTime;
        switch (period) {
          case 'today':
            startTime = startOfDay;
            break;
          case 'week':
            startTime = startOfWeek;
            break;
          case 'month':
            startTime = startOfMonth;
            break;
        }

        console.log('Fetching time blocks with params:', {
          userId: userData.id,
          period,
          startTime
        });

        let query = supabase
          .from('time_blocks')
          .select('*')
          .eq('user_id', userData.id)
          .gte('start_time', startTime)
          .order('start_time', { ascending: false });

        const { data: timeBlocksData, error: timeBlocksError } = await query;

        if (timeBlocksError) {
          console.error('Error fetching time blocks:', timeBlocksError);
          throw timeBlocksError;
        }

        console.log('Successfully fetched time blocks:', timeBlocksData?.length || 0, 'blocks found');
        setTimeBlocks(timeBlocksData || []);
      } catch (err: any) {
        console.error('Error in fetchTimeBlocks:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTimeBlocks();
  }, [supabase, clerkUserId, period]);

  return { timeBlocks, loading, error };
} 
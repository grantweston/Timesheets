'use client';

import { useEffect, useState } from 'react';
import { useSupabase } from '@/app/providers/supabase-provider';
import { useAuth } from '@clerk/nextjs';
import { TimeBlock } from '@/types/time-block';

export function useTimeBlocks(period: 'today' | 'week' | 'month' = 'today') {
  const { supabase } = useSupabase();
  const { userId: clerkUserId } = useAuth();
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // First, get the user's UUID from their clerk ID
  useEffect(() => {
    const getUserId = async () => {
      if (!clerkUserId) return;

      try {
        const { data, error } = await supabase
          .from('users')
          .select('id')
          .eq('clerk_user_id', clerkUserId)
          .single();

        if (error) throw error;
        setUserId(data.id);
      } catch (err) {
        console.error('Error getting user ID:', err);
        setError('Failed to get user ID');
      }
    };

    getUserId();
  }, [clerkUserId, supabase]);

  useEffect(() => {
    const fetchTimeBlocks = async () => {
      if (!userId) {
        console.log('No user ID found, returning early');
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Add date filtering based on period
        const now = new Date();
        // Set to start of day in local timezone
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);
        
        // Set to start of week in local timezone
        const startOfWeek = new Date(now);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        
        // Set to start of month in local timezone
        const startOfMonth = new Date(now);
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

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
          userId,
          period,
          startTime: startTime.toISOString()
        });

        const { data: timeBlocksData, error: timeBlocksError } = await supabase
          .from('time_blocks')
          .select('*')
          .eq('user_id', userId)
          .gte('start_time', startTime.toISOString())
          .order('start_time', { ascending: true });

        if (timeBlocksError) {
          console.error('Error fetching time blocks:', timeBlocksError);
          throw timeBlocksError;
        }

        setTimeBlocks(timeBlocksData || []);
      } catch (err: any) {
        console.error('Error in fetchTimeBlocks:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTimeBlocks();
  }, [supabase, userId, period]);

  return { timeBlocks, loading, error };
} 
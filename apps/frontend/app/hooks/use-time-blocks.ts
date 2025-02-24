'use client';

import { useEffect, useState } from 'react';
import { useSupabase } from '@/app/providers/supabase-provider';
import { useUser } from '@/app/hooks/use-user';
import { TimeBlock, transformDatabaseToUI } from '@/app/types/time-block';

export function useTimeBlocks(period: 'today' | 'week' | 'month' = 'today') {
  const { supabase } = useSupabase();
  const { user } = useUser();
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTimeBlocks = async () => {
      if (!user?.id) {
        setLoading(false);
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

        const { data: timeBlocksData, error: timeBlocksError } = await supabase
          .from('time_blocks')
          .select('*')
          .eq('user_id', user.id)
          .gte('start_time', startTime.toISOString())
          .order('start_time', { ascending: true });

        if (timeBlocksError) {
          throw timeBlocksError;
        }

        setTimeBlocks(timeBlocksData?.map(transformDatabaseToUI) || []);
      } catch (err: any) {
        console.error('Error in fetchTimeBlocks:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTimeBlocks();
  }, [supabase, user?.id, period]);

  return { timeBlocks, loading, error };
} 
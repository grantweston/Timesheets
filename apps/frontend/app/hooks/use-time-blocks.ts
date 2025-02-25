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
      console.log('useTimeBlocks: Starting fetch with user:', {
        hasUser: !!user,
        userId: user?.user_id,
        period
      });
      
      if (!user?.user_id) {
        console.log('useTimeBlocks: No user ID found, returning early');
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

        console.log('useTimeBlocks: Date range:', {
          now: now.toISOString(),
          startTime: startTime.toISOString(),
          period
        });

        // First, let's check if we have any time blocks at all for this user
        const { data: allBlocks, error: countError } = await supabase
          .from('time_blocks')
          .select('time_block_id')
          .eq('user_id', user.user_id);

        console.log('useTimeBlocks: Total blocks for user:', {
          count: allBlocks?.length || 0,
          error: countError
        });

        const { data: timeBlocksData, error: timeBlocksError } = await supabase
          .from('time_blocks')
          .select(`
            *,
            client:clients (
              client_id,
              name,
              billing_rate,
              email,
              status
            )
          `)
          .eq('user_id', user.user_id)
          .gte('start_time', startTime.toISOString())
          .order('start_time', { ascending: true });

        console.log('useTimeBlocks: Query result:', { 
          success: !timeBlocksError,
          dataLength: timeBlocksData?.length || 0,
          error: timeBlocksError,
          firstBlock: timeBlocksData?.[0],
          query: {
            userId: user.user_id,
            startTime: startTime.toISOString()
          }
        });

        if (timeBlocksError) {
          throw timeBlocksError;
        }

        const transformedBlocks = timeBlocksData?.map(transformDatabaseToUI) || [];
        console.log('useTimeBlocks: Final blocks:', {
          originalLength: timeBlocksData?.length || 0,
          transformedLength: transformedBlocks.length,
          sampleBlock: transformedBlocks[0] || null
        });

        setTimeBlocks(transformedBlocks);
      } catch (err: any) {
        console.error('Error in fetchTimeBlocks:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTimeBlocks();
  }, [supabase, user?.user_id, period]);

  return { timeBlocks, loading, error };
} 
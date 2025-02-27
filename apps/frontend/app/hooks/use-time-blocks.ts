'use client';

import { useEffect, useState } from 'react';
import { useSupabase } from '@/app/providers/supabase-provider';
import { useUser } from '@/app/hooks/use-user';
import { TimeBlock, transformDatabaseToUI } from '@/app/types/time-block';

// Add optional parameters for debugging
interface UseTimeBlocksOptions {
  useHardcodedId?: boolean;
  hardcodedId?: string;
  showAllBlocks?: boolean;
}

export function useTimeBlocks(
  period: 'today' | 'week' | 'month' | 'all' = 'today', 
  referenceDate?: Date,
  options: UseTimeBlocksOptions = {}
) {
  // We still keep the supabase client for legacy fallback
  const { supabase } = useSupabase();
  const { user } = useUser();
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Default hardcoded ID for debugging
  const DEFAULT_HARDCODED_ID = "user_2tExBCPQtiCFy1EMr1EJ76rZGgK";

  // Track if we're using the API vs direct Supabase method
  const [usingApiRoute, setUsingApiRoute] = useState(true);

  useEffect(() => {
    const fetchTimeBlocks = async () => {
      // Determine which user ID to use
      const useHardcodedId = options.useHardcodedId || false;
      const hardcodedId = options.hardcodedId || DEFAULT_HARDCODED_ID;
      const effectiveUserId = useHardcodedId ? hardcodedId : (user?.clerk_user_id || '');
      const showAllBlocks = options.showAllBlocks || period === 'all';
      
      if (!effectiveUserId && !useHardcodedId) {
        setLoading(false);
        setError('No user ID found. Please make sure you are logged in.');
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Use provided reference date or default to current date
        const now = referenceDate || new Date();
        
        // Try the API route approach first
        if (usingApiRoute) {
          try {
            // Build the query URL with parameters
            const queryParams = new URLSearchParams();
            queryParams.append('period', period);
            queryParams.append('date', now.toISOString());
            if (showAllBlocks) {
              queryParams.append('showAll', 'true');
            }
            
            // Fetch time blocks from the API route
            const response = await fetch(`/api/time-blocks?${queryParams.toString()}`);
            
            if (!response.ok) {
              throw new Error(`API returned ${response.status}: ${await response.text()}`);
            }
            
            const data = await response.json();
            
            if (!data.timeBlocks) {
              throw new Error('API response missing timeBlocks array');
            }
            
            // Transform the data to UI format
            const transformedBlocks = data.timeBlocks.map(transformDatabaseToUI) || [];
            
            setTimeBlocks(transformedBlocks);
            setLoading(false);
            return;
          } catch (apiError: any) {
            console.error('Error using API route:', apiError);
            setUsingApiRoute(false);
            // Don't return here - fall through to the direct Supabase query as a fallback
          }
        }
        
        // LEGACY CODE: Direct Supabase query if API route failed or is disabled
        // Create UTC dates for database querying
        const utcDate = new Date(now.getTime());
        const startOfDay = new Date(Date.UTC(utcDate.getUTCFullYear(), utcDate.getUTCMonth(), utcDate.getUTCDate(), 0, 0, 0));
        const endOfDay = new Date(Date.UTC(utcDate.getUTCFullYear(), utcDate.getUTCMonth(), utcDate.getUTCDate() + 1, 0, 0, 0));
        
        // For week and month views
        const startOfWeek = new Date(utcDate);
        startOfWeek.setUTCDate(startOfWeek.getUTCDate() - startOfWeek.getUTCDay());
        startOfWeek.setUTCHours(0, 0, 0, 0);
        
        const startOfMonth = new Date(utcDate);
        startOfMonth.setUTCDate(1);
        startOfMonth.setUTCHours(0, 0, 0, 0);

        // If we're showing all blocks, skip the date filtering
        if (showAllBlocks) {
          const { data: allTimeData, error: allTimeError } = await supabase
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
            .eq('clerk_user_id', effectiveUserId)
            .order('start_time', { ascending: true })
            .limit(20);
            
          if (allTimeError) {
            throw allTimeError;
          }
            
          if (allTimeData && allTimeData.length > 0) {
            const transformedBlocks = allTimeData.map(transformDatabaseToUI) || [];
            setTimeBlocks(transformedBlocks);
            setLoading(false);
            return;
          }
        }
        
        // Define date ranges for filtering based on period
        let startTime: Date;
        let endTime: Date;

        switch (period) {
          case 'today':
            startTime = startOfDay;
            endTime = endOfDay;
            break;
          case 'week':
            startTime = startOfWeek;
            // End time is 7 days after start time
            endTime = new Date(startOfWeek);
            endTime.setUTCDate(endTime.getUTCDate() + 7);
            break;
          case 'month':
            startTime = startOfMonth;
            // End time is the start of next month
            endTime = new Date(startOfMonth);
            endTime.setUTCMonth(endTime.getUTCMonth() + 1);
            break;
          default:
            // Default to today if period is not recognized
            startTime = startOfDay;
            endTime = endOfDay;
            break;
        }

        // Make the date range more inclusive by extending the range a bit
        // This helps with timezone issues and blocks that might be right at the boundaries
        const extendedStartTime = new Date(startTime);
        extendedStartTime.setUTCHours(extendedStartTime.getUTCHours() - 12); // Extend 12 hours earlier
        
        const extendedEndTime = new Date(endTime);
        extendedEndTime.setUTCHours(extendedEndTime.getUTCHours() + 12); // Extend 12 hours later

        // Query with explicit date range
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
          .eq('clerk_user_id', effectiveUserId)
          .gte('start_time', extendedStartTime.toISOString())
          .lt('start_time', extendedEndTime.toISOString())
          .order('start_time', { ascending: true });

        if (timeBlocksError) {
          throw timeBlocksError;
        }

        // If no blocks found with date filter, try creating a demo block
        if (!timeBlocksData || timeBlocksData.length === 0) {
          // Try without date filter first
          const { data: allTimeData, error: allTimeError } = await supabase
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
            .eq('clerk_user_id', effectiveUserId)
            .order('start_time', { ascending: true })
            .limit(10);
            
          if (allTimeData && allTimeData.length > 0) {
            // Show blocks from any date if none found for selected date
            const transformedBlocks = allTimeData.map(transformDatabaseToUI) || [];
            setTimeBlocks(transformedBlocks);
            setLoading(false);
            return;
          } else {
            // If no blocks found at all, create a demo block
            const demoDate = now || new Date();
            // Force the demo block to be at 10AM-12PM to be visible in the grid
            const startDate = new Date(demoDate);
            startDate.setHours(10, 0, 0, 0); // 10:00 AM
            const endDate = new Date(demoDate);
            endDate.setHours(12, 0, 0, 0); // 12:00 PM
            
            const demoBlock: TimeBlock = {
              time_block_id: "demo-block-123",
              clerk_user_id: effectiveUserId,
              client_id: "demo-client-123",
              start_time: startDate.toISOString(),
              end_time: endDate.toISOString(),
              description: "This is a demo time block",
              time_block_label: "Demo Time Block",
              is_billable: true,
              in_scope: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              client: {
                client_id: "demo-client-123",
                name: "Demo Client",
                billing_rate: "150",
                email: "demo@example.com",
                status: "active"
              },
              ui: {
                color: "bg-blue-500/10",
                classification: {
                  category: "meeting",
                  applications: [
                    { name: "Zoom", timeSpent: 1.5 }
                  ]
                }
              }
            };
            
            setTimeBlocks([demoBlock]);
            setLoading(false);
            return;
          }
        }

        const transformedBlocks = timeBlocksData?.map(transformDatabaseToUI) || [];
        setTimeBlocks(transformedBlocks);
      } catch (err: any) {
        console.error('Error in fetchTimeBlocks:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTimeBlocks();
  }, [supabase, user?.clerk_user_id, period, referenceDate, options.useHardcodedId, options.hardcodedId, options.showAllBlocks, usingApiRoute]);

  return { timeBlocks, loading, error, usingApiRoute };
} 
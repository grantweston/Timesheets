'use client';

import { useState } from 'react';
import { useUser } from '@/app/hooks/use-user';
import { useSupabase } from '@/app/providers/supabase-provider';
import { TimeBlock, transformDatabaseToUI } from '@/app/types/time-block';

// Define the types for the input data
export interface CreateTimeBlockInput {
  client_id: string;
  start_time: string;
  end_time: string;
  time_block_label: string;
  description?: string;
  is_billable?: boolean;
  in_scope?: boolean;
}

export interface UpdateTimeBlockInput {
  time_block_id: string;
  client_id?: string;
  start_time?: string;
  end_time?: string;
  time_block_label?: string;
  description?: string;
  is_billable?: boolean;
  in_scope?: boolean;
}

export function useTimeBlockMutations() {
  const { user } = useUser();
  // Keep Supabase client for fallback
  const { supabase } = useSupabase();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Track if we're using the API route or direct Supabase
  const [usingApiRoute, setUsingApiRoute] = useState(true);

  /**
   * Create a new time block
   */
  const createTimeBlock = async (input: CreateTimeBlockInput): Promise<TimeBlock | null> => {
    setLoading(true);
    setError(null);
    
    try {
      if (!user?.clerk_user_id) {
        throw new Error('User not authenticated');
      }
      
      if (usingApiRoute) {
        try {
          // Use the API route to create the time block
          const response = await fetch('/api/time-blocks/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(input),
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API error: ${response.status} - ${errorText}`);
          }
          
          const data = await response.json();
          
          if (!data.timeBlock) {
            throw new Error('API response missing timeBlock data');
          }
          
          const transformedBlock = transformDatabaseToUI(data.timeBlock);
          return transformedBlock;
        } catch (apiError: any) {
          console.error('Error using API route to create time block:', apiError);
          setUsingApiRoute(false);
          // Fall through to direct Supabase mutation
        }
      }
      
      // LEGACY: Direct Supabase mutation
      const timeBlockData = {
        clerk_user_id: user.clerk_user_id,
        client_id: input.client_id,
        start_time: input.start_time,
        end_time: input.end_time,
        time_block_label: input.time_block_label,
        description: input.description || '',
        is_billable: input.is_billable !== undefined ? input.is_billable : true,
        in_scope: input.in_scope !== undefined ? input.in_scope : true,
      };
      
      const { data, error } = await supabase
        .from('time_blocks')
        .insert(timeBlockData)
        .select(`
          *,
          client:clients (
            client_id,
            name,
            email,
            billing_rate,
            status
          )
        `)
        .single();
      
      if (error) {
        throw new Error(error.message);
      }
      
      return transformDatabaseToUI(data);
    } catch (err: any) {
      console.error('Error in createTimeBlock:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update an existing time block
   */
  const updateTimeBlock = async (input: UpdateTimeBlockInput): Promise<TimeBlock | null> => {
    setLoading(true);
    setError(null);
    
    try {
      if (!user?.clerk_user_id) {
        throw new Error('User not authenticated');
      }
      
      if (!input.time_block_id) {
        throw new Error('time_block_id is required');
      }
      
      if (usingApiRoute) {
        try {
          // Use the API route to update the time block
          const response = await fetch('/api/time-blocks/update', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(input),
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API error: ${response.status} - ${errorText}`);
          }
          
          const data = await response.json();
          
          if (!data.timeBlock) {
            throw new Error('API response missing timeBlock data');
          }
          
          const transformedBlock = transformDatabaseToUI(data.timeBlock);
          return transformedBlock;
        } catch (apiError: any) {
          console.error('Error using API route to update time block:', apiError);
          setUsingApiRoute(false);
          // Fall through to direct Supabase mutation
        }
      }
      
      // LEGACY: Direct Supabase mutation
      const updateData: any = {
        updated_at: new Date().toISOString()
      };
      
      // Only update fields that are provided
      if (input.client_id !== undefined) updateData.client_id = input.client_id;
      if (input.start_time !== undefined) updateData.start_time = input.start_time;
      if (input.end_time !== undefined) updateData.end_time = input.end_time;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.time_block_label !== undefined) updateData.time_block_label = input.time_block_label;
      if (input.is_billable !== undefined) updateData.is_billable = input.is_billable;
      if (input.in_scope !== undefined) updateData.in_scope = input.in_scope;
      
      const { data, error } = await supabase
        .from('time_blocks')
        .update(updateData)
        .eq('time_block_id', input.time_block_id)
        .eq('clerk_user_id', user.clerk_user_id)
        .select(`
          *,
          client:clients (
            client_id,
            name,
            email,
            billing_rate,
            status
          )
        `)
        .single();
      
      if (error) {
        throw new Error(error.message);
      }
      
      return transformDatabaseToUI(data);
    } catch (err: any) {
      console.error('Error in updateTimeBlock:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete a time block
   */
  const deleteTimeBlock = async (timeBlockId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      if (!user?.clerk_user_id) {
        throw new Error('User not authenticated');
      }
      
      if (usingApiRoute) {
        try {
          // Use the API route to delete the time block
          const response = await fetch(`/api/time-blocks/delete?id=${encodeURIComponent(timeBlockId)}`, {
            method: 'DELETE',
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API error: ${response.status} - ${errorText}`);
          }
          
          return true;
        } catch (apiError: any) {
          console.error('Error using API route to delete time block:', apiError);
          setUsingApiRoute(false);
          // Fall through to direct Supabase mutation
        }
      }
      
      // LEGACY: Direct Supabase mutation
      const { error } = await supabase
        .from('time_blocks')
        .delete()
        .eq('time_block_id', timeBlockId)
        .eq('clerk_user_id', user.clerk_user_id);
      
      if (error) {
        throw new Error(error.message);
      }
      
      return true;
    } catch (err: any) {
      console.error('Error in deleteTimeBlock:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { 
    createTimeBlock, 
    updateTimeBlock, 
    deleteTimeBlock, 
    loading, 
    error,
    usingApiRoute
  };
} 
'use client';

import { useSupabase } from '@/app/providers/supabase-provider';
import { useAuth } from '@clerk/nextjs';

export function useTimeBlockMutations() {
  const { supabase } = useSupabase();
  const { userId: clerkUserId } = useAuth();

  const getSupabaseUserId = async () => {
    console.log('Getting Supabase user ID for Clerk ID:', clerkUserId);
    
    if (!clerkUserId) {
      console.error('No Clerk user ID found');
      throw new Error('User not authenticated');
    }

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
    return userData.id;
  };

  const createTimeBlock = async (block: {
    task_label: string;
    start_time: string;
    end_time: string;
    is_billable: boolean;
    project_id?: string | null;
    classification?: any;
  }) => {
    console.log('Creating time block:', block);
    const userId = await getSupabaseUserId();

    const { data, error } = await supabase
      .from('time_blocks')
      .insert({
        ...block,
        user_id: userId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating time block:', error);
      throw error;
    }

    console.log('Successfully created time block:', data);
    return data;
  };

  const updateTimeBlock = async (
    id: string,
    block: {
      task_label?: string;
      start_time?: string;
      end_time?: string;
      is_billable?: boolean;
      project_id?: string | null;
      classification?: any;
    }
  ) => {
    console.log('Updating time block:', { id, block });
    const userId = await getSupabaseUserId();

    const { data, error } = await supabase
      .from('time_blocks')
      .update(block)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating time block:', error);
      throw error;
    }

    console.log('Successfully updated time block:', data);
    return data;
  };

  return {
    createTimeBlock,
    updateTimeBlock,
  };
} 
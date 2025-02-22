'use client';

import { useSupabase } from '@/app/providers/supabase-provider';
import { useAuth } from '@clerk/nextjs';
import { TimeBlock } from '@/types/time-block';

export function useTimeBlockMutations() {
  const { supabase } = useSupabase();
  const { userId: clerkUserId } = useAuth();

  const createTimeBlock = async (block: Partial<TimeBlock>) => {
    if (!clerkUserId) throw new Error('No user ID found');

    const newBlock = {
      ...block,
      clerk_id: clerkUserId,
      is_recurring: false,
      recurrence_pattern: null,
      classification: {
        category: block.classification?.category || 'uncategorized',
        confidence: 1.0
      }
    };

    const { data, error } = await supabase
      .from('time_blocks')
      .insert([newBlock])
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const updateTimeBlock = async (id: string, block: Partial<TimeBlock>) => {
    if (!clerkUserId) throw new Error('No user ID found');

    const { data, error } = await supabase
      .from('time_blocks')
      .update(block)
      .eq('id', id)
      .eq('clerk_id', clerkUserId)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const deleteTimeBlock = async (id: string) => {
    if (!clerkUserId) throw new Error('No user ID found');

    const { error } = await supabase
      .from('time_blocks')
      .delete()
      .eq('id', id)
      .eq('clerk_id', clerkUserId);

    if (error) throw error;
  };

  return {
    createTimeBlock,
    updateTimeBlock,
    deleteTimeBlock
  };
} 
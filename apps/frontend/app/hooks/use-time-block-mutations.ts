'use client';

import { useEffect, useState } from 'react';
import { useSupabase } from '@/app/providers/supabase-provider';
import { useAuth } from '@clerk/nextjs';
import { TimeBlock } from '@/types/time-block';

export function useTimeBlockMutations() {
  const { supabase } = useSupabase();
  const { userId: clerkUserId } = useAuth();
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
      }
    };

    getUserId();
  }, [clerkUserId, supabase]);

  const createTimeBlock = async (block: Partial<TimeBlock>) => {
    if (!userId) throw new Error('No user ID found');

    const newBlock = {
      ...block,
      user_id: userId,
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
    if (!userId) throw new Error('No user ID found');

    const { data, error } = await supabase
      .from('time_blocks')
      .update(block)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const deleteTimeBlock = async (id: string) => {
    if (!userId) throw new Error('No user ID found');

    const { error } = await supabase
      .from('time_blocks')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  };

  return {
    createTimeBlock,
    updateTimeBlock,
    deleteTimeBlock
  };
} 
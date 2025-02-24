'use client';

import { useSupabase } from '@/app/providers/supabase-provider';
import { TimeBlock } from '@/types/time-block';
import { useUser } from '../../../../app/hooks/use-user';

export function useTimeBlockMutations() {
  const { supabase } = useSupabase();
  const { user } = useUser();

  const createTimeBlock = async (block: Partial<TimeBlock>) => {
    if (!user?.id) throw new Error('No user ID found');

    const newBlock = {
      ...block,
      user_id: user.id,
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
    if (!user?.id) throw new Error('No user ID found');

    const { data, error } = await supabase
      .from('time_blocks')
      .update(block)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const deleteTimeBlock = async (id: string) => {
    if (!user?.id) throw new Error('No user ID found');

    const { error } = await supabase
      .from('time_blocks')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  };

  return {
    createTimeBlock,
    updateTimeBlock,
    deleteTimeBlock
  };
} 
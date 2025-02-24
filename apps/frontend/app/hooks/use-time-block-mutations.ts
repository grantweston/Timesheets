'use client';

import { useSupabase } from '@/app/providers/supabase-provider';
import { TimeBlock, transformDatabaseToUI, transformUIToDatabase } from '@/app/types/time-block';
import { useUser } from '@/app/hooks/use-user';

interface User {
  id: string;
  // other user properties...
}

export function useTimeBlockMutations() {
  const { supabase } = useSupabase();
  const { user } = useUser() as { user: User | null };

  const createTimeBlock = async (block: Partial<TimeBlock>) => {
    if (!user?.id) throw new Error('No user ID found');

    const dbBlock = {
      ...block,
      user_id: user.id,
      in_scope: block.in_scope ?? true
    };

    const { data, error } = await supabase
      .from('time_blocks')
      .insert([dbBlock])
      .select()
      .single();

    if (error) throw error;
    return transformDatabaseToUI(data);
  };

  const updateTimeBlock = async (id: string, block: Partial<TimeBlock>) => {
    if (!user?.id) throw new Error('No user ID found');

    const { data, error } = await supabase
      .from('time_blocks')
      .update(block)
      .eq('time_block_id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return transformDatabaseToUI(data);
  };

  const deleteTimeBlock = async (id: string) => {
    if (!user?.id) throw new Error('No user ID found');

    const { error } = await supabase
      .from('time_blocks')
      .delete()
      .eq('time_block_id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  };

  return {
    createTimeBlock,
    updateTimeBlock,
    deleteTimeBlock
  };
} 
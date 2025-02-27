import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addTestData() {
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  const testBlocks = [
    {
      clerk_id: 'user_2tExBCPQtiCFy1EMr1EJ76rZGgK',
      start_time: new Date(currentDate.getTime() + 9 * 60 * 60 * 1000).toISOString(),
      end_time: new Date(currentDate.getTime() + 11 * 60 * 60 * 1000).toISOString(),
      task_label: 'Morning Development',
      description: 'Working on timesheet app',
      is_billable: true,
      classification: { category: 'development', confidence: 1.0 }
    },
    {
      clerk_id: 'user_2tExBCPQtiCFy1EMr1EJ76rZGgK',
      start_time: new Date(currentDate.getTime() + 13 * 60 * 60 * 1000).toISOString(),
      end_time: new Date(currentDate.getTime() + 14.5 * 60 * 60 * 1000).toISOString(),
      task_label: 'Team Meeting',
      description: 'Weekly sync',
      is_billable: true,
      classification: { category: 'meeting', confidence: 1.0 }
    },
    {
      clerk_id: 'user_2tExBCPQtiCFy1EMr1EJ76rZGgK',
      start_time: new Date(currentDate.getTime() + 15 * 60 * 60 * 1000).toISOString(),
      end_time: new Date(currentDate.getTime() + 17 * 60 * 60 * 1000).toISOString(),
      task_label: 'Afternoon Coding',
      description: 'Implementing new features',
      is_billable: true,
      classification: { category: 'development', confidence: 1.0 }
    }
  ];

  console.log('Inserting test blocks:', testBlocks);

  const { data, error } = await supabase
    .from('time_blocks')
    .insert(testBlocks)
    .select();

  if (error) {
    console.error('Error inserting test data:', error);
    return;
  }

  console.log('Successfully inserted test data:', data);
}

addTestData(); 
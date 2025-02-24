import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory path of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedTestData() {
  // Create organization
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .insert({
      name: 'Grant\'s Workspace',
    })
    .select()
    .single();

  if (orgError) {
    console.error('Error creating organization:', orgError);
    return;
  }

  console.log('Created organization:', org);

  // Create user
  const { data: user, error: userError } = await supabase
    .from('users')
    .insert({
      email: 'grantmweston@gmail.com',
      display_name: 'Grant Weston',
      clerk_user_id: 'user_2tExBCPQtiCFy1EMr1EJ76rZGgK',
      organization_id: org.id,
      is_desktop_setup: true,
    })
    .select()
    .single();

  if (userError) {
    console.error('Error creating user:', userError);
    return;
  }

  console.log('Created user:', user);

  // Create projects
  const projects = [
    {
      name: 'Website Redesign',
      client_name: 'Acme Corp',
      billing_rate: 150,
      organization_id: org.id,
      status: 'active',
    },
    {
      name: 'Mobile App Development',
      client_name: 'TechStart Inc',
      billing_rate: 175,
      organization_id: org.id,
      status: 'active',
    },
    {
      name: 'API Integration',
      client_name: 'DataFlow Systems',
      billing_rate: 160,
      organization_id: org.id,
      status: 'active',
    },
  ];

  const { data: projectData, error: projectError } = await supabase
    .from('projects')
    .insert(projects)
    .select();

  if (projectError) {
    console.error('Error creating projects:', projectError);
    return;
  }

  console.log('Created projects:', projectData);

  // Create time blocks for today
  const today = new Date();
  const timeBlocks = [
    {
      user_id: user.id,
      project_id: projectData[0].id,
      start_time: new Date(today.setHours(9, 0, 0)).toISOString(),
      end_time: new Date(today.setHours(10, 30, 0)).toISOString(),
      task_label: 'Client Meeting - Project Review',
      is_billable: true,
    },
    {
      user_id: user.id,
      project_id: projectData[0].id,
      start_time: new Date(today.setHours(10, 45, 0)).toISOString(),
      end_time: new Date(today.setHours(12, 0, 0)).toISOString(),
      task_label: 'Documentation & Notes',
      is_billable: true,
    },
    {
      user_id: user.id,
      project_id: null,
      start_time: new Date(today.setHours(12, 0, 0)).toISOString(),
      end_time: new Date(today.setHours(13, 0, 0)).toISOString(),
      task_label: 'Lunch Break',
      is_billable: false,
    },
    {
      user_id: user.id,
      project_id: projectData[1].id,
      start_time: new Date(today.setHours(13, 0, 0)).toISOString(),
      end_time: new Date(today.setHours(15, 30, 0)).toISOString(),
      task_label: 'Development Work',
      is_billable: true,
    },
  ];

  const { data: timeBlockData, error: timeBlockError } = await supabase
    .from('time_blocks')
    .insert(timeBlocks)
    .select();

  if (timeBlockError) {
    console.error('Error creating time blocks:', timeBlockError);
    return;
  }

  console.log('Created time blocks:', timeBlockData);
  console.log('Test data seeded successfully!');
}

seedTestData().catch(console.error); 
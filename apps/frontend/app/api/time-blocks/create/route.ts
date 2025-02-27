import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: NextRequest) {
  console.log('🔍 API: create time-block route called');
  
  try {
    // Get the Clerk user ID
    console.log('🔍 API: Getting Clerk userId from auth()');
    const { userId } = auth();
    
    if (!userId) {
      console.log('❌ API: No userId found in auth()');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('✅ API: Got userId:', userId);
    
    // Parse the request body
    const body = await req.json();
    console.log('🔍 API: Request body:', JSON.stringify(body));
    
    // Validate the required fields
    if (!body.client_id || !body.start_time || !body.end_time || !body.time_block_label) {
      console.log('❌ API: Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields: client_id, start_time, end_time, time_block_label' },
        { status: 400 }
      );
    }
    
    // Create a Supabase client with service role key (bypasses RLS)
    console.log('🔍 API: Creating Supabase client with service role key');
    
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ API: SUPABASE_SERVICE_ROLE_KEY is not defined');
      return NextResponse.json(
        { error: 'Server configuration error: Missing service role key' },
        { status: 500 }
      );
    }
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    );
    console.log('✅ API: Supabase client created');
    
    // Prepare the time block data
    const timeBlockData = {
      clerk_user_id: userId,
      client_id: body.client_id,
      start_time: body.start_time,
      end_time: body.end_time,
      description: body.description || '',
      time_block_label: body.time_block_label,
      is_billable: body.is_billable !== undefined ? body.is_billable : true,
      in_scope: body.in_scope !== undefined ? body.in_scope : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('🔍 API: Time block data:', timeBlockData);
    
    // Insert the time block into the database
    const { data, error } = await supabase
      .from('time_blocks')
      .insert(timeBlockData)
      .select();
    
    if (error) {
      console.error('❌ API: Error creating time block:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    console.log('✅ API: Time block created successfully:', data);
    
    // Fetch the client information
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('client_id, name, billing_rate, email, status')
      .eq('client_id', body.client_id)
      .single();
    
    if (clientError) {
      console.error('❌ API: Error fetching client:', clientError);
      // Still return the created time block, but without client info
      return NextResponse.json({ timeBlock: data[0] });
    }
    
    // Return the created time block with client information
    const timeBlockWithClient = {
      ...data[0],
      client: clientData
    };
    
    console.log('✅ API: Returning time block with client:', timeBlockWithClient);
    return NextResponse.json({ timeBlock: timeBlockWithClient });
  } catch (error: any) {
    console.error('❌ API: Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
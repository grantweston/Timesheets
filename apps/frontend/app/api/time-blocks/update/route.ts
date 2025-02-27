import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function PUT(req: NextRequest) {
  console.log('🔍 API: update time-block route called');
  
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
    if (!body.time_block_id) {
      console.log('❌ API: Missing time_block_id');
      return NextResponse.json(
        { error: 'Missing time_block_id' },
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
    
    // First, verify that the time block belongs to the user
    const { data: verifyData, error: verifyError } = await supabase
      .from('time_blocks')
      .select('*')
      .eq('time_block_id', body.time_block_id)
      .eq('clerk_user_id', userId)
      .single();
    
    if (verifyError) {
      console.error('❌ API: Error verifying time block:', verifyError);
      
      if (verifyError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Time block not found or you do not have permission to update it' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: verifyError.message },
        { status: 500 }
      );
    }
    
    if (!verifyData) {
      console.log('❌ API: Time block not found or not owned by user');
      return NextResponse.json(
        { error: 'Time block not found or you do not have permission to update it' },
        { status: 404 }
      );
    }
    
    // Prepare the time block data for update
    const updateData: any = {
      updated_at: new Date().toISOString()
    };
    
    // Only update fields that are provided
    if (body.client_id !== undefined) updateData.client_id = body.client_id;
    if (body.start_time !== undefined) updateData.start_time = body.start_time;
    if (body.end_time !== undefined) updateData.end_time = body.end_time;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.time_block_label !== undefined) updateData.time_block_label = body.time_block_label;
    if (body.is_billable !== undefined) updateData.is_billable = body.is_billable;
    if (body.in_scope !== undefined) updateData.in_scope = body.in_scope;
    
    console.log('🔍 API: Update data:', updateData);
    
    // Update the time block
    const { data, error } = await supabase
      .from('time_blocks')
      .update(updateData)
      .eq('time_block_id', body.time_block_id)
      .eq('clerk_user_id', userId)
      .select(`
        *,
        client:clients (
          client_id,
          name,
          billing_rate,
          email,
          status
        )
      `);
    
    if (error) {
      console.error('❌ API: Error updating time block:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    console.log('✅ API: Time block updated successfully:', data);
    return NextResponse.json({ timeBlock: data[0] });
  } catch (error: any) {
    console.error('❌ API: Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
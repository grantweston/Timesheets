import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function DELETE(req: NextRequest) {
  console.log('🔍 API: delete time-block route called');
  
  try {
    // Get the Clerk user ID
    console.log('🔍 API: Getting Clerk userId from auth()');
    const { userId } = auth();
    
    if (!userId) {
      console.log('❌ API: No userId found in auth()');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('✅ API: Got userId:', userId);
    
    // Get the time block ID from the URL
    const url = new URL(req.url);
    const timeBlockId = url.searchParams.get('id');
    
    if (!timeBlockId) {
      console.log('❌ API: No time block ID provided');
      return NextResponse.json(
        { error: 'No time block ID provided' },
        { status: 400 }
      );
    }
    
    console.log('🔍 API: Deleting time block with ID:', timeBlockId);
    
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
      .select('time_block_id')
      .eq('time_block_id', timeBlockId)
      .eq('clerk_user_id', userId)
      .single();
    
    if (verifyError) {
      console.error('❌ API: Error verifying time block:', verifyError);
      
      if (verifyError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Time block not found or you do not have permission to delete it' },
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
        { error: 'Time block not found or you do not have permission to delete it' },
        { status: 404 }
      );
    }
    
    // Delete the time block
    const { error: deleteError } = await supabase
      .from('time_blocks')
      .delete()
      .eq('time_block_id', timeBlockId)
      .eq('clerk_user_id', userId);
    
    if (deleteError) {
      console.error('❌ API: Error deleting time block:', deleteError);
      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 }
      );
    }
    
    console.log('✅ API: Time block deleted successfully');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ API: Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
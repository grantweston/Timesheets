import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET(req: NextRequest) {
  console.log('🔍 API: get-user route called');
  
  try {
    // Get the Clerk user ID and token
    console.log('🔍 API: Getting Clerk userId from auth()');
    const { userId } = auth();
    
    if (!userId) {
      console.log('❌ API: No userId found in auth()');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('✅ API: Got userId:', userId);
    
    // Create a Supabase client with service role key (bypasses RLS)
    console.log('🔍 API: Creating Supabase client with service role key');
    console.log('🔍 API: NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('🔍 API: SUPABASE_SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
    
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
    
    // Query the user data
    console.log('🔍 API: Querying user with clerk_user_id:', userId);
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_user_id', userId)
      .single();
      
    if (error) {
      console.error('❌ API: Error fetching user:', error);
      console.log('❌ API: Error details:', JSON.stringify(error));
      
      // Check if it's a "not found" error
      if (error.code === 'PGRST116') {
        return NextResponse.json({ user: null }, { status: 404 });
      }
      
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    if (!user) {
      console.log('🔍 API: No user found with clerk_user_id:', userId);
      return NextResponse.json({ user: null }, { status: 404 });
    }
    
    console.log('✅ API: User found:', {
      clerk_user_id: user.clerk_user_id,
      email: user.email,
      display_name: user.display_name
    });
    
    return NextResponse.json({ user });
  } catch (error: any) {
    console.error('❌ API: Unexpected error:', error);
    console.log('❌ API: Error details:', error instanceof Error ? error.stack : String(error));
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
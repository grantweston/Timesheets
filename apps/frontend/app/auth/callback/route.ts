import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    console.log('🔍 Auth callback initiated');
    console.log('🔍 DEBUG: Full request URL:', request.url);
    const requestUrl = new URL(request.url);
    console.log('🔍 DEBUG: All search params:', Object.fromEntries(requestUrl.searchParams.entries()));
    const code = requestUrl.searchParams.get('code');
    console.log('📝 Auth code received:', code ? 'Present' : 'Missing');
    
    if (code) {
      console.log('🔄 Creating Supabase client and exchanging code for session...');
      const cookieStore = cookies();
      console.log('🔍 DEBUG: Cookie store created');
      
      // Log environment variables (without exposing sensitive values)
      console.log('🔍 DEBUG: NEXT_PUBLIC_SUPABASE_URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
      console.log('🔍 DEBUG: NEXT_PUBLIC_SUPABASE_ANON_KEY exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
      
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
      console.log('🔍 DEBUG: Supabase client created');
      
      try {
        await supabase.auth.exchangeCodeForSession(code);
        console.log('✅ Code exchanged for session');
      } catch (exchangeError) {
        console.error('❌ ERROR: Failed to exchange code for session:', exchangeError);
        throw exchangeError;
      }

      // Get user info from session
      console.log('🔍 Fetching session data...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('📋 Session data:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        userId: session?.user?.id,
        userEmail: session?.user?.email,
      });

      if (sessionError) {
        console.error('❌ Error getting session:', sessionError);
        console.error('❌ DEBUG: Session error details:', JSON.stringify(sessionError));
        throw sessionError;
      }
      
      if (session?.user) {
        // Write user info to our users table
        console.log('💾 Attempting to upsert user data...');
        
        // Include email in user data
        const userData = {
          user_id: session.user.id,
          clerk_user_id: session.user.id, // Using Supabase ID temporarily
          email: session.user.email, // Include email from session
          created_at: new Date().toISOString(),
        };
        console.log('📝 User data to upsert:', JSON.stringify(userData));

        // Check if user already exists before upserting
        console.log('🔍 DEBUG: Checking if user already exists');
        const { data: existingUser, error: checkError } = await supabase
          .from('users')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle();
          
        if (checkError) {
          console.error('❌ DEBUG: Error checking for existing user:', JSON.stringify(checkError));
        } else {
          console.log('🔍 DEBUG: Existing user check result:', existingUser ? 'User exists' : 'User does not exist');
        }

        const { data: upsertData, error: upsertError } = await supabase
          .from('users')
          .upsert(userData, {
            onConflict: 'user_id',
            ignoreDuplicates: false,
          })
          .select();

        if (upsertError) {
          console.error('❌ Error upserting user:', upsertError);
          console.error('❌ DEBUG: Upsert error details:', JSON.stringify(upsertError));
          
          // Additional debugging for upsert errors
          console.log('🔍 DEBUG: Attempting to query users table structure');
          const { data: tableInfo, error: tableError } = await supabase
            .from('users')
            .select('*')
            .limit(0);
            
          if (tableError) {
            console.error('❌ DEBUG: Error querying users table:', JSON.stringify(tableError));
          } else {
            console.log('✅ DEBUG: Users table exists and is accessible');
          }
          
          throw upsertError;
        }
        console.log('✅ User data upserted successfully');
        console.log('✅ DEBUG: Upsert result:', JSON.stringify(upsertData));
      } else {
        console.warn('⚠️ No user found in session');
      }
    }

    console.log('🔄 Redirecting to origin...');
    const origin = new URL(request.url).origin;
    return NextResponse.redirect(origin);
  } catch (error) {
    console.error('❌ Auth callback error:', error);
    console.error('❌ DEBUG: Full error details:', error instanceof Error ? error.stack : JSON.stringify(error));
    const origin = new URL(request.url).origin;
    return NextResponse.redirect(
      `${origin}/login?error=Could not authenticate user`
    );
  }
}
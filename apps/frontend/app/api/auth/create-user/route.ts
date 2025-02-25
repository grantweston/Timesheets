import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';

interface TableColumn {
  column_name: string;
  data_type: string;
  is_nullable: boolean;
  column_default: string | null;
}

export async function POST(req: NextRequest) {
  console.log('🔍 API: create-user route called');
  
  try {
    // Get the Clerk user ID and token
    console.log('🔍 API: Getting Clerk userId from auth()');
    const { userId } = auth();
    
    if (!userId) {
      console.log('❌ API: No userId found in auth()');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('✅ API: Got userId:', userId);
    
    // Get user data from request body
    console.log('🔍 API: Parsing request body');
    const userData = await req.json();
    console.log('✅ API: Request body parsed:', userData);
    
    // Create a Supabase client
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
      process.env.SUPABASE_SERVICE_ROLE_KEY, // Use service role key to bypass RLS
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    );
    console.log('✅ API: Supabase client created');
    
    // Check if user already exists - outside of transaction
    console.log('🔍 API: Checking if user exists with clerk_user_id:', userId);
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_user_id', userId)
      .maybeSingle();
      
    if (checkError) {
      console.error('❌ API: Error checking for user:', checkError);
      console.log('❌ API: Error details:', JSON.stringify(checkError));
      return NextResponse.json({ error: checkError.message }, { status: 500 });
    }
    
    if (existingUser) {
      console.log('✅ API: User already exists:', existingUser);
      
      // Update the user if needed
      if (userData.clerk_sub_id && (!existingUser.clerk_sub_id || existingUser.clerk_sub_id !== userData.clerk_sub_id)) {
        console.log('🔍 API: Updating clerk_sub_id for existing user to:', userData.clerk_sub_id);
        const { error: updateError } = await supabase
          .from('users')
          .update({ clerk_sub_id: userData.clerk_sub_id })
          .eq('clerk_user_id', userId);
          
        if (updateError) {
          console.error('❌ API: Error updating clerk_sub_id:', updateError);
          console.log('❌ API: Error details:', JSON.stringify(updateError));
          return NextResponse.json({ error: updateError.message }, { status: 500 });
        }
        console.log('✅ API: clerk_sub_id updated successfully');
      }
      
      return NextResponse.json({ user: existingUser });
    }
    
    // Get the columns of the users table - outside of transaction
    console.log('🔍 API: Getting table columns for users table');
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name: 'users' });
      
    if (columnsError) {
      console.error('❌ API: Error getting table columns:', columnsError);
      console.log('❌ API: Error details:', JSON.stringify(columnsError));
      return NextResponse.json({ error: columnsError.message }, { status: 500 });
    }
    
    console.log('✅ API: Got table columns:', columns);
    
    // Filter the user data to only include columns that exist in the table
    console.log('🔍 API: Filtering user data to match table columns');
    const columnNames = columns.map((col: TableColumn) => col.column_name);
    console.log('🔍 API: Available column names:', columnNames);
    
    const filteredUserData = Object.keys(userData)
      .filter(key => columnNames.includes(key))
      .reduce((obj, key) => {
        obj[key] = userData[key];
        return obj;
      }, {} as Record<string, any>);
    
    // Ensure clerk_user_id is set
    filteredUserData.clerk_user_id = userId;
    
    console.log('✅ API: Filtered user data:', filteredUserData);
    
    // Create the user with a transaction
    console.log('🔍 API: Creating new user with filtered data');
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert(filteredUserData)
      .select()
      .single();
      
    if (insertError) {
      console.error('❌ API: Error creating user:', insertError);
      console.log('❌ API: Error details:', JSON.stringify(insertError));
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
    
    console.log('✅ API: User created successfully:', newUser);
    return NextResponse.json({ user: newUser });
  } catch (error: any) {
    console.error('❌ API: Unexpected error:', error);
    console.log('❌ API: Error details:', error instanceof Error ? error.stack : String(error));
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
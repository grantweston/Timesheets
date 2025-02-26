import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';

export async function GET(req: NextRequest) {
  const requestId = Math.random().toString(36).substring(2, 10); // Generate a unique ID for this request
  console.log(`🔍 [${requestId}] GET /api/auth/get-user called`);
  console.log(`🔍 [${requestId}] Headers:`, JSON.stringify(Object.fromEntries([...req.headers.entries()])));
  
  try {
    // Get the Clerk user ID
    console.log(`🔍 [${requestId}] Getting Clerk userId from auth()`);
    const { userId } = auth();
    
    if (!userId) {
      console.log(`❌ [${requestId}] No userId found in auth()`);
      return NextResponse.json({ error: 'Unauthorized - No Clerk user ID found' }, { status: 401 });
    }
    
    console.log(`✅ [${requestId}] Got userId: ${userId}`);
    
    // Get the Clerk user details to get the email
    console.log(`🔍 [${requestId}] Fetching Clerk user details`);
    const user = await currentUser();
    
    if (!user) {
      console.log(`❌ [${requestId}] Could not fetch Clerk user details`);
      return NextResponse.json({ error: 'Could not fetch user details from Clerk' }, { status: 500 });
    }
    
    const primaryEmail = user.emailAddresses.find(email => email.id === user.primaryEmailAddressId)?.emailAddress;
    console.log(`✅ [${requestId}] Got Clerk user details: email=${primaryEmail}, name=${user.firstName} ${user.lastName}`);
    
    // Create a Supabase client
    console.log(`🔍 [${requestId}] Creating Supabase client with service role key`);
    console.log(`🔍 [${requestId}] NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);
    console.log(`🔍 [${requestId}] SUPABASE_SERVICE_ROLE_KEY exists: ${!!process.env.SUPABASE_SERVICE_ROLE_KEY}`);
    
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error(`❌ [${requestId}] SUPABASE_SERVICE_ROLE_KEY is not defined`);
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
    console.log(`✅ [${requestId}] Supabase client created`);
    
    // Query for the user
    console.log(`🔍 [${requestId}] Querying user with clerk_user_id: ${userId}`);
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_user_id', userId)
      .maybeSingle();
    
    // If the user exists, check if we need to update any information
    if (existingUser) {
      console.log(`✅ [${requestId}] User found: ${JSON.stringify(existingUser)}`);
      
      // Check if we need to update user information
      const needsUpdate = (
        (primaryEmail && existingUser.email !== primaryEmail) ||
        (user.firstName && existingUser.first_name !== user.firstName) ||
        (user.lastName && existingUser.last_name !== user.lastName)
      );
      
      if (needsUpdate) {
        console.log(`🔍 [${requestId}] Updating user information`);
        
        // Build update data
        const updateData: Record<string, any> = {};
        
        if (primaryEmail && existingUser.email !== primaryEmail) {
          updateData.email = primaryEmail;
        }
        
        if (user.firstName && existingUser.first_name !== user.firstName) {
          updateData.first_name = user.firstName;
        }
        
        if (user.lastName && existingUser.last_name !== user.lastName) {
          updateData.last_name = user.lastName;
        }
        
        console.log(`🔍 [${requestId}] Update data:`, JSON.stringify(updateData));
        
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update(updateData)
          .eq('clerk_user_id', userId)
          .select()
          .single();
          
        if (updateError) {
          console.error(`❌ [${requestId}] Error updating user:`, updateError);
          console.log(`❌ [${requestId}] Error details: ${JSON.stringify(updateError)}`);
          // Continue with the existing user even if update fails
        } else {
          console.log(`✅ [${requestId}] User updated successfully`);
          return NextResponse.json({ user: updatedUser });
        }
      }
      
      return NextResponse.json({ user: existingUser });
    }
    
    // If there's an error but it's not just that the user doesn't exist, return the error
    if (userError && userError.code !== 'PGRST116') {
      console.error(`❌ [${requestId}] Error fetching user:`, userError);
      console.log(`❌ [${requestId}] Error details: ${JSON.stringify(userError)}`);
      return NextResponse.json({ error: userError.message }, { status: 500 });
    }
    
    // User doesn't exist, so create one
    console.log(`🔍 [${requestId}] User not found, creating new user`);
    
    // Create user data including email and name
    const userData = {
      clerk_user_id: userId,
      email: primaryEmail || null,
      first_name: user.firstName || null,
      last_name: user.lastName || null,
      display_name: [user.firstName, user.lastName].filter(Boolean).join(' ') || null,
      created_at: new Date().toISOString(),
    };
    
    console.log(`✅ [${requestId}] User data to insert: ${JSON.stringify(userData)}`);
    
    // Create the user
    console.log(`🔍 [${requestId}] Inserting new user into database`);
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single();
      
    if (insertError) {
      console.error(`❌ [${requestId}] Error creating user:`, insertError);
      console.log(`❌ [${requestId}] Error details: ${JSON.stringify(insertError)}`);
      
      // Additional debugging for insert errors
      console.log(`🔍 [${requestId}] Attempting to verify users table exists`);
      const { data: tableInfo, error: tableError } = await supabase
        .from('users')
        .select('*')
        .limit(0);
        
      if (tableError) {
        console.error(`❌ [${requestId}] Error accessing users table:`, tableError);
        console.log(`❌ [${requestId}] Table error details: ${JSON.stringify(tableError)}`);
      } else {
        console.log(`✅ [${requestId}] Users table exists and is accessible`);
        
        // Get the table structure
        console.log(`🔍 [${requestId}] Querying users table structure`);
        const { data: tableStructure, error: structureError } = await supabase
          .rpc('get_table_columns', { table_name: 'users' });
          
        if (structureError) {
          console.error(`❌ [${requestId}] Error getting table structure:`, structureError);
        } else {
          console.log(`✅ [${requestId}] Table structure: ${JSON.stringify(tableStructure)}`);
        }
      }
      
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
    
    console.log(`✅ [${requestId}] User created successfully: ${JSON.stringify(newUser)}`);
    return NextResponse.json({ user: newUser });
  } catch (error: any) {
    console.error(`❌ [${requestId}] Unexpected error:`, error);
    console.log(`❌ [${requestId}] Error details: ${error instanceof Error ? error.stack : String(error)}`);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
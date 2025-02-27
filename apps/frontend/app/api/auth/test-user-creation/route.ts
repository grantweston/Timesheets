import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';

/**
 * Test endpoint to manually trigger user creation in Supabase
 * This can be called after signing up with Clerk to debug the user creation process
 */
export async function GET(req: NextRequest) {
  console.log('🔍 TEST API: test-user-creation route called');

  try {
    // Get the Clerk user ID
    console.log('🔍 TEST API: Getting Clerk userId from auth()');
    const { userId } = auth();

    if (!userId) {
      console.log('❌ TEST API: No userId found in auth()');
      return NextResponse.json({ error: 'Unauthorized - No Clerk user ID found' }, { status: 401 });
    }

    console.log('✅ TEST API: Got userId:', userId);
    
    // Get the Clerk user details to get the email
    console.log('🔍 TEST API: Fetching Clerk user details');
    const user = await currentUser();
    
    if (!user) {
      console.log('❌ TEST API: Could not fetch Clerk user details');
      return NextResponse.json({ error: 'Could not fetch user details from Clerk' }, { status: 500 });
    }
    
    const primaryEmail = user.emailAddresses.find(email => email.id === user.primaryEmailAddressId)?.emailAddress;
    console.log('✅ TEST API: Got Clerk user details:', {
      email: primaryEmail,
      firstName: user.firstName,
      lastName: user.lastName
    });

    // Create a Supabase client
    console.log('🔍 TEST API: Creating Supabase client with service role key');
    console.log('🔍 TEST API: NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('🔍 TEST API: SUPABASE_SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ TEST API: SUPABASE_SERVICE_ROLE_KEY is not defined');
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
    console.log('✅ TEST API: Supabase client created');

    // Check if user already exists
    console.log('🔍 TEST API: Checking if user exists with clerk_user_id:', userId);
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_user_id', userId)
      .maybeSingle();

    if (checkError) {
      console.error('❌ TEST API: Error checking for user:', checkError);
      console.log('❌ TEST API: Error details:', JSON.stringify(checkError));
      return NextResponse.json({ error: checkError.message }, { status: 500 });
    }

    if (existingUser) {
      console.log('✅ TEST API: User already exists:', JSON.stringify(existingUser));
      
      // Check if we need to update user information
      const needsUpdate = (
        (primaryEmail && existingUser.email !== primaryEmail) ||
        (user.firstName && existingUser.first_name !== user.firstName) ||
        (user.lastName && existingUser.last_name !== user.lastName)
      );
      
      if (needsUpdate) {
        console.log('🔍 TEST API: Updating user information');
        
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
        
        // Update display name if first or last name changed
        if (updateData.first_name || updateData.last_name) {
          const firstName = updateData.first_name || existingUser.first_name;
          const lastName = updateData.last_name || existingUser.last_name;
          updateData.display_name = [firstName, lastName].filter(Boolean).join(' ') || null;
        }
        
        console.log('🔍 TEST API: Update data:', JSON.stringify(updateData));
        
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update(updateData)
          .eq('clerk_user_id', userId)
          .select()
          .single();
          
        if (updateError) {
          console.error('❌ TEST API: Error updating user:', updateError);
          console.log('❌ TEST API: Error details:', JSON.stringify(updateError));
          return NextResponse.json({
            message: 'User exists but failed to update information',
            user: existingUser,
            updateError: updateError.message
          });
        } else {
          console.log('✅ TEST API: User information updated successfully');
          return NextResponse.json({
            message: 'User exists and information was updated',
            user: updatedUser
          });
        }
      }
      
      return NextResponse.json({
        message: 'User already exists in Supabase',
        user: existingUser
      });
    }

    // Get the columns of the users table
    console.log('🔍 TEST API: Getting table columns for users table');
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name: 'users' });

    if (columnsError) {
      console.error('❌ TEST API: Error getting table columns:', columnsError);
      console.log('❌ TEST API: Error details:', JSON.stringify(columnsError));
      return NextResponse.json({ error: columnsError.message }, { status: 500 });
    }

    console.log('✅ TEST API: Got table columns:', JSON.stringify(columns));

    // Create comprehensive user data
    const userData = {
      clerk_user_id: userId,
      email: primaryEmail || null,
      first_name: user.firstName || null,
      last_name: user.lastName || null,
      display_name: [user.firstName, user.lastName].filter(Boolean).join(' ') || null,
      created_at: new Date().toISOString(),
    };

    console.log('✅ TEST API: User data to insert:', JSON.stringify(userData));

    // Create the user
    console.log('🔍 TEST API: Creating new user');
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single();

    if (insertError) {
      console.error('❌ TEST API: Error creating user:', insertError);
      console.log('❌ TEST API: Error details:', JSON.stringify(insertError));

      // Additional debugging for insert errors
      console.log('🔍 TEST API: Attempting to query users table structure');
      const { data: tableInfo, error: tableError } = await supabase
        .from('users')
        .select('*')
        .limit(0);

      if (tableError) {
        console.error('❌ TEST API: Error querying users table:', tableError);
      } else {
        console.log('✅ TEST API: Users table exists and is accessible');

        // Try to get the table definition
        const { data: tableDefinition, error: defError } = await supabase
          .rpc('get_table_columns', { table_name: 'users' });

        if (defError) {
          console.error('❌ TEST API: Error getting table definition:', defError);
        } else {
          console.log('✅ TEST API: Table definition:', JSON.stringify(tableDefinition));
        }
      }

      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    console.log('✅ TEST API: User created successfully:', JSON.stringify(newUser));
    return NextResponse.json({
      message: 'User created successfully in Supabase',
      user: newUser
    });
  } catch (error: any) {
    console.error('❌ TEST API: Unexpected error:', error);
    console.log('❌ TEST API: Error details:', error instanceof Error ? error.stack : String(error));
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
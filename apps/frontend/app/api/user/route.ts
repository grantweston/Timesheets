import { auth, currentUser } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Import necessary database client and utilities
const CLERK_SUPABASE_JWT_ISSUER = process.env.CLERK_SUPABASE_JWT_ISSUER;

export async function GET() {
  try {
    // Get the user from Clerk
    const { userId } = auth();
    const user = await currentUser();

    // If no user found, return unauthorized
    if (!userId || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create Supabase client with service role to bypass RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    );

    // Check if user exists in Supabase users table
    const { data: existingUser, error: queryError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('clerk_user_id', userId)
      .single();
      
    // If user doesn't exist, create them
    if (queryError && !existingUser) {
      // Create user in Supabase
      const { data: newUser, error: insertError } = await supabaseAdmin
        .from('users')
        .insert([
          {
            clerk_user_id: userId,
            email: user.emailAddresses[0]?.emailAddress,
            name: `${user.firstName} ${user.lastName}`,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }

      return NextResponse.json({
        user: newUser,
        status: 'Created',
      });
    }

    // Return existing user
    return NextResponse.json({
      user: existingUser,
      status: 'Existing',
    });
  } catch (error: any) {
    console.error('Error fetching user data:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 
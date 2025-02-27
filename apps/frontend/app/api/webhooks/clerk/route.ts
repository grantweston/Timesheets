import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { Webhook } from 'svix';

// Define the expected webhook event types
type WebhookEvent = {
  data: {
    id: string;
    email_addresses: Array<{
      id: string;
      email_address: string;
      verification: { status: string };
      primary?: boolean;
    }>;
    primary_email_address_id: string;
    first_name: string | null;
    last_name: string | null;
    image_url: string;
  };
  object: 'event';
  type: string;
};

export async function POST(req: Request) {
  const requestId = Math.random().toString(36).substring(2, 10);
  console.log(`🔍 [${requestId}] Clerk webhook received`);
  
  try {
    // Get the Clerk webhook secret
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error(`❌ [${requestId}] CLERK_WEBHOOK_SECRET is not defined`);
      return NextResponse.json(
        { error: 'Webhook secret is not set' },
        { status: 500 }
      );
    }

    // Get the headers directly from the request
    const svixId = req.headers.get('svix-id');
    const svixTimestamp = req.headers.get('svix-timestamp');
    const svixSignature = req.headers.get('svix-signature');
    
    if (!svixId || !svixTimestamp || !svixSignature) {
      console.error(`❌ [${requestId}] Missing Svix headers`);
      return NextResponse.json(
        { error: 'Missing Svix headers' },
        { status: 400 }
      );
    }

    // Get the raw body
    const payload = await req.text();
    const svixHeaders = {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    };
    
    // Initialize Svix webhook with the secret
    const wh = new Webhook(webhookSecret);
    
    // Verify the payload with the headers
    let evt: WebhookEvent;
    try {
      evt = wh.verify(payload, svixHeaders) as WebhookEvent;
    } catch (err) {
      console.error(`❌ [${requestId}] Error verifying webhook:`, err);
      return NextResponse.json(
        { error: 'Error verifying webhook' },
        { status: 400 }
      );
    }

    // Process the event based on the type
    const eventType = evt.type;
    console.log(`✅ [${requestId}] Webhook verified, event type:`, eventType);
    
    // Only handle user creation events
    if (eventType === 'user.created') {
      return await handleUserCreated(evt.data, requestId);
    } else if (eventType === 'user.updated') {
      return await handleUserUpdated(evt.data, requestId);
    }
    
    // For other event types, acknowledge receipt
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`❌ [${requestId}] Webhook error:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleUserCreated(userData: WebhookEvent['data'], requestId: string) {
  console.log(`🔍 [${requestId}] Processing user.created event for user:`, userData.id);
  
  try {
    // Create a Supabase client
    console.log(`🔍 [${requestId}] Creating Supabase client with service role key`);
    
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.error(`❌ [${requestId}] Missing Supabase credentials`);
      return NextResponse.json(
        { error: 'Missing Supabase credentials' },
        { status: 500 }
      );
    }
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    );
    
    // Find primary email
    const primaryEmail = userData.email_addresses.find(
      email => email.id === userData.primary_email_address_id
    )?.email_address;
    
    if (!primaryEmail) {
      console.warn(`⚠️ [${requestId}] No primary email found for user:`, userData.id);
    }
    
    // Check if user already exists
    console.log(`🔍 [${requestId}] Checking if user exists with clerk_user_id:`, userData.id);
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_user_id', userData.id)
      .maybeSingle();
      
    if (checkError && checkError.code !== 'PGRST116') {
      console.error(`❌ [${requestId}] Error checking for user:`, checkError);
      return NextResponse.json({ error: checkError.message }, { status: 500 });
    }
    
    if (existingUser) {
      console.log(`✅ [${requestId}] User already exists in Supabase:`, existingUser.id);
      return NextResponse.json({ success: true, message: 'User already exists', user: existingUser });
    }
    
    // Create display name from first and last name
    const displayName = [userData.first_name, userData.last_name].filter(Boolean).join(' ');
    
    // Create new user in Supabase
    const newUserData = {
      clerk_user_id: userData.id,
      email: primaryEmail || null,
      display_name: displayName || null,
      created_at: new Date().toISOString(),
    };
    
    console.log(`🔍 [${requestId}] Creating new user in Supabase:`, JSON.stringify(newUserData));
    
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert(newUserData)
      .select()
      .single();
      
    if (insertError) {
      console.error(`❌ [${requestId}] Error creating user:`, insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
    
    console.log(`✅ [${requestId}] User successfully created in Supabase:`, newUser.id);
    return NextResponse.json({ success: true, message: 'User created', user: newUser });
  } catch (error) {
    console.error(`❌ [${requestId}] Error in handleUserCreated:`, error);
    return NextResponse.json(
      { error: 'Error creating user' },
      { status: 500 }
    );
  }
}

async function handleUserUpdated(userData: WebhookEvent['data'], requestId: string) {
  console.log(`🔍 [${requestId}] Processing user.updated event for user:`, userData.id);
  
  try {
    // Create a Supabase client
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.error(`❌ [${requestId}] Missing Supabase credentials`);
      return NextResponse.json(
        { error: 'Missing Supabase credentials' },
        { status: 500 }
      );
    }
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    );
    
    // Find primary email
    const primaryEmail = userData.email_addresses.find(
      email => email.id === userData.primary_email_address_id
    )?.email_address;
    
    // Check if user exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_user_id', userData.id)
      .maybeSingle();
      
    if (checkError) {
      console.error(`❌ [${requestId}] Error checking for user:`, checkError);
      return NextResponse.json({ error: checkError.message }, { status: 500 });
    }
    
    if (!existingUser) {
      // User doesn't exist in Supabase, create them
      return await handleUserCreated(userData, requestId);
    }
    
    // Create display name from first and last name
    const displayName = [userData.first_name, userData.last_name].filter(Boolean).join(' ');
    
    // User exists, update their information
    const updateData: Record<string, any> = {
      email: primaryEmail || existingUser.email,
      display_name: displayName || existingUser.display_name,
    };
    
    console.log(`🔍 [${requestId}] Updating user in Supabase:`, JSON.stringify(updateData));
    
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('clerk_user_id', userData.id)
      .select()
      .single();
      
    if (updateError) {
      console.error(`❌ [${requestId}] Error updating user:`, updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
    
    console.log(`✅ [${requestId}] User successfully updated in Supabase:`, updatedUser.id);
    return NextResponse.json({ success: true, message: 'User updated', user: updatedUser });
  } catch (error) {
    console.error(`❌ [${requestId}] Error in handleUserUpdated:`, error);
    return NextResponse.json(
      { error: 'Error updating user' },
      { status: 500 }
    );
  }
} 
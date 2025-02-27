import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET(req: NextRequest) {
  console.log('🔍 API: time-blocks route called');
  
  try {
    // Get query parameters
    const url = new URL(req.url);
    const period = url.searchParams.get('period') || 'today';
    const dateParam = url.searchParams.get('date');
    const referenceDate = dateParam ? new Date(dateParam) : new Date();
    const showAllParam = url.searchParams.get('showAll');
    const showAll = showAllParam === 'true';
    
    console.log('🔍 API: time-blocks params:', { period, dateParam, showAll });
    
    // Get the Clerk user ID
    console.log('🔍 API: Getting Clerk userId from auth()');
    const { userId } = auth();
    
    if (!userId) {
      console.log('❌ API: No userId found in auth()');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('✅ API: Got userId:', userId);
    
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
    
    // If showAll is true, get all time blocks for the user
    if (showAll) {
      console.log('🔍 API: Fetching all time blocks for user');
      
      const { data, error } = await supabase
        .from('time_blocks')
        .select(`
          *,
          client:clients (
            client_id,
            name,
            billing_rate,
            email,
            status
          )
        `)
        .eq('clerk_user_id', userId)
        .order('start_time', { ascending: true });
      
      if (error) {
        console.error('❌ API: Error fetching time blocks:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      
      console.log(`✅ API: Found ${data?.length || 0} time blocks for user`);
      return NextResponse.json({ timeBlocks: data });
    }
    
    // Otherwise, filter by date range
    // Create UTC dates for database querying
    const utcDate = new Date(referenceDate.getTime());
    const startOfDay = new Date(Date.UTC(utcDate.getUTCFullYear(), utcDate.getUTCMonth(), utcDate.getUTCDate(), 0, 0, 0));
    const endOfDay = new Date(Date.UTC(utcDate.getUTCFullYear(), utcDate.getUTCMonth(), utcDate.getUTCDate() + 1, 0, 0, 0));
    
    // For week and month views
    const startOfWeek = new Date(utcDate);
    startOfWeek.setUTCDate(startOfWeek.getUTCDate() - startOfWeek.getUTCDay());
    startOfWeek.setUTCHours(0, 0, 0, 0);
    
    const startOfMonth = new Date(utcDate);
    startOfMonth.setUTCDate(1);
    startOfMonth.setUTCHours(0, 0, 0, 0);
    
    // Define date ranges for filtering based on period
    let startTime: Date;
    let endTime: Date;

    switch (period) {
      case 'today':
        startTime = startOfDay;
        endTime = endOfDay;
        break;
      case 'week':
        startTime = startOfWeek;
        // End time is 7 days after start time
        endTime = new Date(startOfWeek);
        endTime.setUTCDate(endTime.getUTCDate() + 7);
        break;
      case 'month':
        startTime = startOfMonth;
        // End time is the start of next month
        endTime = new Date(startOfMonth);
        endTime.setUTCMonth(endTime.getUTCMonth() + 1);
        break;
      default:
        // Default to today if period is not recognized
        startTime = startOfDay;
        endTime = endOfDay;
        break;
    }
    
    // Make the date range more inclusive by extending the range a bit
    // This helps with timezone issues and blocks that might be right at the boundaries
    const extendedStartTime = new Date(startTime);
    extendedStartTime.setUTCHours(extendedStartTime.getUTCHours() - 12); // Extend 12 hours earlier
    
    const extendedEndTime = new Date(endTime);
    extendedEndTime.setUTCHours(extendedEndTime.getUTCHours() + 12); // Extend 12 hours later
    
    console.log('🔍 API: Querying with date range:', {
      period,
      original: {
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      },
      extended: {
        startTime: extendedStartTime.toISOString(),
        endTime: extendedEndTime.toISOString(),
      }
    });
    
    // Query with extended date range
    const { data, error } = await supabase
      .from('time_blocks')
      .select(`
        *,
        client:clients (
          client_id,
          name,
          billing_rate,
          email,
          status
        )
      `)
      .eq('clerk_user_id', userId)
      .gte('start_time', extendedStartTime.toISOString())
      .lt('start_time', extendedEndTime.toISOString())
      .order('start_time', { ascending: true });
    
    if (error) {
      console.error('❌ API: Error fetching time blocks:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    console.log(`✅ API: Found ${data?.length || 0} time blocks for period ${period}`);
    return NextResponse.json({ timeBlocks: data });
  } catch (error: any) {
    console.error('❌ API: Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
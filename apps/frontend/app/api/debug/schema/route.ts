import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Create a Supabase client with the anon key
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Query the database schema information
    const { data: columnsData, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('*')
      .eq('table_name', 'users');

    if (columnsError) {
      console.error('Error fetching columns:', columnsError);
      return NextResponse.json(
        { error: columnsError.message },
        { status: 500 }
      );
    }

    // Get primary key information
    const { data: pkData, error: pkError } = await supabase
      .from('information_schema.table_constraints')
      .select(`
        constraint_name,
        constraint_type,
        information_schema.key_column_usage(column_name)
      `)
      .eq('table_name', 'users')
      .eq('constraint_type', 'PRIMARY KEY');

    if (pkError) {
      console.error('Error fetching primary key info:', pkError);
      return NextResponse.json(
        { error: pkError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      columns: columnsData,
      primaryKeys: pkData
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
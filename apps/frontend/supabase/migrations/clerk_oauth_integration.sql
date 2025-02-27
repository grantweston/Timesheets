-- Add clerk_sub_id column to users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS clerk_sub_id TEXT;

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_clerk_sub_id ON users(clerk_sub_id);

-- Create a function to extract the appropriate ID from the JWT
-- This function will try to match either the clerk_user_id or clerk_sub_id
CREATE OR REPLACE FUNCTION auth.get_clerk_id()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT 
    coalesce(
      nullif(current_setting('request.jwt.claim.sub', true), ''),
      (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
    )::text;
$$;

-- Create a function to get table columns
CREATE OR REPLACE FUNCTION public.get_table_columns(table_name text)
RETURNS TABLE (
  column_name text,
  data_type text,
  is_nullable boolean,
  column_default text
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    column_name::text,
    data_type::text,
    (is_nullable = 'YES')::boolean as is_nullable,
    column_default::text
  FROM 
    information_schema.columns
  WHERE 
    table_schema = 'public'
    AND table_name = get_table_columns.table_name
  ORDER BY 
    ordinal_position;
$$;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION public.get_table_columns TO public;

-- Update RLS policies for users table
DROP POLICY IF EXISTS users_select_policy ON public.users;
CREATE POLICY users_select_policy ON public.users
  FOR SELECT USING (
    clerk_user_id = auth.uid()::text 
    OR 
    clerk_sub_id = auth.get_clerk_id()
  );

DROP POLICY IF EXISTS users_update_policy ON public.users;
CREATE POLICY users_update_policy ON public.users
  FOR UPDATE USING (
    clerk_user_id = auth.uid()::text 
    OR 
    clerk_sub_id = auth.get_clerk_id()
  );

DROP POLICY IF EXISTS users_delete_policy ON public.users;
CREATE POLICY users_delete_policy ON public.users
  FOR DELETE USING (
    clerk_user_id = auth.uid()::text 
    OR 
    clerk_sub_id = auth.get_clerk_id()
  );

-- Update RLS policies for clients table
DROP POLICY IF EXISTS clients_select_policy ON public.clients;
CREATE POLICY clients_select_policy ON public.clients
  FOR SELECT USING (
    clerk_user_id IN (
      SELECT clerk_user_id FROM users 
      WHERE clerk_user_id = auth.uid()::text 
      OR clerk_sub_id = auth.get_clerk_id()
    )
  );

DROP POLICY IF EXISTS clients_update_policy ON public.clients;
CREATE POLICY clients_update_policy ON public.clients
  FOR UPDATE USING (
    clerk_user_id IN (
      SELECT clerk_user_id FROM users 
      WHERE clerk_user_id = auth.uid()::text 
      OR clerk_sub_id = auth.get_clerk_id()
    )
  );

DROP POLICY IF EXISTS clients_delete_policy ON public.clients;
CREATE POLICY clients_delete_policy ON public.clients
  FOR DELETE USING (
    clerk_user_id IN (
      SELECT clerk_user_id FROM users 
      WHERE clerk_user_id = auth.uid()::text 
      OR clerk_sub_id = auth.get_clerk_id()
    )
  );

-- Update RLS policies for time_blocks table
DROP POLICY IF EXISTS time_blocks_select_policy ON public.time_blocks;
CREATE POLICY time_blocks_select_policy ON public.time_blocks
  FOR SELECT USING (
    clerk_user_id IN (
      SELECT clerk_user_id FROM users 
      WHERE clerk_user_id = auth.uid()::text 
      OR clerk_sub_id = auth.get_clerk_id()
    )
  );

DROP POLICY IF EXISTS time_blocks_update_policy ON public.time_blocks;
CREATE POLICY time_blocks_update_policy ON public.time_blocks
  FOR UPDATE USING (
    clerk_user_id IN (
      SELECT clerk_user_id FROM users 
      WHERE clerk_user_id = auth.uid()::text 
      OR clerk_sub_id = auth.get_clerk_id()
    )
  );

DROP POLICY IF EXISTS time_blocks_delete_policy ON public.time_blocks;
CREATE POLICY time_blocks_delete_policy ON public.time_blocks
  FOR DELETE USING (
    clerk_user_id IN (
      SELECT clerk_user_id FROM users 
      WHERE clerk_user_id = auth.uid()::text 
      OR clerk_sub_id = auth.get_clerk_id()
    )
  );

-- Repeat for other tables (devices, link_codes, engagement_letters) as needed
-- Example for devices table:
DROP POLICY IF EXISTS devices_select_policy ON public.devices;
CREATE POLICY devices_select_policy ON public.devices
  FOR SELECT USING (
    clerk_user_id IN (
      SELECT clerk_user_id FROM users 
      WHERE clerk_user_id = auth.uid()::text 
      OR clerk_sub_id = auth.get_clerk_id()
    )
  );

-- Add similar policies for UPDATE and DELETE operations on devices

-- Enable RLS on all tables if not already enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_letters ENABLE ROW LEVEL SECURITY; 
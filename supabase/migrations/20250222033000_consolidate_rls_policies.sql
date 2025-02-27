-- Drop ALL existing policies first
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN (
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename IN ('users', 'time_blocks')
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
            pol.policyname, pol.schemaname, pol.tablename);
    END LOOP;
END $$;

-- Set default transaction mode to read-write
ALTER SYSTEM SET default_transaction_read_only = off;
SELECT pg_reload_conf();

-- Set role-level default to read-write
ALTER ROLE authenticated SET default_transaction_read_only = off;
ALTER ROLE anon SET default_transaction_read_only = off;

-- Set session characteristics to ensure read-write mode persists
ALTER DATABASE postgres SET default_transaction_read_only = off;

-- Enable RLS on tables if not already enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_blocks ENABLE ROW LEVEL SECURITY;

-- Create UUID v5 function
CREATE OR REPLACE FUNCTION clerk_id_to_uuid(clerk_id text)
RETURNS uuid AS $$
DECLARE
    -- Using the same namespace UUID as in the frontend
    namespace uuid := '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
BEGIN
    -- Generate a v5 UUID using the clerk_id as name and our namespace
    RETURN extensions.uuid_generate_v5(namespace, clerk_id);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Helper function to get clerk user id from JWT claims
CREATE OR REPLACE FUNCTION get_clerk_user_id() 
RETURNS TEXT AS $$
BEGIN
    RETURN (current_setting('request.jwt.claims', true)::json->'user_metadata'->>'clerk_id')::text;
EXCEPTION 
    WHEN OTHERS THEN 
        RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get supabase user id from JWT claims
CREATE OR REPLACE FUNCTION get_supabase_user_id() 
RETURNS uuid AS $$
BEGIN
    RETURN (current_setting('request.jwt.claims', true)::json->'user_metadata'->>'sub')::uuid;
EXCEPTION 
    WHEN OTHERS THEN 
        RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RPC function to set transaction mode
CREATE OR REPLACE FUNCTION set_transaction_mode()
RETURNS void AS $$
BEGIN
    -- Set at session level
    SET SESSION CHARACTERISTICS AS TRANSACTION READ WRITE;
    -- Start a transaction
    BEGIN;
    -- Set for current transaction
    SET TRANSACTION READ WRITE;
    -- Commit the transaction
    COMMIT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Users table policies
CREATE POLICY "users_select_policy" ON users
FOR SELECT USING (true);

CREATE POLICY "users_insert_policy" ON users
FOR INSERT WITH CHECK (
    clerk_user_id = get_clerk_user_id()
);

CREATE POLICY "users_update_policy" ON users
FOR UPDATE USING (
    clerk_user_id = get_clerk_user_id()
) WITH CHECK (
    clerk_user_id = get_clerk_user_id()
);

-- Time blocks policies
CREATE POLICY "time_blocks_select_policy" ON time_blocks
FOR SELECT USING (
    user_id IN (
        SELECT user_id FROM users 
        WHERE clerk_user_id = get_clerk_user_id()
    )
);

CREATE POLICY "time_blocks_insert_policy" ON time_blocks
FOR INSERT WITH CHECK (
    user_id IN (
        SELECT user_id FROM users 
        WHERE clerk_user_id = get_clerk_user_id()
    )
);

CREATE POLICY "time_blocks_update_policy" ON time_blocks
FOR UPDATE USING (
    user_id IN (
        SELECT user_id FROM users 
        WHERE clerk_user_id = get_clerk_user_id()
    )
) WITH CHECK (
    user_id IN (
        SELECT user_id FROM users 
        WHERE clerk_user_id = get_clerk_user_id()
    )
);

CREATE POLICY "time_blocks_delete_policy" ON time_blocks
FOR DELETE USING (
    user_id IN (
        SELECT user_id FROM users 
        WHERE clerk_user_id = get_clerk_user_id()
    )
);

-- Drop the function if it exists
DROP FUNCTION IF EXISTS get_user_with_transaction(text);

-- Create function to get user with transaction mode
CREATE OR REPLACE FUNCTION get_user_with_transaction(p_clerk_user_id TEXT)
RETURNS TABLE (
    id uuid,
    clerk_user_id text,
    email text,
    display_name text,
    timezone text,
    is_desktop_setup boolean,
    integration_statuses jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
) AS $$
BEGIN
    -- Set both session and transaction level
    SET SESSION CHARACTERISTICS AS TRANSACTION READ WRITE;
    SET TRANSACTION READ WRITE;
    
    -- Return user data directly
    RETURN QUERY 
    SELECT 
        users.id,
        users.clerk_user_id,
        users.email,
        users.display_name,
        users.timezone,
        users.is_desktop_setup,
        users.integration_statuses,
        users.created_at,
        users.updated_at
    FROM users
    WHERE users.clerk_user_id = p_clerk_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to the authenticated role
GRANT EXECUTE ON FUNCTION get_user_with_transaction TO authenticated; 
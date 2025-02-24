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
CREATE OR REPLACE FUNCTION set_transaction_mode(mode text)
RETURNS void AS $$
BEGIN
    IF mode = 'read write' THEN
        SET TRANSACTION READ WRITE;
    ELSIF mode = 'read only' THEN
        SET TRANSACTION READ ONLY;
    ELSE
        RAISE EXCEPTION 'Invalid transaction mode';
    END IF;
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
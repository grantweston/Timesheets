-- Drop existing policies and functions
DROP POLICY IF EXISTS "Time blocks for clerk user" ON time_blocks;
DROP FUNCTION IF EXISTS get_clerk_id();

-- Create a simpler policy
CREATE POLICY "time_blocks_policy"
ON time_blocks
FOR ALL
USING (
    clerk_id = COALESCE(
        current_setting('request.headers.x-clerk-user-id', true),
        current_setting('request.jwt.claims', true)::json->>'sub'
    )
);

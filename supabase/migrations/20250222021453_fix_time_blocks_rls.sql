-- Drop existing policies
DROP POLICY IF EXISTS "time_blocks_policy" ON time_blocks;
DROP POLICY IF EXISTS "Time blocks for clerk user" ON time_blocks;

-- Create separate policies for different operations
CREATE POLICY "time_blocks_select_policy"
ON time_blocks
FOR SELECT
USING (clerk_id = current_setting('request.headers.x-clerk-user-id', true));

CREATE POLICY "time_blocks_insert_policy"
ON time_blocks
FOR INSERT
WITH CHECK (
    clerk_id = current_setting('request.headers.x-clerk-user-id', true)
);

CREATE POLICY "time_blocks_update_policy"
ON time_blocks
FOR UPDATE
USING (
    clerk_id = current_setting('request.headers.x-clerk-user-id', true)
)
WITH CHECK (
    clerk_id = current_setting('request.headers.x-clerk-user-id', true)
);

CREATE POLICY "time_blocks_delete_policy"
ON time_blocks
FOR DELETE
USING (
    clerk_id = current_setting('request.headers.x-clerk-user-id', true)
);

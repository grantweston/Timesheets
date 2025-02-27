-- First, drop foreign key constraints
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_organization_id_fkey;
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_organization_id_fkey;
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_organization_id_fkey;

-- Remove organization_id columns
ALTER TABLE users DROP COLUMN IF EXISTS organization_id;
ALTER TABLE projects DROP COLUMN IF EXISTS organization_id;
ALTER TABLE invoices DROP COLUMN IF EXISTS organization_id;

-- Drop organizations table
DROP TABLE IF EXISTS organizations;

-- Add user_id to time_blocks and migrate data
ALTER TABLE time_blocks ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id);

-- Migrate existing data from clerk_id to user_id
UPDATE time_blocks 
SET user_id = (
    SELECT id 
    FROM users 
    WHERE users.clerk_user_id = time_blocks.clerk_id
)
WHERE user_id IS NULL;

-- Make user_id not null after data migration
ALTER TABLE time_blocks ALTER COLUMN user_id SET NOT NULL;

-- Drop old clerk_id column
ALTER TABLE time_blocks DROP COLUMN clerk_id;

-- Update RLS policies for time_blocks
DROP POLICY IF EXISTS "time_blocks_select_policy" ON time_blocks;
DROP POLICY IF EXISTS "time_blocks_insert_policy" ON time_blocks;
DROP POLICY IF EXISTS "time_blocks_update_policy" ON time_blocks;
DROP POLICY IF EXISTS "time_blocks_delete_policy" ON time_blocks;

-- Create new RLS policies using user_id
CREATE POLICY "time_blocks_select_policy"
ON time_blocks
FOR SELECT
USING (user_id IN (
    SELECT id FROM users 
    WHERE clerk_user_id = current_setting('request.headers.x-clerk-user-id', true)
));

CREATE POLICY "time_blocks_insert_policy"
ON time_blocks
FOR INSERT
WITH CHECK (user_id IN (
    SELECT id FROM users 
    WHERE clerk_user_id = current_setting('request.headers.x-clerk-user-id', true)
));

CREATE POLICY "time_blocks_update_policy"
ON time_blocks
FOR UPDATE
USING (user_id IN (
    SELECT id FROM users 
    WHERE clerk_user_id = current_setting('request.headers.x-clerk-user-id', true)
))
WITH CHECK (user_id IN (
    SELECT id FROM users 
    WHERE clerk_user_id = current_setting('request.headers.x-clerk-user-id', true)
));

CREATE POLICY "time_blocks_delete_policy"
ON time_blocks
FOR DELETE
USING (user_id IN (
    SELECT id FROM users 
    WHERE clerk_user_id = current_setting('request.headers.x-clerk-user-id', true)
));

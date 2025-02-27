-- Drop the old policy
DROP POLICY IF EXISTS "Time blocks for specific email" ON time_blocks;

-- Add clerk_id column if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'time_blocks' AND column_name = 'clerk_id') 
  THEN
    ALTER TABLE time_blocks ADD COLUMN clerk_id TEXT;
  END IF;
END $$;

-- Update existing records with clerk_id
UPDATE time_blocks 
SET clerk_id = 'user_2tExBCPQtiCFy1EMr1EJ76rZGgK' 
WHERE user_email = 'grantmweston@gmail.com';

-- Create new policy using clerk_id
CREATE POLICY "Time blocks for clerk user" 
ON time_blocks FOR ALL 
USING (clerk_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Create function to handle clerk auth
CREATE OR REPLACE FUNCTION get_clerk_id() 
RETURNS TEXT AS $$
BEGIN
    RETURN current_setting('request.headers', true)::json->>'x-clerk-user-id';
EXCEPTION 
    WHEN OTHERS THEN 
        RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the policy to use the new function
DROP POLICY IF EXISTS "Time blocks for clerk user" ON time_blocks;
CREATE POLICY "Time blocks for clerk user" 
ON time_blocks FOR ALL 
USING (clerk_id = get_clerk_id());

-- Add clerk_id column
ALTER TABLE time_blocks ADD COLUMN clerk_id TEXT;

-- Update existing records (optional since we're just testing)
UPDATE time_blocks SET clerk_id = 'user_2tExBCPQtiCFy1EMr1EJ76rZGgK' WHERE user_email = 'grantmweston@gmail.com';

-- Drop the old policy
DROP POLICY IF EXISTS "Time blocks for specific email" ON time_blocks;

-- Create new policy using clerk_id
CREATE POLICY "Time blocks for specific clerk user" 
ON time_blocks FOR ALL 
USING (clerk_id = current_setting('app.clerk_user_id', TRUE));

-- Create function to set clerk_id from request header
CREATE OR REPLACE FUNCTION set_clerk_user_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.clerk_id = current_setting('app.clerk_user_id', TRUE);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set clerk_id
CREATE TRIGGER set_clerk_user_id_trigger
  BEFORE INSERT OR UPDATE ON time_blocks
  FOR EACH ROW
  EXECUTE FUNCTION set_clerk_user_id();

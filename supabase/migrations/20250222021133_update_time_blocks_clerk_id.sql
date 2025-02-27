-- Drop the existing table and its policies
DROP TABLE IF EXISTS time_blocks CASCADE;

-- Create the table with the correct structure
CREATE TABLE time_blocks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clerk_id TEXT NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    title TEXT,
    description TEXT,
    color TEXT,
    is_recurring BOOLEAN DEFAULT false,
    recurrence_pattern TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE time_blocks ENABLE ROW LEVEL SECURITY;

-- Create the policy using clerk_id
CREATE POLICY "Time blocks for clerk user" 
ON time_blocks FOR ALL 
USING (clerk_id = get_clerk_id());

-- Insert a sample time block
INSERT INTO time_blocks (clerk_id, start_time, end_time, title, description, color)
VALUES (
    'user_2tExBCPQtiCFy1EMr1EJ76rZGgK',
    NOW(),
    NOW() + INTERVAL '1 hour',
    'Sample Block',
    'This is a test time block',
    '#4A90E2'
);

BEGIN;
  -- Update all time blocks with the clerk ID
  UPDATE time_blocks 
  SET clerk_id = 'user_2tExBCPQtiCFy1EMr1EJ76rZGgK'
  WHERE clerk_id IS NULL;

  -- Make clerk_id NOT NULL for future entries
  ALTER TABLE time_blocks 
  ALTER COLUMN clerk_id SET NOT NULL;
COMMIT;

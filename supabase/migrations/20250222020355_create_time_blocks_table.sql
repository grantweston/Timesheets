-- Drop existing table and policies if they exist
DROP TABLE IF EXISTS time_blocks CASCADE;

CREATE TABLE time_blocks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_email TEXT NOT NULL,
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

-- Enable RLS (Row Level Security)
ALTER TABLE time_blocks ENABLE ROW LEVEL SECURITY;

-- Create policy to only allow access to blocks for grantmweston@gmail.com
CREATE POLICY "Time blocks for specific email" 
ON time_blocks FOR ALL 
USING (user_email = 'grantmweston@gmail.com');

-- Insert a sample time block
INSERT INTO time_blocks (user_email, start_time, end_time, title, description, color)
VALUES (
    'grantmweston@gmail.com',
    NOW(),
    NOW() + INTERVAL '1 hour',
    'Sample Block',
    'This is a test time block',
    '#4A90E2'
);


CREATE TABLE timesheets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    description TEXT,
    project TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE timesheets ENABLE ROW LEVEL SECURITY;

-- Create policy to only allow users to see their own timesheets
CREATE POLICY "Users can only see their own timesheets" 
ON timesheets FOR ALL 
USING (auth.uid() = user_id);

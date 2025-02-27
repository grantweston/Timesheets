-- Drop team-related tables (with CASCADE to handle dependencies)
DROP TABLE IF EXISTS engagement_letter_assignments CASCADE;
DROP TABLE IF EXISTS user_group_members CASCADE;
DROP TABLE IF EXISTS user_groups CASCADE;

-- Modify engagement_letters table to link directly to users
ALTER TABLE engagement_letters
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES users(id),
DROP COLUMN IF EXISTS group_id;

-- Remove any group-related columns from other tables
ALTER TABLE users
DROP COLUMN IF EXISTS default_group_id;

-- Add direct user assignments where needed
ALTER TABLE time_blocks
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES users(id);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_time_blocks_user ON time_blocks(user_id);
CREATE INDEX IF NOT EXISTS idx_engagement_letters_user ON engagement_letters(user_id); 
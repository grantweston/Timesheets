-- Rename and modify columns to match frontend expectations
ALTER TABLE time_blocks
  -- Rename title to task_label
  RENAME COLUMN title TO task_label;

-- Add new columns
ALTER TABLE time_blocks
  ADD COLUMN is_billable BOOLEAN DEFAULT true,
  ADD COLUMN classification JSONB DEFAULT '{"category": "development", "confidence": 1.0}'::jsonb;

-- Update existing records
UPDATE time_blocks
SET 
  is_billable = true,
  classification = '{"category": "development", "confidence": 1.0}'::jsonb
WHERE is_billable IS NULL;

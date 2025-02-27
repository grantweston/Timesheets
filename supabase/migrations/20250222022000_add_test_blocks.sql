-- Add test blocks for today
INSERT INTO time_blocks (
    clerk_id,
    start_time,
    end_time,
    task_label,
    description,
    is_billable,
    classification
) VALUES 
(
    'user_2tExBCPQtiCFy1EMr1EJ76rZGgK',
    CURRENT_DATE + INTERVAL '9 hours',
    CURRENT_DATE + INTERVAL '11 hours',
    'Morning Development',
    'Working on timesheet app',
    true,
    '{"category": "development", "confidence": 1.0}'::jsonb
),
(
    'user_2tExBCPQtiCFy1EMr1EJ76rZGgK',
    CURRENT_DATE + INTERVAL '13 hours',
    CURRENT_DATE + INTERVAL '14 hours 30 minutes',
    'Team Meeting',
    'Weekly sync',
    true,
    '{"category": "meeting", "confidence": 1.0}'::jsonb
),
(
    'user_2tExBCPQtiCFy1EMr1EJ76rZGgK',
    CURRENT_DATE + INTERVAL '15 hours',
    CURRENT_DATE + INTERVAL '17 hours',
    'Afternoon Coding',
    'Implementing new features',
    true,
    '{"category": "development", "confidence": 1.0}'::jsonb
); 
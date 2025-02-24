-- Sample Clients
INSERT INTO clients (user_id, name, email, phone, address, billing_rate, status)
VALUES 
  ('44cb9ae0-c85f-462b-aeb5-e814263e71f5', 'Acme Corporation', 'contact@acme.com', '555-0100', '123 Business Ave, Suite 100', 150.00, 'active'),
  ('44cb9ae0-c85f-462b-aeb5-e814263e71f5', 'Tech Innovators LLC', 'info@techinnovators.com', '555-0200', '456 Innovation Drive', 175.00, 'active'),
  ('44cb9ae0-c85f-462b-aeb5-e814263e71f5', 'Global Solutions Inc', 'contact@globalsolutions.com', '555-0300', '789 Enterprise Blvd', 200.00, 'active');

-- Sample Time Blocks (for today)
WITH first_client AS (
  SELECT client_id FROM clients WHERE user_id = '44cb9ae0-c85f-462b-aeb5-e814263e71f5' ORDER BY created_at LIMIT 1
)
INSERT INTO time_blocks (user_id, client_id, start_time, end_time, description, time_block_label)
SELECT 
  '44cb9ae0-c85f-462b-aeb5-e814263e71f5',
  client_id,
  NOW() - INTERVAL '8 hours',
  NOW() - INTERVAL '6 hours',
  'Initial project planning and requirements gathering',
  'Project Planning'
FROM first_client;

-- Add more time blocks
WITH clients_ordered AS (
  SELECT client_id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM clients 
  WHERE user_id = '44cb9ae0-c85f-462b-aeb5-e814263e71f5'
  LIMIT 2
)
INSERT INTO time_blocks (user_id, client_id, start_time, end_time, description, time_block_label, is_billable)
SELECT 
  '44cb9ae0-c85f-462b-aeb5-e814263e71f5',
  client_id,
  CASE 
    WHEN rn = 1 THEN NOW() - INTERVAL '5 hours'
    WHEN rn = 2 THEN NOW() - INTERVAL '3 hours'
  END,
  CASE 
    WHEN rn = 1 THEN NOW() - INTERVAL '4 hours'
    WHEN rn = 2 THEN NOW() - INTERVAL '1 hour'
  END,
  CASE 
    WHEN rn = 1 THEN 'Team sync and progress review'
    WHEN rn = 2 THEN 'Development work on core features'
  END,
  CASE 
    WHEN rn = 1 THEN 'Team Meeting'
    WHEN rn = 2 THEN 'Development'
  END,
  true
FROM clients_ordered;

-- Sample Engagement Letters
WITH client_ids AS (
  SELECT client_id 
  FROM clients 
  WHERE user_id = '44cb9ae0-c85f-462b-aeb5-e814263e71f5' 
  ORDER BY created_at 
  LIMIT 2
)
INSERT INTO engagement_letters (user_id, client_id, title, scope_description, status, effective_date, expiry_date)
SELECT 
  '44cb9ae0-c85f-462b-aeb5-e814263e71f5',
  client_id,
  'Professional Services Agreement',
  'This engagement covers software development, consulting, and related technical services.',
  'active',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '1 year'
FROM client_ids; 
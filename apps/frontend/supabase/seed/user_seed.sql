-- Create a new organization
INSERT INTO organizations (id, name, created_at)
VALUES 
  ('10000000-0000-0000-0000-000000000001', 'Grant Weston Organization', NOW());

-- Create user entry
INSERT INTO users (id, email, display_name, organization_id, created_at)
VALUES 
  ('20000000-0000-0000-0000-000000000001', 'grantmweston@gmail.com', 'Grant Weston', '10000000-0000-0000-0000-000000000001', NOW());

-- Create a sample project
INSERT INTO projects (id, organization_id, name, description, created_at)
VALUES 
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'TimesheetAI Development', 'Development of TimesheetAI application', NOW());

-- Create some time blocks for the last few days
INSERT INTO time_blocks (id, user_id, project_id, start_time, end_time, task_label, is_billable, classification, created_at)
VALUES 
  ('40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001',
   NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '4 hours',
   'Initial Development', TRUE, '{"category": "Development", "confidence": 0.95}', NOW()),
   
  ('40000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001',
   NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '6 hours',
   'Feature Implementation', TRUE, '{"category": "Development", "confidence": 0.98}', NOW());

-- Create a draft invoice
INSERT INTO invoices (id, user_id, status, total_amount, created_at)
VALUES 
  ('50000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'draft', 1000.00, NOW());

-- Create invoice items
INSERT INTO invoice_items (id, invoice_id, time_block_id, description, rate, hours, amount, created_at)
VALUES 
  ('60000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001',
   'Development Work', 125.00, 4.0, 500.00, NOW()),
  ('60000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000002',
   'Feature Development', 125.00, 4.0, 500.00, NOW());

-- Create an engagement letter
INSERT INTO engagement_letters (id, organization_id, user_id, title, content, status, created_at)
VALUES 
  ('70000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001',
   'TimesheetAI Development Agreement', 'This letter outlines the terms of engagement for TimesheetAI development...', 'active', NOW()); 
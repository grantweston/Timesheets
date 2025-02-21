-- Sample Organizations
INSERT INTO organizations (id, name, created_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Acme Corp', NOW()),
  ('22222222-2222-2222-2222-222222222222', 'Tech Solutions Inc', NOW());

-- Sample Users
INSERT INTO users (id, clerk_user_id, email, display_name, organization_id, created_at)
VALUES 
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'user_1', 'john@example.com', 'John Doe', '11111111-1111-1111-1111-111111111111', NOW()),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'user_2', 'jane@example.com', 'Jane Smith', '11111111-1111-1111-1111-111111111111', NOW()),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'user_3', 'bob@example.com', 'Bob Wilson', '22222222-2222-2222-2222-222222222222', NOW());

-- Sample Projects
INSERT INTO projects (id, organization_id, name, description, created_at)
VALUES 
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Website Redesign', 'Complete overhaul of company website', NOW()),
  ('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'Mobile App Development', 'New customer-facing mobile application', NOW()),
  ('55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', 'Cloud Migration', 'Migration of legacy systems to cloud', NOW());

-- Sample Time Blocks (past 7 days)
INSERT INTO time_blocks (id, user_id, project_id, start_time, end_time, task_label, is_billable, classification, created_at)
VALUES 
  -- John's time blocks
  ('66666666-6666-6666-6666-666666666666', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 
   NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days' + INTERVAL '4 hours',
   'Homepage wireframes', TRUE, '{"category": "Design", "confidence": 0.95}', NOW()),
  
  ('77777777-7777-7777-7777-777777777777', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333',
   NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days' + INTERVAL '3 hours',
   'Client meeting', TRUE, '{"category": "Meetings", "confidence": 0.98}', NOW()),

  -- Jane's time blocks
  ('88888888-8888-8888-8888-888888888888', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '44444444-4444-4444-4444-444444444444',
   NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days' + INTERVAL '6 hours',
   'API Development', TRUE, '{"category": "Development", "confidence": 0.92}', NOW()),
   
  ('99999999-9999-9999-9999-999999999999', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '44444444-4444-4444-4444-444444444444',
   NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days' + INTERVAL '5 hours',
   'Unit Testing', TRUE, '{"category": "Testing", "confidence": 0.94}', NOW()),

  -- Bob's time blocks
  ('aaaaaaaa-0000-0000-0000-aaaaaaaaaaaa', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '55555555-5555-5555-5555-555555555555',
   NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '8 hours',
   'Infrastructure Setup', TRUE, '{"category": "DevOps", "confidence": 0.96}', NOW());

-- Sample Invoices
INSERT INTO invoices (id, user_id, status, total_amount, created_at)
VALUES 
  ('bbbbbbbb-0000-0000-0000-bbbbbbbbbbbb', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'draft', 1200.00, NOW()),
  ('cccccccc-0000-0000-0000-cccccccccccc', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'sent', 2400.00, NOW());

-- Sample Invoice Items
INSERT INTO invoice_items (id, invoice_id, time_block_id, description, rate, hours, amount, created_at)
VALUES 
  ('dddddddd-0000-0000-0000-dddddddddddd', 'bbbbbbbb-0000-0000-0000-bbbbbbbbbbbb', '66666666-6666-6666-6666-666666666666',
   'Homepage Design Work', 150.00, 4.0, 600.00, NOW()),
  ('eeeeeeee-0000-0000-0000-eeeeeeeeeeee', 'bbbbbbbb-0000-0000-0000-bbbbbbbbbbbb', '77777777-7777-7777-7777-777777777777',
   'Client Consultation', 150.00, 4.0, 600.00, NOW()),
  ('ffffffff-0000-0000-0000-fffffffffffff', 'cccccccc-0000-0000-0000-cccccccccccc', '88888888-8888-8888-8888-888888888888',
   'Mobile App Development', 200.00, 12.0, 2400.00, NOW());

-- Sample Engagement Letters
INSERT INTO engagement_letters (id, organization_id, user_id, title, content, status, created_at)
VALUES 
  ('gggggggg-0000-0000-0000-gggggggggggg', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   'Website Redesign Project', 'This letter outlines the terms of our engagement for the website redesign project...', 'active', NOW()),
  ('hhhhhhhh-0000-0000-0000-hhhhhhhhhhhh', '22222222-2222-2222-2222-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc',
   'Cloud Migration Services', 'This engagement letter covers the scope of cloud migration services...', 'active', NOW()); 
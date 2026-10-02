-- Note: Real authentication users are managed by auth.users in Supabase.
-- This script contains template inserts for profiles and initial entities that can be referenced.

-- Create profiles for internal team members (UUIDs are generated mock strings or can be mapped to auth users)
-- In real deployment, these UUIDs would map to auth.users entries.
-- We seed these to allow simulating full RBAC flows.

-- Seed profile values directly if they don't exist
INSERT INTO public.profiles (id, name, email, role, company_name, phone, timezone, onboarded, avatar_url)
VALUES 
('00000000-0000-0000-0000-000000000001', 'Shivam Dube', 'shivam@binaryfroster.com', 'admin', 'Binary Froster', '+91 98765 43210', 'Asia/Kolkata', TRUE, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'),
('00000000-0000-0000-0000-000000000002', 'Digvijay Kadam', 'digvijay@binaryfroster.com', 'admin', 'Binary Froster', '+91 98765 43211', 'Asia/Kolkata', TRUE, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'),
('00000000-0000-0000-0000-000000000003', 'Jawad Khan Hakim', 'jawad@binaryfroster.com', 'admin', 'Binary Froster', '+91 98765 43212', 'Asia/Kolkata', TRUE, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'),
('11111111-1111-1111-1111-111111111111', 'John Sterling', 'john@sterling.com', 'client', 'Sterling Capital Group', '+44 20 7946 0192', 'Europe/London', TRUE, 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'),
('22222222-2222-2222-2222-222222222222', 'Acme Client Profile', 'client@acme.com', 'client', 'Acme Enterprises Inc.', '+1 202 555 0143', 'America/New_York', TRUE, 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80')
ON CONFLICT (id) DO NOTHING;

-- Seed Notification preferences for profiles
INSERT INTO public.notification_preferences (user_id)
VALUES 
('00000000-0000-0000-0000-000000000001'),
('00000000-0000-0000-0000-000000000002'),
('00000000-0000-0000-0000-000000000003'),
('11111111-1111-1111-1111-111111111111'),
('22222222-2222-2222-2222-222222222222')
ON CONFLICT (user_id) DO NOTHING;

-- Seed Projects
INSERT INTO public.projects (id, name, client_id, phase, progress, upcoming_milestone_name, upcoming_milestone_date)
VALUES 
('10000000-0000-0000-0000-000000000001', 'Sterling Wealth Algorithmic Platform (SWAP)', '11111111-1111-1111-1111-111111111111', 'Build', 68, 'Beta Core Ledger Engine Deployment', '2026-07-15'),
('20000000-0000-0000-0000-000000000002', 'Acme Enterprise AI Logistics System', '22222222-2222-2222-2222-222222222222', 'Design', 35, 'Figma High Fidelity Interface Review', '2026-07-05')
ON CONFLICT (id) DO NOTHING;

-- Seed Milestones for SWAP Project
INSERT INTO public.milestones (id, project_id, title, description, due_date, completed_date, status, "order")
VALUES 
('10000000-1111-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Discover: Architecture & Scope Definition', 'Define database models, Ledger consensus strategies, and compliance frameworks.', '2026-04-20', '2026-04-18 10:00:00+00', 'Completed', 1),
('10000000-1111-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Design: Wireframes & High-Fidelity Prototypes', 'Generate dark minimalist user dashboards and interactive charts layout.', '2026-05-15', '2026-05-14 16:30:00+00', 'Completed', 2),
('10000000-1111-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'Build: Core Engine & Smart APIs', 'Develop primary matching engine backend and WebSocket endpoints.', '2026-07-15', NULL, 'In Progress', 3),
('10000000-1111-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 'Test: Security Audits & Load Testing', 'Simulate massive concurrent trading volumes and conduct penetration testing.', '2026-08-10', NULL, 'Upcoming', 4)
ON CONFLICT (id) DO NOTHING;

-- Seed Milestones for Acme Project
INSERT INTO public.milestones (id, project_id, title, description, due_date, completed_date, status, "order")
VALUES 
('20000000-1111-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'Discover: Logistic Pipeline Blueprinting', 'Map supply chain APIs, routing constraints, and carrier integrations.', '2026-05-20', '2026-05-19 11:00:00+00', 'Completed', 1),
('20000000-1111-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 'Design: User Experience Mockups & Wireframes', 'Create fully customizable map panels, tracking cards, and dispatcher hubs.', '2026-07-05', NULL, 'In Progress', 2)
ON CONFLICT (id) DO NOTHING;

-- Seed Tasks
INSERT INTO public.tasks (id, project_id, title, description, assigned_to_name, assigned_to_avatar, due_date, priority, "column")
VALUES 
('10000000-2222-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Develop Portfolio Rebalancing Algorithms', 'Implement high-throughput portfolio allocations matching UK regulatory bounds.', 'Shivam Dube', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', '2026-07-01', 'Critical', 'In Progress'),
('10000000-2222-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Revamp Dark Minimalist User Interface Components', 'Polish glowing interactive components using premium rgba(0, 212, 255, 0.08) shadows.', 'Digvijay Kadam', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', '2026-06-28', 'High', 'In Review'),
('10000000-2222-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'Integrate Resend Notification Hooks', 'Configure absolute SMTP channels notifying client profiles during critical pipeline changes.', 'Jawad Khan Hakim', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', '2026-07-10', 'Medium', 'To Do')
ON CONFLICT (id) DO NOTHING;

-- Seed Invoices
INSERT INTO public.invoices (id, project_id, invoice_number, description, amount, issue_date, due_date, status, line_items, tax, total, paid_at)
VALUES 
('10000000-3333-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'BF-2026-001', 'Phase 1: Architecture & Scope Initiation (Discover)', 15000.00, '2026-04-10', '2026-04-25', 'Paid', '[{"description": "Scoping workshops & regulatory blueprinting", "amount": 10000}, {"description": "Figma scoping structure setup", "amount": 5000}]'::jsonb, 0.00, 15000.00, '2026-04-20 11:22:00+00'),
('10000000-3333-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'BF-2026-002', 'Phase 2: High-Fidelity UI/UX Design Approval', 20000.00, '2026-05-10', '2026-05-25', 'Paid', '[{"description": "Figma screens flow finalization", "amount": 20000}]'::jsonb, 0.00, 20000.00, '2026-05-24 15:43:00+00'),
('10000000-3333-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'BF-2026-003', 'Phase 3: Core Backend & Matching Engine Setup (Deposit)', 35000.00, '2026-06-15', '2026-06-30', 'Sent', '[{"description": "Core matching engine backend deployment deposit (50%)", "amount": 35000}]'::jsonb, 0.00, 35000.00, NULL)
ON CONFLICT (id) DO NOTHING;

-- Seed Contracts
INSERT INTO public.contracts (id, project_id, name, file_url, status, signature_name, signature_ip, signature_timestamp, signature_user_id)
VALUES 
('10000000-4444-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Binary_Froster_NDA_Sterling_Capital.pdf', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'Signed', 'John Sterling', '82.165.12.100', '2026-04-11 10:05:00+00', '11111111-1111-1111-1111-111111111111'),
('10000000-4444-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'FCA_Ledger_Regulatory_Compliance_Rider.pdf', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'Pending Signature', NULL, NULL, NULL, NULL)
ON CONFLICT (id) DO NOTHING;

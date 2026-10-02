-- Create custom extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Define Enums
CREATE TYPE user_role AS ENUM ('client', 'admin');
CREATE TYPE project_phase AS ENUM ('Discover', 'Design', 'Build', 'Test', 'Launch', 'Support');
CREATE TYPE milestone_status AS ENUM ('Upcoming', 'In Progress', 'Completed', 'Delayed');
CREATE TYPE task_priority AS ENUM ('Low', 'Medium', 'High', 'Critical');
CREATE TYPE task_column AS ENUM ('To Do', 'In Progress', 'In Review', 'Completed');
CREATE TYPE file_folder AS ENUM ('Discover', 'Design', 'Build', 'Test', 'Launch', 'Support', 'Contracts', 'References');
CREATE TYPE invoice_status AS ENUM ('Draft', 'Sent', 'Paid', 'Overdue');
CREATE TYPE meeting_type AS ENUM ('Discovery Call', 'Project Review', 'Support Call');
CREATE TYPE meeting_status AS ENUM ('Scheduled', 'Completed', 'Cancelled');
CREATE TYPE ticket_category AS ENUM ('Bug Report', 'Change Request', 'General Question', 'Billing Query');
CREATE TYPE ticket_priority AS ENUM ('Low', 'Medium', 'High', 'Urgent');
CREATE TYPE ticket_status AS ENUM ('Open', 'In Progress', 'Awaiting Client Response', 'Resolved');

-- 1. PROFILES Table (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role user_role DEFAULT 'client'::user_role,
    company_name TEXT NOT NULL,
    company_logo TEXT,
    phone TEXT,
    timezone TEXT DEFAULT 'UTC',
    onboarded BOOLEAN DEFAULT FALSE,
    totp_secret TEXT,
    is_two_factor_enabled BOOLEAN DEFAULT FALSE,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 2. PROJECTS Table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    phase project_phase DEFAULT 'Discover'::project_phase NOT NULL,
    progress INTEGER DEFAULT 0 NOT NULL,
    upcoming_milestone_name TEXT,
    upcoming_milestone_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 3. MILESTONES Table
CREATE TABLE IF NOT EXISTS public.milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    completed_date TIMESTAMP WITH TIME ZONE,
    status milestone_status DEFAULT 'Upcoming'::milestone_status NOT NULL,
    "order" INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 4. TASKS Table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    assigned_to_name TEXT,
    assigned_to_avatar TEXT,
    due_date DATE,
    priority task_priority DEFAULT 'Medium'::task_priority NOT NULL,
    "column" task_column DEFAULT 'To Do'::task_column NOT NULL,
    feedback JSONB, -- stores revisions logs, specific section details
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 5. TASK FILES Table (Reference files attached to a Kanban task card)
CREATE TABLE IF NOT EXISTS public.task_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. FILES Table (Phase-scoped project resources)
CREATE TABLE IF NOT EXISTS public.files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phase file_folder NOT NULL,
    uploaded_by_name TEXT NOT NULL,
    uploaded_by_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    size TEXT NOT NULL, -- Human-readable (e.g. "4.2 MB")
    type TEXT NOT NULL, -- e.g. "PDF", "PNG", "ZIP"
    url TEXT NOT NULL,
    version INTEGER DEFAULT 1 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 7. FILE VERSIONS Table (Version histories)
CREATE TABLE IF NOT EXISTS public.file_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id UUID NOT NULL REFERENCES public.files(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    url TEXT NOT NULL,
    uploaded_by_name TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. APPROVALS Table
CREATE TABLE IF NOT EXISTS public.approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    status TEXT DEFAULT 'Pending' NOT NULL, -- 'Pending', 'Approved', 'Changes Requested'
    reviewer_name TEXT,
    reviewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action_timestamp TIMESTAMP WITH TIME ZONE,
    feedback JSONB, -- stores structured feedback schema
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 9. APPROVAL AUDIT TRAIL Table (Immutable log records)
CREATE TABLE IF NOT EXISTS public.approval_audit_trail (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    approval_id UUID NOT NULL REFERENCES public.approvals(id) ON DELETE CASCADE,
    event TEXT NOT NULL,
    username TEXT NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. INVOICES Table
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    invoice_number TEXT UNIQUE NOT NULL,
    description TEXT,
    amount NUMERIC(12, 2) NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status invoice_status DEFAULT 'Draft'::invoice_status NOT NULL,
    line_items JSONB NOT NULL, -- Array of { description: string, amount: number }
    tax NUMERIC(5, 2) DEFAULT 0.00 NOT NULL,
    total NUMERIC(12, 2) NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE,
    pdf_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 11. MESSAGES Table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    sender_name TEXT NOT NULL,
    sender_role user_role NOT NULL,
    sender_avatar TEXT,
    content TEXT,
    file_url TEXT,
    file_name TEXT,
    read_by JSONB DEFAULT '[]'::jsonb NOT NULL, -- Array of user UUIDs
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 12. MEETINGS Table
CREATE TABLE IF NOT EXISTS public.meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type meeting_type NOT NULL,
    duration INTEGER NOT NULL,
    date DATE NOT NULL,
    time_slot TEXT NOT NULL,
    calendar_invite_url TEXT,
    status meeting_status DEFAULT 'Scheduled'::meeting_status NOT NULL,
    host_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 13. TICKETS Table
CREATE TABLE IF NOT EXISTS public.tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    ticket_id TEXT UNIQUE NOT NULL, -- BF-XYZ
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category ticket_category NOT NULL,
    priority ticket_priority NOT NULL,
    status ticket_status DEFAULT 'Open'::ticket_status NOT NULL,
    sla_hours INTEGER NOT NULL,
    assigned_to_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 14. TICKET REPLIES Table
CREATE TABLE IF NOT EXISTS public.ticket_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
    sender_name TEXT NOT NULL,
    sender_role user_role NOT NULL,
    sender_avatar TEXT,
    content TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 15. NOTIFICATIONS Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    link TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    type TEXT NOT NULL, -- message, milestone, invoice, etc.
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 16. CONTRACTS Table
CREATE TABLE IF NOT EXISTS public.contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    status TEXT DEFAULT 'Pending Signature' NOT NULL, -- 'Pending Signature', 'Signed'
    signature_name TEXT,
    signature_ip TEXT,
    signature_timestamp TIMESTAMP WITH TIME ZONE,
    signature_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 17. NOTIFICATION PREFERENCES Table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    new_message_in_portal BOOLEAN DEFAULT TRUE NOT NULL,
    new_message_email BOOLEAN DEFAULT TRUE NOT NULL,
    milestone_completed_in_portal BOOLEAN DEFAULT TRUE NOT NULL,
    milestone_completed_email BOOLEAN DEFAULT TRUE NOT NULL,
    invoice_generated_in_portal BOOLEAN DEFAULT TRUE NOT NULL,
    invoice_generated_email BOOLEAN DEFAULT TRUE NOT NULL,
    payment_received_in_portal BOOLEAN DEFAULT TRUE NOT NULL,
    payment_received_email BOOLEAN DEFAULT TRUE NOT NULL,
    deliverable_approval_in_portal BOOLEAN DEFAULT TRUE NOT NULL,
    deliverable_approval_email BOOLEAN DEFAULT TRUE NOT NULL,
    ticket_status_in_portal BOOLEAN DEFAULT TRUE NOT NULL,
    ticket_status_email BOOLEAN DEFAULT TRUE NOT NULL,
    meeting_booked_in_portal BOOLEAN DEFAULT TRUE NOT NULL,
    meeting_booked_email BOOLEAN DEFAULT TRUE NOT NULL,
    contract_signed_in_portal BOOLEAN DEFAULT TRUE NOT NULL,
    contract_signed_email BOOLEAN DEFAULT TRUE NOT NULL
);

-- 18. TEAM ASSIGNMENTS Table
CREATE TABLE IF NOT EXISTS public.team_assignments (
    admin_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    client_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    PRIMARY KEY (admin_user_id, client_user_id)
);

-- Auto-update updated_at triggers helper function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_milestones_updated_at BEFORE UPDATE ON public.milestones FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_files_updated_at BEFORE UPDATE ON public.files FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_approvals_updated_at BEFORE UPDATE ON public.approvals FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_meetings_updated_at BEFORE UPDATE ON public.meetings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON public.tickets FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON public.contracts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Create Indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON public.projects(client_id);
CREATE INDEX IF NOT EXISTS idx_milestones_project_id ON public.milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_files_project_id ON public.files(project_id);
CREATE INDEX IF NOT EXISTS idx_approvals_project_id ON public.approvals(project_id);
CREATE INDEX IF NOT EXISTS idx_invoices_project_id ON public.invoices(project_id);
CREATE INDEX IF NOT EXISTS idx_messages_project_id ON public.messages(project_id);
CREATE INDEX IF NOT EXISTS idx_meetings_project_id ON public.meetings(project_id);
CREATE INDEX IF NOT EXISTS idx_tickets_project_id ON public.tickets(project_id);
CREATE INDEX IF NOT EXISTS idx_contracts_project_id ON public.contracts(project_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);

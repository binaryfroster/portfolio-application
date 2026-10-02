-- ==============================================================================
-- BINARY FROSTER CLIENT SUCCESS HUB - COMPLETE PRODUCTION DATABASE SCHEMA
-- Author: Agency Backend Architect
-- Target Runtime: PostgreSQL 15+ / Supabase
-- Architecture Pattern: Multi-Tenant Modular Monolith with Multi-Region Read Safety
-- ==============================================================================

-- Enable Core Cryptographic and UUID Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. GLOBAL ENUM TYPES
-- ==============================================================================

DO $$ BEGIN
    CREATE TYPE user_role_type AS ENUM (
        'super_admin', 'admin', 'project_manager', 'developer', 
        'designer', 'support_agent', 'finance', 'account_manager',
        'client_admin', 'client', 'client_user'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE project_phase_type AS ENUM (
        'Discover', 'Design', 'Build', 'Test', 'Launch', 'Support'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE project_status_type AS ENUM (
        'Active', 'In Review', 'Launching', 'On Hold', 'Completed', 'Archived'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE milestone_status_type AS ENUM (
        'Upcoming', 'In Progress', 'Completed', 'Delayed'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE task_priority_type AS ENUM (
        'Low', 'Medium', 'High', 'Critical'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE task_column_type AS ENUM (
        'To Do', 'In Progress', 'In Review', 'Completed'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE deliverable_status_type AS ENUM (
        'Pending', 'Approved', 'Changes Requested'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE invoice_status_type AS ENUM (
        'Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE contract_status_type AS ENUM (
        'Draft', 'Pending Signature', 'Signed', 'Fully Executed', 'Terminated'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE proposal_status_type AS ENUM (
        'Draft', 'Generated', 'Editing', 'Finalized', 'Sent', 'Accepted', 'Declined'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE ticket_category_type AS ENUM (
        'Bug Report', 'Change Request', 'General Question', 'Billing Query'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE ticket_status_type AS ENUM (
        'Open', 'In Progress', 'Awaiting Client Response', 'Resolved', 'Closed'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ==============================================================================
-- 2. MULTI-TENANT ORGANIZATIONS & PROFILES
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    logo_url TEXT,
    industry VARCHAR(100),
    website VARCHAR(255),
    primary_contact_name VARCHAR(150) NOT NULL,
    primary_contact_email VARCHAR(255) NOT NULL,
    primary_contact_phone VARCHAR(50),
    health_score INT DEFAULT 95 CHECK (health_score BETWEEN 0 AND 100),
    health_explanation TEXT DEFAULT 'Project on schedule, invoice payments up to date.',
    account_manager_id UUID,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'onboarding', 'suspended', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ NULL
);

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'client_user' NOT NULL,
    company_name VARCHAR(150) NOT NULL,
    company_logo TEXT,
    phone VARCHAR(50),
    timezone VARCHAR(50) DEFAULT 'UTC' NOT NULL,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'deactivated')) NOT NULL,
    avatar_url TEXT,
    is_two_factor_enabled BOOLEAN DEFAULT FALSE NOT NULL,
    totp_secret TEXT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ NULL
);

-- Organization account manager foreign key resolution
ALTER TABLE public.organizations 
    DROP CONSTRAINT IF EXISTS fk_org_account_manager,
    ADD CONSTRAINT fk_org_account_manager 
    FOREIGN KEY (account_manager_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- ==============================================================================
-- 3. PROJECTS & ENGINEERING WORKFLOW ENGINE
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    phase project_phase_type DEFAULT 'Discover'::project_phase_type NOT NULL,
    status project_status_type DEFAULT 'Active'::project_status_type NOT NULL,
    progress INT DEFAULT 0 CHECK (progress BETWEEN 0 AND 100) NOT NULL,
    budget NUMERIC(12,2) DEFAULT 0.00 CHECK (budget >= 0) NOT NULL,
    spent NUMERIC(12,2) DEFAULT 0.00 CHECK (spent >= 0) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD' CHECK (currency IN ('USD', 'GBP', 'INR', 'EUR')) NOT NULL,
    start_date DATE,
    target_end_date DATE,
    lead_engineer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    project_manager_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    designer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    repository_url TEXT,
    staging_url TEXT,
    production_url TEXT,
    tech_stack TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
    upcoming_milestone_name VARCHAR(255),
    upcoming_milestone_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ NULL
);

CREATE TABLE IF NOT EXISTS public.milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    completed_date TIMESTAMPTZ NULL,
    status milestone_status_type DEFAULT 'Upcoming'::milestone_status_type NOT NULL,
    "order" INT DEFAULT 1 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assigned_to_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    assigned_to_name VARCHAR(150),
    assigned_to_avatar TEXT,
    due_date DATE,
    priority task_priority_type DEFAULT 'Medium'::task_priority_type NOT NULL,
    "column" task_column_type DEFAULT 'To Do'::task_column_type NOT NULL,
    order_index INT DEFAULT 0 NOT NULL,
    feedback JSONB NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ NULL
);

CREATE TABLE IF NOT EXISTS public.task_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    size_bytes BIGINT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==============================================================================
-- 4. DELIVERABLES, APPROVALS & FILE VAULT WITH REVISION HISTORY
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    status deliverable_status_type DEFAULT 'Pending'::deliverable_status_type NOT NULL,
    reviewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reviewer_name VARCHAR(150),
    action_timestamp TIMESTAMPTZ,
    feedback JSONB NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.approval_audit_trail (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    approval_id UUID NOT NULL REFERENCES public.approvals(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    actor_name VARCHAR(150) NOT NULL,
    event VARCHAR(100) NOT NULL,
    comments TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phase VARCHAR(50) NOT NULL,
    uploaded_by_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    uploaded_by_name VARCHAR(150) NOT NULL,
    current_version INT DEFAULT 1 NOT NULL,
    size_bytes BIGINT,
    size_formatted VARCHAR(50) NOT NULL,
    mime_type VARCHAR(100),
    url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ NULL
);

CREATE TABLE IF NOT EXISTS public.file_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id UUID NOT NULL REFERENCES public.files(id) ON DELETE CASCADE,
    version INT NOT NULL,
    url TEXT NOT NULL,
    size_bytes BIGINT,
    uploaded_by_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    uploaded_by_name VARCHAR(150),
    changelog TEXT,
    uploaded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(file_id, version)
);

-- ==============================================================================
-- 5. FINANCIAL LEDGER, INVOICES & IDEMPOTENT PAYMENT GATEWAY
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
    tax_rate NUMERIC(5,2) DEFAULT 0.00 CHECK (tax_rate >= 0) NOT NULL,
    tax_amount NUMERIC(12,2) DEFAULT 0.00 CHECK (tax_amount >= 0) NOT NULL,
    discount NUMERIC(12,2) DEFAULT 0.00 CHECK (discount >= 0) NOT NULL,
    total NUMERIC(12,2) NOT NULL CHECK (total >= 0),
    currency VARCHAR(3) DEFAULT 'USD' CHECK (currency IN ('USD', 'GBP', 'INR', 'EUR')) NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status invoice_status_type DEFAULT 'Draft'::invoice_status_type NOT NULL,
    paid_at TIMESTAMPTZ NULL,
    pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.invoice_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    hours NUMERIC(8,2) DEFAULT 1.00 CHECK (hours >= 0) NOT NULL,
    rate NUMERIC(12,2) DEFAULT 0.00 CHECK (rate >= 0) NOT NULL,
    amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
    "order" INT DEFAULT 1 NOT NULL
);

CREATE TABLE IF NOT EXISTS public.payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE RESTRICT,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL CHECK (provider IN ('stripe', 'razorpay', 'bank_transfer', 'wire', 'crypto')),
    transaction_reference VARCHAR(255) NOT NULL,
    idempotency_key VARCHAR(255) UNIQUE NOT NULL,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'captured', 'succeeded', 'failed', 'refunded')),
    webhook_event_id VARCHAR(255),
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMPTZ NULL
);

-- ==============================================================================
-- 6. CONTRACTS, E-SIGNATURES & TAMPER-EVIDENT SEALS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) DEFAULT 'MSA' CHECK (type IN ('MSA', 'SOW', 'NDA', 'SLA', 'Change_Order')) NOT NULL,
    file_url TEXT NOT NULL,
    status contract_status_type DEFAULT 'Pending Signature'::contract_status_type NOT NULL,
    signature_name VARCHAR(150),
    signature_ip VARCHAR(50),
    signature_timestamp TIMESTAMPTZ,
    signature_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    signed_hash TEXT, -- SHA-256 integrity seal
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==============================================================================
-- 7. REAL-TIME COLLABORATION, MESSAGES, MEETINGS & TICKETING
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    sender_name VARCHAR(150) NOT NULL,
    sender_role VARCHAR(50) NOT NULL,
    sender_avatar TEXT,
    content TEXT NOT NULL,
    file_url TEXT,
    file_name VARCHAR(255),
    read_by UUID[] DEFAULT '{}'::UUID[] NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('Discovery Call', 'Project Review', 'Support Call')),
    duration_minutes INT DEFAULT 30 NOT NULL,
    date DATE NOT NULL,
    time_slot VARCHAR(50) NOT NULL,
    calendar_invite_url TEXT,
    meeting_link TEXT,
    status VARCHAR(50) DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Completed', 'Cancelled')) NOT NULL,
    host_name VARCHAR(150) NOT NULL,
    host_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category ticket_category_type NOT NULL,
    priority task_priority_type DEFAULT 'Medium'::task_priority_type NOT NULL,
    status ticket_status_type DEFAULT 'Open'::ticket_status_type NOT NULL,
    sla_response_hours INT DEFAULT 4 NOT NULL,
    sla_breached BOOLEAN DEFAULT FALSE NOT NULL,
    assigned_to_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    assigned_to_name VARCHAR(150),
    created_by_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    resolved_at TIMESTAMPTZ NULL
);

CREATE TABLE IF NOT EXISTS public.ticket_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    sender_name VARCHAR(150) NOT NULL,
    sender_role VARCHAR(50) NOT NULL,
    sender_avatar TEXT,
    content TEXT NOT NULL,
    attachments JSONB DEFAULT '[]'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    link TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    type VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==============================================================================
-- 8. AI PROPOSAL GENERATOR & ARCHITECTURAL SCRIPT ENGINE
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    proposal_number VARCHAR(50) UNIQUE NOT NULL,
    client_name VARCHAR(150) NOT NULL,
    client_email VARCHAR(255),
    project_title VARCHAR(255) NOT NULL,
    project_type VARCHAR(100) NOT NULL,
    brief_description TEXT NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD' CHECK (currency IN ('USD', 'GBP', 'INR')) NOT NULL,
    
    -- AI Generated & Editable Sections
    executive_summary TEXT,
    scope_of_work JSONB DEFAULT '[]'::jsonb NOT NULL,
    phases JSONB DEFAULT '[]'::jsonb NOT NULL,
    cost_breakdown JSONB DEFAULT '[]'::jsonb NOT NULL,
    deliverables JSONB DEFAULT '[]'::jsonb NOT NULL,
    tech_stack_recommendation TEXT,
    assumptions TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
    terms_and_conditions TEXT,

    -- 7-Act Script & Problem Diagnostics
    proposal_script TEXT,
    problem_opportunity TEXT,
    solution_architecture TEXT,
    risk_mitigation TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
    ai_model_used VARCHAR(50),
    ai_tone VARCHAR(50),

    -- Financial Computations
    subtotal NUMERIC(12,2) DEFAULT 0.00 CHECK (subtotal >= 0) NOT NULL,
    tax_rate NUMERIC(5,2) DEFAULT 0.00 CHECK (tax_rate >= 0) NOT NULL,
    tax_amount NUMERIC(12,2) DEFAULT 0.00 CHECK (tax_amount >= 0) NOT NULL,
    discount NUMERIC(12,2) DEFAULT 0.00 CHECK (discount >= 0) NOT NULL,
    grand_total NUMERIC(12,2) DEFAULT 0.00 CHECK (grand_total >= 0) NOT NULL,

    status proposal_status_type DEFAULT 'Draft'::proposal_status_type NOT NULL,
    valid_until DATE NOT NULL,
    created_by_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_by_name VARCHAR(150) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==============================================================================
-- 9. ENTERPRISE SUITE: CHANGE REQUESTS, SLA, HANDOVER, CREDENTIALS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.change_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority task_priority_type DEFAULT 'Medium'::task_priority_type NOT NULL,
    business_impact TEXT,
    estimated_cost NUMERIC(12,2) DEFAULT 0.00 CHECK (estimated_cost >= 0) NOT NULL,
    estimated_hours INT DEFAULT 0 CHECK (estimated_hours >= 0) NOT NULL,
    status VARCHAR(50) DEFAULT 'Submitted' CHECK (status IN (
        'Submitted', 'Reviewed', 'Estimated', 'Client Approval',
        'Scheduled', 'In Progress', 'Completed', 'Rejected'
    )) NOT NULL,
    requested_by_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    requested_by_name VARCHAR(150) NOT NULL,
    approved_by_name VARCHAR(150),
    approval_timestamp TIMESTAMPTZ,
    attachments JSONB DEFAULT '[]'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.maintenance_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    plan_name VARCHAR(150) NOT NULL,
    start_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    sla_response_hours INT DEFAULT 1 NOT NULL,
    sla_resolution_hours INT DEFAULT 8 NOT NULL,
    monthly_support_hours INT DEFAULT 40 NOT NULL,
    used_support_hours INT DEFAULT 0 NOT NULL,
    uptime_guarantee NUMERIC(5,2) DEFAULT 99.95 CHECK (uptime_guarantee BETWEEN 90 AND 100) NOT NULL,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'pending_renewal', 'expired')) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.project_handovers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    stage VARCHAR(50) DEFAULT 'Ready for Handover' CHECK (stage IN (
        'Ready for Handover', 'Client Review', 'Client Approval',
        'Handover Complete', 'Maintenance'
    )) NOT NULL,
    repository_url TEXT,
    deployment_url TEXT,
    api_docs_url TEXT,
    training_materials_url TEXT,
    backup_manifest_url TEXT,
    client_signoff_name VARCHAR(150),
    signoff_timestamp TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.credential_vault (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    service_name VARCHAR(150) NOT NULL,
    environment VARCHAR(50) DEFAULT 'Production' CHECK (environment IN ('Production', 'Staging', 'Development')) NOT NULL,
    username_or_key TEXT NOT NULL,
    encrypted_secret TEXT NOT NULL, -- AES-256 encrypted ciphertext
    notes TEXT,
    last_rotated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.nps_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_name VARCHAR(150) NOT NULL,
    nps_score INT CHECK (nps_score BETWEEN 0 AND 10) NOT NULL,
    csat_rating INT CHECK (csat_rating BETWEEN 1 AND 5) NOT NULL,
    category VARCHAR(100) DEFAULT 'General Experience' NOT NULL,
    comments TEXT,
    testimonial_granted BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Append-only Immutable Audit Log
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    actor_name VARCHAR(150) NOT NULL,
    actor_role VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(150) NOT NULL,
    result VARCHAR(20) DEFAULT 'SUCCESS' CHECK (result IN ('SUCCESS', 'FAILURE', 'DENIED')) NOT NULL,
    ip_address VARCHAR(50),
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    key_name VARCHAR(100) NOT NULL,
    key_prefix VARCHAR(20) NOT NULL,
    hashed_key TEXT NOT NULL, -- SHA-256 hash of API key
    rate_limit_per_min INT DEFAULT 60 CHECK (rate_limit_per_min > 0) NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'revoked')) NOT NULL,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.knowledge_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    read_time VARCHAR(50) NOT NULL,
    summary TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
    author VARCHAR(150) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.client_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    author_name VARCHAR(150) NOT NULL,
    author_role VARCHAR(50) NOT NULL,
    tag VARCHAR(50) CHECK (tag IN ('Important', 'Billing', 'Technical', 'Relationship')) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==============================================================================
-- 10. HIGH-PERFORMANCE INDEXING SPECIFICATION
-- ==============================================================================

-- Multi-Tenant Composite Indexes
CREATE INDEX IF NOT EXISTS idx_projects_org_status ON public.projects(organization_id, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON public.projects(client_id);
CREATE INDEX IF NOT EXISTS idx_milestones_project_order ON public.milestones(project_id, "order");
CREATE INDEX IF NOT EXISTS idx_tasks_project_col ON public.tasks(project_id, "column") WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to_id);

-- Invoices & Payment Performance
CREATE INDEX IF NOT EXISTS idx_invoices_org_status ON public.invoices(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_invoices_project_id ON public.invoices(project_id);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON public.invoices(due_date) WHERE status != 'Paid';
CREATE INDEX IF NOT EXISTS idx_payment_tx_idempotency ON public.payment_transactions(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_payment_tx_invoice ON public.payment_transactions(invoice_id);

-- Communication & Tickets
CREATE INDEX IF NOT EXISTS idx_messages_project_time ON public.messages(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tickets_project_status ON public.support_tickets(project_id, status);
CREATE INDEX IF NOT EXISTS idx_tickets_org_sla ON public.support_tickets(organization_id, sla_breached);
CREATE INDEX IF NOT EXISTS idx_ticket_replies_ticket ON public.ticket_replies(ticket_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read) WHERE is_read = FALSE;

-- Proposals & Enterprise Operations
CREATE INDEX IF NOT EXISTS idx_proposals_number ON public.proposals(proposal_number);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON public.proposals(status);
CREATE INDEX IF NOT EXISTS idx_change_requests_project ON public.change_requests(project_id, status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_time ON public.audit_logs(organization_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_api_keys_lookup ON public.api_keys(key_prefix) WHERE status = 'active';

-- GIN Indexes for Structured JSONB Searching
CREATE INDEX IF NOT EXISTS idx_proposals_scope_gin ON public.proposals USING gin(scope_of_work);
CREATE INDEX IF NOT EXISTS idx_proposals_cost_gin ON public.proposals USING gin(cost_breakdown);
CREATE INDEX IF NOT EXISTS idx_audit_metadata_gin ON public.audit_logs USING gin(metadata);

-- ==============================================================================
-- 11. ROW LEVEL SECURITY (RLS) & DEFENSE-IN-DEPTH ACCESS CONTROL
-- ==============================================================================

-- Security Definer Helpers
CREATE OR REPLACE FUNCTION public.is_studio_staff()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() 
          AND role IN ('super_admin', 'admin', 'project_manager', 'developer', 'designer', 'support_agent', 'finance', 'account_manager')
          AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.user_has_org_access(target_org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() 
          AND (organization_id = target_org_id OR public.is_studio_staff())
          AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Enable RLS across all multi-tenant tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_audit_trail ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.change_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_handovers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credential_vault ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nps_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Core RLS Policies (Tenant Isolation)
CREATE POLICY "Profiles: Users read own or same-org profiles, studio staff reads all"
ON public.profiles FOR SELECT
USING (public.is_studio_staff() OR id = auth.uid() OR organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Profiles: Users update own profile without role escalation"
ON public.profiles FOR UPDATE
USING (public.is_studio_staff() OR id = auth.uid())
WITH CHECK (
    public.is_studio_staff() OR 
    (id = auth.uid() AND role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()))
);

CREATE POLICY "Orgs: Studio staff access all, clients access own"
ON public.organizations FOR ALL
USING (public.is_studio_staff() OR id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Projects: Studio staff access all, clients access assigned org"
ON public.projects FOR ALL
USING (public.is_studio_staff() OR organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Tasks: Project participant access"
ON public.tasks FOR ALL
USING (
    public.is_studio_staff() OR 
    EXISTS (SELECT 1 FROM public.projects p JOIN public.profiles pr ON pr.organization_id = p.organization_id WHERE p.id = tasks.project_id AND pr.id = auth.uid())
);

CREATE POLICY "Invoices: Financial visibility by org"
ON public.invoices FOR ALL
USING (
    public.is_studio_staff() OR 
    organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Proposals: Studio leadership manage, clients view finalized"
ON public.proposals FOR ALL
USING (
    public.is_studio_staff() OR 
    (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()) AND status IN ('Sent', 'Accepted'))
);

CREATE POLICY "Audit Logs: Read-only for org admins and studio staff"
ON public.audit_logs FOR SELECT
USING (
    public.is_studio_staff() OR 
    organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid() AND role = 'client_admin')
);

CREATE POLICY "Credential Vault: Restricted to studio staff and client admin"
ON public.credential_vault FOR ALL
USING (
    public.is_studio_staff() OR 
    organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid() AND role = 'client_admin')
);

-- ==============================================================================
-- 12. AUTOMATIC TIMESTAMP TRIGGER
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ 
DECLARE
    tbl text;
BEGIN
    FOR tbl IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND column_name = 'updated_at'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trg_set_updated_at ON public.%I;', tbl);
        EXECUTE format('CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();', tbl);
    END LOOP;
END $$;

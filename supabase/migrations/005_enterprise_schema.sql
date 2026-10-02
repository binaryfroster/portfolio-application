-- Migration: 005_enterprise_schema.sql
-- Description: Enterprise schema expansion for Binary Froster Client Success Hub

-- Enable pgcrypto for UUIDs and Encryption if needed
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Organizations (Tenants) Table
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    logo_url TEXT,
    industry TEXT,
    website TEXT,
    primary_contact_name TEXT,
    primary_contact_email TEXT,
    primary_contact_phone TEXT,
    health_score INT DEFAULT 95 CHECK (health_score BETWEEN 0 AND 100),
    health_explanation TEXT DEFAULT 'Project on schedule, invoice payments up to date.',
    account_manager_id UUID,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'onboarding', 'suspended', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Granular User Roles & Permissions
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN (
        'client_user', 'client_admin', 'admin', 'super_admin',
        'project_manager', 'developer', 'designer', 'support_agent',
        'finance', 'account_manager'
    )),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, organization_id)
);

-- 3. Change Requests Table
CREATE TABLE IF NOT EXISTS public.change_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    project_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    priority TEXT DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
    business_impact TEXT,
    estimated_cost NUMERIC(10,2) DEFAULT 0.00,
    estimated_hours INT DEFAULT 0,
    status TEXT DEFAULT 'Submitted' CHECK (status IN (
        'Submitted', 'Reviewed', 'Estimated', 'Client Approval',
        'Scheduled', 'In Progress', 'Completed', 'Rejected'
    )),
    requested_by_id UUID,
    requested_by_name TEXT NOT NULL,
    approved_by_name TEXT,
    approval_timestamp TIMESTAMPTZ,
    attachments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Maintenance Plans & SLA Incidents Table
CREATE TABLE IF NOT EXISTS public.maintenance_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    plan_name TEXT NOT NULL DEFAULT 'Enterprise SLA Care',
    start_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    sla_response_hours INT DEFAULT 1,
    sla_resolution_hours INT DEFAULT 8,
    monthly_support_hours INT DEFAULT 40,
    used_support_hours INT DEFAULT 12,
    uptime_guarantee NUMERIC(5,2) DEFAULT 99.95,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending_renewal', 'expired')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Project Handovers Table
CREATE TABLE IF NOT EXISTS public.project_handovers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    project_id UUID NOT NULL,
    stage TEXT DEFAULT 'Ready for Handover' CHECK (stage IN (
        'Ready for Handover', 'Client Review', 'Client Approval',
        'Handover Complete', 'Maintenance'
    )),
    repository_url TEXT,
    deployment_url TEXT,
    api_docs_url TEXT,
    training_materials_url TEXT,
    backup_manifest_url TEXT,
    client_signoff_name TEXT,
    signoff_timestamp TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Encrypted Credential Vault Table
CREATE TABLE IF NOT EXISTS public.credential_vault (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    service_name TEXT NOT NULL,
    environment TEXT DEFAULT 'Production' CHECK (environment IN ('Production', 'Staging', 'Development')),
    username_or_key TEXT NOT NULL,
    encrypted_secret TEXT NOT NULL,
    notes TEXT,
    last_rotated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. NPS & CSAT Feedback Table
CREATE TABLE IF NOT EXISTS public.nps_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID,
    user_name TEXT NOT NULL,
    nps_score INT CHECK (nps_score BETWEEN 0 AND 10),
    csat_rating INT CHECK (csat_rating BETWEEN 1 AND 5),
    category TEXT DEFAULT 'General Experience',
    comments TEXT,
    testimonial_granted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Tamper-Resistant Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    actor_id UUID,
    actor_name TEXT NOT NULL,
    actor_role TEXT NOT NULL,
    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    result TEXT DEFAULT 'SUCCESS' CHECK (result IN ('SUCCESS', 'FAILURE', 'DENIED')),
    ip_address TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 9. API Keys & Webhooks Management Table
CREATE TABLE IF NOT EXISTS public.api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    key_name TEXT NOT NULL,
    key_prefix TEXT NOT NULL,
    hashed_key TEXT NOT NULL,
    rate_limit_per_min INT DEFAULT 60,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.webhook_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    target_url TEXT NOT NULL,
    secret_hash TEXT NOT NULL,
    events TEXT[] DEFAULT ARRAY['project.updated', 'invoice.paid', 'ticket.created'],
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexing for high-performance multi-tenant queries
CREATE INDEX IF NOT EXISTS idx_change_requests_org ON public.change_requests(organization_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_plans_org ON public.maintenance_plans(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org ON public.audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);

-- ==============================================================================
-- BINARY FROSTER SUITE - PORTFOLIO APPLICATIONS PRODUCTION SCHEMA
-- Migration: 007_portfolio_applications_schema.sql
-- Description: Provisioning relational tables for all 7 enterprise showcase applications:
-- 1. VocalFlow Telephony
-- 2. MetroVal Real Estate ML
-- 3. LearnBridge LMS
-- 4. MediCare Clinical EHR
-- 5. FlowOps Manufacturing ERP
-- 6. EduTrack Student Information System
-- 7. Nexus LLM Copilot & Knowledge Station
-- ==============================================================================

-- Enable Core Cryptographic Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. VOCALFLOW TELEPHONY (vocalflow_call_logs)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.vocalflow_call_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_sid VARCHAR(64) UNIQUE NOT NULL,
    from_number VARCHAR(32) NOT NULL,
    to_number VARCHAR(32) NOT NULL,
    customer_name VARCHAR(128) NOT NULL DEFAULT 'Valued Client',
    scenario VARCHAR(64) NOT NULL DEFAULT 'enterprise_priority',
    agent_voice VARCHAR(64) NOT NULL DEFAULT 'Sarah (Neural Voice Agent)',
    status VARCHAR(32) NOT NULL DEFAULT 'completed',
    direction VARCHAR(32) NOT NULL DEFAULT 'outbound-api',
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    recording_url TEXT,
    transcript_json JSONB DEFAULT '[]'::jsonb,
    sentiment_score NUMERIC(4, 2) DEFAULT 0.90,
    latency_ms INTEGER DEFAULT 140,
    carrier VARCHAR(64) DEFAULT 'twilio-voice-gateway',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vocalflow_to_number ON public.vocalflow_call_logs (to_number);
CREATE INDEX IF NOT EXISTS idx_vocalflow_created_at ON public.vocalflow_call_logs (created_at DESC);

-- ==============================================================================
-- 2. METROVAL REAL ESTATE PREDICTOR (metroval_saved_properties)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.metroval_saved_properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_ref VARCHAR(64) UNIQUE NOT NULL,
    borough VARCHAR(128) NOT NULL,
    postcode VARCHAR(32) NOT NULL,
    typology VARCHAR(64) NOT NULL,
    sqft INTEGER NOT NULL,
    bedrooms INTEGER NOT NULL,
    bathrooms INTEGER NOT NULL,
    condition_grade INTEGER NOT NULL DEFAULT 3,
    year_built INTEGER NOT NULL DEFAULT 1980,
    estimated_price NUMERIC(14, 2) NOT NULL,
    currency VARCHAR(8) NOT NULL DEFAULT 'GBP',
    price_per_sqft NUMERIC(10, 2) NOT NULL,
    confidence_low NUMERIC(14, 2) NOT NULL,
    confidence_high NUMERIC(14, 2) NOT NULL,
    mortgage_quote_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_metroval_borough ON public.metroval_saved_properties (borough);
CREATE INDEX IF NOT EXISTS idx_metroval_created_at ON public.metroval_saved_properties (created_at DESC);

-- ==============================================================================
-- 3. LEARNBRIDGE LMS (learnbridge_enrollments & learnbridge_quiz_attempts)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.learnbridge_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_name VARCHAR(128) NOT NULL,
    course_id VARCHAR(64) NOT NULL,
    course_title VARCHAR(256) NOT NULL,
    progress_percent INTEGER NOT NULL DEFAULT 0,
    completed_lessons JSONB DEFAULT '[]'::jsonb,
    cert_hash VARCHAR(128),
    notes_json JSONB DEFAULT '[]'::jsonb,
    streak_days INTEGER DEFAULT 14,
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_student_course UNIQUE (student_name, course_id)
);

CREATE TABLE IF NOT EXISTS public.learnbridge_quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_name VARCHAR(128) NOT NULL,
    course_id VARCHAR(64) NOT NULL,
    score_percent INTEGER NOT NULL,
    passed BOOLEAN NOT NULL DEFAULT false,
    answers_json JSONB DEFAULT '{}'::jsonb,
    attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 4. MEDICARE CLINICAL EHR (medicare_patients & medicare_audit_ledger)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.medicare_patients (
    mrn VARCHAR(32) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    age INTEGER NOT NULL,
    gender VARCHAR(16) NOT NULL,
    triage_acuity VARCHAR(32) NOT NULL DEFAULT 'Stable',
    bed VARCHAR(32) NOT NULL,
    condition VARCHAR(256) NOT NULL,
    blood_pressure VARCHAR(16) NOT NULL DEFAULT '120/80',
    heart_rate INTEGER NOT NULL DEFAULT 72,
    spo2 INTEGER NOT NULL DEFAULT 98,
    resp_rate INTEGER NOT NULL DEFAULT 16,
    temp_f NUMERIC(4, 1) NOT NULL DEFAULT 98.6,
    map_mmhg INTEGER NOT NULL DEFAULT 93,
    allergies JSONB DEFAULT '[]'::jsonb,
    prescriptions JSONB DEFAULT '[]'::jsonb,
    attending_physician VARCHAR(128) DEFAULT 'Dr. Aris Thorne, MD',
    is_active_inpatient BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.medicare_audit_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(64) NOT NULL,
    mrn VARCHAR(32) REFERENCES public.medicare_patients(mrn) ON DELETE SET NULL,
    clinician_name VARCHAR(128) NOT NULL,
    action_detail TEXT NOT NULL,
    sha256_hash VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_medicare_patients_acuity ON public.medicare_patients (triage_acuity);

-- ==============================================================================
-- 5. FLOWOPS ERP (flowops_inventory & flowops_work_orders)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.flowops_inventory (
    sku VARCHAR(32) PRIMARY KEY,
    description VARCHAR(256) NOT NULL,
    bay VARCHAR(32) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    safety_min INTEGER NOT NULL DEFAULT 10,
    unit_cost NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    category VARCHAR(64) NOT NULL DEFAULT 'Fasteners',
    status VARCHAR(32) NOT NULL DEFAULT 'In Stock',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.flowops_work_orders (
    order_id VARCHAR(32) PRIMARY KEY,
    client_name VARCHAR(128) NOT NULL,
    product VARCHAR(256) NOT NULL,
    units INTEGER NOT NULL DEFAULT 1,
    priority VARCHAR(32) NOT NULL DEFAULT 'Standard',
    stage VARCHAR(64) NOT NULL DEFAULT 'Backlog',
    dispatch_manifest JSONB DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_flowops_inventory_bay ON public.flowops_inventory (bay);

-- ==============================================================================
-- 6. EDUTRACK SIS (edutrack_students & edutrack_attendance_ledger)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.edutrack_students (
    student_id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    email VARCHAR(128) NOT NULL,
    cohort VARCHAR(64) NOT NULL,
    gpa NUMERIC(3, 2) NOT NULL DEFAULT 3.50,
    attendance_rate NUMERIC(5, 2) NOT NULL DEFAULT 95.00,
    guardian_name VARCHAR(128) NOT NULL,
    guardian_phone VARCHAR(32) NOT NULL,
    guardian_email VARCHAR(128),
    tuition_status VARCHAR(32) NOT NULL DEFAULT 'PAID',
    tuition_balance NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    grades_json JSONB DEFAULT '[]'::jsonb,
    warning_flags JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.edutrack_attendance_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_date DATE NOT NULL DEFAULT CURRENT_DATE,
    student_id VARCHAR(32) REFERENCES public.edutrack_students(student_id) ON DELETE CASCADE,
    status VARCHAR(16) NOT NULL DEFAULT 'Present',
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_student_session UNIQUE (student_id, session_date)
);

CREATE INDEX IF NOT EXISTS idx_edutrack_cohort ON public.edutrack_students (cohort);

-- ==============================================================================
-- 7. NEXUS LLM PORTAL (nexus_conversations & nexus_knowledge_chunks)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.nexus_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(64) NOT NULL,
    turn_index INTEGER NOT NULL,
    speaker VARCHAR(32) NOT NULL,
    text TEXT NOT NULL,
    ttft_ms INTEGER DEFAULT 50,
    tokens_per_sec NUMERIC(6, 1) DEFAULT 45.0,
    citations_json JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.nexus_knowledge_chunks (
    chunk_id VARCHAR(64) PRIMARY KEY,
    doc_title VARCHAR(256) NOT NULL,
    token_range VARCHAR(64) NOT NULL,
    similarity_score NUMERIC(5, 4) NOT NULL DEFAULT 0.8500,
    chunk_text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nexus_session_id ON public.nexus_conversations (session_id);

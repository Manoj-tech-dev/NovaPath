-- ==============================================================================
-- NovaPath: LaunchPadX 2026 (Track 01: The Agent Hub) - Supabase / PostgreSQL Schema
-- Team: NovaForge
-- ==============================================================================

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users table (Student profile)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    degree TEXT NOT NULL,
    branch TEXT NOT NULL,
    year INTEGER NOT NULL CHECK (year >= 1 AND year <= 5),
    location TEXT NOT NULL,
    skills TEXT[] NOT NULL DEFAULT '{}',
    career_interests TEXT[] NOT NULL DEFAULT '{}',
    preferred_opportunity_types TEXT[] NOT NULL DEFAULT '{"Internship"}',
    remote_preference BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Memories table (Persistent Profile and Interaction Memory)
CREATE TABLE IF NOT EXISTS memories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    memory_type TEXT NOT NULL CHECK (memory_type IN ('PROFILE', 'INTERACTION', 'PREFERENCE', 'FEEDBACK')),
    memory_text TEXT NOT NULL,
    importance TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (importance IN ('LOW', 'MEDIUM', 'HIGH')),
    category TEXT DEFAULT 'General',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Opportunities table (External & Curated Opportunities)
CREATE TABLE IF NOT EXISTS opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    organization TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Internship', 'Full-time', 'Research', 'Fellowship', 'Apprenticeship')),
    location TEXT NOT NULL,
    remote BOOLEAN NOT NULL DEFAULT false,
    skills TEXT[] NOT NULL DEFAULT '{}',
    eligibility TEXT NOT NULL,
    deadline TIMESTAMP WITH TIME ZONE,
    description TEXT NOT NULL,
    source TEXT NOT NULL,
    url TEXT,
    source_type TEXT NOT NULL DEFAULT 'CURATED_DATASET' CHECK (source_type IN ('LIVE_API', 'CURATED_DATASET', 'CACHED_SOURCE')),
    stipend_or_salary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Applications / Saved Opportunities table
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL DEFAULT 'SAVED' CHECK (status IN ('SAVED', 'APPLIED', 'INTERVIEWING', 'OFFER', 'REJECTED')),
    notes TEXT,
    applied_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, opportunity_id)
);

-- 5. Agent Runs table (Execution tracking & session state)
CREATE TABLE IF NOT EXISTS agent_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    goal TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'QUEUED' CHECK (status IN ('QUEUED', 'RUNNING', 'COMPLETED', 'FAILED')),
    summary TEXT,
    retrieved_preferences TEXT[] DEFAULT '{}',
    result_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 6. Agent Steps table (Decomposed reasoning steps for visible agent execution)
CREATE TABLE IF NOT EXISTS agent_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_run_id UUID REFERENCES agent_runs(id) ON DELETE CASCADE NOT NULL,
    step_number INTEGER NOT NULL,
    step_name TEXT NOT NULL,
    display_title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'SKIPPED')),
    result_summary TEXT,
    details JSONB,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_memories_user_id ON memories(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_runs_user_id ON agent_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_steps_run_id ON agent_steps(agent_run_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_type ON opportunities(type);
CREATE INDEX IF NOT EXISTS idx_opportunities_location ON opportunities(location);

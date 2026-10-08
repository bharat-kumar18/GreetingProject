CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(120) NOT NULL,
    occasion VARCHAR(100) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    width INTEGER NOT NULL DEFAULT 1200,
    height INTEGER NOT NULL DEFAULT 630,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

ALTER TABLE templates ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    email VARCHAR(320) NOT NULL,
    occasion VARCHAR(100) NOT NULL,
    greeting_date DATE,
    message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS generation_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES templates(id),
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    total_count INTEGER NOT NULL DEFAULT 0,
    success_count INTEGER NOT NULL DEFAULT 0,
    failed_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS generated_outputs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES generation_jobs(id),
    template_id UUID NOT NULL REFERENCES templates(id),
    recipient_id UUID NOT NULL REFERENCES recipients(id),
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    format VARCHAR(20) NOT NULL DEFAULT 'png',
    email_status VARCHAR(30) NOT NULL DEFAULT 'not_sent',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recipients_email ON recipients(email);
CREATE INDEX IF NOT EXISTS idx_outputs_recipient ON generated_outputs(recipient_id);
CREATE INDEX IF NOT EXISTS idx_outputs_job ON generated_outputs(job_id);

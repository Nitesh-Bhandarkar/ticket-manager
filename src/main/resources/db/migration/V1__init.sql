CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email       VARCHAR(255) UNIQUE NOT NULL,
    name        VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role        VARCHAR(50) NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE tickets (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject          VARCHAR(500) NOT NULL,
    body             TEXT,
    email_from       VARCHAR(255) NOT NULL,
    gmail_message_id VARCHAR(255) UNIQUE,
    gmail_thread_id  VARCHAR(255),
    category         VARCHAR(100),
    priority         VARCHAR(50) NOT NULL DEFAULT 'MEDIUM',
    status           VARCHAR(50) NOT NULL DEFAULT 'OPEN',
    assigned_agent_id UUID REFERENCES users(id),
    sla_deadline     TIMESTAMP,
    created_at       TIMESTAMP NOT NULL DEFAULT now(),
    updated_at       TIMESTAMP NOT NULL DEFAULT now(),
    resolved_at      TIMESTAMP
);

CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_assigned_agent ON tickets(assigned_agent_id);
CREATE INDEX idx_tickets_gmail_thread ON tickets(gmail_thread_id);

CREATE TABLE ticket_replies (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id     UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    body          TEXT NOT NULL,
    sent_by       UUID REFERENCES users(id),
    ai_generated  BOOLEAN NOT NULL DEFAULT false,
    sent_at       TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_ticket_replies_ticket ON ticket_replies(ticket_id);

CREATE TABLE knowledge_base (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title               VARCHAR(500) NOT NULL,
    category            VARCHAR(100),
    problem_description TEXT NOT NULL,
    resolution          TEXT NOT NULL,
    vector_store_doc_id VARCHAR(255),
    created_by          UUID REFERENCES users(id),
    created_at          TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE sla_config (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    priority         VARCHAR(50) UNIQUE NOT NULL,
    resolution_hours INTEGER NOT NULL
);

INSERT INTO sla_config (priority, resolution_hours) VALUES
    ('HIGH',   4),
    ('MEDIUM', 24),
    ('LOW',    72);

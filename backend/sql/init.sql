-- ╔═══════════════════════════════════════════════════════════════╗
-- ║              ChainGuard AI — Database Schema                ║
-- ╚═══════════════════════════════════════════════════════════════╝

-- Run with:  psql -U postgres -f sql/init.sql

-- ── Create database ──────────────────────────────────────────────
-- NOTE: Run this line separately if needed:
-- CREATE DATABASE chainguard;
-- Then connect: \c chainguard

-- ── Extensions ───────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Users ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            VARCHAR(100)   NOT NULL,
  email           VARCHAR(255)   UNIQUE NOT NULL,
  password_hash   VARCHAR(255)   NOT NULL,
  role            VARCHAR(20)    NOT NULL DEFAULT 'learner'
                    CHECK (role IN ('learner', 'pro', 'admin')),
  wallet_address  VARCHAR(42),
  refresh_token   TEXT,
  created_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ── Education: Modules ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS modules (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title             VARCHAR(200)   NOT NULL,
  description       TEXT           NOT NULL,
  category          VARCHAR(30)    NOT NULL
                      CHECK (category IN ('basics', 'defi', 'nft', 'security', 'advanced', 'real-world')),
  difficulty        VARCHAR(20)    NOT NULL
                      CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  lesson_count      INT            NOT NULL DEFAULT 0,
  estimated_minutes INT            NOT NULL DEFAULT 0,
  "order"           INT            NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- ── Education: Lessons ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lessons (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id   UUID           NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title       VARCHAR(200)   NOT NULL,
  content     TEXT           NOT NULL,
  "order"     INT            NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lessons_module ON lessons(module_id);

-- ── Education: Quiz Questions ────────────────────────────────────
CREATE TABLE IF NOT EXISTS quiz_questions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id   UUID           NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  question    TEXT           NOT NULL,
  options     JSONB          NOT NULL,        -- ["A", "B", "C", "D"]
  answer      VARCHAR(10)    NOT NULL,        -- e.g. "A"
  explanation TEXT,
  "order"     INT            NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_quiz_module ON quiz_questions(module_id);

-- ── User Progress ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_progress (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id   UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed   BOOLEAN        NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, lesson_id)
);

-- ── Quiz Scores ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quiz_scores (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  module_id   UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  score       INT  NOT NULL,
  total       INT  NOT NULL,
  taken_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Chat Sessions ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_sessions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       VARCHAR(200) DEFAULT 'New Chat',
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user ON chat_sessions(user_id);

-- ── Chat Messages ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_messages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id  UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role        VARCHAR(20)  NOT NULL CHECK (role IN ('user', 'assistant')),
  content     TEXT         NOT NULL,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);

-- ── NFT Scan History ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS nft_scans (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID REFERENCES users(id) ON DELETE SET NULL,
  contract_address  VARCHAR(100),
  collection_name   VARCHAR(200),
  risk_score        INT  NOT NULL,
  risk_band         VARCHAR(20) NOT NULL,
  factors           JSONB NOT NULL DEFAULT '[]',
  scanned_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nft_scans_user ON nft_scans(user_id);

-- ══════════════════════════════════════════════════════════════════
-- Schema ready ✅
-- ══════════════════════════════════════════════════════════════════

-- ConcourNow — Initial Schema Migration
-- Run this in Supabase SQL Editor or via supabase db push

-- ── Users table ────────────────────────────────────────────────────────────────
-- Extends Supabase auth.users with profile data
CREATE TABLE public.users (
  id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           text NOT NULL UNIQUE,
  name            text NOT NULL,
  user_role       text NOT NULL DEFAULT 'user' CHECK (user_role IN ('user', 'admin')),
  status          text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive')),
  specialty_id    integer,
  diploma_id      integer,
  exp_range_ids   integer[],
  region_id       integer,
  city_id         integer,
  notification_prefs jsonb DEFAULT '{"email": true, "push": false}'::jsonb,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ── Job Posts ──────────────────────────────────────────────────────────────────
CREATE TABLE public.job_posts (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url              text NOT NULL UNIQUE,
  title            text NOT NULL,
  organization     text,
  body_text        text NOT NULL DEFAULT '',
  deadline         date,
  exam_date        date,
  published_at     date,
  positions_count  integer,
  competition_code text,
  scraped_at       timestamptz NOT NULL DEFAULT now(),
  source_page      integer
);

CREATE INDEX idx_job_posts_scraped_at ON public.job_posts(scraped_at DESC);
CREATE INDEX idx_job_posts_deadline ON public.job_posts(deadline);
CREATE INDEX idx_job_posts_published_at ON public.job_posts(published_at);

-- Full-text search index on title
CREATE INDEX idx_job_posts_title_fts ON public.job_posts
  USING gin(to_tsvector('arabic', title || ' ' || COALESCE(organization, '')));

-- ── AI Analyses ────────────────────────────────────────────────────────────────
CREATE TABLE public.ai_analyses (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_post_id         uuid NOT NULL REFERENCES public.job_posts(id) ON DELETE CASCADE UNIQUE,
  raw_output          text NOT NULL,
  specialty_matches   integer[] NOT NULL DEFAULT '{}',
  diploma_matches     integer[] NOT NULL DEFAULT '{}',
  exp_matches         integer[] NOT NULL DEFAULT '{}',
  region_matches      integer[] NOT NULL DEFAULT '{}',
  city_matches        integer[] NOT NULL DEFAULT '{}',
  analyzed_at         timestamptz NOT NULL DEFAULT now(),
  ai_provider         text NOT NULL
);

CREATE INDEX idx_ai_analyses_specialty ON public.ai_analyses USING gin(specialty_matches);
CREATE INDEX idx_ai_analyses_diploma ON public.ai_analyses USING gin(diploma_matches);
CREATE INDEX idx_ai_analyses_exp ON public.ai_analyses USING gin(exp_matches);
CREATE INDEX idx_ai_analyses_region ON public.ai_analyses USING gin(region_matches);
CREATE INDEX idx_ai_analyses_city ON public.ai_analyses USING gin(city_matches);

-- ── User Matches ───────────────────────────────────────────────────────────────
CREATE TABLE public.user_matches (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  job_post_id   uuid NOT NULL REFERENCES public.job_posts(id) ON DELETE CASCADE,
  matched_at    timestamptz NOT NULL DEFAULT now(),
  notified      boolean NOT NULL DEFAULT false,
  UNIQUE (user_id, job_post_id)
);

CREATE INDEX idx_user_matches_user_id ON public.user_matches(user_id);
CREATE INDEX idx_user_matches_matched_at ON public.user_matches(matched_at DESC);
CREATE INDEX idx_user_matches_new ON public.user_matches(user_id, matched_at DESC)
  WHERE notified = false;

-- ── Push Subscriptions ─────────────────────────────────────────────────────────
CREATE TABLE public.push_subscriptions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  subscription jsonb NOT NULL
);

-- ── Scrape Runs ────────────────────────────────────────────────────────────────
CREATE TABLE public.scrape_runs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  triggered_by  text NOT NULL DEFAULT 'cron' CHECK (triggered_by IN ('cron', 'manual')),
  started_at    timestamptz NOT NULL DEFAULT now(),
  finished_at   timestamptz,
  posts_found   integer,
  posts_new     integer,
  status        text NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'complete', 'error')),
  error_message text
);

CREATE INDEX idx_scrape_runs_started_at ON public.scrape_runs(started_at DESC);

-- ── Row Level Security ─────────────────────────────────────────────────────────

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scrape_runs ENABLE ROW LEVEL SECURITY;

-- Users: can only read/update their own row
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Job posts: all authenticated users can read
CREATE POLICY "job_posts_select_auth" ON public.job_posts
  FOR SELECT USING (auth.role() = 'authenticated');

-- AI analyses: all authenticated users can read
CREATE POLICY "ai_analyses_select_auth" ON public.ai_analyses
  FOR SELECT USING (auth.role() = 'authenticated');

-- User matches: users can only read their own matches
CREATE POLICY "user_matches_select_own" ON public.user_matches
  FOR SELECT USING (auth.uid() = user_id);

-- Push subscriptions: users manage their own
CREATE POLICY "push_sub_select_own" ON public.push_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "push_sub_insert_own" ON public.push_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "push_sub_delete_own" ON public.push_subscriptions
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "push_sub_upsert_own" ON public.push_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Scrape runs: authenticated users can read
CREATE POLICY "scrape_runs_select_auth" ON public.scrape_runs
  FOR SELECT USING (auth.role() = 'authenticated');

-- NOTE: All write operations to job_posts, ai_analyses, user_matches, scrape_runs
-- are done via the service role key (bypasses RLS). Never expose the service key client-side.

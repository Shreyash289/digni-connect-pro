-- =============================================================================
-- CAREVIA — schema gap-fill pass
-- Adds tables/columns/policies the real UI needs that weren't in the original
-- setup, based on a page-by-page audit against src/pages/*.jsx.
-- Additive only, safe to re-run.
-- =============================================================================

-- ===== PROFILES: denormalized email + account status =====
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS account_status TEXT NOT NULL DEFAULT 'active'
    CHECK (account_status IN ('active', 'suspended'));

-- Backfill email for accounts that already exist
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND p.email IS DISTINCT FROM u.email;

-- Keep email in sync for new signups going forward
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), NEW.email);
  RETURN NEW;
END;
$$;

-- Admins previously had no way to list other users' profiles at all
DROP POLICY IF EXISTS "admins read all profiles" ON public.profiles;
CREATE POLICY "admins read all profiles" ON public.profiles FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "admins update all profiles" ON public.profiles;
CREATE POLICY "admins update all profiles" ON public.profiles FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()));

-- ===== SURVIVORS: employment pipeline stage + experience summary =====
DO $$ BEGIN
  CREATE TYPE public.survivor_pipeline_stage AS ENUM (
    'registered', 'profile_complete', 'applying', 'interviewing', 'offer', 'employed'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.survivors
  ADD COLUMN IF NOT EXISTS pipeline_stage public.survivor_pipeline_stage NOT NULL DEFAULT 'registered',
  ADD COLUMN IF NOT EXISTS total_experience TEXT;

CREATE INDEX IF NOT EXISTS survivors_pipeline_stage_idx ON public.survivors(pipeline_stage);

-- ===== JOB APPLICATIONS: recruiter/NGO status notes + finer-grained statuses =====
ALTER TABLE public.job_applications
  ADD COLUMN IF NOT EXISTS status_note TEXT;

ALTER TYPE public.application_status ADD VALUE IF NOT EXISTS 'interview_scheduled';
ALTER TYPE public.application_status ADD VALUE IF NOT EXISTS 'offered';

-- ===== SURVIVOR DOCUMENTS: verification workflow was missing an UPDATE policy =====
DROP POLICY IF EXISTS "ngo owners update survivor document status" ON public.survivor_documents;
CREATE POLICY "ngo owners update survivor document status" ON public.survivor_documents FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.survivors s
    WHERE s.id = survivor_id AND public.owns_approved_ngo(auth.uid(), s.ngo_id)
  ));
DROP POLICY IF EXISTS "admins update all documents" ON public.survivor_documents;
CREATE POLICY "admins update all documents" ON public.survivor_documents FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()));

-- ===== AUDIT LOGS: denormalized human-readable target label =====
ALTER TABLE public.audit_logs
  ADD COLUMN IF NOT EXISTS target_label TEXT;

-- ===== NEW: recruiter saved/shortlisted candidates =====
CREATE TABLE IF NOT EXISTS public.saved_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID NOT NULL REFERENCES public.recruiters(id) ON DELETE CASCADE,
  survivor_id UUID NOT NULL REFERENCES public.survivors(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (recruiter_id, survivor_id)
);
CREATE INDEX IF NOT EXISTS saved_candidates_recruiter_id_idx ON public.saved_candidates(recruiter_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_candidates TO authenticated;
GRANT ALL ON public.saved_candidates TO service_role;
ALTER TABLE public.saved_candidates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "recruiters manage own saved candidates" ON public.saved_candidates;
CREATE POLICY "recruiters manage own saved candidates" ON public.saved_candidates FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.recruiters r WHERE r.id = recruiter_id AND r.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.recruiters r WHERE r.id = recruiter_id AND r.user_id = auth.uid()));
DROP POLICY IF EXISTS "admins read all saved candidates" ON public.saved_candidates;
CREATE POLICY "admins read all saved candidates" ON public.saved_candidates FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

-- ===== NEW: interview scheduling =====
DO $$ BEGIN
  CREATE TYPE public.interview_status AS ENUM ('scheduled', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID NOT NULL REFERENCES public.recruiters(id) ON DELETE CASCADE,
  survivor_id UUID NOT NULL REFERENCES public.survivors(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  introduction_request_id UUID REFERENCES public.introduction_requests(id) ON DELETE SET NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  interview_type TEXT NOT NULL DEFAULT 'virtual',
  video_link TEXT,
  status public.interview_status NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS interviews_recruiter_id_idx ON public.interviews(recruiter_id);
CREATE INDEX IF NOT EXISTS interviews_survivor_id_idx ON public.interviews(survivor_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.interviews TO authenticated;
GRANT ALL ON public.interviews TO service_role;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "recruiters manage own interviews" ON public.interviews;
CREATE POLICY "recruiters manage own interviews" ON public.interviews FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.recruiters r WHERE r.id = recruiter_id AND r.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.recruiters r WHERE r.id = recruiter_id AND r.user_id = auth.uid()));
DROP POLICY IF EXISTS "survivors read own interviews" ON public.interviews;
CREATE POLICY "survivors read own interviews" ON public.interviews FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.survivors s WHERE s.id = survivor_id AND s.linked_user_id = auth.uid()));
DROP POLICY IF EXISTS "ngo read interviews for own survivors" ON public.interviews;
CREATE POLICY "ngo read interviews for own survivors" ON public.interviews FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.survivors s
    WHERE s.id = survivor_id AND public.owns_approved_ngo(auth.uid(), s.ngo_id)
  ));
DROP POLICY IF EXISTS "admins read all interviews" ON public.interviews;
CREATE POLICY "admins read all interviews" ON public.interviews FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

DROP TRIGGER IF EXISTS interviews_updated_at ON public.interviews;
CREATE TRIGGER interviews_updated_at BEFORE UPDATE ON public.interviews
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

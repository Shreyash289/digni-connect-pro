-- =============================================================================
-- CAREVIA — COMPLETE database setup in ONE script (run once in the SQL Editor)
--
-- Works on a brand-new Supabase project AND on a project that is already
-- partly set up: every statement checks before it creates, so it is safe to
-- run more than once.
--
-- Contents, in dependency order:
--   1. Base schema (tables, roles, RLS, storage)      — made re-runnable
--   2. Resume upload + self-onboarding columns
--   3. Schema gap-fill (shortlist, interviews, pipeline)
--   4. Admin users + audit logs
--   5. Jobs, applications, shortlist, interviews, documents, signup role
--   6. NGO + admin dashboards, analytics
--   7. Resume / skills / courses tools + code sign-in
--   8. Reserved admin account (shreym171@gmail.com is made admin on signup)
--
-- Dashboard → SQL Editor → New query → paste this whole file → Run.
-- =============================================================================


-- #############################################################################
-- ##### 1. Base schema (SQL_EDITOR_FULL_SETUP.sql, re-runnable)
-- #############################################################################

-- =============================================================================
-- CAREVIA — Full database setup for Supabase SQL Editor
-- Run ONCE on a fresh project: Dashboard → SQL Editor → New query → Run
-- =============================================================================

-- ===== ENUMS =====
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'ngo_partner', 'survivor', 'recruiter');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE TYPE public.ngo_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE TYPE public.survivor_status AS ENUM ('draft', 'submitted', 'under_review', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ===== PROFILES =====
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users read own profile" ON public.profiles;
CREATE POLICY "users read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
DROP POLICY IF EXISTS "users insert own profile" ON public.profiles;
CREATE POLICY "users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "users update own profile" ON public.profiles;
CREATE POLICY "users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- ===== USER ROLES =====
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users read own roles" ON public.user_roles;
CREATE POLICY "users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Security definer role check (avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin', 'super_admin')
  )
$$;

DROP POLICY IF EXISTS "admins read all roles" ON public.user_roles;
CREATE POLICY "admins read all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));

-- ===== NGOs =====
CREATE TABLE IF NOT EXISTS public.ngos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  registration_number TEXT,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  website TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  focus_areas TEXT[],
  description TEXT,
  status public.ngo_status NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.ngos TO authenticated;
GRANT ALL ON public.ngos TO service_role;
ALTER TABLE public.ngos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "owners read own ngo" ON public.ngos;
CREATE POLICY "owners read own ngo" ON public.ngos FOR SELECT TO authenticated USING (auth.uid() = owner_id);
DROP POLICY IF EXISTS "owners insert own ngo" ON public.ngos;
CREATE POLICY "owners insert own ngo" ON public.ngos FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
DROP POLICY IF EXISTS "owners update own ngo when not approved" ON public.ngos;
CREATE POLICY "owners update own ngo when not approved" ON public.ngos FOR UPDATE TO authenticated USING (auth.uid() = owner_id);
DROP POLICY IF EXISTS "admins read all ngos" ON public.ngos;
CREATE POLICY "admins read all ngos" ON public.ngos FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "admins update all ngos" ON public.ngos;
CREATE POLICY "admins update all ngos" ON public.ngos FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));

-- ===== SURVIVORS =====
CREATE TABLE IF NOT EXISTS public.survivors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ngo_id UUID NOT NULL REFERENCES public.ngos(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  full_name TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  phone TEXT,
  email TEXT,
  emergency_contact TEXT,
  education_level TEXT,
  skills TEXT[],
  languages TEXT[],
  preferred_roles TEXT[],
  preferred_industries TEXT[],
  preferred_locations TEXT[],
  accommodation_needs TEXT,
  notes TEXT,
  anonymous_id TEXT NOT NULL DEFAULT ('CV-' || upper(substring(gen_random_uuid()::text, 1, 8))),
  profile_completion INTEGER NOT NULL DEFAULT 0,
  status public.survivor_status NOT NULL DEFAULT 'draft',
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS survivors_ngo_id_idx ON public.survivors(ngo_id);
CREATE INDEX IF NOT EXISTS survivors_status_idx ON public.survivors(status);
CREATE UNIQUE INDEX IF NOT EXISTS survivors_anonymous_id_idx ON public.survivors(anonymous_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.survivors TO authenticated;
GRANT ALL ON public.survivors TO service_role;
ALTER TABLE public.survivors ENABLE ROW LEVEL SECURITY;

-- Helper: does user own an approved NGO that owns this survivor?
CREATE OR REPLACE FUNCTION public.owns_approved_ngo(_user_id UUID, _ngo_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.ngos
    WHERE id = _ngo_id AND owner_id = _user_id AND status = 'approved'
  )
$$;

DROP POLICY IF EXISTS "ngo owners read own survivors" ON public.survivors;
CREATE POLICY "ngo owners read own survivors" ON public.survivors FOR SELECT TO authenticated
  USING (public.owns_approved_ngo(auth.uid(), ngo_id));
DROP POLICY IF EXISTS "ngo owners insert survivors" ON public.survivors;
CREATE POLICY "ngo owners insert survivors" ON public.survivors FOR INSERT TO authenticated
  WITH CHECK (public.owns_approved_ngo(auth.uid(), ngo_id) AND created_by = auth.uid());
DROP POLICY IF EXISTS "ngo owners update own survivors" ON public.survivors;
CREATE POLICY "ngo owners update own survivors" ON public.survivors FOR UPDATE TO authenticated
  USING (public.owns_approved_ngo(auth.uid(), ngo_id));
DROP POLICY IF EXISTS "ngo owners delete own survivors" ON public.survivors;
CREATE POLICY "ngo owners delete own survivors" ON public.survivors FOR DELETE TO authenticated
  USING (public.owns_approved_ngo(auth.uid(), ngo_id));
DROP POLICY IF EXISTS "admins read all survivors" ON public.survivors;
CREATE POLICY "admins read all survivors" ON public.survivors FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "admins update all survivors" ON public.survivors;
CREATE POLICY "admins update all survivors" ON public.survivors FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));

-- ===== SURVIVOR DOCUMENTS =====
CREATE TABLE IF NOT EXISTS public.survivor_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survivor_id UUID NOT NULL REFERENCES public.survivors(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  doc_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  mime_type TEXT,
  size_bytes INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS survivor_documents_survivor_id_idx ON public.survivor_documents(survivor_id);
GRANT SELECT, INSERT, DELETE ON public.survivor_documents TO authenticated;
GRANT ALL ON public.survivor_documents TO service_role;
ALTER TABLE public.survivor_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ngo owners read survivor documents" ON public.survivor_documents;
CREATE POLICY "ngo owners read survivor documents" ON public.survivor_documents FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.survivors s WHERE s.id = survivor_id AND public.owns_approved_ngo(auth.uid(), s.ngo_id)));
DROP POLICY IF EXISTS "ngo owners insert survivor documents" ON public.survivor_documents;
CREATE POLICY "ngo owners insert survivor documents" ON public.survivor_documents FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.survivors s WHERE s.id = survivor_id AND public.owns_approved_ngo(auth.uid(), s.ngo_id)) AND uploaded_by = auth.uid());
DROP POLICY IF EXISTS "ngo owners delete survivor documents" ON public.survivor_documents;
CREATE POLICY "ngo owners delete survivor documents" ON public.survivor_documents FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.survivors s WHERE s.id = survivor_id AND public.owns_approved_ngo(auth.uid(), s.ngo_id)));
DROP POLICY IF EXISTS "admins read all documents" ON public.survivor_documents;
CREATE POLICY "admins read all documents" ON public.survivor_documents FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));

-- ===== AUDIT LOGS =====
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS audit_logs_entity_idx ON public.audit_logs(entity_type, entity_id);
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins read audit logs" ON public.audit_logs;
CREATE POLICY "admins read audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));

-- ===== TRIGGERS =====
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS ngos_updated_at ON public.ngos;
CREATE TRIGGER ngos_updated_at BEFORE UPDATE ON public.ngos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS survivors_updated_at ON public.survivors;
CREATE TRIGGER survivors_updated_at BEFORE UPDATE ON public.survivors FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_admin(UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.owns_approved_ngo(UUID, UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.owns_approved_ngo(UUID, UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.self_assign_initial_role(_role public.app_role)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF _role NOT IN ('ngo_partner', 'survivor') THEN
    RAISE EXCEPTION 'This role cannot be self-assigned';
  END IF;
  -- Block if user already has any role
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = uid) THEN
    RAISE EXCEPTION 'Role already assigned';
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (uid, _role);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.self_assign_initial_role(public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.self_assign_initial_role(public.app_role) TO authenticated;
-- CAREVIA Phases 2-8: Schema extensions
-- Phase 2: Survivor profile editor + document vault
-- Phase 3: AI Mentor chat
-- Phase 4: Recruiter portal
-- Phase 5: AI Matcher (pgvector)
-- Phase 6: Job board
-- Phase 7: Analytics (aggregate queries, no extra tables)
-- Phase 8: Notifications

-- ===== EXTENSIONS =====
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- ===== ENUMS =====
DO $$ BEGIN
  CREATE TYPE public.recruiter_verification_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE TYPE public.intro_request_status AS ENUM ('pending', 'accepted', 'declined', 'expired');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE TYPE public.job_status AS ENUM ('draft', 'published', 'closed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE TYPE public.employment_type AS ENUM ('full_time', 'part_time', 'contract', 'internship');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE TYPE public.application_status AS ENUM ('submitted', 'reviewing', 'shortlisted', 'rejected', 'hired');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE TYPE public.document_status AS ENUM ('pending', 'verified', 'rejected', 'deleted');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE TYPE public.notification_kind AS ENUM (
  'ngo_approved', 'ngo_rejected', 'recruiter_verified', 'recruiter_rejected',
  'intro_request_received', 'intro_request_responded',
  'job_application_received', 'application_status_changed',
  'mentor_safety_flag', 'weekly_digest'
);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ===== PROFILES: feature flags =====
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS feature_flags JSONB NOT NULL DEFAULT '{
    "phase2": true, "phase3": true, "phase4": true, "phase5": true,
    "phase6": true, "phase7": true, "phase8": true
  }'::jsonb;

-- ===== PHASE 2: Extend survivors =====
ALTER TABLE public.survivors
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS pronouns TEXT,
  ADD COLUMN IF NOT EXISTS location_country TEXT,
  ADD COLUMN IF NOT EXISTS location_region TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS certifications JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS work_history JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS education JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS availability TEXT,
  ADD COLUMN IF NOT EXISTS consent_share_with_recruiters BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS consent_ai_processing BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS consent_share_changed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS consent_ai_changed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS linked_user_id UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS embedding extensions.vector(768),
  ADD COLUMN IF NOT EXISTS searchable BOOLEAN GENERATED ALWAYS AS (
    consent_share_with_recruiters AND profile_completion >= 60
  ) STORED;

CREATE INDEX IF NOT EXISTS survivors_searchable_idx ON public.survivors(searchable) WHERE searchable = true;
CREATE INDEX IF NOT EXISTS survivors_skills_gin_idx ON public.survivors USING gin(skills);
CREATE INDEX IF NOT EXISTS survivors_languages_gin_idx ON public.survivors USING gin(languages);

-- Survivor linked account policies
DROP POLICY IF EXISTS "survivors read own linked profile" ON public.survivors;
CREATE POLICY "survivors read own linked profile" ON public.survivors FOR SELECT TO authenticated
  USING (linked_user_id = auth.uid());
DROP POLICY IF EXISTS "survivors update own linked profile" ON public.survivors;
CREATE POLICY "survivors update own linked profile" ON public.survivors FOR UPDATE TO authenticated
  USING (linked_user_id = auth.uid());

-- Profile completion trigger
CREATE OR REPLACE FUNCTION public.compute_survivor_completion(s public.survivors)
RETURNS INTEGER
LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
  score INTEGER := 0;
  wh_len INTEGER;
  edu_len INTEGER;
BEGIN
  IF s.bio IS NOT NULL AND length(trim(s.bio)) > 20 THEN score := score + 10; END IF;
  IF s.pronouns IS NOT NULL AND length(trim(s.pronouns)) > 0 THEN score := score + 5; END IF;
  IF s.languages IS NOT NULL AND array_length(s.languages, 1) > 0 THEN score := score + 10; END IF;
  IF s.location_country IS NOT NULL THEN score := score + 5; END IF;
  IF s.location_region IS NOT NULL THEN score := score + 5; END IF;
  IF s.skills IS NOT NULL AND array_length(s.skills, 1) > 0 THEN score := score + 15; END IF;
  IF s.availability IS NOT NULL THEN score := score + 5; END IF;
  wh_len := COALESCE(jsonb_array_length(s.work_history), 0);
  IF wh_len > 0 THEN score := score + 15; END IF;
  edu_len := COALESCE(jsonb_array_length(s.education), 0);
  IF edu_len > 0 THEN score := score + 10; END IF;
  IF s.interests IS NOT NULL AND array_length(s.interests, 1) > 0 THEN score := score + 5; END IF;
  IF s.consent_share_with_recruiters THEN score := score + 10; END IF;
  IF s.consent_ai_processing THEN score := score + 5; END IF;
  RETURN LEAST(score, 100);
END;
$$;

CREATE OR REPLACE FUNCTION public.survivors_completion_trigger()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.profile_completion := public.compute_survivor_completion(NEW);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS survivors_compute_completion ON public.survivors;
CREATE TRIGGER survivors_compute_completion
  BEFORE INSERT OR UPDATE ON public.survivors
  FOR EACH ROW EXECUTE FUNCTION public.survivors_completion_trigger();

-- ===== PHASE 2: Skills taxonomy =====
CREATE TABLE IF NOT EXISTS public.survivor_skills_taxonomy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  category TEXT NOT NULL,
  embedding extensions.vector(768),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.survivor_skills_taxonomy TO authenticated;
GRANT ALL ON public.survivor_skills_taxonomy TO service_role;
ALTER TABLE public.survivor_skills_taxonomy ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anyone read skills taxonomy" ON public.survivor_skills_taxonomy;
CREATE POLICY "anyone read skills taxonomy" ON public.survivor_skills_taxonomy FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "admins manage skills taxonomy" ON public.survivor_skills_taxonomy;
CREATE POLICY "admins manage skills taxonomy" ON public.survivor_skills_taxonomy FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()));

INSERT INTO public.survivor_skills_taxonomy (slug, label, category) VALUES
  ('tailoring', 'Tailoring', 'crafts'),
  ('cooking', 'Cooking', 'hospitality'),
  ('hospitality', 'Hospitality', 'hospitality'),
  ('customer-service', 'Customer Service', 'business'),
  ('data-entry', 'Data Entry', 'office'),
  ('english', 'English Communication', 'language'),
  ('computer-basics', 'Computer Basics', 'technology'),
  ('sewing', 'Sewing', 'crafts'),
  ('beauty-wellness', 'Beauty & Wellness', 'services'),
  ('childcare', 'Childcare', 'care'),
  ('accounting', 'Accounting', 'finance'),
  ('marketing', 'Digital Marketing', 'business'),
  ('graphic-design', 'Graphic Design', 'creative'),
  ('nursing', 'Nursing', 'healthcare'),
  ('teaching', 'Teaching', 'education')
ON CONFLICT (slug) DO NOTHING;

-- ===== PHASE 2: Document status =====
ALTER TABLE public.survivor_documents
  ADD COLUMN IF NOT EXISTS status public.document_status NOT NULL DEFAULT 'verified',
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

DROP POLICY IF EXISTS "survivors read own documents" ON public.survivor_documents;
CREATE POLICY "survivors read own documents" ON public.survivor_documents FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.survivors s
    WHERE s.id = survivor_id AND s.linked_user_id = auth.uid()
  ));

-- ===== PHASE 2: Storage bucket =====
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('survivor-documents', 'survivor-documents', false, 10485760)
ON CONFLICT (id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.survivor_doc_storage_path(_ngo_id UUID, _survivor_id UUID, _filename TEXT)
RETURNS TEXT LANGUAGE SQL IMMUTABLE AS $$
  SELECT _ngo_id::text || '/' || _survivor_id::text || '/' || gen_random_uuid()::text || '-' || _filename;
$$;

-- Storage RLS
DROP POLICY IF EXISTS "ngo upload survivor docs" ON storage.objects;
CREATE POLICY "ngo upload survivor docs" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'survivor-documents'
    AND EXISTS (
      SELECT 1 FROM public.survivors s
      JOIN public.ngos n ON n.id = s.ngo_id
      WHERE n.owner_id = auth.uid() AND n.status = 'approved'
        AND (storage.foldername(name))[1] = s.ngo_id::text
        AND (storage.foldername(name))[2] = s.id::text
    )
  );

DROP POLICY IF EXISTS "ngo read survivor docs" ON storage.objects;
CREATE POLICY "ngo read survivor docs" ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'survivor-documents'
    AND (
      EXISTS (
        SELECT 1 FROM public.survivors s
        JOIN public.ngos n ON n.id = s.ngo_id
        WHERE n.owner_id = auth.uid()
          AND (storage.foldername(name))[1] = s.ngo_id::text
          AND (storage.foldername(name))[2] = s.id::text
      )
      OR public.is_admin(auth.uid())
      OR EXISTS (
        SELECT 1 FROM public.survivors s
        WHERE s.linked_user_id = auth.uid()
          AND (storage.foldername(name))[2] = s.id::text
      )
    )
  );

DROP POLICY IF EXISTS "ngo delete survivor docs" ON storage.objects;
CREATE POLICY "ngo delete survivor docs" ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'survivor-documents'
    AND EXISTS (
      SELECT 1 FROM public.survivors s
      JOIN public.ngos n ON n.id = s.ngo_id
      WHERE n.owner_id = auth.uid() AND n.status = 'approved'
        AND (storage.foldername(name))[1] = s.ngo_id::text
        AND (storage.foldername(name))[2] = s.id::text
    )
  );

-- ===== AUDIT: allow authenticated inserts =====
DROP POLICY IF EXISTS "authenticated insert audit logs" ON public.audit_logs;
CREATE POLICY "authenticated insert audit logs" ON public.audit_logs FOR INSERT TO authenticated
  WITH CHECK (actor_id = auth.uid() OR actor_id IS NULL);

-- ===== PHASE 3: Mentor chat =====
CREATE TABLE IF NOT EXISTS public.mentor_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  survivor_id UUID REFERENCES public.survivors(id) ON DELETE SET NULL,
  title TEXT NOT NULL DEFAULT 'New conversation',
  safety_flagged BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS mentor_threads_user_id_idx ON public.mentor_threads(user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.mentor_threads TO authenticated;
GRANT ALL ON public.mentor_threads TO service_role;
ALTER TABLE public.mentor_threads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users manage own threads" ON public.mentor_threads;
CREATE POLICY "users manage own threads" ON public.mentor_threads FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "admins read flagged threads" ON public.mentor_threads;
CREATE POLICY "admins read flagged threads" ON public.mentor_threads FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()) AND safety_flagged = true);

CREATE TABLE IF NOT EXISTS public.mentor_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.mentor_threads(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  parts JSONB NOT NULL DEFAULT '[]'::jsonb,
  safety_flagged BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS mentor_messages_thread_id_idx ON public.mentor_messages(thread_id);

GRANT SELECT, INSERT ON public.mentor_messages TO authenticated;
GRANT ALL ON public.mentor_messages TO service_role;
ALTER TABLE public.mentor_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users read own thread messages" ON public.mentor_messages;
CREATE POLICY "users read own thread messages" ON public.mentor_messages FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.mentor_threads t WHERE t.id = thread_id AND t.user_id = auth.uid()));
DROP POLICY IF EXISTS "users insert own thread messages" ON public.mentor_messages;
CREATE POLICY "users insert own thread messages" ON public.mentor_messages FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.mentor_threads t WHERE t.id = thread_id AND t.user_id = auth.uid()));
DROP POLICY IF EXISTS "admins read flagged messages" ON public.mentor_messages;
CREATE POLICY "admins read flagged messages" ON public.mentor_messages FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()) AND safety_flagged = true);

DROP TRIGGER IF EXISTS mentor_threads_updated_at ON public.mentor_threads;
CREATE TRIGGER mentor_threads_updated_at BEFORE UPDATE ON public.mentor_threads
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ===== PHASE 4: Recruiters =====
CREATE TABLE IF NOT EXISTS public.recruiters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  company_website TEXT,
  verification_status public.recruiter_verification_status NOT NULL DEFAULT 'pending',
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.recruiters TO authenticated;
GRANT ALL ON public.recruiters TO service_role;
ALTER TABLE public.recruiters ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_recruiter_approved(_user_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.recruiters
    WHERE user_id = _user_id AND verification_status = 'approved'
  )
$$;

REVOKE EXECUTE ON FUNCTION public.is_recruiter_approved(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_recruiter_approved(UUID) TO authenticated;

DROP POLICY IF EXISTS "recruiters read own profile" ON public.recruiters;
CREATE POLICY "recruiters read own profile" ON public.recruiters FOR SELECT TO authenticated
  USING (user_id = auth.uid());
DROP POLICY IF EXISTS "recruiters insert own profile" ON public.recruiters;
CREATE POLICY "recruiters insert own profile" ON public.recruiters FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "recruiters update own pending profile" ON public.recruiters;
CREATE POLICY "recruiters update own pending profile" ON public.recruiters FOR UPDATE TO authenticated
  USING (user_id = auth.uid());
DROP POLICY IF EXISTS "admins manage recruiters" ON public.recruiters;
CREATE POLICY "admins manage recruiters" ON public.recruiters FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()));

DROP TRIGGER IF EXISTS recruiters_updated_at ON public.recruiters;
CREATE TRIGGER recruiters_updated_at BEFORE UPDATE ON public.recruiters
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Recruiter self-assign role
CREATE OR REPLACE FUNCTION public.self_assign_recruiter_role(
  _company_name TEXT,
  _company_website TEXT DEFAULT NULL
)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid UUID := auth.uid();
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = uid) THEN
    RAISE EXCEPTION 'Role already assigned';
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (uid, 'recruiter');
  INSERT INTO public.recruiters (user_id, company_name, company_website)
  VALUES (uid, _company_name, _company_website);
END;
$$;
REVOKE EXECUTE ON FUNCTION public.self_assign_recruiter_role(TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.self_assign_recruiter_role(TEXT, TEXT) TO authenticated;

-- Anonymized survivor directory view
CREATE OR REPLACE VIEW public.survivor_directory
WITH (security_invoker = false) AS
SELECT
  s.id,
  s.anonymous_id,
  s.languages,
  s.location_country,
  s.location_region,
  s.skills,
  s.availability,
  (
    SELECT COALESCE(jsonb_agg(jsonb_build_object('name', c->>'name', 'issuer', c->>'issuer', 'year', c->>'year')), '[]'::jsonb)
    FROM jsonb_array_elements(COALESCE(s.certifications, '[]'::jsonb)) c
  ) AS certifications,
  (
    SELECT COALESCE(jsonb_agg(jsonb_build_object(
      'role', w->>'role',
      'start', w->>'start',
      'end', w->>'end'
    )), '[]'::jsonb)
    FROM jsonb_array_elements(COALESCE(s.work_history, '[]'::jsonb)) w
  ) AS work_history,
  (
    SELECT COALESCE(jsonb_agg(jsonb_build_object(
      'level', e->>'level',
      'field', e->>'field',
      'year', e->>'year'
    )), '[]'::jsonb)
    FROM jsonb_array_elements(COALESCE(s.education, '[]'::jsonb)) e
  ) AS education,
  left(COALESCE(s.bio, ''), 240) AS bio_excerpt,
  s.searchable
FROM public.survivors s
WHERE s.searchable = true;

GRANT SELECT ON public.survivor_directory TO authenticated;

-- Introduction requests
CREATE TABLE IF NOT EXISTS public.introduction_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID NOT NULL REFERENCES public.recruiters(id) ON DELETE CASCADE,
  survivor_id UUID NOT NULL REFERENCES public.survivors(id) ON DELETE CASCADE,
  ngo_id UUID NOT NULL REFERENCES public.ngos(id) ON DELETE CASCADE,
  job_id UUID,
  message TEXT NOT NULL,
  status public.intro_request_status NOT NULL DEFAULT 'pending',
  response_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  responded_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS intro_requests_ngo_id_idx ON public.introduction_requests(ngo_id);
CREATE INDEX IF NOT EXISTS intro_requests_recruiter_id_idx ON public.introduction_requests(recruiter_id);

GRANT SELECT, INSERT, UPDATE ON public.introduction_requests TO authenticated;
GRANT ALL ON public.introduction_requests TO service_role;
ALTER TABLE public.introduction_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "recruiters manage own intro requests" ON public.introduction_requests;
CREATE POLICY "recruiters manage own intro requests" ON public.introduction_requests FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.recruiters r WHERE r.id = recruiter_id AND r.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.recruiters r WHERE r.id = recruiter_id AND r.user_id = auth.uid()));
DROP POLICY IF EXISTS "ngo read intro requests" ON public.introduction_requests;
CREATE POLICY "ngo read intro requests" ON public.introduction_requests FOR SELECT TO authenticated
  USING (public.owns_approved_ngo(auth.uid(), ngo_id));
DROP POLICY IF EXISTS "ngo respond intro requests" ON public.introduction_requests;
CREATE POLICY "ngo respond intro requests" ON public.introduction_requests FOR UPDATE TO authenticated
  USING (public.owns_approved_ngo(auth.uid(), ngo_id));
DROP POLICY IF EXISTS "admins read all intro requests" ON public.introduction_requests;
CREATE POLICY "admins read all intro requests" ON public.introduction_requests FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

-- ===== PHASE 6: Jobs =====
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID NOT NULL REFERENCES public.recruiters(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  required_skills TEXT[] DEFAULT '{}',
  preferred_skills TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{}',
  location_country TEXT,
  location_region TEXT,
  remote_ok BOOLEAN NOT NULL DEFAULT false,
  employment_type public.employment_type NOT NULL DEFAULT 'full_time',
  salary_min INTEGER,
  salary_max INTEGER,
  currency TEXT DEFAULT 'INR',
  status public.job_status NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  closes_at TIMESTAMPTZ,
  embedding extensions.vector(768),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS jobs_status_idx ON public.jobs(status);
CREATE INDEX IF NOT EXISTS jobs_recruiter_id_idx ON public.jobs(recruiter_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.jobs TO authenticated;
GRANT ALL ON public.jobs TO service_role;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "recruiters manage own jobs" ON public.jobs;
CREATE POLICY "recruiters manage own jobs" ON public.jobs FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.recruiters r WHERE r.id = recruiter_id AND r.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.recruiters r WHERE r.id = recruiter_id AND r.user_id = auth.uid()));
DROP POLICY IF EXISTS "authenticated read published jobs" ON public.jobs;
CREATE POLICY "authenticated read published jobs" ON public.jobs FOR SELECT TO authenticated
  USING (status = 'published');
DROP POLICY IF EXISTS "admins read all jobs" ON public.jobs;
CREATE POLICY "admins read all jobs" ON public.jobs FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

DROP TRIGGER IF EXISTS jobs_updated_at ON public.jobs;
CREATE TRIGGER jobs_updated_at BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- FK for intro requests -> jobs (deferred because jobs created after)
DO $$ BEGIN
  ALTER TABLE public.introduction_requests
    ADD CONSTRAINT introduction_requests_job_id_fkey
    FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  survivor_id UUID NOT NULL REFERENCES public.survivors(id) ON DELETE CASCADE,
  ngo_id UUID NOT NULL REFERENCES public.ngos(id) ON DELETE CASCADE,
  cover_note TEXT,
  status public.application_status NOT NULL DEFAULT 'submitted',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (job_id, survivor_id)
);
CREATE INDEX IF NOT EXISTS job_applications_job_id_idx ON public.job_applications(job_id);
CREATE INDEX IF NOT EXISTS job_applications_ngo_id_idx ON public.job_applications(ngo_id);

GRANT SELECT, INSERT, UPDATE ON public.job_applications TO authenticated;
GRANT ALL ON public.job_applications TO service_role;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ngo manage applications" ON public.job_applications;
CREATE POLICY "ngo manage applications" ON public.job_applications FOR ALL TO authenticated
  USING (public.owns_approved_ngo(auth.uid(), ngo_id))
  WITH CHECK (public.owns_approved_ngo(auth.uid(), ngo_id));
DROP POLICY IF EXISTS "recruiters read job applications" ON public.job_applications;
CREATE POLICY "recruiters read job applications" ON public.job_applications FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.jobs j JOIN public.recruiters r ON r.id = j.recruiter_id
    WHERE j.id = job_id AND r.user_id = auth.uid()
  ));
DROP POLICY IF EXISTS "recruiters update application status" ON public.job_applications;
CREATE POLICY "recruiters update application status" ON public.job_applications FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.jobs j JOIN public.recruiters r ON r.id = j.recruiter_id
    WHERE j.id = job_id AND r.user_id = auth.uid()
  ));
DROP POLICY IF EXISTS "admins read all applications" ON public.job_applications;
CREATE POLICY "admins read all applications" ON public.job_applications FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

DROP TRIGGER IF EXISTS job_applications_updated_at ON public.job_applications;
CREATE TRIGGER job_applications_updated_at BEFORE UPDATE ON public.job_applications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ===== PHASE 5: Match scores =====
CREATE TABLE IF NOT EXISTS public.match_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survivor_id UUID NOT NULL REFERENCES public.survivors(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  score NUMERIC(5,4) NOT NULL,
  breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
  summary TEXT,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (survivor_id, job_id)
);
CREATE INDEX IF NOT EXISTS match_scores_job_id_idx ON public.match_scores(job_id);
CREATE INDEX IF NOT EXISTS match_scores_survivor_id_idx ON public.match_scores(survivor_id);

GRANT SELECT ON public.match_scores TO authenticated;
GRANT ALL ON public.match_scores TO service_role;
ALTER TABLE public.match_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "recruiters read match scores for own jobs" ON public.match_scores;
CREATE POLICY "recruiters read match scores for own jobs" ON public.match_scores FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.jobs j JOIN public.recruiters r ON r.id = j.recruiter_id
    WHERE j.id = job_id AND r.user_id = auth.uid()
  ));
DROP POLICY IF EXISTS "ngo read match scores for own survivors" ON public.match_scores;
CREATE POLICY "ngo read match scores for own survivors" ON public.match_scores FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.survivors s
    WHERE s.id = survivor_id AND public.owns_approved_ngo(auth.uid(), s.ngo_id)
  ));
DROP POLICY IF EXISTS "admins read all match scores" ON public.match_scores;
CREATE POLICY "admins read all match scores" ON public.match_scores FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

-- ===== PHASE 8: Notifications =====
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind public.notification_kind NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_unread_idx ON public.notifications(user_id) WHERE read_at IS NULL;

GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users read own notifications" ON public.notifications;
CREATE POLICY "users read own notifications" ON public.notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid());
DROP POLICY IF EXISTS "users mark own notifications read" ON public.notifications;
CREATE POLICY "users mark own notifications read" ON public.notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind public.notification_kind NOT NULL,
  in_app BOOLEAN NOT NULL DEFAULT true,
  email BOOLEAN NOT NULL DEFAULT true,
  UNIQUE (user_id, kind)
);
GRANT SELECT, INSERT, UPDATE ON public.notification_preferences TO authenticated;
GRANT ALL ON public.notification_preferences TO service_role;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users manage own notification prefs" ON public.notification_preferences;
CREATE POLICY "users manage own notification prefs" ON public.notification_preferences FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Rate limiting table
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL DEFAULT date_trunc('minute', now()),
  count INTEGER NOT NULL DEFAULT 1,
  UNIQUE (user_id, action, window_start)
);
GRANT ALL ON public.rate_limits TO service_role;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.check_rate_limit(_user_id UUID, _action TEXT, _max INTEGER DEFAULT 30)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  ws TIMESTAMPTZ := date_trunc('minute', now());
  cnt INTEGER;
BEGIN
  INSERT INTO public.rate_limits (user_id, action, window_start, count)
  VALUES (_user_id, _action, ws, 1)
  ON CONFLICT (user_id, action, window_start)
  DO UPDATE SET count = rate_limits.count + 1
  RETURNING count INTO cnt;
  RETURN cnt <= _max;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.check_rate_limit(UUID, TEXT, INTEGER) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(UUID, TEXT, INTEGER) TO authenticated;

-- Enable realtime for notifications
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- #############################################################################
-- ##### 2. 20260802000000_resume_and_chat_updates.sql
-- #############################################################################

-- Migration: Resume Upload, AI Resume Builder, and RLS Updates

-- 1. Modify survivors table columns to allow NULL ngo_id (for self-onboarded survivors)
ALTER TABLE public.survivors ALTER COLUMN ngo_id DROP NOT NULL;

ALTER TABLE public.survivors ADD COLUMN IF NOT EXISTS resume_url TEXT;
ALTER TABLE public.survivors ADD COLUMN IF NOT EXISTS resume_name TEXT;
ALTER TABLE public.survivors ADD COLUMN IF NOT EXISTS resume_uploaded_at TIMESTAMPTZ;
ALTER TABLE public.survivors ADD COLUMN IF NOT EXISTS uploaded_at TIMESTAMPTZ;
ALTER TABLE public.survivors ADD COLUMN IF NOT EXISTS resume_builder_data JSONB DEFAULT '{}'::jsonb;

-- 2. Enable insert policy for survivors to register themselves
DROP POLICY IF EXISTS "survivors insert own profile" ON public.survivors;
CREATE POLICY "survivors insert own profile" ON public.survivors
  FOR INSERT TO authenticated
  WITH CHECK (linked_user_id = auth.uid());

-- 3. Create resumes storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('resumes', 'resumes', false, 10485760)
ON CONFLICT (id) DO NOTHING;

-- 4. Enable RLS on storage.objects for the resumes bucket
DROP POLICY IF EXISTS "users manage own resumes" ON storage.objects;
CREATE POLICY "users manage own resumes" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'resumes' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'resumes' AND (storage.foldername(name))[1] = auth.uid()::text);


-- #############################################################################
-- ##### 3. 20260828010000_schema_gap_fill.sql
-- #############################################################################

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


-- #############################################################################
-- ##### 4. 20261001000000_admin_live_users_audit.sql
-- #############################################################################

-- =============================================================================
-- CAREVIA — live User Management + Audit Logs for the admin portal
--
-- * Every signup, sign-in, failed sign-in, role assignment, and status change
--   on NGOs / survivors / recruiters / jobs / applications / documents /
--   intro requests is written to audit_logs automatically by triggers.
-- * Admin RPCs to list users, suspend/reactivate, and delete accounts.
-- * Realtime enabled on profiles, user_roles, audit_logs so the admin pages
--   update live.
--
-- Additive and safe to re-run. Run in: Dashboard → SQL Editor → New query.
-- =============================================================================

-- ===== PROFILES: email + account status =====
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS account_status TEXT NOT NULL DEFAULT 'active';

DO $$ BEGIN
  ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_account_status_check CHECK (account_status IN ('active', 'suspended'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Every existing auth user gets a profile row, with email filled in
INSERT INTO public.profiles (id, full_name, email)
SELECT u.id, COALESCE(u.raw_user_meta_data->>'full_name', u.email), u.email
FROM auth.users u
ON CONFLICT (id) DO NOTHING;

UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND p.email IS DISTINCT FROM u.email;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.sync_profile_email()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.profiles SET email = NEW.email WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_email_changed ON auth.users;
CREATE TRIGGER on_auth_user_email_changed
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW WHEN (NEW.email IS DISTINCT FROM OLD.email)
  EXECUTE FUNCTION public.sync_profile_email();

DROP POLICY IF EXISTS "admins read all profiles" ON public.profiles;
CREATE POLICY "admins read all profiles" ON public.profiles FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

-- ===== AUDIT LOGS: extra columns =====
ALTER TABLE public.audit_logs
  ADD COLUMN IF NOT EXISTS target_label TEXT,
  ADD COLUMN IF NOT EXISTS actor_label TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'success';

DO $$ BEGIN
  ALTER TABLE public.audit_logs
    ADD CONSTRAINT audit_logs_status_check CHECK (status IN ('success', 'failed'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON public.audit_logs(created_at DESC);

-- Logs are written only by the triggers/RPCs below, so users can't forge entries
DROP POLICY IF EXISTS "authenticated insert audit logs" ON public.audit_logs;

-- Snapshot the actor's name so the log stays readable after the account is deleted
CREATE OR REPLACE FUNCTION public.audit_fill_actor_label()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.actor_label IS NULL AND NEW.actor_id IS NOT NULL THEN
    SELECT COALESCE(p.full_name, p.email) INTO NEW.actor_label
    FROM public.profiles p WHERE p.id = NEW.actor_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS audit_logs_fill_actor_label ON public.audit_logs;
CREATE TRIGGER audit_logs_fill_actor_label
  BEFORE INSERT ON public.audit_logs
  FOR EACH ROW EXECUTE FUNCTION public.audit_fill_actor_label();

-- ===== FOREIGN KEYS: let a user be deleted without losing history =====
ALTER TABLE public.audit_logs
  DROP CONSTRAINT IF EXISTS audit_logs_actor_id_fkey,
  ADD CONSTRAINT audit_logs_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.ngos
  DROP CONSTRAINT IF EXISTS ngos_approved_by_fkey,
  ADD CONSTRAINT ngos_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.recruiters
  DROP CONSTRAINT IF EXISTS recruiters_verified_by_fkey,
  ADD CONSTRAINT recruiters_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.survivors
  DROP CONSTRAINT IF EXISTS survivors_updated_by_fkey,
  ADD CONSTRAINT survivors_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id) ON DELETE SET NULL,
  DROP CONSTRAINT IF EXISTS survivors_linked_user_id_fkey,
  ADD CONSTRAINT survivors_linked_user_id_fkey FOREIGN KEY (linked_user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_id_fkey,
  ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.user_roles
  DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey,
  ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.mentor_threads
  DROP CONSTRAINT IF EXISTS mentor_threads_user_id_fkey,
  ADD CONSTRAINT mentor_threads_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.notifications
  DROP CONSTRAINT IF EXISTS notifications_user_id_fkey,
  ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.notification_preferences
  DROP CONSTRAINT IF EXISTS notification_preferences_user_id_fkey,
  ADD CONSTRAINT notification_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.rate_limits
  DROP CONSTRAINT IF EXISTS rate_limits_user_id_fkey,
  ADD CONSTRAINT rate_limits_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- ===== AUTH EVENTS: signup + sign-in =====
CREATE OR REPLACE FUNCTION public.audit_auth_user_event()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  BEGIN
    INSERT INTO public.audit_logs (actor_id, actor_label, action, entity_type, entity_id, target_label)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
      CASE WHEN TG_OP = 'INSERT' THEN 'user.signed_up' ELSE 'user.signed_in' END,
      'auth', NEW.id, NEW.email
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'audit_auth_user_event failed: %', SQLERRM;
  END;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_audit_signup ON auth.users;
CREATE TRIGGER on_auth_user_audit_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.audit_auth_user_event();

DROP TRIGGER IF EXISTS on_auth_user_audit_signin ON auth.users;
CREATE TRIGGER on_auth_user_audit_signin
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW WHEN (NEW.last_sign_in_at IS DISTINCT FROM OLD.last_sign_in_at)
  EXECUTE FUNCTION public.audit_auth_user_event();

-- Failed sign-ins: called by the login page (Postgres never sees a failed
-- password check). Only logs for real accounts and is throttled so it can't
-- be used to flood the log.
CREATE OR REPLACE FUNCTION public.log_failed_login(_email TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_email TEXT := lower(trim(_email));
  v_uid UUID;
BEGIN
  SELECT id INTO v_uid FROM auth.users WHERE lower(email) = v_email;
  IF v_uid IS NULL THEN RETURN; END IF;

  IF (SELECT count(*) FROM public.audit_logs
      WHERE action = 'user.login_failed' AND entity_id = v_uid
        AND created_at > now() - interval '15 minutes') >= 5 THEN
    RETURN;
  END IF;

  INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, target_label, status)
  VALUES (v_uid, 'user.login_failed', 'auth', v_uid, 'Invalid password', 'failed');
END;
$$;
REVOKE EXECUTE ON FUNCTION public.log_failed_login(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.log_failed_login(TEXT) TO anon, authenticated;

-- ===== ROLE EVENTS =====
CREATE OR REPLACE FUNCTION public.audit_user_role_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  r public.user_roles;
BEGIN
  IF TG_OP = 'DELETE' THEN r := OLD; ELSE r := NEW; END IF;
  BEGIN
    INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, target_label, metadata)
    VALUES (
      auth.uid(),
      CASE WHEN TG_OP = 'DELETE' THEN 'role.removed' ELSE 'role.assigned' END,
      'user', r.user_id,
      (SELECT email FROM auth.users WHERE id = r.user_id),
      jsonb_build_object('role', r.role)
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'audit_user_role_change failed: %', SQLERRM;
  END;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS user_roles_audit ON public.user_roles;
CREATE TRIGGER user_roles_audit
  AFTER INSERT OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.audit_user_role_change();

-- ===== DOMAIN EVENTS: create / status change / delete on core tables =====
CREATE OR REPLACE FUNCTION public.audit_row_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  entity TEXT := TG_ARGV[0];
  rec JSONB;
  old_status TEXT;
  new_status TEXT;
  act TEXT;
  meta JSONB := '{}'::jsonb;
BEGIN
  rec := CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE to_jsonb(NEW) END;
  new_status := COALESCE(rec->>'status', rec->>'verification_status');

  IF TG_OP = 'INSERT' THEN
    act := entity || '.created';
    IF new_status IS NOT NULL THEN meta := jsonb_build_object('to', new_status); END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    old_status := COALESCE(to_jsonb(OLD)->>'status', to_jsonb(OLD)->>'verification_status');
    IF old_status IS NOT DISTINCT FROM new_status THEN RETURN NULL; END IF;
    act := entity || '.status_changed';
    meta := jsonb_build_object('from', old_status, 'to', new_status);
  ELSE
    act := entity || '.deleted';
  END IF;

  BEGIN
    INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, target_label, metadata)
    VALUES (
      auth.uid(), act, entity, (rec->>'id')::uuid,
      -- survivors are labelled by anonymous id, never by name
      COALESCE(rec->>'anonymous_id', rec->>'name', rec->>'title', rec->>'company_name', rec->>'file_name'),
      meta
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'audit_row_change failed: %', SQLERRM;
  END;
  RETURN NULL;
END;
$$;

DO $$
DECLARE
  t RECORD;
BEGIN
  FOR t IN SELECT * FROM (VALUES
    ('ngos', 'ngo'),
    ('survivors', 'survivor'),
    ('recruiters', 'recruiter'),
    ('jobs', 'job'),
    ('job_applications', 'job_application'),
    ('survivor_documents', 'document'),
    ('introduction_requests', 'intro_request'),
    ('interviews', 'interview')
  ) AS v(tbl, entity)
  LOOP
    IF to_regclass('public.' || t.tbl) IS NOT NULL THEN
      EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.%I', t.tbl || '_audit', t.tbl);
      EXECUTE format(
        'CREATE TRIGGER %I AFTER INSERT OR UPDATE OR DELETE ON public.%I
           FOR EACH ROW EXECUTE FUNCTION public.audit_row_change(%L)',
        t.tbl || '_audit', t.tbl, t.entity
      );
    END IF;
  END LOOP;
END $$;

-- ===== ADMIN RPCs =====
CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  email TEXT,
  roles TEXT[],
  account_status TEXT,
  created_at TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
#variable_conflict use_column
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Admin access required' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT
    u.id,
    COALESCE(p.full_name, u.raw_user_meta_data->>'full_name', u.email)::TEXT,
    u.email::TEXT,
    COALESCE(array_agg(r.role::TEXT ORDER BY r.role::TEXT) FILTER (WHERE r.role IS NOT NULL), '{}')::TEXT[],
    COALESCE(p.account_status, 'active')::TEXT,
    u.created_at,
    u.last_sign_in_at
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.id = u.id
  LEFT JOIN public.user_roles r ON r.user_id = u.id
  GROUP BY u.id, p.full_name, p.account_status
  ORDER BY u.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_set_user_status(_user_id UUID, _status TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_email TEXT;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Admin access required' USING ERRCODE = '42501';
  END IF;
  IF _status NOT IN ('active', 'suspended') THEN
    RAISE EXCEPTION 'Invalid status: %', _status;
  END IF;
  IF _user_id = auth.uid() THEN
    RAISE EXCEPTION 'You cannot change the status of your own account';
  END IF;

  SELECT email INTO v_email FROM auth.users WHERE id = _user_id;
  IF v_email IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  INSERT INTO public.profiles (id, full_name, email, account_status)
  VALUES (_user_id, v_email, v_email, _status)
  ON CONFLICT (id) DO UPDATE SET account_status = EXCLUDED.account_status;

  -- Ban at the auth layer so the account can't sign in, and end live sessions
  UPDATE auth.users
  SET banned_until = CASE WHEN _status = 'suspended' THEN now() + interval '100 years' ELSE NULL END
  WHERE id = _user_id;
  IF _status = 'suspended' THEN
    DELETE FROM auth.sessions WHERE user_id = _user_id;
  END IF;

  INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, target_label)
  VALUES (
    auth.uid(),
    CASE WHEN _status = 'suspended' THEN 'user.suspended' ELSE 'user.reactivated' END,
    'user', _user_id, v_email
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_delete_user(_user_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_email TEXT;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Admin access required' USING ERRCODE = '42501';
  END IF;
  IF _user_id = auth.uid() THEN
    RAISE EXCEPTION 'You cannot delete your own account';
  END IF;

  SELECT email INTO v_email FROM auth.users WHERE id = _user_id;
  IF v_email IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Deleting an NGO owner would cascade away every survivor record the NGO holds
  IF EXISTS (SELECT 1 FROM public.ngos WHERE owner_id = _user_id) THEN
    RAISE EXCEPTION 'This user owns an NGO with survivor records. Suspend the account instead of deleting it.';
  END IF;

  BEGIN
    DELETE FROM auth.users WHERE id = _user_id;
  EXCEPTION WHEN foreign_key_violation THEN
    RAISE EXCEPTION 'This user still owns records (for example survivor profiles or documents they created). Suspend the account instead of deleting it.';
  END;

  INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, target_label)
  VALUES (auth.uid(), 'user.deleted', 'user', _user_id, v_email);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_list_audit_logs(_limit INTEGER DEFAULT 500)
RETURNS TABLE (
  id UUID,
  created_at TIMESTAMPTZ,
  action TEXT,
  entity_type TEXT,
  entity_id UUID,
  target_label TEXT,
  metadata JSONB,
  status TEXT,
  actor_id UUID,
  actor_name TEXT,
  actor_email TEXT
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
#variable_conflict use_column
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Admin access required' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT
    l.id, l.created_at, l.action, l.entity_type, l.entity_id, l.target_label,
    COALESCE(l.metadata, '{}'::jsonb), l.status, l.actor_id,
    COALESCE(p.full_name, l.actor_label, CASE WHEN l.actor_id IS NULL THEN 'System' ELSE 'Deleted user' END)::TEXT,
    p.email
  FROM public.audit_logs l
  LEFT JOIN public.profiles p ON p.id = l.actor_id
  ORDER BY l.created_at DESC
  LIMIT LEAST(GREATEST(_limit, 1), 2000);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_list_users() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_set_user_status(UUID, TEXT) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_delete_user(UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_list_audit_logs(INTEGER) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_users() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_user_status(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_audit_logs(INTEGER) TO authenticated;

-- Trigger-only functions shouldn't be callable over the API
REVOKE EXECUTE ON FUNCTION public.audit_row_change() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.audit_user_role_change() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.audit_auth_user_event() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.audit_fill_actor_label() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_profile_email() FROM PUBLIC, anon, authenticated;

-- ===== REALTIME =====
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['audit_logs', 'profiles', 'user_roles'] LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = t
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    END IF;
  END LOOP;
END $$;


-- #############################################################################
-- ##### 5. 20261001010000_jobs_applications_live.sql
-- #############################################################################

-- =============================================================================
-- CAREVIA â€” live jobs, applications, shortlist, interviews, survivor documents
--
-- * Role chosen at signup is assigned automatically (no second role prompt)
-- * Survivors who sign up themselves get their own survivor record
-- * Recruiters post jobs; survivors browse + apply; recruiters review,
--   shortlist and schedule interviews; survivors see status + interview live
-- * Survivors upload real documents to the private storage bucket
--
-- Run AFTER 20261001000000_admin_live_users_audit.sql.
-- Additive and safe to re-run. Dashboard â†’ SQL Editor â†’ New query â†’ Run.
-- =============================================================================

-- ===== CONSTRAINTS the RPCs below rely on =====
DELETE FROM public.user_roles a USING public.user_roles b
WHERE a.user_id = b.user_id AND a.role = b.role AND a.ctid > b.ctid;
CREATE UNIQUE INDEX IF NOT EXISTS user_roles_user_id_role_key ON public.user_roles(user_id, role);

DELETE FROM public.job_applications a USING public.job_applications b
WHERE a.job_id = b.job_id AND a.survivor_id = b.survivor_id AND a.ctid > b.ctid;
CREATE UNIQUE INDEX IF NOT EXISTS job_applications_job_id_survivor_id_key ON public.job_applications(job_id, survivor_id);

-- Self-registered survivors aren't attached to an NGO
ALTER TABLE public.survivors ALTER COLUMN ngo_id DROP NOT NULL;
ALTER TABLE public.job_applications ALTER COLUMN ngo_id DROP NOT NULL;
ALTER TABLE public.introduction_requests ALTER COLUMN ngo_id DROP NOT NULL;

ALTER TABLE public.survivors ADD COLUMN IF NOT EXISTS total_experience TEXT;
CREATE INDEX IF NOT EXISTS survivors_linked_user_id_idx ON public.survivors(linked_user_id);

ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS status_note TEXT;
ALTER TYPE public.application_status ADD VALUE IF NOT EXISTS 'interview_scheduled';
ALTER TYPE public.application_status ADD VALUE IF NOT EXISTS 'offered';

-- ===== SAVED CANDIDATES (shortlist) =====
CREATE TABLE IF NOT EXISTS public.saved_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID NOT NULL REFERENCES public.recruiters(id) ON DELETE CASCADE,
  survivor_id UUID NOT NULL REFERENCES public.survivors(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (recruiter_id, survivor_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_candidates TO authenticated;
GRANT ALL ON public.saved_candidates TO service_role;
ALTER TABLE public.saved_candidates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "recruiters manage own saved candidates" ON public.saved_candidates;
CREATE POLICY "recruiters manage own saved candidates" ON public.saved_candidates FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.recruiters r WHERE r.id = recruiter_id AND r.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.recruiters r WHERE r.id = recruiter_id AND r.user_id = auth.uid()));

-- ===== INTERVIEWS =====
DO $$ BEGIN
  CREATE TYPE public.interview_status AS ENUM ('scheduled', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID NOT NULL REFERENCES public.recruiters(id) ON DELETE CASCADE,
  survivor_id UUID NOT NULL REFERENCES public.survivors(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  interview_type TEXT NOT NULL DEFAULT 'virtual',
  video_link TEXT,
  status public.interview_status NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.interviews
  ADD COLUMN IF NOT EXISTS application_id UUID REFERENCES public.job_applications(id) ON DELETE SET NULL;
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
DROP POLICY IF EXISTS "admins read all interviews" ON public.interviews;
CREATE POLICY "admins read all interviews" ON public.interviews FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

DROP TRIGGER IF EXISTS interviews_updated_at ON public.interviews;
CREATE TRIGGER interviews_updated_at BEFORE UPDATE ON public.interviews
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS interviews_audit ON public.interviews;
CREATE TRIGGER interviews_audit AFTER INSERT OR UPDATE OR DELETE ON public.interviews
  FOR EACH ROW EXECUTE FUNCTION public.audit_row_change('interview');

-- Survivors can see their own applications (and get realtime updates on them)
DROP POLICY IF EXISTS "survivors read own applications" ON public.job_applications;
CREATE POLICY "survivors read own applications" ON public.job_applications FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.survivors s WHERE s.id = survivor_id AND s.linked_user_id = auth.uid()));

-- ===== HELPERS =====
CREATE OR REPLACE FUNCTION public.jsonb_text_array(j JSONB)
RETURNS TEXT[] LANGUAGE sql IMMUTABLE AS $$
  SELECT COALESCE(
    ARRAY(
      SELECT trim(x) FROM jsonb_array_elements_text(CASE WHEN jsonb_typeof(j) = 'array' THEN j ELSE '[]'::jsonb END) x
      WHERE trim(x) <> ''
    ),
    '{}'::TEXT[]
  )
$$;

-- Recruiters see "First L." â€” never a full name, never an email
CREATE OR REPLACE FUNCTION public.survivor_display_name(_name TEXT, _anon TEXT)
RETURNS TEXT LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE
    WHEN COALESCE(trim(_name), '') = '' OR _name LIKE '%@%' THEN 'Candidate ' || _anon
    WHEN split_part(trim(_name), ' ', 2) = '' THEN split_part(trim(_name), ' ', 1)
    ELSE split_part(trim(_name), ' ', 1) || ' ' || upper(left(split_part(trim(_name), ' ', 2), 1)) || '.'
  END
$$;

CREATE OR REPLACE FUNCTION public.ensure_survivor_for_user(_uid UUID)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_id UUID;
BEGIN
  SELECT id INTO v_id FROM public.survivors WHERE linked_user_id = _uid ORDER BY created_at LIMIT 1;
  IF v_id IS NULL THEN
    INSERT INTO public.survivors (ngo_id, created_by, linked_user_id, full_name, email, status)
    SELECT NULL, u.id, u.id, COALESCE(NULLIF(trim(u.raw_user_meta_data->>'full_name'), ''), ''), u.email, 'submitted'
    FROM auth.users u WHERE u.id = _uid
    RETURNING id INTO v_id;
  END IF;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.ensure_recruiter_for_user(_uid UUID)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_id UUID;
BEGIN
  SELECT id INTO v_id FROM public.recruiters WHERE user_id = _uid;
  IF v_id IS NULL THEN
    INSERT INTO public.recruiters (user_id, company_name, company_website)
    SELECT u.id,
           COALESCE(NULLIF(trim(u.raw_user_meta_data->>'company_name'), ''), 'My Company'),
           NULLIF(trim(u.raw_user_meta_data->>'company_website'), '')
    FROM auth.users u WHERE u.id = _uid
    ON CONFLICT (user_id) DO NOTHING
    RETURNING id INTO v_id;
    IF v_id IS NULL THEN
      SELECT id INTO v_id FROM public.recruiters WHERE user_id = _uid;
    END IF;
  END IF;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.my_survivor_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id FROM public.survivors WHERE linked_user_id = auth.uid() ORDER BY created_at LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.require_role(_role public.app_role)
RETURNS VOID LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not signed in' USING ERRCODE = '42501';
  END IF;
  IF NOT public.has_role(auth.uid(), _role) THEN
    RAISE EXCEPTION 'This action needs the % role', _role USING ERRCODE = '42501';
  END IF;
END;
$$;

-- A survivor is visible to a recruiter if they opted in to recruiter search,
-- or if they applied to one of that recruiter's jobs.
CREATE OR REPLACE FUNCTION public.survivor_visible_to_recruiter(_survivor_id UUID, _recruiter_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.survivors s WHERE s.id = _survivor_id AND s.consent_share_with_recruiters)
      OR EXISTS (
        SELECT 1 FROM public.job_applications a JOIN public.jobs j ON j.id = a.job_id
        WHERE a.survivor_id = _survivor_id AND j.recruiter_id = _recruiter_id
      )
$$;

-- ===== ROLE CHOSEN AT SIGNUP =====
CREATE OR REPLACE FUNCTION public.assign_signup_role()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  r TEXT := NEW.raw_user_meta_data->>'signup_role';
BEGIN
  IF r IN ('survivor', 'ngo_partner', 'recruiter') THEN
    BEGIN
      INSERT INTO public.user_roles (user_id, role)
      SELECT NEW.id, r::public.app_role
      WHERE NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = NEW.id);
      IF r = 'recruiter' THEN
        PERFORM public.ensure_recruiter_for_user(NEW.id);
      END IF;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'assign_signup_role failed: %', SQLERRM;
    END;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_signup_role ON auth.users;
CREATE TRIGGER on_auth_user_signup_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.assign_signup_role();

-- Every survivor-role account gets a survivor record (however the role was assigned)
CREATE OR REPLACE FUNCTION public.on_survivor_role_assigned()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  BEGIN
    PERFORM public.ensure_survivor_for_user(NEW.user_id);
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'on_survivor_role_assigned failed: %', SQLERRM;
  END;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS user_roles_survivor_record ON public.user_roles;
CREATE TRIGGER user_roles_survivor_record
  AFTER INSERT ON public.user_roles
  FOR EACH ROW WHEN (NEW.role = 'survivor')
  EXECUTE FUNCTION public.on_survivor_role_assigned();

-- Backfill: existing accounts
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, (u.raw_user_meta_data->>'signup_role')::public.app_role
FROM auth.users u
WHERE u.raw_user_meta_data->>'signup_role' IN ('survivor', 'ngo_partner', 'recruiter')
  AND NOT EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = u.id);

SELECT public.ensure_survivor_for_user(r.user_id) FROM public.user_roles r WHERE r.role = 'survivor';
SELECT public.ensure_recruiter_for_user(r.user_id) FROM public.user_roles r WHERE r.role = 'recruiter';

-- ===== SURVIVOR: own profile =====
CREATE OR REPLACE FUNCTION public.get_my_survivor()
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_id UUID;
BEGIN
  PERFORM public.require_role('survivor');
  v_id := public.ensure_survivor_for_user(auth.uid());
  RETURN (SELECT to_jsonb(s) - 'embedding' FROM public.survivors s WHERE s.id = v_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.save_my_survivor_profile(_p JSONB)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_id UUID;
  v_consent BOOLEAN := COALESCE((_p->>'consent_share_with_recruiters')::BOOLEAN, false);
BEGIN
  PERFORM public.require_role('survivor');
  v_id := public.ensure_survivor_for_user(auth.uid());

  UPDATE public.survivors SET
    full_name = COALESCE(trim(_p->>'full_name'), ''),
    age = CASE WHEN (_p->>'age') ~ '^\d{1,3}$' THEN (_p->>'age')::INTEGER ELSE NULL END,
    phone = NULLIF(trim(_p->>'phone'), ''),
    city = NULLIF(trim(_p->>'city'), ''),
    state = NULLIF(trim(_p->>'state'), ''),
    location_region = NULLIF(trim(_p->>'state'), ''),
    location_country = COALESCE(NULLIF(trim(_p->>'country'), ''), 'India'),
    languages = public.jsonb_text_array(_p->'languages'),
    skills = public.jsonb_text_array(_p->'skills'),
    preferred_roles = public.jsonb_text_array(_p->'preferred_roles'),
    education_level = NULLIF(trim(_p->>'education_level'), ''),
    certifications = CASE WHEN jsonb_typeof(_p->'certifications') = 'array' THEN _p->'certifications' ELSE '[]'::jsonb END,
    work_history = CASE WHEN jsonb_typeof(_p->'work_history') = 'array' THEN _p->'work_history' ELSE '[]'::jsonb END,
    total_experience = NULLIF(trim(_p->>'total_experience'), ''),
    bio = NULLIF(trim(_p->>'bio'), ''),
    availability = NULLIF(trim(_p->>'availability'), ''),
    accommodation_needs = NULLIF(trim(_p->>'accommodation_needs'), ''),
    consent_share_changed_at = CASE WHEN consent_share_with_recruiters IS DISTINCT FROM v_consent THEN now() ELSE consent_share_changed_at END,
    consent_share_with_recruiters = v_consent,
    updated_by = auth.uid()
  WHERE id = v_id;

  RETURN (SELECT to_jsonb(s) - 'embedding' FROM public.survivors s WHERE s.id = v_id);
END;
$$;

-- ===== RECRUITER: own record =====
CREATE OR REPLACE FUNCTION public.get_my_recruiter()
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_id UUID;
BEGIN
  PERFORM public.require_role('recruiter');
  v_id := public.ensure_recruiter_for_user(auth.uid());
  RETURN (SELECT to_jsonb(r) FROM public.recruiters r WHERE r.id = v_id);
END;
$$;

-- ===== RECRUITER: talent search =====
CREATE OR REPLACE FUNCTION public.search_survivors(_query TEXT DEFAULT NULL, _location TEXT DEFAULT NULL)
RETURNS TABLE (
  id UUID, anonymous_id TEXT, display_name TEXT, age INTEGER, city TEXT, state TEXT,
  skills TEXT[], languages TEXT[], preferred_roles TEXT[], education_level TEXT,
  total_experience TEXT, bio TEXT, work_history JSONB, certifications JSONB,
  profile_completion INTEGER, is_saved BOOLEAN, updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
#variable_conflict use_column
DECLARE
  v_rid UUID;
  q TEXT := NULLIF(trim(_query), '');
  loc TEXT := NULLIF(trim(_location), '');
BEGIN
  PERFORM public.require_role('recruiter');
  v_rid := public.ensure_recruiter_for_user(auth.uid());

  RETURN QUERY
  SELECT s.id, s.anonymous_id, public.survivor_display_name(s.full_name, s.anonymous_id), s.age, s.city, s.state,
         COALESCE(s.skills, '{}'), COALESCE(s.languages, '{}'), COALESCE(s.preferred_roles, '{}'), s.education_level,
         s.total_experience, s.bio, COALESCE(s.work_history, '[]'), COALESCE(s.certifications, '[]'),
         s.profile_completion,
         EXISTS (SELECT 1 FROM public.saved_candidates sc WHERE sc.recruiter_id = v_rid AND sc.survivor_id = s.id),
         s.updated_at
  FROM public.survivors s
  WHERE s.consent_share_with_recruiters
    AND (q IS NULL
         OR EXISTS (SELECT 1 FROM unnest(COALESCE(s.skills, '{}') || COALESCE(s.preferred_roles, '{}')) x WHERE x ILIKE '%' || q || '%')
         OR s.education_level ILIKE '%' || q || '%'
         OR s.bio ILIKE '%' || q || '%')
    AND (loc IS NULL OR s.city ILIKE '%' || loc || '%' OR s.state ILIKE '%' || loc || '%')
  ORDER BY s.profile_completion DESC, s.updated_at DESC
  LIMIT 200;
END;
$$;

-- ===== RECRUITER: shortlist =====
CREATE OR REPLACE FUNCTION public.toggle_saved_candidate(_survivor_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_rid UUID;
BEGIN
  PERFORM public.require_role('recruiter');
  v_rid := public.ensure_recruiter_for_user(auth.uid());

  DELETE FROM public.saved_candidates WHERE recruiter_id = v_rid AND survivor_id = _survivor_id;
  IF FOUND THEN RETURN false; END IF;

  IF NOT public.survivor_visible_to_recruiter(_survivor_id, v_rid) THEN
    RAISE EXCEPTION 'This candidate is not available';
  END IF;
  INSERT INTO public.saved_candidates (recruiter_id, survivor_id) VALUES (v_rid, _survivor_id);
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_saved_candidate_notes(_survivor_id UUID, _notes TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.require_role('recruiter');
  UPDATE public.saved_candidates SET notes = NULLIF(trim(_notes), '')
  WHERE survivor_id = _survivor_id AND recruiter_id = public.ensure_recruiter_for_user(auth.uid());
END;
$$;

CREATE OR REPLACE FUNCTION public.recruiter_list_saved()
RETURNS TABLE (
  id UUID, anonymous_id TEXT, display_name TEXT, age INTEGER, city TEXT, state TEXT,
  skills TEXT[], languages TEXT[], preferred_roles TEXT[], education_level TEXT,
  total_experience TEXT, bio TEXT, work_history JSONB, certifications JSONB,
  profile_completion INTEGER, is_saved BOOLEAN, notes TEXT, saved_at TIMESTAMPTZ
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
#variable_conflict use_column
DECLARE
  v_rid UUID;
BEGIN
  PERFORM public.require_role('recruiter');
  v_rid := public.ensure_recruiter_for_user(auth.uid());

  RETURN QUERY
  SELECT s.id, s.anonymous_id, public.survivor_display_name(s.full_name, s.anonymous_id), s.age, s.city, s.state,
         COALESCE(s.skills, '{}'), COALESCE(s.languages, '{}'), COALESCE(s.preferred_roles, '{}'), s.education_level,
         s.total_experience, s.bio, COALESCE(s.work_history, '[]'), COALESCE(s.certifications, '[]'),
         s.profile_completion, true, sc.notes, sc.created_at
  FROM public.saved_candidates sc
  JOIN public.survivors s ON s.id = sc.survivor_id
  WHERE sc.recruiter_id = v_rid
    AND public.survivor_visible_to_recruiter(s.id, v_rid)
  ORDER BY sc.created_at DESC;
END;
$$;

-- ===== RECRUITER: own jobs with applicant counts =====
CREATE OR REPLACE FUNCTION public.recruiter_list_my_jobs()
RETURNS TABLE (
  id UUID, title TEXT, company_name TEXT, description TEXT, required_skills TEXT[],
  location_region TEXT, location_country TEXT, remote_ok BOOLEAN, employment_type TEXT,
  salary_min INTEGER, salary_max INTEGER, currency TEXT, status TEXT,
  published_at TIMESTAMPTZ, closes_at TIMESTAMPTZ, created_at TIMESTAMPTZ,
  applicant_count INTEGER, new_count INTEGER
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
#variable_conflict use_column
DECLARE
  v_rid UUID;
BEGIN
  PERFORM public.require_role('recruiter');
  v_rid := public.ensure_recruiter_for_user(auth.uid());

  RETURN QUERY
  SELECT j.id, j.title, j.company_name, j.description, COALESCE(j.required_skills, '{}'),
         j.location_region, j.location_country, j.remote_ok, j.employment_type::TEXT,
         j.salary_min, j.salary_max, j.currency, j.status::TEXT,
         j.published_at, j.closes_at, j.created_at,
         (SELECT count(*)::INTEGER FROM public.job_applications a WHERE a.job_id = j.id),
         (SELECT count(*)::INTEGER FROM public.job_applications a WHERE a.job_id = j.id AND a.status = 'submitted')
  FROM public.jobs j
  WHERE j.recruiter_id = v_rid
  ORDER BY j.created_at DESC;
END;
$$;

-- ===== SURVIVOR: job board =====
CREATE OR REPLACE FUNCTION public.list_open_jobs()
RETURNS TABLE (
  id UUID, title TEXT, company_name TEXT, description TEXT, required_skills TEXT[],
  location_region TEXT, location_country TEXT, remote_ok BOOLEAN, employment_type TEXT,
  salary_min INTEGER, salary_max INTEGER, currency TEXT,
  published_at TIMESTAMPTZ, closes_at TIMESTAMPTZ, application_status TEXT
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
#variable_conflict use_column
DECLARE
  v_sid UUID := public.my_survivor_id();
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not signed in' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT j.id, j.title, j.company_name, j.description, COALESCE(j.required_skills, '{}'),
         j.location_region, j.location_country, j.remote_ok, j.employment_type::TEXT,
         j.salary_min, j.salary_max, j.currency, j.published_at, j.closes_at,
         (SELECT a.status::TEXT FROM public.job_applications a WHERE a.job_id = j.id AND a.survivor_id = v_sid)
  FROM public.jobs j
  WHERE j.status = 'published' AND (j.closes_at IS NULL OR j.closes_at > now())
  ORDER BY j.published_at DESC NULLS LAST, j.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.apply_to_job(_job_id UUID, _cover_note TEXT DEFAULT NULL)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_sid UUID;
  v_ngo UUID;
  v_id UUID;
BEGIN
  PERFORM public.require_role('survivor');
  v_sid := public.ensure_survivor_for_user(auth.uid());

  IF NOT EXISTS (
    SELECT 1 FROM public.jobs
    WHERE id = _job_id AND status = 'published' AND (closes_at IS NULL OR closes_at > now())
  ) THEN
    RAISE EXCEPTION 'This job is no longer accepting applications';
  END IF;
  IF EXISTS (SELECT 1 FROM public.job_applications WHERE job_id = _job_id AND survivor_id = v_sid) THEN
    RAISE EXCEPTION 'You have already applied to this job';
  END IF;

  SELECT ngo_id INTO v_ngo FROM public.survivors WHERE id = v_sid;
  INSERT INTO public.job_applications (job_id, survivor_id, ngo_id, cover_note)
  VALUES (_job_id, v_sid, v_ngo, NULLIF(trim(_cover_note), ''))
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.withdraw_application(_application_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.require_role('survivor');
  DELETE FROM public.job_applications
  WHERE id = _application_id
    AND survivor_id = public.my_survivor_id()
    AND status IN ('submitted', 'reviewing');
  IF NOT FOUND THEN
    RAISE EXCEPTION 'This application can no longer be withdrawn';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.survivor_list_my_applications()
RETURNS TABLE (
  id UUID, job_id UUID, job_title TEXT, company_name TEXT, location TEXT, remote_ok BOOLEAN,
  employment_type TEXT, job_status TEXT, status TEXT, status_note TEXT, cover_note TEXT,
  created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ,
  interview_id UUID, interview_at TIMESTAMPTZ, interview_type TEXT, interview_link TEXT, interview_status TEXT
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
#variable_conflict use_column
DECLARE
  v_sid UUID;
BEGIN
  PERFORM public.require_role('survivor');
  v_sid := public.ensure_survivor_for_user(auth.uid());

  RETURN QUERY
  SELECT a.id, j.id, j.title, j.company_name,
         NULLIF(concat_ws(', ', j.location_region, j.location_country), ''), j.remote_ok,
         j.employment_type::TEXT, j.status::TEXT, a.status::TEXT, a.status_note, a.cover_note,
         a.created_at, a.updated_at,
         i.id, i.scheduled_at, i.interview_type, i.video_link, i.status::TEXT
  FROM public.job_applications a
  JOIN public.jobs j ON j.id = a.job_id
  LEFT JOIN LATERAL (
    SELECT * FROM public.interviews iv
    WHERE iv.application_id = a.id
    ORDER BY (iv.status = 'scheduled') DESC, iv.scheduled_at DESC
    LIMIT 1
  ) i ON true
  WHERE a.survivor_id = v_sid
  ORDER BY a.updated_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.survivor_list_my_interviews()
RETURNS TABLE (
  id UUID, application_id UUID, job_title TEXT, company_name TEXT, scheduled_at TIMESTAMPTZ,
  interview_type TEXT, video_link TEXT, status TEXT
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
#variable_conflict use_column
BEGIN
  PERFORM public.require_role('survivor');

  RETURN QUERY
  SELECT i.id, i.application_id, j.title, COALESCE(j.company_name, r.company_name), i.scheduled_at,
         i.interview_type, i.video_link, i.status::TEXT
  FROM public.interviews i
  JOIN public.recruiters r ON r.id = i.recruiter_id
  LEFT JOIN public.jobs j ON j.id = i.job_id
  WHERE i.survivor_id = public.my_survivor_id()
  ORDER BY (i.status = 'scheduled') DESC, i.scheduled_at ASC;
END;
$$;

-- ===== RECRUITER: applicants, status, interviews =====
CREATE OR REPLACE FUNCTION public.recruiter_list_applicants(_job_id UUID DEFAULT NULL)
RETURNS TABLE (
  application_id UUID, job_id UUID, job_title TEXT,
  id UUID, anonymous_id TEXT, display_name TEXT, age INTEGER, city TEXT, state TEXT,
  skills TEXT[], languages TEXT[], preferred_roles TEXT[], education_level TEXT,
  total_experience TEXT, bio TEXT, work_history JSONB, certifications JSONB,
  profile_completion INTEGER, is_saved BOOLEAN,
  cover_note TEXT, status TEXT, status_note TEXT, applied_at TIMESTAMPTZ, updated_at TIMESTAMPTZ,
  interview_id UUID, interview_at TIMESTAMPTZ, interview_status TEXT
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
#variable_conflict use_column
DECLARE
  v_rid UUID;
BEGIN
  PERFORM public.require_role('recruiter');
  v_rid := public.ensure_recruiter_for_user(auth.uid());

  RETURN QUERY
  SELECT a.id, j.id, j.title,
         s.id, s.anonymous_id, public.survivor_display_name(s.full_name, s.anonymous_id), s.age, s.city, s.state,
         COALESCE(s.skills, '{}'), COALESCE(s.languages, '{}'), COALESCE(s.preferred_roles, '{}'), s.education_level,
         s.total_experience, s.bio, COALESCE(s.work_history, '[]'), COALESCE(s.certifications, '[]'),
         s.profile_completion,
         EXISTS (SELECT 1 FROM public.saved_candidates sc WHERE sc.recruiter_id = v_rid AND sc.survivor_id = s.id),
         a.cover_note, a.status::TEXT, a.status_note, a.created_at, a.updated_at,
         i.id, i.scheduled_at, i.status::TEXT
  FROM public.job_applications a
  JOIN public.jobs j ON j.id = a.job_id
  JOIN public.survivors s ON s.id = a.survivor_id
  LEFT JOIN LATERAL (
    SELECT * FROM public.interviews iv
    WHERE iv.application_id = a.id
    ORDER BY (iv.status = 'scheduled') DESC, iv.scheduled_at DESC
    LIMIT 1
  ) i ON true
  WHERE j.recruiter_id = v_rid AND (_job_id IS NULL OR j.id = _job_id)
  ORDER BY a.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.recruiter_set_application_status(_application_id UUID, _status TEXT, _note TEXT DEFAULT NULL)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_rid UUID;
  v_sid UUID;
BEGIN
  PERFORM public.require_role('recruiter');
  v_rid := public.ensure_recruiter_for_user(auth.uid());

  IF _status NOT IN ('submitted', 'reviewing', 'shortlisted', 'interview_scheduled', 'offered', 'hired', 'rejected') THEN
    RAISE EXCEPTION 'Invalid status: %', _status;
  END IF;

  UPDATE public.job_applications a
  SET status = _status::public.application_status,
      status_note = COALESCE(NULLIF(trim(_note), ''), a.status_note)
  FROM public.jobs j
  WHERE a.id = _application_id AND j.id = a.job_id AND j.recruiter_id = v_rid
  RETURNING a.survivor_id INTO v_sid;

  IF v_sid IS NULL THEN
    RAISE EXCEPTION 'Application not found';
  END IF;

  IF _status = 'shortlisted' THEN
    INSERT INTO public.saved_candidates (recruiter_id, survivor_id)
    VALUES (v_rid, v_sid)
    ON CONFLICT (recruiter_id, survivor_id) DO NOTHING;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.schedule_interview(
  _application_id UUID,
  _survivor_id UUID,
  _scheduled_at TIMESTAMPTZ,
  _interview_type TEXT DEFAULT 'virtual',
  _video_link TEXT DEFAULT NULL,
  _notes TEXT DEFAULT NULL
)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_rid UUID;
  v_sid UUID := _survivor_id;
  v_job UUID;
  v_id UUID;
BEGIN
  PERFORM public.require_role('recruiter');
  v_rid := public.ensure_recruiter_for_user(auth.uid());

  IF _scheduled_at IS NULL OR _scheduled_at < now() - interval '5 minutes' THEN
    RAISE EXCEPTION 'Pick a date and time in the future';
  END IF;

  IF _application_id IS NOT NULL THEN
    SELECT a.survivor_id, a.job_id INTO v_sid, v_job
    FROM public.job_applications a JOIN public.jobs j ON j.id = a.job_id
    WHERE a.id = _application_id AND j.recruiter_id = v_rid;
    IF v_sid IS NULL THEN
      RAISE EXCEPTION 'Application not found';
    END IF;
  ELSIF v_sid IS NULL OR NOT public.survivor_visible_to_recruiter(v_sid, v_rid) THEN
    RAISE EXCEPTION 'This candidate is not available';
  END IF;

  INSERT INTO public.interviews (recruiter_id, survivor_id, job_id, application_id, scheduled_at, interview_type, video_link, notes)
  VALUES (v_rid, v_sid, v_job, _application_id, _scheduled_at,
          COALESCE(NULLIF(trim(_interview_type), ''), 'virtual'), NULLIF(trim(_video_link), ''), NULLIF(trim(_notes), ''))
  RETURNING id INTO v_id;

  IF _application_id IS NOT NULL THEN
    UPDATE public.job_applications SET status = 'interview_scheduled'::public.application_status
    WHERE id = _application_id;
  END IF;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.recruiter_list_interviews()
RETURNS TABLE (
  id UUID, survivor_id UUID, display_name TEXT, anonymous_id TEXT, job_id UUID, job_title TEXT,
  application_id UUID, scheduled_at TIMESTAMPTZ, interview_type TEXT, video_link TEXT,
  status TEXT, notes TEXT, feedback TEXT, created_at TIMESTAMPTZ
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
#variable_conflict use_column
DECLARE
  v_rid UUID;
BEGIN
  PERFORM public.require_role('recruiter');
  v_rid := public.ensure_recruiter_for_user(auth.uid());

  RETURN QUERY
  SELECT i.id, s.id, public.survivor_display_name(s.full_name, s.anonymous_id), s.anonymous_id,
         j.id, j.title, i.application_id, i.scheduled_at, i.interview_type, i.video_link,
         i.status::TEXT, i.notes, i.feedback, i.created_at
  FROM public.interviews i
  JOIN public.survivors s ON s.id = i.survivor_id
  LEFT JOIN public.jobs j ON j.id = i.job_id
  WHERE i.recruiter_id = v_rid
  ORDER BY (i.status = 'scheduled') DESC, i.scheduled_at ASC;
END;
$$;

-- ===== SURVIVOR: documents =====
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('survivor-documents', 'survivor-documents', false, 10485760)
ON CONFLICT (id) DO NOTHING;

-- Survivor uploads live under  self/<survivor_id>/<uuid>-<filename>
DROP POLICY IF EXISTS "survivors upload own docs" ON storage.objects;
CREATE POLICY "survivors upload own docs" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'survivor-documents'
    AND (storage.foldername(name))[1] = 'self'
    AND (storage.foldername(name))[2] = public.my_survivor_id()::TEXT
  );
DROP POLICY IF EXISTS "survivors read own docs" ON storage.objects;
CREATE POLICY "survivors read own docs" ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'survivor-documents'
    AND (storage.foldername(name))[1] = 'self'
    AND (storage.foldername(name))[2] = public.my_survivor_id()::TEXT
  );
DROP POLICY IF EXISTS "survivors delete own docs" ON storage.objects;
CREATE POLICY "survivors delete own docs" ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'survivor-documents'
    AND (storage.foldername(name))[1] = 'self'
    AND (storage.foldername(name))[2] = public.my_survivor_id()::TEXT
  );

CREATE OR REPLACE FUNCTION public.register_my_document(
  _doc_type TEXT, _file_name TEXT, _storage_path TEXT, _mime_type TEXT, _size_bytes INTEGER
)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_sid UUID;
  v_id UUID;
BEGIN
  PERFORM public.require_role('survivor');
  v_sid := public.ensure_survivor_for_user(auth.uid());

  IF _storage_path NOT LIKE 'self/' || v_sid::TEXT || '/%' THEN
    RAISE EXCEPTION 'Invalid storage path';
  END IF;

  -- Uploads start as pending until an NGO partner or admin verifies them
  INSERT INTO public.survivor_documents (survivor_id, uploaded_by, doc_type, file_name, storage_path, mime_type, size_bytes, status)
  VALUES (v_sid, auth.uid(), _doc_type, _file_name, _storage_path, _mime_type, _size_bytes, 'pending')
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_my_document(_document_id UUID)
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_path TEXT;
BEGIN
  PERFORM public.require_role('survivor');
  DELETE FROM public.survivor_documents
  WHERE id = _document_id AND survivor_id = public.my_survivor_id()
  RETURNING storage_path INTO v_path;
  IF v_path IS NULL THEN
    RAISE EXCEPTION 'Document not found';
  END IF;
  RETURN v_path;
END;
$$;

-- ===== ADMIN DELETE: also remove a self-registered survivor's record =====
CREATE OR REPLACE FUNCTION public.admin_delete_user(_user_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_email TEXT;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Admin access required' USING ERRCODE = '42501';
  END IF;
  IF _user_id = auth.uid() THEN
    RAISE EXCEPTION 'You cannot delete your own account';
  END IF;

  SELECT email INTO v_email FROM auth.users WHERE id = _user_id;
  IF v_email IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  IF EXISTS (SELECT 1 FROM public.ngos WHERE owner_id = _user_id) THEN
    RAISE EXCEPTION 'This user owns an NGO with survivor records. Suspend the account instead of deleting it.';
  END IF;

  BEGIN
    DELETE FROM public.survivors WHERE linked_user_id = _user_id AND ngo_id IS NULL;
    DELETE FROM auth.users WHERE id = _user_id;
  EXCEPTION WHEN foreign_key_violation THEN
    RAISE EXCEPTION 'This user still owns records (for example survivor profiles or documents they created). Suspend the account instead of deleting it.';
  END;

  INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, target_label)
  VALUES (auth.uid(), 'user.deleted', 'user', _user_id, v_email);
END;
$$;

-- ===== GRANTS =====
DO $$
DECLARE
  f TEXT;
BEGIN
  FOREACH f IN ARRAY ARRAY[
    'public.get_my_survivor()',
    'public.save_my_survivor_profile(jsonb)',
    'public.get_my_recruiter()',
    'public.search_survivors(text, text)',
    'public.toggle_saved_candidate(uuid)',
    'public.update_saved_candidate_notes(uuid, text)',
    'public.recruiter_list_saved()',
    'public.recruiter_list_my_jobs()',
    'public.list_open_jobs()',
    'public.apply_to_job(uuid, text)',
    'public.withdraw_application(uuid)',
    'public.survivor_list_my_applications()',
    'public.survivor_list_my_interviews()',
    'public.recruiter_list_applicants(uuid)',
    'public.recruiter_set_application_status(uuid, text, text)',
    'public.schedule_interview(uuid, uuid, timestamptz, text, text, text)',
    'public.recruiter_list_interviews()',
    'public.register_my_document(text, text, text, text, integer)',
    'public.delete_my_document(uuid)',
    'public.my_survivor_id()'
  ] LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon', f);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated', f);
  END LOOP;

  FOREACH f IN ARRAY ARRAY[
    'public.ensure_survivor_for_user(uuid)',
    'public.ensure_recruiter_for_user(uuid)',
    'public.assign_signup_role()',
    'public.on_survivor_role_assigned()',
    'public.survivor_visible_to_recruiter(uuid, uuid)',
    'public.require_role(public.app_role)'
  ] LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon, authenticated', f);
  END LOOP;
END $$;

-- ===== REALTIME =====
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['jobs', 'job_applications', 'interviews', 'saved_candidates', 'survivor_documents'] LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = t
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    END IF;
  END LOOP;
END $$;


-- #############################################################################
-- ##### 6. 20261002000000_dashboards_ngo_admin_live.sql
-- #############################################################################

-- =============================================================================
-- CAREVIA — live dashboards for every role
--
-- * Survivor dashboard: real profile completion (matches the profile form)
-- * NGO partners: register organisation, add/manage survivors, track progress,
--   verify documents
-- * Admin: approve NGOs / recruiters / survivor profiles / documents, real
--   analytics
-- * Login page: real platform counters
-- * Closes self-approval holes (owners could set their own status)
--
-- Run AFTER 20261001010000_jobs_applications_live.sql.
-- Additive and safe to re-run. Dashboard → SQL Editor → New query → Run.
-- =============================================================================

-- ===== SECURITY: status fields are only changed through checked RPCs =====
DROP POLICY IF EXISTS "owners insert own ngo" ON public.ngos;
DROP POLICY IF EXISTS "owners update own ngo when not approved" ON public.ngos;
DROP POLICY IF EXISTS "recruiters insert own profile" ON public.recruiters;
DROP POLICY IF EXISTS "recruiters update own pending profile" ON public.recruiters;
DROP POLICY IF EXISTS "survivors update own linked profile" ON public.survivors;

-- ===== PROFILE COMPLETION: same checklist the survivor sees =====
CREATE OR REPLACE FUNCTION public.compute_survivor_completion(s public.survivors)
RETURNS INTEGER LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
  score INTEGER := 0;
BEGIN
  IF COALESCE(trim(s.full_name), '') <> '' AND s.full_name NOT LIKE '%@%' THEN score := score + 10; END IF;
  IF s.age IS NOT NULL THEN score := score + 5; END IF;
  IF COALESCE(s.city, s.state) IS NOT NULL THEN score := score + 10; END IF;
  IF COALESCE(array_length(s.languages, 1), 0) > 0 THEN score := score + 10; END IF;
  IF COALESCE(array_length(s.skills, 1), 0) > 0 THEN score := score + 20; END IF;
  IF s.education_level IS NOT NULL THEN score := score + 10; END IF;
  IF COALESCE(jsonb_array_length(s.work_history), 0) > 0 OR s.total_experience IS NOT NULL THEN score := score + 15; END IF;
  IF length(trim(COALESCE(s.bio, ''))) > 20 THEN score := score + 10; END IF;
  IF s.consent_share_with_recruiters THEN score := score + 10; END IF;
  RETURN LEAST(score, 100);
END;
$$;

UPDATE public.survivors SET profile_completion = public.compute_survivor_completion(survivors.*);

-- ===== SURVIVOR PROFILE (shared by survivors and NGO caseworkers) =====
CREATE OR REPLACE FUNCTION public.survivor_apply_profile(_id UUID, _p JSONB)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_consent BOOLEAN := COALESCE((_p->>'consent_share_with_recruiters')::BOOLEAN, false);
BEGIN
  UPDATE public.survivors SET
    full_name = COALESCE(trim(_p->>'full_name'), ''),
    age = CASE WHEN (_p->>'age') ~ '^\d{1,3}$' THEN (_p->>'age')::INTEGER ELSE NULL END,
    phone = NULLIF(trim(_p->>'phone'), ''),
    email = CASE WHEN _p ? 'email' THEN NULLIF(trim(_p->>'email'), '') ELSE email END,
    notes = CASE WHEN _p ? 'notes' THEN NULLIF(trim(_p->>'notes'), '') ELSE notes END,
    city = NULLIF(trim(_p->>'city'), ''),
    state = NULLIF(trim(_p->>'state'), ''),
    location_region = NULLIF(trim(_p->>'state'), ''),
    location_country = COALESCE(NULLIF(trim(_p->>'country'), ''), 'India'),
    languages = public.jsonb_text_array(_p->'languages'),
    skills = public.jsonb_text_array(_p->'skills'),
    preferred_roles = public.jsonb_text_array(_p->'preferred_roles'),
    education_level = NULLIF(trim(_p->>'education_level'), ''),
    certifications = CASE WHEN jsonb_typeof(_p->'certifications') = 'array' THEN _p->'certifications' ELSE '[]'::jsonb END,
    work_history = CASE WHEN jsonb_typeof(_p->'work_history') = 'array' THEN _p->'work_history' ELSE '[]'::jsonb END,
    total_experience = NULLIF(trim(_p->>'total_experience'), ''),
    bio = NULLIF(trim(_p->>'bio'), ''),
    availability = NULLIF(trim(_p->>'availability'), ''),
    accommodation_needs = NULLIF(trim(_p->>'accommodation_needs'), ''),
    consent_share_changed_at = CASE WHEN consent_share_with_recruiters IS DISTINCT FROM v_consent THEN now() ELSE consent_share_changed_at END,
    consent_share_with_recruiters = v_consent,
    -- a rejected profile goes back into the review queue once it's edited
    status = CASE WHEN status = 'rejected' THEN 'submitted'::public.survivor_status ELSE status END,
    updated_by = auth.uid()
  WHERE id = _id;
END;
$$;

CREATE OR REPLACE FUNCTION public.survivor_json(_id UUID)
RETURNS JSONB LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT (to_jsonb(s) - 'embedding') || jsonb_build_object('ngo_name', n.name)
  FROM public.survivors s LEFT JOIN public.ngos n ON n.id = s.ngo_id
  WHERE s.id = _id
$$;

CREATE OR REPLACE FUNCTION public.get_my_survivor()
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.require_role('survivor');
  RETURN public.survivor_json(public.ensure_survivor_for_user(auth.uid()));
END;
$$;

CREATE OR REPLACE FUNCTION public.save_my_survivor_profile(_p JSONB)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_id UUID;
BEGIN
  PERFORM public.require_role('survivor');
  v_id := public.ensure_survivor_for_user(auth.uid());
  PERFORM public.survivor_apply_profile(v_id, _p - 'email' - 'notes');
  RETURN public.survivor_json(v_id);
END;
$$;

-- ===== NGO: organisation =====
CREATE OR REPLACE FUNCTION public.my_approved_ngo_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id FROM public.ngos WHERE owner_id = auth.uid() AND status = 'approved' ORDER BY created_at LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.require_approved_ngo()
RETURNS UUID LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_id UUID := public.my_approved_ngo_id();
BEGIN
  IF v_id IS NULL THEN
    RAISE EXCEPTION 'Your organisation must be approved by CAREVIA before you can do this' USING ERRCODE = '42501';
  END IF;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.ngo_get_my_org()
RETURNS JSONB LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.require_role('ngo_partner');
  RETURN (SELECT to_jsonb(n) FROM public.ngos n WHERE n.owner_id = auth.uid() ORDER BY n.created_at LIMIT 1);
END;
$$;

CREATE OR REPLACE FUNCTION public.ngo_save_my_org(_p JSONB)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_id UUID;
  v_name TEXT := NULLIF(trim(_p->>'name'), '');
  v_email TEXT := NULLIF(trim(_p->>'contact_email'), '');
BEGIN
  PERFORM public.require_role('ngo_partner');
  IF v_name IS NULL OR v_email IS NULL THEN
    RAISE EXCEPTION 'Organisation name and contact email are required';
  END IF;

  SELECT id INTO v_id FROM public.ngos WHERE owner_id = auth.uid() ORDER BY created_at LIMIT 1;
  IF v_id IS NULL THEN
    INSERT INTO public.ngos (owner_id, name, contact_email, status)
    VALUES (auth.uid(), v_name, v_email, 'pending')
    RETURNING id INTO v_id;
  END IF;

  UPDATE public.ngos SET
    name = v_name,
    contact_email = v_email,
    registration_number = NULLIF(trim(_p->>'registration_number'), ''),
    contact_phone = NULLIF(trim(_p->>'contact_phone'), ''),
    website = NULLIF(trim(_p->>'website'), ''),
    address = NULLIF(trim(_p->>'address'), ''),
    city = NULLIF(trim(_p->>'city'), ''),
    state = NULLIF(trim(_p->>'state'), ''),
    country = COALESCE(NULLIF(trim(_p->>'country'), ''), 'India'),
    focus_areas = public.jsonb_text_array(_p->'focus_areas'),
    description = NULLIF(trim(_p->>'description'), ''),
    -- editing after a rejection re-submits for review
    status = CASE WHEN status = 'rejected' THEN 'pending'::public.ngo_status ELSE status END,
    rejection_reason = CASE WHEN status = 'rejected' THEN NULL ELSE rejection_reason END
  WHERE id = v_id;

  RETURN (SELECT to_jsonb(n) FROM public.ngos n WHERE n.id = v_id);
END;
$$;

-- ===== NGO: survivors =====
CREATE OR REPLACE FUNCTION public.ngo_list_survivors()
RETURNS JSONB LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_ngo UUID;
BEGIN
  PERFORM public.require_role('ngo_partner');
  v_ngo := public.require_approved_ngo();

  RETURN COALESCE((
    SELECT jsonb_agg(
      (to_jsonb(s) - 'embedding') || jsonb_build_object(
        'has_login', s.linked_user_id IS NOT NULL,
        'applications', (SELECT count(*) FROM public.job_applications a WHERE a.survivor_id = s.id),
        'interviews', (SELECT count(*) FROM public.interviews i WHERE i.survivor_id = s.id AND i.status <> 'cancelled'),
        'offers', (SELECT count(*) FROM public.job_applications a WHERE a.survivor_id = s.id AND a.status::TEXT IN ('offered', 'hired')),
        'hired', (SELECT count(*) FROM public.job_applications a WHERE a.survivor_id = s.id AND a.status::TEXT = 'hired'),
        'documents', (SELECT count(*) FROM public.survivor_documents d WHERE d.survivor_id = s.id AND d.deleted_at IS NULL),
        'pending_documents', (SELECT count(*) FROM public.survivor_documents d WHERE d.survivor_id = s.id AND d.deleted_at IS NULL AND d.status = 'pending')
      )
      ORDER BY s.created_at DESC
    )
    FROM public.survivors s
    WHERE s.ngo_id = v_ngo
  ), '[]'::jsonb);
END;
$$;

CREATE OR REPLACE FUNCTION public.ngo_save_survivor(_id UUID, _p JSONB)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_ngo UUID;
  v_id UUID := _id;
BEGIN
  PERFORM public.require_role('ngo_partner');
  v_ngo := public.require_approved_ngo();

  IF COALESCE(trim(_p->>'full_name'), '') = '' THEN
    RAISE EXCEPTION 'Full name is required';
  END IF;

  IF v_id IS NULL THEN
    INSERT INTO public.survivors (ngo_id, created_by, full_name, status)
    VALUES (v_ngo, auth.uid(), trim(_p->>'full_name'), 'submitted')
    RETURNING id INTO v_id;
  ELSIF NOT EXISTS (SELECT 1 FROM public.survivors WHERE id = v_id AND ngo_id = v_ngo) THEN
    RAISE EXCEPTION 'Survivor not found';
  END IF;

  PERFORM public.survivor_apply_profile(v_id, _p);
  RETURN v_id;
END;
$$;

DROP POLICY IF EXISTS "ngo read interviews for own survivors" ON public.interviews;
CREATE POLICY "ngo read interviews for own survivors" ON public.interviews FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.survivors s WHERE s.id = survivor_id AND public.owns_approved_ngo(auth.uid(), s.ngo_id)));

-- ===== DOCUMENT VERIFICATION (NGO for own survivors, admin for everyone) =====
DROP POLICY IF EXISTS "ngo read self-uploaded survivor docs" ON storage.objects;
CREATE POLICY "ngo read self-uploaded survivor docs" ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'survivor-documents'
    AND (storage.foldername(name))[1] = 'self'
    AND EXISTS (
      SELECT 1 FROM public.survivors s
      WHERE s.id::TEXT = (storage.foldername(name))[2] AND public.owns_approved_ngo(auth.uid(), s.ngo_id)
    )
  );
DROP POLICY IF EXISTS "admins read all survivor docs" ON storage.objects;
CREATE POLICY "admins read all survivor docs" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'survivor-documents' AND public.is_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.list_reviewable_documents(_status TEXT DEFAULT NULL)
RETURNS JSONB LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_admin BOOLEAN := public.is_admin(auth.uid());
  v_ngo UUID;
BEGIN
  IF NOT v_admin THEN
    PERFORM public.require_role('ngo_partner');
    v_ngo := public.require_approved_ngo();
  END IF;

  RETURN COALESCE((
    SELECT jsonb_agg(jsonb_build_object(
      'id', d.id, 'doc_type', d.doc_type, 'file_name', d.file_name, 'storage_path', d.storage_path,
      'mime_type', d.mime_type, 'size_bytes', d.size_bytes, 'status', d.status, 'created_at', d.created_at,
      'survivor_id', s.id, 'survivor_name', NULLIF(trim(s.full_name), ''), 'anonymous_id', s.anonymous_id,
      'ngo_name', n.name
    ) ORDER BY (d.status = 'pending') DESC, d.created_at DESC)
    FROM public.survivor_documents d
    JOIN public.survivors s ON s.id = d.survivor_id
    LEFT JOIN public.ngos n ON n.id = s.ngo_id
    WHERE d.deleted_at IS NULL
      AND (_status IS NULL OR d.status::TEXT = _status)
      AND (v_admin OR s.ngo_id = v_ngo)
  ), '[]'::jsonb);
END;
$$;

CREATE OR REPLACE FUNCTION public.review_document(_document_id UUID, _status TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF _status NOT IN ('verified', 'rejected', 'pending') THEN
    RAISE EXCEPTION 'Invalid status: %', _status;
  END IF;

  UPDATE public.survivor_documents d SET status = _status::public.document_status
  FROM public.survivors s
  WHERE d.id = _document_id AND s.id = d.survivor_id AND d.deleted_at IS NULL
    AND (public.is_admin(auth.uid()) OR s.ngo_id = public.my_approved_ngo_id());

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Document not found';
  END IF;
END;
$$;

-- ===== ADMIN: approvals =====
CREATE OR REPLACE FUNCTION public.require_admin()
RETURNS VOID LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Admin access required' USING ERRCODE = '42501';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_overview()
RETURNS JSONB LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.require_admin();

  RETURN jsonb_build_object(
    'stats', jsonb_build_object(
      'survivors', (SELECT count(*) FROM public.survivors),
      'placed', (SELECT count(DISTINCT survivor_id) FROM public.job_applications WHERE status::TEXT = 'hired'),
      'active_ngos', (SELECT count(*) FROM public.ngos WHERE status = 'approved'),
      'recruiters', (SELECT count(*) FROM public.recruiters),
      'pending', (SELECT count(*) FROM public.ngos WHERE status = 'pending')
               + (SELECT count(*) FROM public.recruiters WHERE verification_status = 'pending')
               + (SELECT count(*) FROM public.survivors WHERE status IN ('submitted', 'under_review'))
               + (SELECT count(*) FROM public.survivor_documents WHERE status = 'pending' AND deleted_at IS NULL)
    ),
    'pending_ngos', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', n.id, 'name', n.name, 'contact_email', n.contact_email, 'contact_phone', n.contact_phone,
        'registration_number', n.registration_number, 'website', n.website,
        'city', n.city, 'state', n.state, 'description', n.description, 'created_at', n.created_at
      ) ORDER BY n.created_at)
      FROM public.ngos n WHERE n.status = 'pending'
    ), '[]'::jsonb),
    'pending_recruiters', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', r.id, 'company_name', r.company_name, 'company_website', r.company_website,
        'email', u.email, 'created_at', r.created_at
      ) ORDER BY r.created_at)
      FROM public.recruiters r JOIN auth.users u ON u.id = r.user_id
      WHERE r.verification_status = 'pending'
    ), '[]'::jsonb),
    'pending_survivors', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', s.id, 'full_name', NULLIF(trim(s.full_name), ''), 'anonymous_id', s.anonymous_id,
        'ngo_name', n.name, 'profile_completion', s.profile_completion, 'city', s.city, 'state', s.state,
        'skills', COALESCE(s.skills, '{}'), 'self_registered', s.linked_user_id IS NOT NULL, 'created_at', s.created_at
      ) ORDER BY s.created_at)
      FROM public.survivors s LEFT JOIN public.ngos n ON n.id = s.ngo_id
      WHERE s.status IN ('submitted', 'under_review')
    ), '[]'::jsonb),
    'top_skills', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('skill', skill, 'count', cnt) ORDER BY cnt DESC, skill)
      FROM (
        SELECT trim(sk) AS skill, count(*) AS cnt
        FROM public.survivors s, unnest(COALESCE(s.skills, '{}')) sk
        GROUP BY trim(sk) ORDER BY count(*) DESC LIMIT 8
      ) t
    ), '[]'::jsonb),
    'ngo_partners', COALESCE((
      SELECT jsonb_agg(row_to_json(t)::jsonb ORDER BY t.survivors DESC)
      FROM (
        SELECT n.id, n.name, n.city,
               (SELECT count(*) FROM public.survivors s WHERE s.ngo_id = n.id) AS survivors,
               (SELECT count(DISTINCT a.survivor_id) FROM public.job_applications a
                  JOIN public.survivors s ON s.id = a.survivor_id
                 WHERE s.ngo_id = n.id AND a.status::TEXT = 'hired') AS placed
        FROM public.ngos n WHERE n.status = 'approved'
        ORDER BY 4 DESC LIMIT 6
      ) t
    ), '[]'::jsonb)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_set_ngo_status(_id UUID, _status TEXT, _reason TEXT DEFAULT NULL)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_owner UUID;
BEGIN
  PERFORM public.require_admin();
  IF _status NOT IN ('pending', 'approved', 'rejected', 'suspended') THEN
    RAISE EXCEPTION 'Invalid status: %', _status;
  END IF;

  UPDATE public.ngos SET
    status = _status::public.ngo_status,
    approved_at = CASE WHEN _status = 'approved' THEN now() ELSE approved_at END,
    approved_by = CASE WHEN _status = 'approved' THEN auth.uid() ELSE approved_by END,
    rejection_reason = CASE WHEN _status = 'rejected' THEN NULLIF(trim(_reason), '') ELSE NULL END
  WHERE id = _id
  RETURNING owner_id INTO v_owner;

  IF v_owner IS NULL THEN RAISE EXCEPTION 'NGO not found'; END IF;

  IF _status IN ('approved', 'rejected') THEN
    INSERT INTO public.notifications (user_id, kind, payload)
    VALUES (v_owner, CASE WHEN _status = 'approved' THEN 'ngo_approved' ELSE 'ngo_rejected' END::public.notification_kind,
            jsonb_build_object('ngo_id', _id, 'reason', _reason));
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_set_recruiter_status(_id UUID, _status TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user UUID;
BEGIN
  PERFORM public.require_admin();
  IF _status NOT IN ('pending', 'approved', 'rejected') THEN
    RAISE EXCEPTION 'Invalid status: %', _status;
  END IF;

  UPDATE public.recruiters SET
    verification_status = _status::public.recruiter_verification_status,
    verified_by = CASE WHEN _status = 'approved' THEN auth.uid() ELSE verified_by END,
    verified_at = CASE WHEN _status = 'approved' THEN now() ELSE verified_at END
  WHERE id = _id
  RETURNING user_id INTO v_user;

  IF v_user IS NULL THEN RAISE EXCEPTION 'Recruiter not found'; END IF;

  IF _status IN ('approved', 'rejected') THEN
    INSERT INTO public.notifications (user_id, kind, payload)
    VALUES (v_user, CASE WHEN _status = 'approved' THEN 'recruiter_verified' ELSE 'recruiter_rejected' END::public.notification_kind,
            jsonb_build_object('recruiter_id', _id));
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_set_survivor_status(_id UUID, _status TEXT, _reason TEXT DEFAULT NULL)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.require_admin();
  IF _status NOT IN ('submitted', 'under_review', 'approved', 'rejected') THEN
    RAISE EXCEPTION 'Invalid status: %', _status;
  END IF;

  UPDATE public.survivors SET
    status = _status::public.survivor_status,
    rejection_reason = CASE WHEN _status = 'rejected' THEN NULLIF(trim(_reason), '') ELSE NULL END
  WHERE id = _id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Survivor not found'; END IF;
END;
$$;

-- ===== ADMIN: analytics =====
CREATE OR REPLACE FUNCTION public.admin_analytics()
RETURNS JSONB LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_apps BIGINT := (SELECT count(*) FROM public.job_applications);
  v_hired BIGINT := (SELECT count(*) FROM public.job_applications WHERE status::TEXT = 'hired');
BEGIN
  PERFORM public.require_admin();

  RETURN jsonb_build_object(
    'total_users', (SELECT count(*) FROM auth.users),
    'new_users_30d', (SELECT count(*) FROM auth.users WHERE created_at > now() - interval '30 days'),
    'survivors', (SELECT count(*) FROM public.survivors),
    'placements', v_hired,
    'active_jobs', (SELECT count(*) FROM public.jobs WHERE status = 'published' AND (closes_at IS NULL OR closes_at > now())),
    'applications', v_apps,
    'interviews', (SELECT count(*) FROM public.interviews WHERE status <> 'cancelled'),
    'hire_rate', CASE WHEN v_apps = 0 THEN 0 ELSE round(v_hired * 100.0 / v_apps) END,
    'users_by_role', jsonb_build_object(
      'survivor', (SELECT count(DISTINCT user_id) FROM public.user_roles WHERE role = 'survivor'),
      'recruiter', (SELECT count(DISTINCT user_id) FROM public.user_roles WHERE role = 'recruiter'),
      'ngo_partner', (SELECT count(DISTINCT user_id) FROM public.user_roles WHERE role = 'ngo_partner'),
      'admin', (SELECT count(DISTINCT user_id) FROM public.user_roles WHERE role IN ('admin', 'super_admin')),
      'none', (SELECT count(*) FROM auth.users u WHERE NOT EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = u.id))
    ),
    'monthly', (
      SELECT jsonb_agg(jsonb_build_object(
        'month', to_char(m, 'Mon YYYY'),
        'signups', (SELECT count(*) FROM auth.users WHERE date_trunc('month', created_at) = m),
        'applications', (SELECT count(*) FROM public.job_applications WHERE date_trunc('month', created_at) = m),
        'placements', (SELECT count(*) FROM public.job_applications WHERE status::TEXT = 'hired' AND date_trunc('month', updated_at) = m)
      ) ORDER BY m)
      FROM generate_series(date_trunc('month', now()) - interval '5 months', date_trunc('month', now()), interval '1 month') m
    )
  );
END;
$$;

-- ===== PUBLIC: login page counters (aggregate counts only) =====
CREATE OR REPLACE FUNCTION public.public_platform_stats()
RETURNS JSONB LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT jsonb_build_object(
    'survivors', (SELECT count(*) FROM public.survivors),
    'ngos', (SELECT count(*) FROM public.ngos WHERE status = 'approved'),
    'placements', (SELECT count(DISTINCT survivor_id) FROM public.job_applications WHERE status::TEXT = 'hired')
  )
$$;

-- ===== GRANTS =====
DO $$
DECLARE
  f TEXT;
BEGIN
  FOREACH f IN ARRAY ARRAY[
    'public.get_my_survivor()',
    'public.save_my_survivor_profile(jsonb)',
    'public.ngo_get_my_org()',
    'public.ngo_save_my_org(jsonb)',
    'public.ngo_list_survivors()',
    'public.ngo_save_survivor(uuid, jsonb)',
    'public.list_reviewable_documents(text)',
    'public.review_document(uuid, text)',
    'public.admin_overview()',
    'public.admin_set_ngo_status(uuid, text, text)',
    'public.admin_set_recruiter_status(uuid, text)',
    'public.admin_set_survivor_status(uuid, text, text)',
    'public.admin_analytics()',
    'public.my_approved_ngo_id()'
  ] LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon', f);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated', f);
  END LOOP;

  FOREACH f IN ARRAY ARRAY[
    'public.survivor_apply_profile(uuid, jsonb)',
    'public.survivor_json(uuid)',
    'public.require_approved_ngo()',
    'public.require_admin()'
  ] LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon, authenticated', f);
  END LOOP;
END $$;

GRANT EXECUTE ON FUNCTION public.public_platform_stats() TO anon, authenticated;

-- ===== REALTIME =====
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['ngos', 'recruiters', 'survivors'] LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = t
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    END IF;
  END LOOP;
END $$;


-- #############################################################################
-- ##### 7. 20261005000000_survivor_tools_and_otp.sql
-- #############################################################################

-- =============================================================================
-- CAREVIA — backend for the redesign's survivor tools + code-based sign-in
--
-- * Skills page   → saves to survivors.skills (the list recruiters search)
-- * Resume page   → survivor_resumes + survivor_resume_data (one per survivor)
-- * Courses page  → courses, course_reviews, survivor_course_enrollments,
--                   get_recommended_courses(); seeded with real public
--                   training programmes (edit freely in Table Editor)
-- * Sign-in by emailed code: failed-code attempts logged as "Invalid code"
--
-- Run AFTER 20261002000000_dashboards_ngo_admin_live.sql.
-- Additive and safe to re-run. Dashboard → SQL Editor → New query → Run.
-- =============================================================================

-- ===== SKILLS =====
CREATE OR REPLACE FUNCTION public.save_my_skills(_skills TEXT[])
RETURNS TEXT[] LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_id UUID;
  v_skills TEXT[];
BEGIN
  PERFORM public.require_role('survivor');
  v_id := public.ensure_survivor_for_user(auth.uid());

  -- trim, drop blanks and case-insensitive duplicates, keep first spelling
  SELECT COALESCE(array_agg(skill ORDER BY ord), '{}') INTO v_skills
  FROM (
    SELECT DISTINCT ON (lower(trim(x))) trim(x) AS skill, ord
    FROM unnest(COALESCE(_skills, '{}')) WITH ORDINALITY AS t(x, ord)
    WHERE trim(x) <> ''
    ORDER BY lower(trim(x)), ord
  ) d;

  UPDATE public.survivors SET skills = v_skills, updated_by = auth.uid() WHERE id = v_id;
  RETURN v_skills;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.save_my_skills(TEXT[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_my_skills(TEXT[]) TO authenticated;

-- ===== RESUMES =====
CREATE TABLE IF NOT EXISTS public.survivor_resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survivor_id UUID NOT NULL UNIQUE REFERENCES public.survivors(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Resume',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.survivor_resume_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID NOT NULL UNIQUE REFERENCES public.survivor_resumes(id) ON DELETE CASCADE,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.survivor_resumes, public.survivor_resume_data TO authenticated;
GRANT ALL ON public.survivor_resumes, public.survivor_resume_data TO service_role;
ALTER TABLE public.survivor_resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survivor_resume_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "survivors manage own resume" ON public.survivor_resumes;
CREATE POLICY "survivors manage own resume" ON public.survivor_resumes FOR ALL TO authenticated
  USING (survivor_id = public.my_survivor_id())
  WITH CHECK (survivor_id = public.my_survivor_id());
DROP POLICY IF EXISTS "ngo and admins read resumes" ON public.survivor_resumes;
CREATE POLICY "ngo and admins read resumes" ON public.survivor_resumes FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()) OR EXISTS (
    SELECT 1 FROM public.survivors s WHERE s.id = survivor_id AND public.owns_approved_ngo(auth.uid(), s.ngo_id)));

DROP POLICY IF EXISTS "survivors manage own resume data" ON public.survivor_resume_data;
CREATE POLICY "survivors manage own resume data" ON public.survivor_resume_data FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.survivor_resumes r WHERE r.id = resume_id AND r.survivor_id = public.my_survivor_id()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.survivor_resumes r WHERE r.id = resume_id AND r.survivor_id = public.my_survivor_id()));
DROP POLICY IF EXISTS "ngo and admins read resume data" ON public.survivor_resume_data;
CREATE POLICY "ngo and admins read resume data" ON public.survivor_resume_data FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.survivor_resumes r JOIN public.survivors s ON s.id = r.survivor_id
    WHERE r.id = resume_id AND (public.is_admin(auth.uid()) OR public.owns_approved_ngo(auth.uid(), s.ngo_id))));

-- ===== COURSES =====
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE,
  title TEXT NOT NULL,
  provider TEXT,
  description TEXT,
  skills TEXT[] NOT NULL DEFAULT '{}',
  duration TEXT,
  difficulty TEXT,
  url TEXT,
  rating NUMERIC(2,1),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.course_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  survivor_id UUID REFERENCES public.survivors(id) ON DELETE SET NULL,
  reviewer_name TEXT,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.survivor_course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survivor_id UUID NOT NULL REFERENCES public.survivors(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'in_progress', 'completed', 'dropped')),
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE (survivor_id, course_id)
);
CREATE INDEX IF NOT EXISTS course_reviews_course_id_idx ON public.course_reviews(course_id);

GRANT SELECT ON public.courses, public.course_reviews TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.survivor_course_enrollments TO authenticated;
GRANT INSERT ON public.course_reviews TO authenticated;
GRANT ALL ON public.courses, public.course_reviews, public.survivor_course_enrollments TO service_role;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survivor_course_enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anyone signed in reads courses" ON public.courses;
CREATE POLICY "anyone signed in reads courses" ON public.courses FOR SELECT TO authenticated USING (is_active OR public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "admins manage courses" ON public.courses;
CREATE POLICY "admins manage courses" ON public.courses FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "anyone signed in reads reviews" ON public.course_reviews;
CREATE POLICY "anyone signed in reads reviews" ON public.course_reviews FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "survivors review courses" ON public.course_reviews;
CREATE POLICY "survivors review courses" ON public.course_reviews FOR INSERT TO authenticated
  WITH CHECK (survivor_id = public.my_survivor_id());

DROP POLICY IF EXISTS "survivors manage own enrollments" ON public.survivor_course_enrollments;
CREATE POLICY "survivors manage own enrollments" ON public.survivor_course_enrollments FOR ALL TO authenticated
  USING (survivor_id = public.my_survivor_id())
  WITH CHECK (survivor_id = public.my_survivor_id());
DROP POLICY IF EXISTS "ngo and admins read enrollments" ON public.survivor_course_enrollments;
CREATE POLICY "ngo and admins read enrollments" ON public.survivor_course_enrollments FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()) OR EXISTS (
    SELECT 1 FROM public.survivors s WHERE s.id = survivor_id AND public.owns_approved_ngo(auth.uid(), s.ngo_id)));

-- Courses ranked by how many of the survivor's skills they cover
CREATE OR REPLACE FUNCTION public.get_recommended_courses(_survivor_id UUID)
RETURNS TABLE (
  id UUID, title TEXT, provider TEXT, description TEXT, skills TEXT[], duration TEXT,
  difficulty TEXT, url TEXT, rating NUMERIC, "matchCount" INTEGER, "relevanceScore" NUMERIC
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
#variable_conflict use_column
DECLARE
  v_skills TEXT[];
BEGIN
  IF _survivor_id IS DISTINCT FROM public.my_survivor_id() AND NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Not allowed' USING ERRCODE = '42501';
  END IF;
  SELECT ARRAY(SELECT lower(x) FROM unnest(COALESCE(s.skills, '{}')) x) INTO v_skills
  FROM public.survivors s WHERE s.id = _survivor_id;

  RETURN QUERY
  SELECT c.id, c.title, c.provider, c.description, c.skills, c.duration, c.difficulty, c.url, c.rating,
         m.cnt::INTEGER,
         CASE WHEN COALESCE(array_length(c.skills, 1), 0) = 0 THEN 0
              ELSE round(m.cnt * 100.0 / array_length(c.skills, 1), 1) END
  FROM public.courses c
  CROSS JOIN LATERAL (
    SELECT count(*) AS cnt FROM unnest(c.skills) k WHERE lower(k) = ANY (COALESCE(v_skills, '{}'))
  ) m
  WHERE c.is_active
  ORDER BY m.cnt DESC, c.title;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.get_recommended_courses(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_recommended_courses(UUID) TO authenticated;

-- Starter catalogue: real public programmes in India. Details are kept general
-- (batches, fees and duration vary by centre) — edit or extend in Table Editor.
INSERT INTO public.courses (slug, title, provider, description, skills, duration, difficulty, url) VALUES
  ('pmgdisha-digital-literacy', 'Digital Literacy (PMGDISHA)', 'Government of India · Common Service Centres',
   'Learn to use a computer and smartphone, browse the internet, send email and make digital payments safely.',
   ARRAY['Computer Basics', 'MS Office', 'Digital Payments'], 'Self-paced, around 20 hours', 'Beginner', 'https://www.pmgdisha.in'),
  ('pmkvy-data-entry', 'Data Entry Operator (PMKVY)', 'Skill India · NSDC training centres',
   'Typing speed, data entry accuracy, spreadsheets and basic office software for back-office jobs.',
   ARRAY['Data Entry', 'MS Office', 'Tamil Typing'], 'Varies by training centre', 'Beginner', 'https://www.skillindiadigital.gov.in'),
  ('pmkvy-sewing-machine-operator', 'Sewing Machine Operator (PMKVY)', 'Skill India · Apparel Sector Skill Council',
   'Operate industrial sewing machines and stitch garments to factory quality standards.',
   ARRAY['Tailoring', 'Garment Stitching', 'Embroidery'], 'Varies by training centre', 'Beginner', 'https://www.skillindiadigital.gov.in'),
  ('pmkvy-customer-care', 'Customer Care Executive (PMKVY)', 'Skill India · IT-ITeS Sector Skill Council',
   'Handle customer calls and chats, solve problems politely and use CRM tools in call-centre roles.',
   ARRAY['Customer Service', 'Data Entry', 'English Communication'], 'Varies by training centre', 'Beginner', 'https://www.skillindiadigital.gov.in'),
  ('pmkvy-general-duty-assistant', 'General Duty Assistant (PMKVY)', 'Skill India · Healthcare Sector Skill Council',
   'Patient care basics, hygiene and assisting nurses in hospitals and care homes.',
   ARRAY['Nursing Assistant', 'Child Care'], 'Varies by training centre', 'Intermediate', 'https://www.skillindiadigital.gov.in'),
  ('pmkvy-fnb-steward', 'Food & Beverage Service Steward (PMKVY)', 'Skill India · Tourism & Hospitality Sector Skill Council',
   'Restaurant and hotel service: taking orders, serving food, hygiene and guest care.',
   ARRAY['Cooking', 'Housekeeping', 'Customer Service'], 'Varies by training centre', 'Beginner', 'https://www.skillindiadigital.gov.in'),
  ('pmkvy-beauty-therapist', 'Assistant Beauty Therapist (PMKVY)', 'Skill India · Beauty & Wellness Sector Skill Council',
   'Salon services such as skin care, hair care and grooming, with client hygiene and safety.',
   ARRAY['Beauty & Wellness'], 'Varies by training centre', 'Beginner', 'https://www.skillindiadigital.gov.in'),
  ('pmkvy-accounts-assistant', 'Accounts Assistant (PMKVY)', 'Skill India · BFSI Sector Skill Council',
   'Bookkeeping, billing and basic accounting software for small businesses.',
   ARRAY['Accounting', 'Tally', 'Data Entry'], 'Varies by training centre', 'Intermediate', 'https://www.skillindiadigital.gov.in'),
  ('nios-open-schooling', 'Class 10 / Class 12 by open schooling (NIOS)', 'National Institute of Open Schooling',
   'Complete secondary or senior secondary education at your own pace, with exams held during the year.',
   ARRAY['Teaching', 'English Communication'], 'Self-paced', 'Beginner', 'https://www.nios.ac.in'),
  ('swayam-communication', 'English & workplace communication (SWAYAM)', 'SWAYAM · Government of India',
   'Free online courses to improve spoken and written English and workplace communication.',
   ARRAY['English Communication', 'Customer Service'], 'Self-paced, online', 'Beginner', 'https://swayam.gov.in')
ON CONFLICT (slug) DO NOTHING;

-- ===== SIGN-IN BY EMAILED CODE =====
-- Same throttled logger as before; the failure is now a wrong/expired code.
CREATE OR REPLACE FUNCTION public.log_failed_login(_email TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_email TEXT := lower(trim(_email));
  v_uid UUID;
BEGIN
  SELECT id INTO v_uid FROM auth.users WHERE lower(email) = v_email;
  IF v_uid IS NULL THEN RETURN; END IF;

  IF (SELECT count(*) FROM public.audit_logs
      WHERE action = 'user.login_failed' AND entity_id = v_uid
        AND created_at > now() - interval '15 minutes') >= 5 THEN
    RETURN;
  END IF;

  INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, target_label, status)
  VALUES (v_uid, 'user.login_failed', 'auth', v_uid, 'Invalid or expired sign-in code', 'failed');
END;
$$;
REVOKE EXECUTE ON FUNCTION public.log_failed_login(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.log_failed_login(TEXT) TO anon, authenticated;


-- #############################################################################
-- ##### 8. 20260828000000_reserved_admin_email.sql
-- #############################################################################

-- Grants the 'admin' role to a reserved email address, both retroactively
-- (if the account already exists) and automatically going forward (if they
-- sign up later). Safe to re-run.

-- 1) One-time backfill: grant admin now if the account already exists
insert into public.user_roles (user_id, role)
select id, 'admin'::public.app_role
from auth.users
where email = 'shreym171@gmail.com'
on conflict (user_id, role) do nothing;

-- 2) Auto-grant admin whenever this email signs up in the future
create or replace function public.grant_admin_for_reserved_emails()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email = 'shreym171@gmail.com' then
    insert into public.user_roles (user_id, role)
    values (new.id, 'admin')
    on conflict (user_id, role) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_grant_admin on auth.users;
create trigger on_auth_user_created_grant_admin
  after insert on auth.users
  for each row execute function public.grant_admin_for_reserved_emails();

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
CREATE TYPE public.recruiter_verification_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.intro_request_status AS ENUM ('pending', 'accepted', 'declined', 'expired');
CREATE TYPE public.job_status AS ENUM ('draft', 'published', 'closed');
CREATE TYPE public.employment_type AS ENUM ('full_time', 'part_time', 'contract', 'internship');
CREATE TYPE public.application_status AS ENUM ('submitted', 'reviewing', 'shortlisted', 'rejected', 'hired');
CREATE TYPE public.document_status AS ENUM ('pending', 'verified', 'rejected', 'deleted');
CREATE TYPE public.notification_kind AS ENUM (
  'ngo_approved', 'ngo_rejected', 'recruiter_verified', 'recruiter_rejected',
  'intro_request_received', 'intro_request_responded',
  'job_application_received', 'application_status_changed',
  'mentor_safety_flag', 'weekly_digest'
);

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
CREATE POLICY "survivors read own linked profile" ON public.survivors FOR SELECT TO authenticated
  USING (linked_user_id = auth.uid());
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
CREATE TABLE public.survivor_skills_taxonomy (
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
CREATE POLICY "anyone read skills taxonomy" ON public.survivor_skills_taxonomy FOR SELECT TO authenticated USING (true);
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
CREATE POLICY "authenticated insert audit logs" ON public.audit_logs FOR INSERT TO authenticated
  WITH CHECK (actor_id = auth.uid() OR actor_id IS NULL);

-- ===== PHASE 3: Mentor chat =====
CREATE TABLE public.mentor_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  survivor_id UUID REFERENCES public.survivors(id) ON DELETE SET NULL,
  title TEXT NOT NULL DEFAULT 'New conversation',
  safety_flagged BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX mentor_threads_user_id_idx ON public.mentor_threads(user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.mentor_threads TO authenticated;
GRANT ALL ON public.mentor_threads TO service_role;
ALTER TABLE public.mentor_threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users manage own threads" ON public.mentor_threads FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "admins read flagged threads" ON public.mentor_threads FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()) AND safety_flagged = true);

CREATE TABLE public.mentor_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.mentor_threads(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  parts JSONB NOT NULL DEFAULT '[]'::jsonb,
  safety_flagged BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX mentor_messages_thread_id_idx ON public.mentor_messages(thread_id);

GRANT SELECT, INSERT ON public.mentor_messages TO authenticated;
GRANT ALL ON public.mentor_messages TO service_role;
ALTER TABLE public.mentor_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own thread messages" ON public.mentor_messages FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.mentor_threads t WHERE t.id = thread_id AND t.user_id = auth.uid()));
CREATE POLICY "users insert own thread messages" ON public.mentor_messages FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.mentor_threads t WHERE t.id = thread_id AND t.user_id = auth.uid()));
CREATE POLICY "admins read flagged messages" ON public.mentor_messages FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()) AND safety_flagged = true);

CREATE TRIGGER mentor_threads_updated_at BEFORE UPDATE ON public.mentor_threads
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ===== PHASE 4: Recruiters =====
CREATE TABLE public.recruiters (
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

CREATE POLICY "recruiters read own profile" ON public.recruiters FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "recruiters insert own profile" ON public.recruiters FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "recruiters update own pending profile" ON public.recruiters FOR UPDATE TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "admins manage recruiters" ON public.recruiters FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()));

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
CREATE TABLE public.introduction_requests (
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
CREATE INDEX intro_requests_ngo_id_idx ON public.introduction_requests(ngo_id);
CREATE INDEX intro_requests_recruiter_id_idx ON public.introduction_requests(recruiter_id);

GRANT SELECT, INSERT, UPDATE ON public.introduction_requests TO authenticated;
GRANT ALL ON public.introduction_requests TO service_role;
ALTER TABLE public.introduction_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "recruiters manage own intro requests" ON public.introduction_requests FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.recruiters r WHERE r.id = recruiter_id AND r.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.recruiters r WHERE r.id = recruiter_id AND r.user_id = auth.uid()));
CREATE POLICY "ngo read intro requests" ON public.introduction_requests FOR SELECT TO authenticated
  USING (public.owns_approved_ngo(auth.uid(), ngo_id));
CREATE POLICY "ngo respond intro requests" ON public.introduction_requests FOR UPDATE TO authenticated
  USING (public.owns_approved_ngo(auth.uid(), ngo_id));
CREATE POLICY "admins read all intro requests" ON public.introduction_requests FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

-- ===== PHASE 6: Jobs =====
CREATE TABLE public.jobs (
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
CREATE INDEX jobs_status_idx ON public.jobs(status);
CREATE INDEX jobs_recruiter_id_idx ON public.jobs(recruiter_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.jobs TO authenticated;
GRANT ALL ON public.jobs TO service_role;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "recruiters manage own jobs" ON public.jobs FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.recruiters r WHERE r.id = recruiter_id AND r.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.recruiters r WHERE r.id = recruiter_id AND r.user_id = auth.uid()));
CREATE POLICY "authenticated read published jobs" ON public.jobs FOR SELECT TO authenticated
  USING (status = 'published');
CREATE POLICY "admins read all jobs" ON public.jobs FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE TRIGGER jobs_updated_at BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- FK for intro requests -> jobs (deferred because jobs created after)
ALTER TABLE public.introduction_requests
  ADD CONSTRAINT introduction_requests_job_id_fkey
  FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE SET NULL;

CREATE TABLE public.job_applications (
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
CREATE INDEX job_applications_job_id_idx ON public.job_applications(job_id);
CREATE INDEX job_applications_ngo_id_idx ON public.job_applications(ngo_id);

GRANT SELECT, INSERT, UPDATE ON public.job_applications TO authenticated;
GRANT ALL ON public.job_applications TO service_role;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ngo manage applications" ON public.job_applications FOR ALL TO authenticated
  USING (public.owns_approved_ngo(auth.uid(), ngo_id))
  WITH CHECK (public.owns_approved_ngo(auth.uid(), ngo_id));
CREATE POLICY "recruiters read job applications" ON public.job_applications FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.jobs j JOIN public.recruiters r ON r.id = j.recruiter_id
    WHERE j.id = job_id AND r.user_id = auth.uid()
  ));
CREATE POLICY "recruiters update application status" ON public.job_applications FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.jobs j JOIN public.recruiters r ON r.id = j.recruiter_id
    WHERE j.id = job_id AND r.user_id = auth.uid()
  ));
CREATE POLICY "admins read all applications" ON public.job_applications FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE TRIGGER job_applications_updated_at BEFORE UPDATE ON public.job_applications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ===== PHASE 5: Match scores =====
CREATE TABLE public.match_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survivor_id UUID NOT NULL REFERENCES public.survivors(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  score NUMERIC(5,4) NOT NULL,
  breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
  summary TEXT,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (survivor_id, job_id)
);
CREATE INDEX match_scores_job_id_idx ON public.match_scores(job_id);
CREATE INDEX match_scores_survivor_id_idx ON public.match_scores(survivor_id);

GRANT SELECT ON public.match_scores TO authenticated;
GRANT ALL ON public.match_scores TO service_role;
ALTER TABLE public.match_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "recruiters read match scores for own jobs" ON public.match_scores FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.jobs j JOIN public.recruiters r ON r.id = j.recruiter_id
    WHERE j.id = job_id AND r.user_id = auth.uid()
  ));
CREATE POLICY "ngo read match scores for own survivors" ON public.match_scores FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.survivors s
    WHERE s.id = survivor_id AND public.owns_approved_ngo(auth.uid(), s.ngo_id)
  ));
CREATE POLICY "admins read all match scores" ON public.match_scores FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

-- ===== PHASE 8: Notifications =====
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind public.notification_kind NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX notifications_user_id_idx ON public.notifications(user_id);
CREATE INDEX notifications_unread_idx ON public.notifications(user_id) WHERE read_at IS NULL;

GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own notifications" ON public.notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "users mark own notifications read" ON public.notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE TABLE public.notification_preferences (
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

CREATE POLICY "users manage own notification prefs" ON public.notification_preferences FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Rate limiting table
CREATE TABLE public.rate_limits (
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
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

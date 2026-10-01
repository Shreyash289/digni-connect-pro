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

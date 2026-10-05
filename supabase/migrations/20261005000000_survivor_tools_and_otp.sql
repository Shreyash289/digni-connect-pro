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

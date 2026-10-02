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

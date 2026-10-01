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

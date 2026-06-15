
-- ===== ENUMS =====
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'ngo_partner', 'survivor', 'recruiter');
CREATE TYPE public.ngo_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
CREATE TYPE public.survivor_status AS ENUM ('draft', 'submitted', 'under_review', 'approved', 'rejected');

-- ===== PROFILES =====
CREATE TABLE public.profiles (
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

CREATE POLICY "users read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- ===== USER ROLES =====
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

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

CREATE POLICY "admins read all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));

-- ===== NGOs =====
CREATE TABLE public.ngos (
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

CREATE POLICY "owners read own ngo" ON public.ngos FOR SELECT TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "owners insert own ngo" ON public.ngos FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "owners update own ngo when not approved" ON public.ngos FOR UPDATE TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "admins read all ngos" ON public.ngos FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "admins update all ngos" ON public.ngos FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));

-- ===== SURVIVORS =====
CREATE TABLE public.survivors (
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
CREATE INDEX survivors_ngo_id_idx ON public.survivors(ngo_id);
CREATE INDEX survivors_status_idx ON public.survivors(status);
CREATE UNIQUE INDEX survivors_anonymous_id_idx ON public.survivors(anonymous_id);

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

CREATE POLICY "ngo owners read own survivors" ON public.survivors FOR SELECT TO authenticated
  USING (public.owns_approved_ngo(auth.uid(), ngo_id));
CREATE POLICY "ngo owners insert survivors" ON public.survivors FOR INSERT TO authenticated
  WITH CHECK (public.owns_approved_ngo(auth.uid(), ngo_id) AND created_by = auth.uid());
CREATE POLICY "ngo owners update own survivors" ON public.survivors FOR UPDATE TO authenticated
  USING (public.owns_approved_ngo(auth.uid(), ngo_id));
CREATE POLICY "ngo owners delete own survivors" ON public.survivors FOR DELETE TO authenticated
  USING (public.owns_approved_ngo(auth.uid(), ngo_id));
CREATE POLICY "admins read all survivors" ON public.survivors FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "admins update all survivors" ON public.survivors FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));

-- ===== SURVIVOR DOCUMENTS =====
CREATE TABLE public.survivor_documents (
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
CREATE INDEX survivor_documents_survivor_id_idx ON public.survivor_documents(survivor_id);
GRANT SELECT, INSERT, DELETE ON public.survivor_documents TO authenticated;
GRANT ALL ON public.survivor_documents TO service_role;
ALTER TABLE public.survivor_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ngo owners read survivor documents" ON public.survivor_documents FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.survivors s WHERE s.id = survivor_id AND public.owns_approved_ngo(auth.uid(), s.ngo_id)));
CREATE POLICY "ngo owners insert survivor documents" ON public.survivor_documents FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.survivors s WHERE s.id = survivor_id AND public.owns_approved_ngo(auth.uid(), s.ngo_id)) AND uploaded_by = auth.uid());
CREATE POLICY "ngo owners delete survivor documents" ON public.survivor_documents FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.survivors s WHERE s.id = survivor_id AND public.owns_approved_ngo(auth.uid(), s.ngo_id)));
CREATE POLICY "admins read all documents" ON public.survivor_documents FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));

-- ===== AUDIT LOGS =====
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX audit_logs_entity_idx ON public.audit_logs(entity_type, entity_id);
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins read audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));

-- ===== TRIGGERS =====
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER ngos_updated_at BEFORE UPDATE ON public.ngos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


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

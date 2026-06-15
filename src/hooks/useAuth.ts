import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "super_admin" | "admin" | "ngo_partner" | "survivor" | "recruiter";

export interface AuthState {
  user: User | null;
  session: Session | null;
  roles: AppRole[];
  loading: boolean;
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    roles: [],
    loading: true,
  });

  useEffect(() => {
    let mounted = true;

    async function loadRoles(userId: string): Promise<AppRole[]> {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);
      return (data ?? []).map((r) => r.role as AppRole);
    }

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (!session) {
        setState({ user: null, session: null, roles: [], loading: false });
        return;
      }
      setState((s) => ({ ...s, user: session.user, session, loading: true }));
      // Defer the roles query to avoid deadlocking inside the auth callback.
      setTimeout(async () => {
        const roles = await loadRoles(session.user.id);
        if (mounted) setState({ user: session.user, session, roles, loading: false });
      }, 0);
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      if (!session) {
        setState({ user: null, session: null, roles: [], loading: false });
        return;
      }
      const roles = await loadRoles(session.user.id);
      if (mounted) setState({ user: session.user, session, roles, loading: false });
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}

export function primaryRole(roles: AppRole[]): AppRole | null {
  const order: AppRole[] = ["super_admin", "admin", "ngo_partner", "recruiter", "survivor"];
  for (const r of order) if (roles.includes(r)) return r;
  return null;
}

export function dashboardPathFor(roles: AppRole[]): string {
  const p = primaryRole(roles);
  if (p === "super_admin" || p === "admin") return "/admin";
  if (p === "ngo_partner") return "/ngo";
  return "/onboarding";
}

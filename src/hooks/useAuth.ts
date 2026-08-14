import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "super_admin" | "admin" | "ngo_partner" | "survivor" | "recruiter";

export interface AuthState {
  user: User | null;
  session: Session | null;
  roles: AppRole[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

export function useAuth(): AuthState {
  const [state, setState] = useState<Omit<AuthState, "reload">>({
    user: null,
    session: null,
    roles: [],
    loading: true,
    error: null,
  });

  async function loadRoles(userId: string): Promise<AppRole[]> {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    if (error) {
      throw error;
    }

    return (data ?? []).map((r) => r.role as AppRole);
  }

  async function handleSession(session: Session | null) {
    if (!session) {
      setState({ user: null, session: null, roles: [], loading: false, error: null });
      return;
    }

    setState((s) => ({ ...s, user: session.user, session, loading: true, error: null }));
    try {
      const roles = await loadRoles(session.user.id);
      setState({ user: session.user, session, roles, loading: false, error: null });
    } catch (error) {
      console.error(error);
      setState({
        user: session.user,
        session,
        roles: [],
        loading: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async function reload() {
    const { data: { session } } = await supabase.auth.getSession();
    await handleSession(session);
  }

  useEffect(() => {
    let mounted = true;

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (!session) {
        setState({ user: null, session: null, roles: [], loading: false, error: null });
        return;
      }
      void handleSession(session);
    });

    void supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      await handleSession(session);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return {
    ...state,
    reload,
  };
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
  if (p === "recruiter") return "/recruiter";
  if (p === "survivor") return "/survivor/dashboard";
  return "/onboarding";
}

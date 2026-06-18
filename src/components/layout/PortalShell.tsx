import { Outlet, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, dashboardPathFor, type AppRole } from "@/hooks/useAuth";
import { Logo } from "@/components/brand/Logo";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { Button } from "@/components/ui/button";

interface PortalShellProps {
  title: string;
  nav: { to: string; label: string }[];
  allow: AppRole[];
  children?: ReactNode;
}

export function PortalShell({ title, nav, allow, children }: PortalShellProps) {
  const { user, roles, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/auth" });
      return;
    }
    if (roles.length === 0) {
      navigate({ to: "/onboarding" });
      return;
    }
    if (!roles.some((r) => allow.includes(r))) {
      navigate({ to: dashboardPathFor(roles) });
    }
  }, [user, roles, loading, navigate, allow]);

  if (loading || !user || roles.length === 0) {
    return <div className="grid min-h-screen place-items-center text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col gap-1 border-r border-border bg-sidebar p-4 text-sidebar-foreground lg:flex">
        <Link to="/" className="px-2 py-3">
          <Logo className="h-8 w-auto brightness-0 invert" />
        </Link>
        <p className="mt-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60">{title}</p>
        <nav className="mt-1 flex flex-col gap-0.5">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="rounded-lg px-3 py-2 text-sm text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground [&.active]:bg-sidebar-accent [&.active]:text-sidebar-accent-foreground"
              activeProps={{ className: "active" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto border-t border-sidebar-border pt-3">
          <div className="flex items-center justify-between px-3 py-1">
            <span className="text-xs text-sidebar-foreground/70 truncate">{user.email}</span>
            <NotificationBell />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/" });
            }}
            className="w-full justify-start gap-2 text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <LogOut className="size-4" /> Sign out
          </Button>
        </div>
      </aside>

      <div className="lg:pl-60">
        <header className="border-b border-border bg-background px-4 py-3 lg:hidden">
          <div className="flex items-center justify-between">
            <Logo className="h-7 w-auto" />
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate({ to: "/" });
              }}
            >
              <LogOut className="size-4" />
            </Button>
          </div>
          <nav className="mt-3 flex gap-2 overflow-x-auto">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="whitespace-nowrap rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground [&.active]:bg-primary [&.active]:text-primary-foreground"
                activeProps={{ className: "active" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  );
}

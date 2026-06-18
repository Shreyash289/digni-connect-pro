import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { PortalShell } from "@/components/layout/PortalShell";
import { StatusBadge } from "./ngo.dashboard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const RECRUITER_NAV = [
  { to: "/recruiter/search", label: "Search" },
  { to: "/recruiter/jobs", label: "Jobs" },
  { to: "/recruiter/requests", label: "Requests" },
  { to: "/recruiter/analytics", label: "Analytics" },
];

export const Route = createFileRoute("/recruiter/requests")({
  head: () => ({ meta: [{ title: "Introduction requests · CAREVIA" }] }),
  component: RecruiterRequests,
});

function RecruiterRequests() {
  return (
    <PortalShell title="Recruiter Portal" nav={RECRUITER_NAV} allow={["recruiter", "admin", "super_admin"]}>
      <Inner />
    </PortalShell>
  );
}

function Inner() {
  const { user } = useAuth();

  const { data: recruiter } = useQuery({
    queryKey: ["recruiter-profile"],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("recruiters").select("id").eq("user_id", user!.id).single();
      return data;
    },
  });

  const { data: requests, isLoading } = useQuery({
    queryKey: ["recruiter-requests", recruiter?.id],
    enabled: !!recruiter,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("introduction_requests")
        .select("*, survivors(anonymous_id)")
        .eq("recruiter_id", recruiter!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-primary">Introduction requests</h1>
      {isLoading ? (
        <Loader2 className="size-6 animate-spin" />
      ) : !requests?.length ? (
        <p className="text-sm text-muted-foreground">No requests yet.</p>
      ) : (
        <div className="divide-y divide-border rounded-2xl border border-border bg-card">
          {requests.map((r) => (
            <div key={r.id} className="flex items-start justify-between gap-4 p-4">
              <div>
                <p className="font-medium">{(r.survivors as { anonymous_id: string })?.anonymous_id}</p>
                <p className="mt-1 text-sm text-muted-foreground">{r.message}</p>
                <p className="mt-1 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</p>
              </div>
              <StatusBadge status={r.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

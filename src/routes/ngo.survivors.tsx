import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Users, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PortalShell } from "@/components/layout/PortalShell";
import { StatusBadge } from "./ngo.dashboard";

const NGO_NAV = [
  { to: "/ngo/dashboard", label: "Dashboard" },
  { to: "/ngo/survivors", label: "Survivors" },
  { to: "/ngo/organization", label: "Organization" },
];

export const Route = createFileRoute("/ngo/survivors")({
  head: () => ({ meta: [{ title: "Survivors · CAREVIA" }] }),
  component: NgoSurvivors,
});

function NgoSurvivors() {
  return (
    <PortalShell title="NGO Portal" nav={NGO_NAV} allow={["ngo_partner", "admin", "super_admin"]}>
      <Inner />
    </PortalShell>
  );
}

function Inner() {
  const { user } = useAuth();

  const { data: ngo } = useQuery({
    queryKey: ["my-ngo", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("ngos").select("*").eq("owner_id", user!.id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: survivors, isLoading } = useQuery({
    queryKey: ["my-survivors", ngo?.id],
    enabled: !!ngo && ngo.status === "approved",
    queryFn: async () => {
      const { data, error } = await supabase
        .from("survivors")
        .select("id, anonymous_id, full_name, status, profile_completion, city, state, created_at")
        .eq("ngo_id", ngo!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  if (!ngo || ngo.status !== "approved") {
    return (
      <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
        Your NGO must be approved before you can view survivors.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-primary">Survivors</h1>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {isLoading ? (
          <div className="grid place-items-center py-16"><Loader2 className="size-5 animate-spin text-muted-foreground" /></div>
        ) : !survivors || survivors.length === 0 ? (
          <div className="grid place-items-center py-16 text-center">
            <Users className="mb-2 size-7 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No survivors added yet.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Progress</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {survivors.map((s) => (
                <tr key={s.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{s.full_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.anonymous_id}</td>
                  <td className="px-4 py-3 text-muted-foreground">{[s.city, s.state].filter(Boolean).join(", ") || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                        <div className="h-full bg-accent" style={{ width: `${s.profile_completion}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground">{s.profile_completion}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

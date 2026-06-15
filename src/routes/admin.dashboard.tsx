import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Users, Building2, Clock, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PortalShell } from "@/components/layout/PortalShell";

const ADMIN_NAV = [
  { to: "/admin/dashboard", label: "Overview" },
  { to: "/admin/ngos", label: "NGO approvals" },
];

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({ meta: [{ title: "Admin · CAREVIA" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  return (
    <PortalShell title="Admin" nav={ADMIN_NAV} allow={["admin", "super_admin"]}>
      <Inner />
    </PortalShell>
  );
}

function Inner() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: async () => {
      const [ngos, survivors] = await Promise.all([
        supabase.from("ngos").select("id,status", { count: "exact" }),
        supabase.from("survivors").select("id", { count: "exact", head: true }),
      ]);
      const all = ngos.data ?? [];
      return {
        ngoTotal: all.length,
        ngoPending: all.filter((n) => n.status === "pending").length,
        ngoApproved: all.filter((n) => n.status === "approved").length,
        survivorTotal: survivors.count ?? 0,
      };
    },
  });

  if (isLoading || !data) {
    return <div className="grid place-items-center py-24"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>;
  }

  const cards = [
    { label: "Total NGOs", value: data.ngoTotal, icon: Building2 },
    { label: "Pending approval", value: data.ngoPending, icon: Clock, tone: "warning" as const },
    { label: "Approved NGOs", value: data.ngoApproved, icon: CheckCircle2, tone: "success" as const },
    { label: "Survivors on platform", value: data.survivorTotal, icon: Users },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-bold text-primary">Platform overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">High-level metrics across CAREVIA.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{c.label}</p>
              <c.icon
                className={`size-4 ${
                  c.tone === "success" ? "text-success" : c.tone === "warning" ? "text-warning-foreground" : "text-accent"
                }`}
              />
            </div>
            <p className="mt-3 font-display text-3xl font-bold text-primary">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center text-sm text-muted-foreground">
        Recruiter portal, AI mentor, job board, and analytics are coming in the next phases.
      </div>
    </div>
  );
}

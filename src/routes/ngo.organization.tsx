import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PortalShell } from "@/components/layout/PortalShell";
import { StatusBadge } from "./ngo.dashboard";

const NGO_NAV = [
  { to: "/ngo/dashboard", label: "Dashboard" },
  { to: "/ngo/survivors", label: "Survivors" },
  { to: "/ngo/organization", label: "Organization" },
];

export const Route = createFileRoute("/ngo/organization")({
  head: () => ({ meta: [{ title: "Organization · CAREVIA" }] }),
  component: Org,
});

function Org() {
  return (
    <PortalShell title="NGO Portal" nav={NGO_NAV} allow={["ngo_partner", "admin", "super_admin"]}>
      <Inner />
    </PortalShell>
  );
}

function Inner() {
  const { user } = useAuth();
  const { data: ngo, isLoading } = useQuery({
    queryKey: ["my-ngo", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("ngos").select("*").eq("owner_id", user!.id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <div className="text-sm text-muted-foreground">Loading…</div>;
  if (!ngo) return <div className="text-sm text-muted-foreground">No NGO registered.</div>;

  const rows: [string, string | null | undefined][] = [
    ["Name", ngo.name],
    ["Registration number", ngo.registration_number],
    ["Contact email", ngo.contact_email],
    ["Contact phone", ngo.contact_phone],
    ["City", ngo.city],
    ["State", ngo.state],
    ["Country", ngo.country],
    ["About", ngo.description],
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-primary">{ngo.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Organization profile</p>
        </div>
        <StatusBadge status={ngo.status} />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <dl className="divide-y divide-border">
          {rows.map(([k, v]) => (
            <div key={k} className="grid grid-cols-[180px_1fr] gap-4 px-5 py-3 text-sm">
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="text-foreground">{v || "—"}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

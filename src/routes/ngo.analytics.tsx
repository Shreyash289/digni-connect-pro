import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { PortalShell } from "@/components/layout/PortalShell";
import { getNgoAnalytics } from "@/lib/analytics.functions";

const NGO_NAV = [
  { to: "/ngo/dashboard", label: "Dashboard" },
  { to: "/ngo/survivors", label: "Survivors" },
  { to: "/ngo/requests", label: "Intro requests" },
  { to: "/ngo/analytics", label: "Analytics" },
  { to: "/ngo/organization", label: "Organization" },
];

export const Route = createFileRoute("/ngo/analytics")({
  head: () => ({ meta: [{ title: "Analytics · CAREVIA" }] }),
  component: NgoAnalytics,
});

function NgoAnalytics() {
  return (
    <PortalShell title="NGO Portal" nav={NGO_NAV} allow={["ngo_partner", "admin", "super_admin"]}>
      <Inner />
    </PortalShell>
  );
}

function Inner() {
  const { data, isLoading } = useQuery({
    queryKey: ["ngo-analytics"],
    queryFn: () => getNgoAnalytics(),
  });

  if (isLoading) return <Loader2 className="size-6 animate-spin" />;

  const metrics = [
    { label: "Survivors managed", value: data?.survivorsManaged },
    { label: "Avg profile completion", value: `${data?.avgProfileCompletion ?? 0}%` },
    { label: "Intros received", value: data?.introsReceived },
    { label: "Intros accepted", value: data?.introsAccepted },
    { label: "Applications submitted", value: data?.applicationsSubmitted },
    { label: "Hires", value: data?.hires },
    { label: "Mentor sessions", value: data?.mentorSessions },
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-primary">NGO analytics</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-2xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">{m.label}</p>
            <p className="mt-2 font-display text-3xl font-bold text-primary">{m.value ?? 0}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { PortalShell } from "@/components/layout/PortalShell";
import { getRecruiterAnalytics } from "@/lib/analytics.functions";

const RECRUITER_NAV = [
  { to: "/recruiter/search", label: "Search" },
  { to: "/recruiter/jobs", label: "Jobs" },
  { to: "/recruiter/requests", label: "Requests" },
  { to: "/recruiter/analytics", label: "Analytics" },
];

export const Route = createFileRoute("/recruiter/analytics")({
  head: () => ({ meta: [{ title: "Analytics · CAREVIA" }] }),
  component: RecruiterAnalytics,
});

function RecruiterAnalytics() {
  return (
    <PortalShell title="Recruiter Portal" nav={RECRUITER_NAV} allow={["recruiter", "admin", "super_admin"]}>
      <Inner />
    </PortalShell>
  );
}

function Inner() {
  const { data, isLoading } = useQuery({
    queryKey: ["recruiter-analytics"],
    queryFn: () => getRecruiterAnalytics(),
  });

  if (isLoading) return <Loader2 className="size-6 animate-spin" />;

  const metrics = [
    { label: "Active jobs", value: data?.activeJobs },
    { label: "Intros sent", value: data?.introsSent },
    { label: "Intros accepted", value: data?.introsAccepted },
    { label: "Applications received", value: data?.applicationsReceived },
    { label: "Hires", value: data?.hires },
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-primary">Recruiter analytics</h1>
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

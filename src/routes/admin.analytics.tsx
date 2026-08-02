import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Download } from "lucide-react";
import { PortalShell } from "@/components/layout/PortalShell";
import { Button } from "@/components/ui/button";
import { getAdminAnalytics, exportAdminCsv } from "@/lib/analytics.functions";

const ADMIN_NAV = [
  { to: "/admin/dashboard", label: "Overview" },
  { to: "/admin/ngos", label: "NGO approvals" },
  { to: "/admin/recruiters", label: "Recruiters" },
  { to: "/admin/requests", label: "Requests" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/analytics", label: "Analytics" },
];

export const Route = createFileRoute("/admin/analytics")({
  head: () => ({ meta: [{ title: "Analytics · CAREVIA" }] }),
  component: AdminAnalytics,
});

function AdminAnalytics() {
  return (
    <PortalShell title="Admin" nav={ADMIN_NAV} allow={["admin", "super_admin"]}>
      <Inner />
    </PortalShell>
  );
}

function Inner() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: () => getAdminAnalytics(),
  });

  async function downloadCsv() {
    const { csv } = await exportAdminCsv();
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "carevia-survivors.csv";
    a.click();
  }

  if (isLoading) return <Loader2 className="size-6 animate-spin" />;

  const metrics = [
    { label: "Total survivors", value: data?.totalSurvivors },
    { label: "Active NGOs", value: data?.activeNgos },
    { label: "Pending NGO approvals", value: data?.pendingNgoApprovals },
    { label: "Pending recruiter approvals", value: data?.pendingRecruiterApprovals },
    { label: "Introductions sent", value: data?.introductionsSent },
    { label: "Introductions accepted", value: data?.introductionsAccepted },
    { label: "Jobs posted", value: data?.jobsPosted },
    { label: "Jobs published", value: data?.jobsPublished },
    { label: "Applications", value: data?.applicationsSubmitted },
    { label: "Hires", value: data?.hires },
    { label: "Safety-flagged messages", value: data?.safetyFlaggedMessages },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-primary">Platform analytics</h1>
        <Button variant="outline" className="gap-2" onClick={downloadCsv}>
          <Download className="size-4" /> Export CSV
        </Button>
      </div>
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

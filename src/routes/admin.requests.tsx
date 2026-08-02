import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { PortalShell } from "@/components/layout/PortalShell";
import { getAdminIntroRequests } from "@/lib/admin.functions";
import { StatusBadge } from "./ngo.dashboard";

const ADMIN_NAV = [
  { to: "/admin/dashboard", label: "Overview" },
  { to: "/admin/ngos", label: "NGO approvals" },
  { to: "/admin/recruiters", label: "Recruiters" },
  { to: "/admin/requests", label: "Requests" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/analytics", label: "Analytics" },
];

export const Route = createFileRoute("/admin/requests")({
  head: () => ({ meta: [{ title: "Requests · CAREVIA" }] }),
  component: AdminRequests,
});

function AdminRequests() {
  return (
    <PortalShell title="Admin" nav={ADMIN_NAV} allow={["admin", "super_admin"]}>
      <Inner />
    </PortalShell>
  );
}

function Inner() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-requests"],
    queryFn: () => getAdminIntroRequests(),
  });

  if (isLoading) {
    return <div className="grid place-items-center py-24"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold text-primary">Introduction requests</h1>
        <p className="mt-1 text-sm text-muted-foreground">Review every recruiter introduction request on the platform.</p>
      </header>

      {!data?.length ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
          No introduction requests found.
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((request: any) => (
            <div key={request.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-foreground">
                    {request.survivors?.full_name ?? "Unknown survivor"} · {request.survivors?.anonymous_id ?? request.survivor_id}
                  </p>
                  <p className="text-sm text-muted-foreground">Recruiter: {request.recruiters?.company_name ?? "Unknown"}</p>
                </div>
                <StatusBadge status={request.status} />
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">NGO</p>
                  <p className="text-sm text-foreground">{request.ngos?.name ?? "Unknown NGO"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Job</p>
                  <p className="text-sm text-foreground">{request.job_id ? request.job_id : "No job selected"}</p>
                </div>
              </div>
              <div className="mt-4 text-sm text-foreground">{request.message}</div>
              {request.response_note && (
                <div className="mt-3 rounded-2xl border border-border bg-muted p-4 text-sm text-muted-foreground">
                  <p className="font-medium">NGO response note</p>
                  <p>{request.response_note}</p>
                </div>
              )}
              <p className="mt-3 text-xs text-muted-foreground">Submitted {new Date(request.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Loader2,
  Briefcase,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { PortalShell } from "@/components/layout/PortalShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSurvivorApplications } from "@/lib/survivor.portal.functions";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/survivor/applications")({
  head: () => ({ meta: [{ title: "My Applications · CAREVIA" }] }),
  component: SurvivorApplications,
});

const SURVIVOR_NAV = [
  { to: "/survivor/dashboard", label: "Dashboard" },
  { to: "/survivor/profile", label: "My Profile" },
  { to: "/survivor/applications", label: "My Applications" },
  { to: "/mentor", label: "AI Mentor" },
  { to: "/mentor/resume", label: "Resume" },
  { to: "/mentor/builder", label: "Resume Builder" },
];

function SurvivorApplications() {
  return (
    <PortalShell
      title="Survivor Portal"
      nav={SURVIVOR_NAV}
      allow={["survivor", "admin", "super_admin"]}
    >
      <ApplicationsInner />
    </PortalShell>
  );
}

// Application status presentation config
// These values come from the real DB enum: submitted | reviewing | shortlisted | rejected | hired
const statusConfig: Record<
  string,
  { label: string; icon: typeof CheckCircle2; colorClass: string }
> = {
  submitted: {
    label: "Submitted",
    icon: Clock,
    colorClass: "text-muted-foreground bg-muted border-border",
  },
  reviewing: {
    label: "Under review",
    icon: AlertCircle,
    colorClass: "text-warning bg-warning/10 border-warning/20",
  },
  shortlisted: {
    label: "Shortlisted",
    icon: CheckCircle2,
    colorClass: "text-success bg-success/10 border-success/20",
  },
  rejected: {
    label: "Not selected",
    icon: XCircle,
    colorClass: "text-destructive bg-destructive/10 border-destructive/20",
  },
  hired: {
    label: "Hired 🎉",
    icon: CheckCircle2,
    colorClass: "text-success bg-success/10 border-success/30",
  },
};

function ApplicationStatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] ?? statusConfig.submitted;
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${cfg.colorClass}`}
    >
      <Icon className="size-3" />
      {cfg.label}
    </span>
  );
}

function ApplicationsInner() {
  const { user } = useAuth();

  const { data: applications, isLoading, error } = useQuery({
    queryKey: ["survivor-applications", user?.id],
    queryFn: () => getSurvivorApplications(),
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="grid place-items-center py-24">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center">
        <AlertCircle className="mx-auto size-8 text-destructive" />
        <p className="mt-3 font-semibold text-foreground">Could not load applications.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "Unknown error. Try refreshing."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-primary">My Applications</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {applications?.length === 0
              ? "No applications yet."
              : `${applications?.length} application${applications?.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Link to="/jobs">
          <Button size="sm" className="gap-1.5">
            <Briefcase className="size-3.5" /> Browse jobs
          </Button>
        </Link>
      </div>

      {!applications || applications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <Briefcase className="mx-auto size-10 text-muted-foreground" />
          <h2 className="mt-4 font-semibold text-foreground">No applications yet</h2>
          <p className="mt-2 max-w-sm mx-auto text-sm text-muted-foreground">
            Browse open jobs on the CAREVIA job board. Your NGO can also apply on your behalf.
          </p>
          <Link to="/jobs">
            <Button className="mt-5 gap-1.5">
              Browse jobs <ArrowRight className="size-3.5" />
            </Button>
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {applications.map((app) => {
            // The supabase join returns jobs as an object or null
            const job = app.jobs as {
              id: string;
              title: string;
              company_name: string;
              employment_type: string | null;
              location_country: string | null;
              location_region: string | null;
              remote_ok: boolean | null;
            } | null;

            const location = job
              ? [job.location_region, job.location_country].filter(Boolean).join(", ")
              : null;

            return (
              <div
                key={app.id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  {job ? (
                    <>
                      <Link
                        to="/jobs/$id"
                        params={{ id: job.id }}
                        className="font-semibold text-foreground hover:text-accent transition-colors"
                      >
                        {job.title}
                      </Link>
                      <p className="mt-0.5 text-sm text-muted-foreground">{job.company_name}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {job.remote_ok && (
                          <Badge variant="secondary" className="text-xs">
                            Remote
                          </Badge>
                        )}
                        {job.employment_type && (
                          <Badge variant="outline" className="text-xs">
                            {job.employment_type.replace("_", " ")}
                          </Badge>
                        )}
                        {location && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="size-3" /> {location}
                          </span>
                        )}
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      Job details unavailable (may have been removed)
                    </p>
                  )}

                  {/* Cover note preview */}
                  {app.cover_note && (
                    <p className="mt-2 line-clamp-2 text-xs text-muted-foreground italic">
                      "{app.cover_note}"
                    </p>
                  )}

                  <p className="mt-2 text-xs text-muted-foreground">
                    Applied {new Date(app.created_at as string).toLocaleDateString()}
                    {app.updated_at !== app.created_at &&
                      ` · Updated ${new Date(app.updated_at as string).toLocaleDateString()}`}
                  </p>
                </div>

                <div className="shrink-0">
                  <ApplicationStatusBadge status={app.status as string} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

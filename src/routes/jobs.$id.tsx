import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  Loader2,
  MapPin,
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  Send,
  Building2,
  Clock,
  AlertCircle,
  XCircle,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import {
  getPublishedJob,
  applyToJob,
  checkMyJobApplication,
} from "@/lib/jobs.functions";
import { Logo } from "@/components/brand/Logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/jobs/$id")({
  head: () => ({
    meta: [
      { title: "Job · CAREVIA" },
      { name: "description", content: "View job details on CAREVIA" },
      { property: "og:title", content: "Job · CAREVIA" },
    ],
  }),
  component: JobDetail,
});

const statusBadgeConfig: Record<
  string,
  { label: string; icon: typeof CheckCircle2; colorClass: string }
> = {
  submitted: {
    label: "Application Submitted",
    icon: Clock,
    colorClass: "text-muted-foreground bg-muted border-border",
  },
  reviewing: {
    label: "Under Review",
    icon: AlertCircle,
    colorClass: "text-warning bg-warning/10 border-warning/20",
  },
  shortlisted: {
    label: "Shortlisted 🎉",
    icon: CheckCircle2,
    colorClass: "text-success bg-success/10 border-success/20",
  },
  rejected: {
    label: "Not Selected",
    icon: XCircle,
    colorClass: "text-destructive bg-destructive/10 border-destructive/20",
  },
  hired: {
    label: "Hired 🎉",
    icon: CheckCircle2,
    colorClass: "text-success bg-success/10 border-success/30",
  },
};

function JobDetail() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [coverNote, setCoverNote] = useState("");

  const { data: job, isLoading, error } = useQuery({
    queryKey: ["job", id],
    queryFn: () => getPublishedJob({ data: { id } }),
  });

  const { data: appStatus } = useQuery({
    queryKey: ["my-job-application", id, user?.id],
    queryFn: () => checkMyJobApplication({ data: { jobId: id } }),
    enabled: !!user,
  });

  const applyMutation = useMutation({
    mutationFn: () =>
      applyToJob({
        data: {
          jobId: id,
          coverNote: coverNote.trim() || undefined,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-job-application", id] });
      queryClient.invalidateQueries({ queryKey: ["survivor-applications"] });
      queryClient.invalidateQueries({ queryKey: ["survivor-portal"] });
      setApplyDialogOpen(false);
      setCoverNote("");
      toast.success("Application submitted successfully!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to submit application.");
    },
  });

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    applyMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
          <Link to="/">
            <Logo className="h-8 w-auto" />
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/jobs">
              <Button variant="ghost" size="sm" className="gap-1">
                <ArrowLeft className="size-4" /> All jobs
              </Button>
            </Link>
            {user ? (
              <Link to="/survivor/dashboard">
                <Button variant="outline" size="sm">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button size="sm">Sign in</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-12">
        {isLoading ? (
          <div className="grid place-items-center py-24">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : error || !job ? (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <Briefcase className="mx-auto size-10 text-muted-foreground" />
            <h1 className="mt-4 font-semibold text-foreground">Job Not Available</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              This job may have been closed or removed by the hiring company.
            </p>
            <Link to="/jobs">
              <Button className="mt-4">Back to Job Board</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Top Card */}
            <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <h1 className="font-display text-3xl font-bold text-primary">
                    {job.title}
                  </h1>
                  <p className="flex items-center gap-1.5 text-lg font-medium text-muted-foreground">
                    <Building2 className="size-5" /> {job.company_name}
                  </p>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {job.remote_ok && <Badge variant="secondary">Remote OK</Badge>}
                    {job.employment_type && (
                      <Badge variant="outline">
                        {job.employment_type.replace("_", " ")}
                      </Badge>
                    )}
                    {(job.required_skills ?? []).map((s: string) => (
                      <Badge key={s} variant="secondary">
                        {s}
                      </Badge>
                    ))}
                  </div>

                  {(job.location_country || job.location_region) && (
                    <p className="flex items-center gap-1 text-sm text-muted-foreground pt-1">
                      <MapPin className="size-4" />{" "}
                      {[job.location_region, job.location_country]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  )}

                  {(job.salary_min || job.salary_max) && (
                    <p className="text-sm font-semibold text-primary pt-1">
                      {job.salary_min && job.salary_max
                        ? `${job.currency ?? "INR"} ${job.salary_min.toLocaleString()} – ${job.salary_max.toLocaleString()}`
                        : job.salary_min
                          ? `From ${job.currency ?? "INR"} ${job.salary_min.toLocaleString()}`
                          : `Up to ${job.currency ?? "INR"} ${job.salary_max?.toLocaleString()}`}
                    </p>
                  )}
                </div>

                {/* Application action panel */}
                <div className="shrink-0 pt-2 md:pt-0">
                  {appStatus?.hasApplied ? (
                    <div className="rounded-xl border border-border bg-muted/20 p-4 text-center space-y-2">
                      <div className="flex items-center justify-center gap-1.5 text-xs font-semibold">
                        {(() => {
                          const cfg =
                            statusBadgeConfig[appStatus.application?.status as string] ??
                            statusBadgeConfig.submitted;
                          const Icon = cfg.icon;
                          return (
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 ${cfg.colorClass}`}
                            >
                              <Icon className="size-3.5" /> {cfg.label}
                            </span>
                          );
                        })()}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Applied on{" "}
                        {new Date(
                          appStatus.application?.created_at as string,
                        ).toLocaleDateString()}
                      </p>
                      <Link to="/survivor/applications">
                        <Button variant="link" size="sm" className="text-xs h-auto p-0">
                          View in My Applications →
                        </Button>
                      </Link>
                    </div>
                  ) : user ? (
                    <Button
                      size="lg"
                      onClick={() => setApplyDialogOpen(true)}
                      className="gap-2 w-full md:w-auto"
                    >
                      <Send className="size-4" /> Apply for this position
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      onClick={() =>
                        navigate({
                          to: "/auth",
                          search: { redirect: `/jobs/${id}` },
                        })
                      }
                      className="gap-2 w-full md:w-auto"
                    >
                      Sign in to apply
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Description Body */}
            <div className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-6">
              <h2 className="font-display text-xl font-bold text-primary">
                Job Description
              </h2>
              <div className="prose prose-sm max-w-none dark:prose-invert leading-relaxed">
                <ReactMarkdown>
                  {job.description || "No description provided."}
                </ReactMarkdown>
              </div>

              {(job.preferred_skills ?? []).length > 0 && (
                <div className="pt-4 border-t border-border">
                  <h3 className="text-sm font-semibold text-foreground mb-2">
                    Preferred Skills
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {job.preferred_skills?.map((s: string) => (
                      <Badge key={s} variant="outline" className="text-xs">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Application Dialog */}
      <Dialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleApply}>
            <DialogHeader>
              <DialogTitle>Apply for {job?.title}</DialogTitle>
              <DialogDescription>
                Your CAREVIA profile and resume will be shared with the recruiter at{" "}
                <span className="font-semibold text-foreground">
                  {job?.company_name}
                </span>
                .
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="cover_note">
                  Cover Note / Message to Recruiter (Optional)
                </Label>
                <Textarea
                  id="cover_note"
                  rows={4}
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  placeholder="Introduce yourself, highlight relevant experience or motivation..."
                  maxLength={2000}
                />
                <p className="text-xs text-muted-foreground">
                  Keep it brief and professional. Max 2,000 characters.
                </p>
              </div>
            </div>

            <DialogFooter className="flex gap-2 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                disabled={applyMutation.isPending}
                onClick={() => setApplyDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={applyMutation.isPending} className="gap-2">
                {applyMutation.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
                {applyMutation.isPending ? "Submitting…" : "Submit Application"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

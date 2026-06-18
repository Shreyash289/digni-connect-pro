import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Briefcase, MapPin, Loader2 } from "lucide-react";
import { listPublishedJobs } from "@/lib/jobs.functions";
import { Logo } from "@/components/brand/Logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/jobs/")({
  head: () => ({
    meta: [
      { title: "Job opportunities · CAREVIA" },
      { name: "description", content: "Browse career opportunities for survivors supported by CAREVIA partner NGOs." },
      { property: "og:title", content: "Job opportunities · CAREVIA" },
      { property: "og:description", content: "Browse career opportunities for survivors supported by CAREVIA partner NGOs." },
    ],
  }),
  component: JobsIndex,
});

function JobsIndex() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["published-jobs"],
    queryFn: () => listPublishedJobs({ data: { page: 1 } }),
  });

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <Link to="/"><Logo className="h-8 w-auto" /></Link>
          <Link to="/auth"><Button variant="outline" size="sm">Sign in</Button></Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-12">
        <h1 className="font-display text-4xl font-bold text-primary">Job opportunities</h1>
        <p className="mt-2 text-muted-foreground">Ethical hiring through CAREVIA's survivor support network.</p>

        <div className="mt-8 flex gap-2">
          <Input placeholder="Search jobs…" id="job-search" className="max-w-sm" />
          <Button onClick={() => {
            const q = (document.getElementById("job-search") as HTMLInputElement)?.value;
            refetch();
          }}>Search</Button>
        </div>

        {isLoading ? (
          <div className="grid place-items-center py-16"><Loader2 className="size-6 animate-spin" /></div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {(data?.jobs ?? []).map((job) => (
              <Link
                key={job.id}
                to="/jobs/$id"
                params={{ id: job.id }}
                className="rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-md"
              >
                <h2 className="font-semibold text-primary">{job.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{job.company_name}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {job.remote_ok && <Badge variant="secondary">Remote</Badge>}
                  <Badge variant="outline">{job.employment_type?.replace("_", " ")}</Badge>
                  {(job.required_skills ?? []).slice(0, 3).map((s: string) => (
                    <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                  ))}
                </div>
                {(job.location_country || job.location_region) && (
                  <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="size-3" /> {[job.location_region, job.location_country].filter(Boolean).join(", ")}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}

        {!isLoading && (data?.jobs ?? []).length === 0 && (
          <div className="mt-12 text-center text-muted-foreground">
            <Briefcase className="mx-auto size-8" />
            <p className="mt-2">No published jobs right now. Check back soon.</p>
          </div>
        )}
      </main>
    </div>
  );
}

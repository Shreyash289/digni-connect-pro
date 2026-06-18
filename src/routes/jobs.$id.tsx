import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2, MapPin, ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { getPublishedJob } from "@/lib/jobs.functions";
import { Logo } from "@/components/brand/Logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/jobs/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Job · CAREVIA` },
      { name: "description", content: "View job details on CAREVIA" },
      { property: "og:title", content: `Job · CAREVIA` },
    ],
  }),
  component: JobDetail,
});

function JobDetail() {
  const { id } = Route.useParams();

  const { data: job, isLoading, error } = useQuery({
    queryKey: ["job", id],
    queryFn: () => getPublishedJob({ data: { id } }),
  });

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
          <Link to="/"><Logo className="h-8 w-auto" /></Link>
          <Link to="/jobs"><Button variant="ghost" size="sm" className="gap-1"><ArrowLeft className="size-4" /> All jobs</Button></Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12">
        {isLoading ? (
          <Loader2 className="size-6 animate-spin" />
        ) : error || !job ? (
          <p className="text-muted-foreground">Job not found or no longer available.</p>
        ) : (
          <article>
            <h1 className="font-display text-3xl font-bold text-primary">{job.title}</h1>
            <p className="mt-2 text-lg text-muted-foreground">{job.company_name}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {job.remote_ok && <Badge>Remote OK</Badge>}
              <Badge variant="outline">{job.employment_type?.replace("_", " ")}</Badge>
              {(job.required_skills ?? []).map((s: string) => (
                <Badge key={s} variant="secondary">{s}</Badge>
              ))}
            </div>
            {(job.location_country || job.location_region) && (
              <p className="mt-3 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="size-4" /> {[job.location_region, job.location_country].filter(Boolean).join(", ")}
              </p>
            )}
            {(job.salary_min || job.salary_max) && (
              <p className="mt-2 text-sm text-muted-foreground">
                {job.salary_min && job.salary_max
                  ? `${job.currency} ${job.salary_min.toLocaleString()} – ${job.salary_max.toLocaleString()}`
                  : job.salary_min
                    ? `From ${job.currency} ${job.salary_min.toLocaleString()}`
                    : `Up to ${job.currency} ${job.salary_max?.toLocaleString()}`}
              </p>
            )}
            <div className="prose prose-sm mt-8 max-w-none dark:prose-invert">
              <ReactMarkdown>{job.description || "No description provided."}</ReactMarkdown>
            </div>
            <p className="mt-8 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
              To apply, contact your NGO partner or sign in to the CAREVIA platform.
            </p>
          </article>
        )}
      </main>
    </div>
  );
}

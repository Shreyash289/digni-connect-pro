import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Briefcase, MapPin, Loader2, Search } from "lucide-react";
import { listPublishedJobs } from "@/lib/jobs.functions";
import { Logo } from "@/components/brand/Logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/jobs/")({
  head: () => ({
    meta: [
      { title: "Job opportunities · CAREVIA" },
      {
        name: "description",
        content:
          "Browse career opportunities for survivors supported by CAREVIA partner NGOs.",
      },
      { property: "og:title", content: "Job opportunities · CAREVIA" },
      {
        property: "og:description",
        content:
          "Browse career opportunities for survivors supported by CAREVIA partner NGOs.",
      },
    ],
  }),
  component: JobsIndex,
});

function JobsIndex() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["published-jobs", activeQuery],
    queryFn: () =>
      listPublishedJobs({
        data: {
          filters: { query: activeQuery || undefined },
          page: 1,
        },
      }),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveQuery(searchQuery.trim());
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <Link to="/">
            <Logo className="h-8 w-auto" />
          </Link>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link to="/survivor/applications">
                  <Button variant="ghost" size="sm">
                    My Applications
                  </Button>
                </Link>
                <Link to="/survivor/dashboard">
                  <Button variant="outline" size="sm">
                    Dashboard
                  </Button>
                </Link>
              </>
            ) : (
              <Link to="/auth">
                <Button variant="outline" size="sm">
                  Sign in
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-12">
        <h1 className="font-display text-4xl font-bold text-primary">
          Job opportunities
        </h1>
        <p className="mt-2 text-muted-foreground">
          Ethical hiring through CAREVIA's survivor support network.
        </p>

        <form onSubmit={handleSearch} className="mt-8 flex gap-2 max-w-md">
          <Input
            placeholder="Search by job title or keyword…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button type="submit" className="gap-1.5 shrink-0">
            <Search className="size-4" /> Search
          </Button>
          {activeQuery && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setSearchQuery("");
                setActiveQuery("");
              }}
            >
              Clear
            </Button>
          )}
        </form>

        {isLoading ? (
          <div className="grid place-items-center py-16">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {(data?.jobs ?? []).map((job) => (
              <Link
                key={job.id}
                to="/jobs/$id"
                params={{ id: job.id }}
                className="rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-md block group"
              >
                <h2 className="font-semibold text-primary group-hover:text-accent transition-colors">
                  {job.title}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {job.company_name}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
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
                  {(job.required_skills ?? []).slice(0, 3).map((s: string) => (
                    <Badge key={s} variant="secondary" className="text-xs">
                      {s}
                    </Badge>
                  ))}
                </div>
                {(job.location_country || job.location_region) && (
                  <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="size-3" />{" "}
                    {[job.location_region, job.location_country]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}

        {!isLoading && (data?.jobs ?? []).length === 0 && (
          <div className="mt-12 text-center text-muted-foreground py-12 rounded-2xl border border-dashed border-border bg-card">
            <Briefcase className="mx-auto size-8" />
            <p className="mt-3 font-medium text-foreground">
              {activeQuery
                ? `No jobs matching "${activeQuery}"`
                : "No published jobs right now."}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Check back soon as partner recruiters post new positions.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

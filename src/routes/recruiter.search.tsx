import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search, Loader2, MapPin, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { PortalShell } from "@/components/layout/PortalShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { searchSurvivors, requestIntroduction, getRecruiterProfile } from "@/lib/recruiters.functions";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const RECRUITER_NAV = [
  { to: "/recruiter/search", label: "Search" },
  { to: "/recruiter/jobs", label: "Jobs" },
  { to: "/recruiter/requests", label: "Requests" },
  { to: "/recruiter/analytics", label: "Analytics" },
];

export const Route = createFileRoute("/recruiter/search")({
  head: () => ({ meta: [{ title: "Search survivors · CAREVIA" }] }),
  component: RecruiterSearch,
});

function RecruiterSearch() {
  return (
    <PortalShell title="Recruiter Portal" nav={RECRUITER_NAV} allow={["recruiter", "admin", "super_admin"]}>
      <SearchInner />
    </PortalShell>
  );
}

function SearchInner() {
  const [filters, setFilters] = useState({ query: "", skills: "", location_country: "", availability: "" });
  const [page, setPage] = useState(1);
  const [introTarget, setIntroTarget] = useState<{ id: string; anonymous_id: string } | null>(null);
  const [message, setMessage] = useState("");

  const { data: profile } = useQuery({
    queryKey: ["recruiter-profile"],
    queryFn: () => getRecruiterProfile(),
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["recruiter-search", filters, page],
    enabled: profile?.verification_status === "approved",
    queryFn: () =>
      searchSurvivors({
        data: {
          filters: {
            query: filters.query || undefined,
            skills: filters.skills ? filters.skills.split(",").map((s) => s.trim()) : undefined,
            location_country: filters.location_country || undefined,
            availability: filters.availability || undefined,
          },
          page,
        },
      }),
  });

  if (profile && profile.verification_status !== "approved") {
    return (
      <div className="rounded-2xl border border-warning/30 bg-warning/10 p-8 text-center">
        <p className="font-semibold">Verification pending</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Your recruiter account is {profile.verification_status}. You'll be able to search once approved.
        </p>
      </div>
    );
  }

  async function sendIntro() {
    if (!introTarget || message.length < 10) {
      toast.error("Message must be at least 10 characters");
      return;
    }
    try {
      await requestIntroduction({ data: { survivorId: introTarget.id, message } });
      toast.success("Introduction request sent");
      setIntroTarget(null);
      setMessage("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-primary">Search survivors</h1>
      <p className="text-sm text-muted-foreground">Only anonymized profiles with consent are shown. No names or documents.</p>

      <div className="grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-4">
        <Input placeholder="Search bio…" value={filters.query} onChange={(e) => setFilters({ ...filters, query: e.target.value })} />
        <Input placeholder="Skills (comma)" value={filters.skills} onChange={(e) => setFilters({ ...filters, skills: e.target.value })} />
        <Input placeholder="Country" value={filters.location_country} onChange={(e) => setFilters({ ...filters, location_country: e.target.value })} />
        <Button onClick={() => { setPage(1); refetch(); }} className="gap-2"><Search className="size-4" /> Search</Button>
      </div>

      {isLoading ? (
        <div className="grid place-items-center py-16"><Loader2 className="size-6 animate-spin" /></div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">{data?.total ?? 0} results</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(data?.results ?? []).map((s: {
              id: string; anonymous_id: string; skills: string[]; location_country: string;
              location_region: string; availability: string; bio_excerpt: string;
            }) => (
              <Card key={s.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{s.anonymous_id}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {(s.skills ?? []).slice(0, 5).map((sk) => (
                      <Badge key={sk} variant="secondary" className="text-xs">{sk}</Badge>
                    ))}
                  </div>
                  {(s.location_country || s.location_region) && (
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="size-3" /> {[s.location_region, s.location_country].filter(Boolean).join(", ")}
                    </p>
                  )}
                  {s.availability && (
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Briefcase className="size-3" /> {s.availability.replace("_", " ")}
                    </p>
                  )}
                  {s.bio_excerpt && <p className="text-xs text-muted-foreground line-clamp-2">{s.bio_excerpt}</p>}
                </CardContent>
                <CardFooter>
                  <Button size="sm" onClick={() => setIntroTarget({ id: s.id, anonymous_id: s.anonymous_id })}>
                    Request introduction
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      )}

      <Dialog open={!!introTarget} onOpenChange={() => setIntroTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request introduction to {introTarget?.anonymous_id}</DialogTitle>
          </DialogHeader>
          <Textarea
            rows={4}
            placeholder="Introduce your company and the opportunity…"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIntroTarget(null)}>Cancel</Button>
            <Button onClick={sendIntro}>Send request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

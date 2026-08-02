import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import { PortalShell } from "@/components/layout/PortalShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { StatusBadge } from "./ngo.dashboard";
import { listRecruiterJobs, createJob, publishJob, closeJob } from "@/lib/jobs.functions";

const RECRUITER_NAV = [
  { to: "/recruiter/search", label: "Search" },
  { to: "/recruiter/jobs", label: "Jobs" },
  { to: "/recruiter/requests", label: "Requests" },
  { to: "/recruiter/analytics", label: "Analytics" },
];

export const Route = createFileRoute("/recruiter/jobs")({
  head: () => ({ meta: [{ title: "Jobs · CAREVIA" }] }),
  component: RecruiterJobs,
});

function RecruiterJobs() {
  return (
    <PortalShell title="Recruiter Portal" nav={RECRUITER_NAV} allow={["recruiter", "admin", "super_admin"]}>
      <JobsInner />
    </PortalShell>
  );
}

function JobsInner() {
  const qc = useQueryClient();
  const { data: jobs, isLoading } = useQuery({
    queryKey: ["recruiter-jobs"],
    queryFn: () => listRecruiterJobs(),
  });

  const publish = useMutation({
    mutationFn: (id: string) => publishJob({ data: { id } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["recruiter-jobs"] }); toast.success("Job published"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const close = useMutation({
    mutationFn: (id: string) => closeJob({ data: { id } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["recruiter-jobs"] }); toast.success("Job closed"); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-primary">Your jobs</h1>
        <NewJobDialog onCreated={() => qc.invalidateQueries({ queryKey: ["recruiter-jobs"] })} />
      </div>

      {isLoading ? (
        <Loader2 className="size-6 animate-spin" />
      ) : !jobs?.length ? (
        <p className="text-sm text-muted-foreground">No jobs yet. Create your first listing.</p>
      ) : (
        <div className="divide-y divide-border rounded-2xl border border-border bg-card">
          {jobs.map((j) => (
            <div key={j.id} className="flex flex-wrap items-center justify-between gap-4 p-4">
              <div>
                <Link to="/recruiter/jobs/$id/edit" params={{ id: j.id }} className="font-medium hover:text-accent">
                  {j.title}
                </Link>
                <p className="text-sm text-muted-foreground">{j.company_name}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={j.status} />
                {j.status === "draft" && (
                  <Button size="sm" onClick={() => publish.mutate(j.id)}>Publish</Button>
                )}
                {j.status === "published" && (
                  <Button size="sm" variant="outline" onClick={() => close.mutate(j.id)}>Close</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function NewJobDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", company_name: "", description: "", required_skills: "" });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createJob({
        data: {
          title: form.title,
          company_name: form.company_name,
          description: form.description,
          required_skills: form.required_skills.split(",").map((s) => s.trim()).filter(Boolean),
        },
      });
      toast.success("Job created");
      setOpen(false);
      onCreated();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2"><Plus className="size-4" /> New job</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Create job listing</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div><Label>Title</Label><Input className="mt-2" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
          <div><Label>Company</Label><Input className="mt-2" value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} required /></div>
          <div><Label>Description</Label><Textarea className="mt-2" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div><Label>Required skills (comma)</Label><Input className="mt-2" value={form.required_skills} onChange={(e) => setForm({ ...form, required_skills: e.target.value })} /></div>
          <DialogFooter><Button type="submit">Create draft</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

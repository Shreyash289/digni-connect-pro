import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import { PortalShell } from "@/components/layout/PortalShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { listRecruiterJobs, updateJob } from "@/lib/jobs.functions";

const RECRUITER_NAV = [
  { to: "/recruiter/search", label: "Search" },
  { to: "/recruiter/jobs", label: "Jobs" },
  { to: "/recruiter/requests", label: "Requests" },
  { to: "/recruiter/analytics", label: "Analytics" },
];

export const Route = createFileRoute("/recruiter/jobs/$id/edit")({
  head: () => ({ meta: [{ title: "Edit job · CAREVIA" }] }),
  component: EditJob,
});

type FormState = {
  title: string;
  company_name: string;
  description: string;
  required_skills: string;
  preferred_skills: string;
  languages: string;
  location_country: string;
  location_region: string;
  remote_ok: boolean;
  employment_type: "full_time" | "part_time" | "contract" | "internship";
  salary_min: string;
  salary_max: string;
  currency: string;
};

function EditJob() {
  const { id } = Route.useParams();
  return (
    <PortalShell title="Recruiter Portal" nav={RECRUITER_NAV} allow={["recruiter", "admin", "super_admin"]}>
      <EditorInner id={id} />
    </PortalShell>
  );
}

function EditorInner({ id }: { id: string }) {
  const navigate = useNavigate();
  const { data: jobs, isLoading } = useQuery({
    queryKey: ["recruiter-jobs"],
    queryFn: () => listRecruiterJobs(),
  });
  const job = jobs?.find((j) => j.id === id);

  const [form, setForm] = useState<FormState | null>(null);

  useEffect(() => {
    if (!job || form) return;
    setForm({
      title: job.title,
      company_name: job.company_name,
      description: job.description ?? "",
      required_skills: (job.required_skills ?? []).join(", "),
      preferred_skills: (job.preferred_skills ?? []).join(", "),
      languages: (job.languages ?? []).join(", "),
      location_country: job.location_country ?? "",
      location_region: job.location_region ?? "",
      remote_ok: job.remote_ok ?? false,
      employment_type: job.employment_type ?? "full_time",
      salary_min: job.salary_min != null ? String(job.salary_min) : "",
      salary_max: job.salary_max != null ? String(job.salary_max) : "",
      currency: job.currency ?? "INR",
    });
  }, [job, form]);

  const save = useMutation({
    mutationFn: (patch: Parameters<typeof updateJob>[0]["data"]["patch"]) =>
      updateJob({ data: { id, patch } }),
    onSuccess: () => {
      toast.success("Job updated");
      navigate({ to: "/recruiter/jobs" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading || !form) {
    return <div className="grid place-items-center py-24"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>;
  }

  if (!job) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Job not found.
      </div>
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    save.mutate({
      title: form.title,
      company_name: form.company_name,
      description: form.description,
      required_skills: form.required_skills.split(",").map((s) => s.trim()).filter(Boolean),
      preferred_skills: form.preferred_skills.split(",").map((s) => s.trim()).filter(Boolean),
      languages: form.languages.split(",").map((s) => s.trim()).filter(Boolean),
      location_country: form.location_country || undefined,
      location_region: form.location_region || undefined,
      remote_ok: form.remote_ok,
      employment_type: form.employment_type,
      salary_min: form.salary_min ? Number(form.salary_min) : undefined,
      salary_max: form.salary_max ? Number(form.salary_max) : undefined,
      currency: form.currency,
    });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link to="/recruiter/jobs" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Back to jobs
        </Link>
        <h1 className="mt-2 font-display text-3xl font-bold text-primary">Edit job</h1>
      </div>

      <form onSubmit={submit} className="space-y-4 rounded-2xl border border-border bg-card p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Title</Label>
            <Input className="mt-2" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div>
            <Label>Company</Label>
            <Input className="mt-2" value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} required />
          </div>
        </div>

        <div>
          <Label>Description</Label>
          <Textarea className="mt-2" rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Required skills (comma-separated)</Label>
            <Input className="mt-2" value={form.required_skills} onChange={(e) => setForm({ ...form, required_skills: e.target.value })} />
          </div>
          <div>
            <Label>Preferred skills (comma-separated)</Label>
            <Input className="mt-2" value={form.preferred_skills} onChange={(e) => setForm({ ...form, preferred_skills: e.target.value })} />
          </div>
        </div>

        <div>
          <Label>Languages (comma-separated)</Label>
          <Input className="mt-2" value={form.languages} onChange={(e) => setForm({ ...form, languages: e.target.value })} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Country</Label>
            <Input className="mt-2" value={form.location_country} onChange={(e) => setForm({ ...form, location_country: e.target.value })} />
          </div>
          <div>
            <Label>Region / city</Label>
            <Input className="mt-2" value={form.location_region} onChange={(e) => setForm({ ...form, location_region: e.target.value })} />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-border p-4">
          <Label htmlFor="remote_ok">Remote OK</Label>
          <Switch
            id="remote_ok"
            checked={form.remote_ok}
            onCheckedChange={(checked) => setForm({ ...form, remote_ok: checked })}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Employment type</Label>
            <select
              value={form.employment_type}
              onChange={(e) => setForm({ ...form, employment_type: e.target.value as FormState["employment_type"] })}
              className="mt-2 block w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10"
            >
              <option value="full_time">Full time</option>
              <option value="part_time">Part time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
          </div>
          <div>
            <Label>Currency</Label>
            <Input className="mt-2" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Salary min</Label>
            <Input className="mt-2" type="number" value={form.salary_min} onChange={(e) => setForm({ ...form, salary_min: e.target.value })} />
          </div>
          <div>
            <Label>Salary max</Label>
            <Input className="mt-2" type="number" value={form.salary_max} onChange={(e) => setForm({ ...form, salary_max: e.target.value })} />
          </div>
        </div>

        <Button type="submit" disabled={save.isPending}>
          {save.isPending ? "Saving…" : "Save changes"}
        </Button>
      </form>
    </div>
  );
}

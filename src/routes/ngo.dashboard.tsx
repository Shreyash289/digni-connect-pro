import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Clock, CheckCircle2, AlertCircle, Users, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PortalShell } from "@/components/layout/PortalShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

const NGO_NAV = [
  { to: "/ngo/dashboard", label: "Dashboard" },
  { to: "/ngo/survivors", label: "Survivors" },
  { to: "/ngo/requests", label: "Intro requests" },
  { to: "/ngo/analytics", label: "Analytics" },
  { to: "/ngo/organization", label: "Organization" },
];

export const Route = createFileRoute("/ngo/dashboard")({
  head: () => ({ meta: [{ title: "NGO Dashboard · CAREVIA" }] }),
  component: NgoDashboard,
});

function NgoDashboard() {
  return (
    <PortalShell title="NGO Portal" nav={NGO_NAV} allow={["ngo_partner", "admin", "super_admin"]}>
      <DashboardInner />
    </PortalShell>
  );
}

function DashboardInner() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: ngo, isLoading: ngoLoading } = useQuery({
    queryKey: ["my-ngo", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ngos")
        .select("*")
        .eq("owner_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: survivors } = useQuery({
    queryKey: ["my-survivors", ngo?.id],
    enabled: !!ngo && ngo.status === "approved",
    queryFn: async () => {
      const { data, error } = await supabase
        .from("survivors")
        .select("id, full_name, status, profile_completion, created_at, anonymous_id")
        .eq("ngo_id", ngo!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  if (ngoLoading) return <Loader />;

  if (!ngo) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="No NGO registered yet"
        body="You haven't registered an NGO. Head to onboarding to create one."
      />
    );
  }

  if (ngo.status === "pending") {
    return (
      <StatusBanner
        icon={Clock}
        tone="warning"
        title="Your NGO is under review"
        body="A CAREVIA admin will verify your organization shortly. You'll be able to onboard survivors once approved."
      />
    );
  }

  if (ngo.status === "rejected") {
    return (
      <StatusBanner
        icon={AlertCircle}
        tone="destructive"
        title="Your application was not approved"
        body={ngo.rejection_reason ?? "Please contact CAREVIA support for more information."}
      />
    );
  }

  if (ngo.status === "suspended") {
    return (
      <StatusBanner
        icon={AlertCircle}
        tone="destructive"
        title="Account suspended"
        body="Your NGO account is currently suspended. Please contact CAREVIA support."
      />
    );
  }

  const stats = {
    total: survivors?.length ?? 0,
    draft: survivors?.filter((s) => s.status === "draft").length ?? 0,
    submitted: survivors?.filter((s) => s.status === "submitted").length ?? 0,
    approved: survivors?.filter((s) => s.status === "approved").length ?? 0,
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-primary">{ngo.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Welcome back. Here's what's happening today.</p>
        </div>
        <AddSurvivorDialog ngoId={ngo.id} onCreated={() => qc.invalidateQueries({ queryKey: ["my-survivors"] })} />
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total survivors" value={stats.total} icon={Users} />
        <StatCard label="In draft" value={stats.draft} icon={Clock} />
        <StatCard label="Submitted" value={stats.submitted} icon={CheckCircle2} />
        <StatCard label="Approved" value={stats.approved} icon={CheckCircle2} tone="success" />
      </div>

      <div className="rounded-2xl border border-border bg-card">
        <div className="border-b border-border p-5">
          <h2 className="font-semibold text-primary">Recent survivors</h2>
        </div>
        {!survivors || survivors.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            No survivors yet. Click "Add survivor" to get started.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {survivors.slice(0, 8).map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div>
                  <p className="font-medium text-foreground">{s.full_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.anonymous_id} · {Math.round(s.profile_completion)}% complete
                  </p>
                </div>
                <StatusBadge status={s.status} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: number;
  icon: typeof Users;
  tone?: "default" | "success";
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <Icon className={`size-4 ${tone === "success" ? "text-success" : "text-accent"}`} />
      </div>
      <p className="mt-3 font-display text-3xl font-bold text-primary">{value}</p>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    draft: { label: "Draft", cls: "bg-muted text-muted-foreground" },
    submitted: { label: "Submitted", cls: "bg-accent/15 text-accent-foreground" },
    under_review: { label: "Under review", cls: "bg-warning/15 text-warning-foreground" },
    approved: { label: "Approved", cls: "bg-success/15 text-success" },
    rejected: { label: "Rejected", cls: "bg-destructive/15 text-destructive" },
    pending: { label: "Pending", cls: "bg-warning/15 text-warning-foreground" },
    suspended: { label: "Suspended", cls: "bg-destructive/15 text-destructive" },
  };
  const v = map[status] ?? { label: status, cls: "bg-muted text-muted-foreground" };
  return <Badge variant="secondary" className={v.cls}>{v.label}</Badge>;
}

function StatusBanner({
  icon: Icon,
  tone,
  title,
  body,
}: {
  icon: typeof Clock;
  tone: "warning" | "destructive";
  title: string;
  body: string;
}) {
  const cls =
    tone === "warning"
      ? "border-warning/30 bg-warning/10"
      : "border-destructive/30 bg-destructive/10";
  return (
    <div className={`flex gap-4 rounded-2xl border p-6 ${cls}`}>
      <Icon className={`mt-0.5 size-5 ${tone === "warning" ? "text-warning-foreground" : "text-destructive"}`} />
      <div>
        <p className="font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{body}</p>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, body }: { icon: typeof AlertCircle; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
      <Icon className="mx-auto size-8 text-muted-foreground" />
      <p className="mt-3 font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

function Loader() {
  return (
    <div className="grid place-items-center py-24">
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
    </div>
  );
}

/* ---------------- Add survivor dialog ---------------- */

function AddSurvivorDialog({ ngoId, onCreated }: { ngoId: string; onCreated: () => void }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    age: "" as string | number,
    gender: "",
    city: "",
    state: "",
    phone: "",
    email: "",
    education_level: "",
    skills: "",
    languages: "",
  });

  const mut = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not signed in");
      const skills = form.skills.split(",").map((s) => s.trim()).filter(Boolean);
      const languages = form.languages.split(",").map((s) => s.trim()).filter(Boolean);
      const payload = {
        ngo_id: ngoId,
        created_by: user.id,
        full_name: form.full_name,
        age: form.age ? Number(form.age) : null,
        gender: form.gender || null,
        city: form.city || null,
        state: form.state || null,
        phone: form.phone || null,
        email: form.email || null,
        education_level: form.education_level || null,
        skills,
        languages,
      };
      const { error } = await supabase.from("survivors").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Survivor added");
      setOpen(false);
      setForm({
        full_name: "", age: "", gender: "", city: "", state: "",
        phone: "", email: "", education_level: "", skills: "", languages: "",
      });
      onCreated();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2"><Plus className="size-4" /> Add survivor</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add a new survivor</DialogTitle>
          <DialogDescription>
            Only basic information is required. You can edit and add documents later.
          </DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={(e) => { e.preventDefault(); mut.mutate(); }}
        >
          <Field label="Full name *" v={form.full_name} on={(v) => setForm({ ...form, full_name: v })} required />
          <Field label="Age" type="number" v={String(form.age)} on={(v) => setForm({ ...form, age: v })} />
          <Field label="Gender" v={form.gender} on={(v) => setForm({ ...form, gender: v })} />
          <Field label="Education" v={form.education_level} on={(v) => setForm({ ...form, education_level: v })} />
          <Field label="City" v={form.city} on={(v) => setForm({ ...form, city: v })} />
          <Field label="State" v={form.state} on={(v) => setForm({ ...form, state: v })} />
          <Field label="Phone" v={form.phone} on={(v) => setForm({ ...form, phone: v })} />
          <Field label="Email" type="email" v={form.email} on={(v) => setForm({ ...form, email: v })} />
          <div className="sm:col-span-2">
            <Label>Skills (comma separated)</Label>
            <Textarea
              className="mt-2"
              rows={2}
              value={form.skills}
              onChange={(e) => setForm({ ...form, skills: e.target.value })}
              placeholder="e.g. Tailoring, Hospitality, English"
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Languages (comma separated)</Label>
            <Input
              className="mt-2"
              value={form.languages}
              onChange={(e) => setForm({ ...form, languages: e.target.value })}
              placeholder="e.g. Hindi, English, Bengali"
            />
          </div>
          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={mut.isPending}>
              {mut.isPending ? "Saving…" : "Add survivor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label, v, on, type = "text", required,
}: { label: string; v: string; on: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <div>
      <Label>{label}</Label>
      <Input className="mt-2" type={type} value={v} onChange={(e) => on(e.target.value)} required={required} />
    </div>
  );
}

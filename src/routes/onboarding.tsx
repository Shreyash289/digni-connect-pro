import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { HeartHandshake, Building2, Briefcase, ShieldCheck, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, dashboardPathFor, type AppRole } from "@/hooks/useAuth";
import { requestAdminSignupRole } from "@/lib/admin.functions";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const onboardingSearchSchema = z.object({
  role: z.enum(["admin", "ngo_partner", "survivor", "recruiter"]).optional(),
});

export const Route = createFileRoute("/onboarding")({
  validateSearch: onboardingSearchSchema,
  head: () => ({ meta: [{ title: "Get started · CAREVIA" }] }),
  component: Onboarding,
});

function Onboarding() {
  const { user, roles, loading, reload } = useAuth();
  const navigate = useNavigate();
  const search = useSearch({ from: "/onboarding" });
  const initialRole = search.role as AppRole | undefined;
  const [step, setStep] = useState<"role" | "ngo" | "recruiter">(() => {
    if (initialRole === "ngo_partner") return "ngo";
    if (initialRole === "recruiter") return "recruiter";
    return "role";
  });
  const [chosen, setChosen] = useState<AppRole | null>(initialRole ?? null);
  const [autoAssigned, setAutoAssigned] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/auth" });
      return;
    }
    if (roles.length > 0) {
      navigate({ to: dashboardPathFor(roles) });
      return;
    }
    if (initialRole === "survivor" && !autoAssigned) {
      setAutoAssigned(true);
      setChosen("survivor");
      void grantRoleAndGo("survivor", navigate);
      return;
    }

    if (initialRole === "admin" && !autoAssigned) {
      setAutoAssigned(true);
      setChosen("admin");
      void claimAdminAndGo(navigate, reload);
      return;
    }

  }, [loading, user, roles, navigate, initialRole, autoAssigned, reload]);

  if (loading || !user) {
    return <CenteredMessage>Loading…</CenteredMessage>;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
          <Logo className="h-8 w-auto" />
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/" });
            }}
            className="gap-2"
          >
            <LogOut className="size-4" /> Sign out
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        {step === "role" ? (
          <RoleChooser
            onPick={(r) => {
              setChosen(r);
              if (r === "ngo_partner") setStep("ngo");
              else if (r === "recruiter") setStep("recruiter");
              else if (r === "admin") void claimAdminAndGo(navigate, reload);
              else void grantRoleAndGo(r, navigate);
            }}
          />
        ) : step === "ngo" ? (
          <NgoForm
            onDone={async () => {
              if (!chosen) return;
              await grantRoleAndGo(chosen, navigate);
            }}
            onBack={() => setStep("role")}
          />
        ) : (
          <RecruiterForm
            onDone={async () => {
              toast.success("Recruiter application submitted for review.");
              navigate({ to: "/recruiter" });
            }}
            onBack={() => setStep("role")}
          />
        )}
      </main>
    </div>
  );
}

async function grantRoleAndGo(
  role: AppRole,
  navigate: ReturnType<typeof useNavigate>,
) {
  const { data: userResp } = await supabase.auth.getUser();
  const uid = userResp.user?.id;
  if (!uid) {
    toast.error("Session expired. Please sign in again.");
    navigate({ to: "/auth" });
    return;
  }
  // user_roles INSERT has no RLS for self-grant — so we use a server function
  // via a direct insert blocked by RLS. For Phase 1, we trust the onboarding
  // flow: insert through an RPC.
  const { error } = await supabase.rpc("self_assign_initial_role", { _role: role });
  if (error) {
    toast.error(`Could not set role: ${error.message}`);
    return;
  }
  toast.success("You're all set.");
  navigate({ to: dashboardPathFor([role]) });
}

async function claimAdminAndGo(
  navigate: ReturnType<typeof useNavigate>,
  reload: () => Promise<void> | void,
) {
  try {
    await requestAdminSignupRole({});
    toast.success("You're all set.");
    await reload();
    navigate({ to: dashboardPathFor(["admin"]) });
  } catch (err: any) {
    toast.error(err?.message ?? "Could not grant admin access.");
  }
}

function RoleChooser({ onPick }: { onPick: (r: AppRole) => void }) {
  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-primary">Welcome to CAREVIA</h1>
      <p className="mt-2 text-muted-foreground">
        Choose how you'll use the platform. You can be invited to more roles later.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <RoleCard
          icon={HeartHandshake}
          title="NGO Partner"
          body="Onboard survivors and track their placements."
          cta="Continue as NGO Partner"
          onClick={() => onPick("ngo_partner")}
        />
        <RoleCard
          icon={ShieldCheck}
          title="Admin"
          body="Review approvals and oversee the platform."
          cta="Continue as Admin"
          onClick={() => onPick("admin")}
        />
        <RoleCard
          icon={Briefcase}
          title="Recruiter"
          body="Discover anonymized, consented candidates."
          cta="Continue as Recruiter"
          onClick={() => onPick("recruiter")}
        />
        <RoleCard
          icon={Building2}
          title="Survivor / exploring"
          body="Get your own account and an AI career mentor."
          cta="Continue as survivor"
          onClick={() => onPick("survivor")}
          subtle
        />
      </div>
    </div>
  );
}

function RoleCard({
  icon: Icon,
  title,
  body,
  cta,
  onClick,
  subtle,
}: {
  icon: typeof HeartHandshake | typeof ShieldCheck;
  title: string;
  body: string;
  cta: string;
  onClick: () => void;
  subtle?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`group text-left rounded-2xl border p-6 transition-all duration-200 hover:-translate-y-0.5 ${
        subtle
          ? "border-border bg-card hover:border-primary/40 hover:shadow-md"
          : "border-primary/20 bg-card shadow-sm hover:border-primary/60 hover:shadow-lg"
      }`}
    >
      <div className="grid size-10 place-items-center rounded-xl bg-primary-soft text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon className="size-5" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-primary">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent">
        {cta} <span className="transition-transform group-hover:translate-x-0.5">→</span>
      </span>
    </button>
  );
}

function NgoForm({ onDone, onBack }: { onDone: () => void; onBack: () => void }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: "",
    registration_number: "",
    contact_email: user?.email ?? "",
    contact_phone: "",
    city: "",
    state: "",
    country: "India",
    description: "",
  });
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("ngos").insert({
      owner_id: user.id,
      ...form,
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("NGO submitted for review.");
    onDone();
  }

  return (
    <form onSubmit={save} className="space-y-5">
      <div>
        <button type="button" onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground">
          ← Back
        </button>
        <h1 className="mt-2 font-display text-3xl font-bold text-primary">Register your NGO</h1>
        <p className="mt-2 text-muted-foreground">
          Tell us about your organization. A CAREVIA admin will review and approve your account before you can add survivors.
        </p>
      </div>
      <div className="grid gap-4 rounded-2xl border border-border bg-card p-6 sm:grid-cols-2">
        <Field label="NGO name *" v={form.name} on={(v) => setForm({ ...form, name: v })} required />
        <Field label="Registration number" v={form.registration_number} on={(v) => setForm({ ...form, registration_number: v })} />
        <Field label="Contact email *" type="email" v={form.contact_email} on={(v) => setForm({ ...form, contact_email: v })} required />
        <Field label="Contact phone" v={form.contact_phone} on={(v) => setForm({ ...form, contact_phone: v })} />
        <Field label="City" v={form.city} on={(v) => setForm({ ...form, city: v })} />
        <Field label="State" v={form.state} on={(v) => setForm({ ...form, state: v })} />
        <Field label="Country" v={form.country} on={(v) => setForm({ ...form, country: v })} />
        <div className="sm:col-span-2">
          <Label>About your work</Label>
          <Textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Briefly describe your mission and the population you serve."
            rows={4}
            className="mt-2"
          />
        </div>
      </div>
      <Button type="submit" disabled={saving}>
        {saving ? "Submitting…" : "Submit for review"}
      </Button>
    </form>
  );
}

function Field({
  label,
  v,
  on,
  type = "text",
  required,
}: {
  label: string;
  v: string;
  on: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Input className="mt-2" type={type} value={v} onChange={(e) => on(e.target.value)} required={required} />
    </div>
  );
}

function CenteredMessage({ children }: { children: React.ReactNode }) {
  return <div className="grid min-h-screen place-items-center text-muted-foreground">{children}</div>;
}

function RecruiterForm({ onDone, onBack }: { onDone: () => void; onBack: () => void }) {
  const [form, setForm] = useState({ company_name: "", company_website: "" });
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.rpc("self_assign_recruiter_role", {
      _company_name: form.company_name,
      _company_website: form.company_website || null,
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    onDone();
  }

  return (
    <form onSubmit={save} className="space-y-5">
      <div>
        <button type="button" onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground">
          ← Back
        </button>
        <h1 className="mt-2 font-display text-3xl font-bold text-primary">Register as recruiter</h1>
        <p className="mt-2 text-muted-foreground">
          Your account will be reviewed by CAREVIA before you can search survivors.
        </p>
      </div>
      <div className="grid gap-4 rounded-2xl border border-border bg-card p-6">
        <Field label="Company name *" v={form.company_name} on={(v) => setForm({ ...form, company_name: v })} required />
        <Field label="Company website" v={form.company_website} on={(v) => setForm({ ...form, company_website: v })} />
      </div>
      <Button type="submit" disabled={saving}>
        {saving ? "Submitting…" : "Submit for review"}
      </Button>
    </form>
  );
}

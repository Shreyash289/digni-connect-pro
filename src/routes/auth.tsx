import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, Mail, ShieldCheck, HeartHandshake, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { dashboardPathFor, type AppRole } from "@/hooks/useAuth";

const searchSchema = z.object({
  mode: z.enum(["signin", "signup"]).optional(),
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign in · CAREVIA" },
      { name: "description", content: "Sign in or create your CAREVIA account." },
    ],
  }),
  component: AuthPage,
});

const TRUST_POINTS = [
  { icon: ShieldCheck, label: "End-to-end encrypted, anonymized profiles" },
  { icon: HeartHandshake, label: "Onboarding only through verified NGOs" },
  { icon: Sparkles, label: "AI mentor for resumes & interview prep" },
];

function AuthPage() {
  const search = useSearch({ from: "/auth" });
  const initial = search.mode ?? "signin";
  return (
    <div className="grid min-h-screen lg:grid-cols-5">
      {/* Brand panel */}
      <div className="gradient-navy relative hidden overflow-hidden p-10 text-primary-foreground lg:col-span-2 lg:flex lg:flex-col lg:justify-between xl:p-12">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-white/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-16 size-80 rounded-full bg-accent/20 blur-3xl"
        />

        <Link to="/" className="relative inline-flex w-fit items-center gap-2 text-sm text-white/80 transition-colors hover:text-white">
          <ArrowLeft className="size-4" /> Back home
        </Link>

        <div className="relative">
          <Logo className="h-9 w-auto brightness-0 invert" />
          <h2 className="mt-8 max-w-md font-display text-3xl font-bold leading-tight xl:text-4xl">
            A second chance, built on dignity.
          </h2>
          <p className="mt-3 max-w-sm text-sm text-white/75">
            Survivors, verified NGOs, and ethical recruiters — one trusted place to work together.
          </p>

          <div className="mt-8 space-y-3">
            {TRUST_POINTS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                <Icon className="size-4 shrink-0 text-accent" />
                <span className="text-sm text-white/90">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex items-center gap-6 text-xs text-white/60">
          <span>1,200+ survivors supported</span>
          <span className="h-1 w-1 rounded-full bg-white/30" />
          <span>85 NGO partners</span>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-background px-6 py-12 sm:px-10 lg:col-span-3">
        <div className="w-full max-w-sm">
          <Link to="/" className="mb-8 inline-flex items-center gap-2 lg:hidden">
            <Logo className="h-8 w-auto" />
          </Link>
          <Tabs defaultValue={initial}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Create account</TabsTrigger>
            </TabsList>
            <TabsContent value="signin"><SignInForm /></TabsContent>
            <TabsContent value="signup"><SignUpForm /></TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

async function loadRoles(userId: string): Promise<AppRole[]> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  if (error) throw error;
  return (data ?? []).map((r) => r.role as AppRole);
}

function SignInForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      if (error.code === "email_not_confirmed" || /confirm/i.test(error.message)) {
        setNeedsVerification(true);
        toast.error("Please confirm your email to continue.");
        return;
      }
      toast.error(error.message);
      return;
    }

    const { data: userResp } = await supabase.auth.getUser();
    const userId = userResp.user?.id;
    if (!userId) {
      setLoading(false);
      toast.error("Unable to load user session. Please try again.");
      return;
    }

    const roles = await loadRoles(userId);
    setLoading(false);
    toast.success("Welcome back!");
    navigate({ to: dashboardPathFor(roles) });
  }

  if (needsVerification) {
    return <CheckEmailNotice email={email} onBack={() => setNeedsVerification(false)} />;
  }

  return (
    <form onSubmit={onSubmit} className="mt-7 space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <Button type="submit" disabled={loading} className="w-full gap-2">
        {loading ? <Loader2 className="size-4 animate-spin" /> : null}
        {loading ? "Signing in…" : "Sign in"}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Have admin access? Sign in with your admin credentials to go straight to the admin dashboard.
      </p>
    </form>
  );
}

function SignUpForm() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AppRole>("survivor");
  const [loading, setLoading] = useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    const redirectUrl = `${window.location.origin}/onboarding?role=${role}`;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { full_name: fullName, role },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }

    if (data?.session) {
      toast.success("Account created. Continue onboarding.");
      navigate({ to: `/onboarding?role=${role}` });
      return;
    }

    setAwaitingConfirmation(true);
  }

  if (awaitingConfirmation) {
    return <CheckEmailNotice email={email} onBack={() => setAwaitingConfirmation(false)} />;
  }

  return (
    <form onSubmit={onSubmit} className="mt-7 space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="full_name">Full name</Label>
        <Input id="full_name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="role">Account type</Label>
        <select
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value as AppRole)}
          className="block w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10"
        >
          <option value="survivor">Survivor / exploring</option>
          <option value="ngo_partner">NGO Partner</option>
          <option value="recruiter">Recruiter</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email2">Email</Label>
        <Input id="email2" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password2">Password</Label>
        <Input id="password2" type="password" required minLength={8} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <p className="text-xs text-muted-foreground">At least 8 characters.</p>
      </div>
      <Button type="submit" disabled={loading} className="w-full gap-2">
        {loading ? <Loader2 className="size-4 animate-spin" /> : null}
        {loading ? "Creating…" : "Create account"}
      </Button>
    </form>
  );
}

function CheckEmailNotice({ email, onBack }: { email: string; onBack: () => void }) {
  const [resending, setResending] = useState(false);

  async function resend() {
    setResending(true);
    const { error } = await supabase.auth.resend({ type: "signup", email });
    setResending(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Confirmation email resent.");
  }

  return (
    <div className="mt-7 space-y-5 text-center">
      <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary-soft text-primary">
        <Mail className="size-6" />
      </div>
      <div>
        <h3 className="font-display text-lg font-semibold text-primary">Check your email</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          We sent a confirmation link to <span className="font-medium text-foreground">{email}</span>.
          Open it to activate your account, then come back here and sign in.
        </p>
      </div>
      <Button type="button" variant="outline" onClick={resend} disabled={resending} className="w-full">
        {resending ? "Resending…" : "Resend email"}
      </Button>
      <button type="button" onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground">
        ← Back
      </button>
    </div>
  );
}

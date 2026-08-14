import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
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

function AuthPage() {
  const search = useSearch({ from: "/auth" });
  const initial = search.mode ?? "signin";
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="gradient-navy relative hidden overflow-hidden p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white">
          <ArrowLeft className="size-4" /> Back home
        </Link>
        <div>
          <Logo className="h-10 w-auto brightness-0 invert" />
          <h2 className="mt-8 max-w-md font-display text-4xl font-bold leading-tight">
            A second chance, built on dignity.
          </h2>
          <p className="mt-4 max-w-md text-white/80">
            CAREVIA connects survivors with dignified work through verified NGOs and recruiters.
          </p>
        </div>
        <p className="text-xs text-white/60">Guided by values. Driven by people.</p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-background p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <Link to="/" className="mb-6 inline-flex items-center gap-2 lg:hidden">
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
        toast.error("Please verify your email to continue.");
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
    return <VerifyEmailForm email={email} onBack={() => setNeedsVerification(false)} />;
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <p className="text-sm text-muted-foreground">
        If you have admin access, sign in with your admin credentials to go straight to the admin dashboard.
      </p>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Signing in…" : "Sign in"}
      </Button>
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
  const [verifying, setVerifying] = useState(false);

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

    toast.success("Account created. Enter the code we emailed you to verify your address.");
    setVerifying(true);
  }

  if (verifying) {
    return <VerifyEmailForm email={email} role={role} onBack={() => setVerifying(false)} />;
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="full_name">Full name</Label>
        <Input id="full_name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="role">Account type</Label>
        <select
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value as AppRole)}
          className="mt-2 block w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10"
        >
          <option value="survivor">Survivor / exploring</option>
          <option value="ngo_partner">NGO Partner</option>
          <option value="recruiter">Recruiter</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email2">Email</Label>
        <Input id="email2" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password2">Password</Label>
        <Input id="password2" type="password" required minLength={8} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <p className="text-xs text-muted-foreground">At least 8 characters.</p>
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Creating…" : "Create account"}
      </Button>
    </form>
  );
}

function VerifyEmailForm({
  email,
  role,
  onBack,
}: {
  email: string;
  role?: AppRole;
  onBack: () => void;
}) {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);

  async function verify() {
    if (code.length !== 6) return;
    setVerifying(true);
    const { data, error } = await supabase.auth.verifyOtp({ email, token: code, type: "signup" });
    setVerifying(false);
    if (error) {
      toast.error(error.message);
      return;
    }

    const userId = data.session?.user.id ?? data.user?.id;
    if (!userId) {
      toast.error("Verification succeeded, but no session was returned. Please sign in.");
      onBack();
      return;
    }

    toast.success("Email verified.");
    const roles = await loadRoles(userId);
    navigate({ to: roles.length > 0 ? dashboardPathFor(roles) : role ? `/onboarding?role=${role}` : "/onboarding" });
  }

  async function resend() {
    setResending(true);
    const { error } = await supabase.auth.resend({ type: "signup", email });
    setResending(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Verification code resent.");
  }

  return (
    <div className="mt-6 space-y-5">
      <button type="button" onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground">
        ← Back
      </button>
      <div>
        <p className="text-sm text-foreground">
          Enter the 6-digit code we emailed to <span className="font-medium">{email}</span>.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">Didn't get it? Check spam, or resend below.</p>
      </div>
      <InputOTP maxLength={6} value={code} onChange={setCode}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>
      <Button onClick={verify} disabled={verifying || code.length !== 6} className="w-full">
        {verifying ? "Verifying…" : "Verify"}
      </Button>
      <Button type="button" variant="ghost" onClick={resend} disabled={resending} className="w-full">
        {resending ? "Resending…" : "Resend code"}
      </Button>
    </div>
  );
}

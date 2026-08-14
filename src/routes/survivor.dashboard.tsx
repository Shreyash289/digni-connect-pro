import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Loader2,
  User,
  Briefcase,
  MapPin,
  BookOpen,
  Star,
  FileText,
  Building2,
  ArrowRight,
  MessageCircle,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { PortalShell } from "@/components/layout/PortalShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getSurvivorPortalData } from "@/lib/survivor.portal.functions";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/survivor/dashboard")({
  head: () => ({ meta: [{ title: "My Dashboard · CAREVIA" }] }),
  component: SurvivorDashboard,
});

const SURVIVOR_NAV = [
  { to: "/survivor/dashboard", label: "Dashboard" },
  { to: "/survivor/profile", label: "My Profile" },
  { to: "/survivor/applications", label: "My Applications" },
  { to: "/mentor", label: "AI Mentor" },
  { to: "/mentor/resume", label: "Resume" },
  { to: "/mentor/builder", label: "Resume Builder" },
];

function SurvivorDashboard() {
  return (
    <PortalShell
      title="Survivor Portal"
      nav={SURVIVOR_NAV}
      allow={["survivor", "admin", "super_admin"]}
    >
      <DashboardInner />
    </PortalShell>
  );
}

function DashboardInner() {
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ["survivor-portal", user?.id],
    queryFn: () => getSurvivorPortalData(),
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="grid place-items-center py-24">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center">
        <AlertCircle className="mx-auto size-8 text-destructive" />
        <p className="mt-3 font-semibold text-foreground">Failed to load your dashboard.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "Unknown error. Please refresh."}
        </p>
      </div>
    );
  }

  const { survivor, applicationCount, applicationsByStatus, ngo } = data ?? {};

  // ── No profile yet ──────────────────────────────────────────────────────────
  if (!survivor) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-primary">
            Welcome to CAREVIA
          </h1>
          <p className="mt-2 text-muted-foreground">
            Your account is set up. Start by chatting with your AI Career Mentor to build your profile.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <EmptyCard
            icon={User}
            title="Complete your profile"
            body="Add your skills, work experience, education, and location."
            href="/survivor/profile"
            cta="Set up profile"
          />
          <EmptyCard
            icon={MessageCircle}
            title="Start with your AI Mentor"
            body="Get personalised career guidance, resume help, and job search tips."
            href="/mentor"
            cta="Chat now"
          />
          <EmptyCard
            icon={FileText}
            title="Upload your resume"
            body="Keep your professional document stored securely and share it when ready."
            href="/mentor/resume"
            cta="Upload resume"
          />
        </div>
      </div>
    );
  }

  // ── Profile exists ───────────────────────────────────────────────────────────
  const fullLocation = [
    survivor.location_region ?? survivor.city ?? survivor.state,
    survivor.location_country ?? survivor.country,
  ]
    .filter(Boolean)
    .join(", ");

  const completionPct: number = survivor.profile_completion ?? 0;

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-primary">
            Hello, {survivor.full_name.split(" ")[0]} 👋
          </h1>
          {fullLocation && (
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="size-3.5" /> {fullLocation}
            </p>
          )}
          {survivor.anonymous_id && (
            <p className="mt-1 text-xs text-muted-foreground">
              Anonymous ID: <span className="font-mono font-medium">{survivor.anonymous_id}</span>
            </p>
          )}
        </div>

        {/* Status badge */}
        {survivor.status && (
          <StatusBadge status={survivor.status as string} />
        )}
      </div>

      {/* ── Stat cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Briefcase}
          label="Applications"
          value={applicationCount ?? 0}
          sub={applicationCount === 0 ? "None yet" : `${applicationCount} total`}
        />
        <StatCard
          icon={CheckCircle2}
          label="Shortlisted"
          value={applicationsByStatus?.shortlisted ?? 0}
          sub="From applications"
        />
        <StatCard
          icon={Star}
          label="Profile completion"
          value={`${completionPct}%`}
          sub={completionPct < 60 ? "Add more info to be searchable" : "Looking good"}
        />
        <StatCard
          icon={Building2}
          label="NGO partner"
          value={ngo ? ngo.name : "—"}
          sub={ngo ? (ngo.status === "approved" ? "Approved" : ngo.status) : "Not linked"}
          small
        />
      </div>

      {/* ── Profile completion bar ── */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">Profile completion</p>
          <span className="text-sm font-semibold text-primary">{completionPct}%</span>
        </div>
        <Progress value={completionPct} className="mt-3 h-2" />
        {completionPct < 60 && (
          <p className="mt-2 text-xs text-muted-foreground">
            Reach 60% to appear in the anonymous recruiter directory.
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/survivor/profile">
            <Button variant="outline" size="sm" className="gap-1.5">
              <User className="size-3.5" /> Edit My Profile
            </Button>
          </Link>
          <Link to="/mentor/builder">
            <Button variant="outline" size="sm" className="gap-1.5">
              <FileText className="size-3.5" /> Resume Builder
            </Button>
          </Link>
          <Link to="/mentor">
            <Button variant="ghost" size="sm" className="gap-1.5">
              <MessageCircle className="size-3.5" /> Ask my AI Mentor
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Two-column details ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Skills */}
        <InfoCard
          icon={Star}
          title="Skills"
          emptyState={
            <EmptyInline
              text="No skills added yet."
              href="/survivor/profile"
              cta="Add skills"
            />
          }
          empty={!survivor.skills || survivor.skills.length === 0}
        >
          <div className="flex flex-wrap gap-1.5">
            {(survivor.skills ?? []).map((skill: string) => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
        </InfoCard>

        {/* Languages */}
        <InfoCard
          icon={BookOpen}
          title="Languages"
          emptyState={
            <EmptyInline
              text="No languages listed."
              href="/survivor/profile"
              cta="Add languages"
            />
          }
          empty={!survivor.languages || survivor.languages.length === 0}
        >
          <div className="flex flex-wrap gap-1.5">
            {(survivor.languages ?? []).map((lang: string) => (
              <Badge key={lang} variant="outline" className="text-xs">
                {lang}
              </Badge>
            ))}
          </div>
        </InfoCard>

        {/* Bio */}
        <InfoCard
          icon={User}
          title="About me"
          emptyState={
            <EmptyInline
              text="No bio yet."
              href="/survivor/profile"
              cta="Write a bio"
            />
          }
          empty={!survivor.bio || survivor.bio.trim().length === 0}
        >
          <p className="text-sm text-muted-foreground leading-relaxed">
            {survivor.bio}
          </p>
        </InfoCard>

        {/* Resume */}
        <InfoCard
          icon={FileText}
          title="Resume"
          emptyState={
            <EmptyInline
              text="No resume uploaded."
              href="/mentor/resume"
              cta="Upload resume"
            />
          }
          empty={!survivor.resume_url}
        >
          <div className="flex items-center gap-3">
            <FileText className="size-8 text-primary shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {survivor.resume_name ?? "resume.pdf"}
              </p>
              {survivor.resume_uploaded_at && (
                <p className="text-xs text-muted-foreground">
                  Uploaded {new Date(survivor.resume_uploaded_at).toLocaleDateString()}
                </p>
              )}
            </div>
            <Link to="/mentor/resume">
              <Button variant="outline" size="sm">
                Manage
              </Button>
            </Link>
          </div>
        </InfoCard>
      </div>

      {/* ── Recent applications preview ── */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Recent applications</h2>
          <Link to="/survivor/applications">
            <Button variant="ghost" size="sm" className="gap-1">
              View all <ArrowRight className="size-3.5" />
            </Button>
          </Link>
        </div>
        {applicationCount === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-border p-6 text-center">
            <Briefcase className="mx-auto size-7 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              No applications yet.
            </p>
            <Link to="/jobs">
              <Button size="sm" className="mt-3 gap-1.5">
                Browse jobs <ArrowRight className="size-3.5" />
              </Button>
            </Link>
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            You have <strong>{applicationCount}</strong> application{applicationCount !== 1 ? "s" : ""}
            {applicationsByStatus?.shortlisted
              ? ` — ${applicationsByStatus.shortlisted} shortlisted`
              : ""}.{" "}
            <Link to="/survivor/applications" className="text-accent underline-offset-2 hover:underline">
              See details →
            </Link>
          </p>
        )}
      </div>

      {/* ── Quick links ── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <QuickLink to="/survivor/profile" icon={User} label="Edit My Profile" />
        <QuickLink to="/mentor" icon={MessageCircle} label="AI Career Mentor" />
        <QuickLink to="/jobs" icon={Briefcase} label="Browse job board" />
        <QuickLink to="/mentor/builder" icon={FileText} label="Resume Builder" />
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  small = false,
}: {
  icon: typeof Briefcase;
  label: string;
  value: string | number;
  sub: string;
  small?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4" />
        <p className="text-xs font-medium uppercase tracking-wide">{label}</p>
      </div>
      <p className={`mt-2 font-display font-bold text-primary ${small ? "text-lg truncate" : "text-3xl"}`}>
        {value}
      </p>
      <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  title,
  children,
  empty,
  emptyState,
}: {
  icon: typeof Star;
  title: string;
  children: React.ReactNode;
  empty: boolean;
  emptyState: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      </div>
      <div className="mt-3">{empty ? emptyState : children}</div>
    </div>
  );
}

function EmptyInline({ text, href, cta }: { text: string; href: string; cta: string }) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">{text}</p>
      <Link to={href}>
        <Button variant="ghost" size="sm" className="gap-1 text-accent">
          {cta} <ArrowRight className="size-3" />
        </Button>
      </Link>
    </div>
  );
}

function EmptyCard({
  icon: Icon,
  title,
  body,
  href,
  cta,
}: {
  icon: typeof MessageCircle;
  title: string;
  body: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="rounded-2xl border border-primary/20 bg-card p-6 shadow-sm">
      <div className="grid size-10 place-items-center rounded-xl bg-primary-soft text-primary">
        <Icon className="size-5" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-primary">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
      <Link to={href}>
        <Button className="mt-4 gap-1.5" size="sm">
          {cta} <ArrowRight className="size-3.5" />
        </Button>
      </Link>
    </div>
  );
}

function QuickLink({
  to,
  icon: Icon,
  label,
}: {
  to: string;
  icon: typeof MessageCircle;
  label: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition-shadow hover:shadow-sm"
    >
      <Icon className="size-4 text-accent" />
      {label}
      <ArrowRight className="ml-auto size-3.5 text-muted-foreground" />
    </Link>
  );
}

const statusConfig: Record<string, { label: string; icon: typeof CheckCircle2; color: string }> = {
  approved: { label: "Approved", icon: CheckCircle2, color: "text-success bg-success/10 border-success/20" },
  draft: { label: "Draft", icon: Clock, color: "text-muted-foreground bg-muted border-border" },
  submitted: { label: "Submitted", icon: Clock, color: "text-warning bg-warning/10 border-warning/20" },
  under_review: { label: "Under review", icon: AlertCircle, color: "text-accent bg-accent/10 border-accent/20" },
  rejected: { label: "Rejected", icon: XCircle, color: "text-destructive bg-destructive/10 border-destructive/20" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] ?? statusConfig.draft;
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${cfg.color}`}
    >
      <Icon className="size-3" />
      {cfg.label}
    </span>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  HeartHandshake,
  Users,
  Sparkles,
  Building2,
  Briefcase,
  CheckCircle2,
  Lock,
  GraduationCap,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CAREVIA — Dignified employment for survivors" },
      {
        name: "description",
        content:
          "CAREVIA is a secure platform that helps survivors of violence and trauma connect with dignified employment through trusted NGOs and recruiters.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main>
        <Hero />
        <Stats />
        <HowItWorks />
        <Features />
        <ForPartners />
        <AiSupport />
        <ClosingCta />
      </main>
      <SiteFooter />
    </div>
  );
}

/* ---------------- Header ---------------- */

function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <Logo className="h-8 w-auto" />
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
          <a href="#how" className="hover:text-foreground">How it works</a>
          <a href="#features" className="hover:text-foreground">Features</a>
          <a href="#partners" className="hover:text-foreground">For partners</a>
          <a href="#ai" className="hover:text-foreground">AI support</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/auth">
            <Button variant="ghost" size="sm">Sign in</Button>
          </Link>
          <Link to="/auth" search={{ mode: "signin" }}>
            <Button variant="outline" size="sm">Admin</Button>
          </Link>
          <Link to="/auth" search={{ mode: "signup" }}>
            <Button size="sm">Get started</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ---------------- Hero ---------------- */

function Hero() {
  return (
    <section className="gradient-hero relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl gap-16 px-4 py-20 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="flex flex-col justify-center"
        >
          <span className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="size-1.5 rounded-full bg-accent" /> Guided by values · Driven by people
          </span>
          <h1 className="text-balance text-4xl font-bold leading-[1.05] text-primary sm:text-5xl lg:text-6xl">
            A second chance,
            <br />
            built on <span className="text-accent">dignity</span>.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            CAREVIA is a secure digital repository that connects survivors of violence,
            exploitation, and trauma with meaningful employment — through trusted NGOs,
            verified recruiters, and AI-powered career support.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/auth" search={{ mode: "signup" }}>
              <Button size="lg" className="gap-2">
                Join the platform <ArrowRight className="size-4" />
              </Button>
            </Link>
            <a href="#how">
              <Button size="lg" variant="outline">See how it works</Button>
            </a>
          </div>
          <div className="mt-8 flex items-center gap-6 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><Lock className="size-3.5" /> End-to-end encrypted</span>
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="size-3.5" /> Privacy first</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
          className="relative"
        >
          <div className="absolute -inset-6 -z-10 rounded-3xl bg-accent/20 blur-3xl" />
          <div className="rounded-3xl border border-border bg-card p-6 shadow-2xl shadow-primary/10">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="grid size-10 place-items-center rounded-full bg-primary-soft text-primary">
                <Users className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Candidate · CV-7A2F19</p>
                <p className="text-xs text-muted-foreground">Verified by Asha Foundation</p>
              </div>
              <span className="ml-auto rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-medium text-success">Ready</span>
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
              <Stat label="Profile" value="94%" />
              <Stat label="Resume" value="A+" />
              <Stat label="Interview ready" value="87%" />
              <Stat label="Applications" value="12" />
            </dl>
            <div className="mt-5 space-y-2">
              {["Hospitality", "Customer support", "Tailoring"].map((s) => (
                <div key={s} className="flex items-center justify-between rounded-lg bg-muted px-3 py-2 text-sm">
                  <span>{s}</span>
                  <CheckCircle2 className="size-4 text-success" />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background/60 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold text-primary">{value}</p>
    </div>
  );
}

/* ---------------- Stats ---------------- */

function Stats() {
  const items = [
    { v: "1,200+", l: "Survivors supported" },
    { v: "85", l: "NGO partners" },
    { v: "320+", l: "Placements made" },
    { v: "100%", l: "Verified pathways" },
  ];
  return (
    <section className="border-y border-border bg-card">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px overflow-hidden px-0 sm:grid-cols-4">
        {items.map((it) => (
          <div key={it.l} className="bg-card px-6 py-8 text-center">
            <p className="font-display text-3xl font-bold text-primary sm:text-4xl">{it.v}</p>
            <p className="mt-1 text-sm text-muted-foreground">{it.l}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- How it works ---------------- */

function HowItWorks() {
  const steps = [
    {
      icon: HeartHandshake,
      title: "NGOs onboard survivors",
      body: "Trusted partner NGOs create verified profiles with consent, capturing skills, education, and aspirations.",
    },
    {
      icon: Sparkles,
      title: "AI builds a ready profile",
      body: "Our AI mentor helps generate resumes, recommend skills, and coach for interviews — at the survivor's pace.",
    },
    {
      icon: Briefcase,
      title: "Recruiters discover talent",
      body: "Verified recruiters search anonymized profiles, request introductions, and offer dignified employment.",
    },
  ];
  return (
    <section id="how" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <SectionHeading
        kicker="How it works"
        title="A protected pathway from rescue to readiness"
        subtitle="Every step is consent-first, privacy-first, and human-supported."
      />
      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {steps.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }}
            className="relative rounded-2xl border border-border bg-card p-7 shadow-sm"
          >
            <div className="grid size-11 place-items-center rounded-xl bg-primary-soft text-primary">
              <s.icon className="size-5" />
            </div>
            <h3 className="mt-5 text-lg font-semibold text-primary">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            <span className="absolute right-5 top-5 text-xs font-medium text-muted-foreground">0{i + 1}</span>
          </motion.div>
        ))}
      </div>

    </section>
  );
}

/* ---------------- Features ---------------- */

function Features() {
  const features = [
    { icon: ShieldCheck, title: "Privacy by design", body: "End-to-end encryption, anonymized candidate IDs, and audit logs on every sensitive action." },
    { icon: GraduationCap, title: "AI career mentor", body: "Resume generation, mock interviews, and learning paths tailored to each survivor." },
    { icon: Building2, title: "NGO operations", body: "Manage assigned survivors, track placement progress, and upload verified documents." },
    { icon: Briefcase, title: "Verified recruiters", body: "Subscription-based access for recruiters with clear consent gates before contact." },
    { icon: Users, title: "Role-based access", body: "Five distinct roles with least-privilege access — survivors, NGOs, recruiters, admins." },
    { icon: Sparkles, title: "Readiness scores", body: "Visual progress for profile, resume, and interview readiness at a glance." },
  ];
  return (
    <section id="features" className="bg-muted/40">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <SectionHeading
          kicker="Platform"
          title="Built for the people behind the profile"
          subtitle="A complete operating system for survivor employment — secure, accessible, and humane."
        />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-card p-6">
              <f.icon className="size-5 text-accent" />
              <h3 className="mt-4 font-semibold text-primary">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Partners ---------------- */

function ForPartners() {
  return (
    <section id="partners" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <PartnerCard
          icon={HeartHandshake}
          tag="For NGO partners"
          title="Bring survivors to dignified work — faster"
          points={[
            "Securely onboard and manage your survivors",
            "Track readiness, placements, and progress",
            "Get matched with verified recruiters",
          ]}
          cta="Partner with us"
        />
        <PartnerCard
          icon={Briefcase}
          tag="For recruiters"
          title="Hire from a pool of verified, ready talent"
          points={[
            "Search anonymized profiles by skill",
            "Request introductions through NGOs",
            "Build your inclusive hiring footprint",
          ]}
          cta="Become a recruiter"
          variant="navy"
        />
      </div>
    </section>
  );
}

function PartnerCard({
  icon: Icon,
  tag,
  title,
  points,
  cta,
  variant = "light",
}: {
  icon: typeof HeartHandshake;
  tag: string;
  title: string;
  points: string[];
  cta: string;
  variant?: "light" | "navy";
}) {
  const navy = variant === "navy";
  return (
    <div
      className={`relative overflow-hidden rounded-3xl border p-8 ${
        navy ? "gradient-navy border-transparent text-primary-foreground" : "border-border bg-card"
      }`}
    >
      <div
        className={`grid size-10 place-items-center rounded-xl ${
          navy ? "bg-white/10 text-accent" : "bg-primary-soft text-primary"
        }`}
      >
        <Icon className="size-5" />
      </div>
      <p className={`mt-5 text-xs font-medium uppercase tracking-wider ${navy ? "text-accent" : "text-accent-foreground/70"}`}>
        {tag}
      </p>
      <h3 className={`mt-1 text-2xl font-semibold ${navy ? "text-white" : "text-primary"}`}>{title}</h3>
      <ul className={`mt-5 space-y-2 text-sm ${navy ? "text-white/85" : "text-muted-foreground"}`}>
        {points.map((p) => (
          <li key={p} className="flex items-start gap-2">
            <CheckCircle2 className={`mt-0.5 size-4 ${navy ? "text-accent" : "text-success"}`} />
            {p}
          </li>
        ))}
      </ul>
      <div className="mt-7">
        <Link to="/auth" search={{ mode: "signup" }}>
          <Button variant={navy ? "secondary" : "default"} className="gap-2">
            {cta} <ArrowRight className="size-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

/* ---------------- AI ---------------- */

function AiSupport() {
  return (
    <section id="ai" className="bg-muted/40">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-24 sm:px-6 lg:grid-cols-2">
        <div>
          <SectionHeading
            align="left"
            kicker="AI mentor"
            title="A patient career companion, available any time"
            subtitle="The CAREVIA AI mentor helps survivors build resumes, practice interviews, and learn new skills — in their own language and pace."
          />
          <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
            {[
              "ATS-friendly resume generation",
              "Mock interview questions with feedback",
              "Personalised learning recommendations",
              "Workplace etiquette and expectations",
            ].map((x) => (
              <li key={x} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 size-4 text-accent" />
                {x}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative">
          <div className="absolute -inset-4 -z-10 rounded-3xl bg-accent/15 blur-2xl" />
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xl">
            <div className="space-y-3 text-sm">
              <ChatBubble role="user">Can you help me write a resume for a hotel front-desk job?</ChatBubble>
              <ChatBubble role="ai">
                Of course. Tell me one thing you enjoyed in your last work or training — we'll start there.
              </ChatBubble>
              <ChatBubble role="user">I learned to welcome guests and manage check-in lists.</ChatBubble>
              <ChatBubble role="ai">
                Wonderful. I'll draft a resume highlighting hospitality, attention to detail, and Hindi & English communication.
              </ChatBubble>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ChatBubble({ role, children }: { role: "user" | "ai"; children: React.ReactNode }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
          isUser ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

/* ---------------- Closing CTA ---------------- */

function ClosingCta() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <div className="gradient-navy relative overflow-hidden rounded-3xl px-8 py-16 text-center text-primary-foreground sm:px-16">
        <div className="absolute inset-0 bg-[radial-gradient(800px_400px_at_50%_-20%,rgba(255,255,255,0.18),transparent)]" />
        <h2 className="relative font-display text-3xl font-bold sm:text-4xl">
          Help build the next chapter — together.
        </h2>
        <p className="relative mx-auto mt-3 max-w-2xl text-white/80">
          Whether you're an NGO supporting survivors or a recruiter who believes in inclusive hiring,
          CAREVIA gives you the tools to make impact at scale.
        </p>
        <div className="relative mt-7 flex flex-wrap justify-center gap-3">
          <Link to="/auth" search={{ mode: "signup" }}>
            <Button size="lg" variant="secondary">Create an account</Button>
          </Link>
          <Link to="/auth">
            <Button size="lg" variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
              I already have an account
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Footer ---------------- */

function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:px-6">
        <div className="flex items-center gap-3">
          <Logo className="h-7 w-auto" />
          <span className="text-xs">© {new Date().getFullYear()} CAREVIA. Guided by values. Driven by people.</span>
        </div>
        <div className="flex gap-5 text-xs">
          <a href="#" className="hover:text-foreground">Privacy</a>
          <a href="#" className="hover:text-foreground">Terms</a>
          <a href="#" className="hover:text-foreground">Contact</a>
        </div>
      </div>
    </footer>
  );
}

/* ---------------- Bits ---------------- */

function SectionHeading({
  kicker,
  title,
  subtitle,
  align = "center",
}: {
  kicker: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">{kicker}</p>
      <h2 className="mt-3 font-display text-3xl font-bold text-primary sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-3 text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

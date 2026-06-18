import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getAdminAnalytics = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: isAdmin } = await supabase.rpc("is_admin", { _user_id: userId });
    if (!isAdmin) throw new Error("Admin only");

    const [
      survivors,
      ngos,
      pendingNgos,
      pendingRecruiters,
      intros,
      acceptedIntros,
      jobs,
      publishedJobs,
      applications,
      hires,
      flaggedMessages,
    ] = await Promise.all([
      supabase.from("survivors").select("id", { count: "exact", head: true }),
      supabase.from("ngos").select("id", { count: "exact", head: true }).eq("status", "approved"),
      supabase.from("ngos").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("recruiters").select("id", { count: "exact", head: true }).eq("verification_status", "pending"),
      supabase.from("introduction_requests").select("id", { count: "exact", head: true }),
      supabase.from("introduction_requests").select("id", { count: "exact", head: true }).eq("status", "accepted"),
      supabase.from("jobs").select("id", { count: "exact", head: true }),
      supabase.from("jobs").select("id", { count: "exact", head: true }).eq("status", "published"),
      supabase.from("job_applications").select("id", { count: "exact", head: true }),
      supabase.from("job_applications").select("id", { count: "exact", head: true }).eq("status", "hired"),
      supabase.from("mentor_messages").select("id", { count: "exact", head: true }).eq("safety_flagged", true),
    ]);

    return {
      totalSurvivors: survivors.count ?? 0,
      activeNgos: ngos.count ?? 0,
      pendingNgoApprovals: pendingNgos.count ?? 0,
      pendingRecruiterApprovals: pendingRecruiters.count ?? 0,
      introductionsSent: intros.count ?? 0,
      introductionsAccepted: acceptedIntros.count ?? 0,
      jobsPosted: jobs.count ?? 0,
      jobsPublished: publishedJobs.count ?? 0,
      applicationsSubmitted: applications.count ?? 0,
      hires: hires.count ?? 0,
      safetyFlaggedMessages: flaggedMessages.count ?? 0,
    };
  });

export const getNgoAnalytics = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: ngo } = await supabase.from("ngos").select("id").eq("owner_id", userId).single();
    if (!ngo) throw new Error("NGO not found");

    const [survivors, intros, acceptedIntros, applications, hires, threads] = await Promise.all([
      supabase.from("survivors").select("profile_completion").eq("ngo_id", ngo.id),
      supabase.from("introduction_requests").select("id", { count: "exact", head: true }).eq("ngo_id", ngo.id),
      supabase.from("introduction_requests").select("id", { count: "exact", head: true }).eq("ngo_id", ngo.id).eq("status", "accepted"),
      supabase.from("job_applications").select("id", { count: "exact", head: true }).eq("ngo_id", ngo.id),
      supabase.from("job_applications").select("id", { count: "exact", head: true }).eq("ngo_id", ngo.id).eq("status", "hired"),
      supabase.from("mentor_threads").select("id", { count: "exact", head: true }).eq("user_id", userId),
    ]);

    const completions = survivors.data?.map((s) => s.profile_completion) ?? [];
    const avgCompletion =
      completions.length > 0 ? completions.reduce((a, b) => a + b, 0) / completions.length : 0;

    return {
      survivorsManaged: completions.length,
      avgProfileCompletion: Math.round(avgCompletion),
      introsReceived: intros.count ?? 0,
      introsAccepted: acceptedIntros.count ?? 0,
      applicationsSubmitted: applications.count ?? 0,
      hires: hires.count ?? 0,
      mentorSessions: threads.count ?? 0,
    };
  });

export const getRecruiterAnalytics = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: recruiter } = await supabase.from("recruiters").select("id").eq("user_id", userId).single();
    if (!recruiter) throw new Error("Recruiter not found");

    const [activeJobs, intros, acceptedIntros, applications, hires] = await Promise.all([
      supabase.from("jobs").select("id", { count: "exact", head: true }).eq("recruiter_id", recruiter.id).eq("status", "published"),
      supabase.from("introduction_requests").select("id", { count: "exact", head: true }).eq("recruiter_id", recruiter.id),
      supabase.from("introduction_requests").select("id", { count: "exact", head: true }).eq("recruiter_id", recruiter.id).eq("status", "accepted"),
      supabase
        .from("job_applications")
        .select("id", { count: "exact", head: true })
        .in("job_id", (await supabase.from("jobs").select("id").eq("recruiter_id", recruiter.id)).data?.map((j) => j.id) ?? []),
      supabase
        .from("job_applications")
        .select("id", { count: "exact", head: true })
        .eq("status", "hired")
        .in("job_id", (await supabase.from("jobs").select("id").eq("recruiter_id", recruiter.id)).data?.map((j) => j.id) ?? []),
    ]);

    return {
      activeJobs: activeJobs.count ?? 0,
      introsSent: intros.count ?? 0,
      introsAccepted: acceptedIntros.count ?? 0,
      applicationsReceived: applications.count ?? 0,
      hires: hires.count ?? 0,
    };
  });

export const exportAdminCsv = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: isAdmin } = await supabase.rpc("is_admin", { _user_id: userId });
    if (!isAdmin) throw new Error("Admin only");

    const { data: survivors } = await supabase
      .from("survivors")
      .select("anonymous_id, status, profile_completion, location_country, searchable, created_at");

    const header = "anonymous_id,status,profile_completion,location_country,searchable,created_at\n";
    const rows = (survivors ?? [])
      .map(
        (s) =>
          `${s.anonymous_id},${s.status},${s.profile_completion},${s.location_country ?? ""},${s.searchable},${s.created_at}`,
      )
      .join("\n");

    return { csv: header + rows };
  });

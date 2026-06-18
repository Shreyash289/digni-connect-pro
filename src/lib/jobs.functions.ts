import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const jobInputSchema = z.object({
  title: z.string().min(3).max(200),
  company_name: z.string().min(2).max(200),
  description: z.string().max(10000).default(""),
  required_skills: z.array(z.string()).default([]),
  preferred_skills: z.array(z.string()).default([]),
  languages: z.array(z.string()).default([]),
  location_country: z.string().optional(),
  location_region: z.string().optional(),
  remote_ok: z.boolean().default(false),
  employment_type: z.enum(["full_time", "part_time", "contract", "internship"]).default("full_time"),
  salary_min: z.number().int().positive().optional(),
  salary_max: z.number().int().positive().optional(),
  currency: z.string().default("INR"),
  closes_at: z.string().optional(),
});

export const createJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(jobInputSchema)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: recruiter } = await supabase.from("recruiters").select("id").eq("user_id", userId).single();
    if (!recruiter) throw new Error("Recruiter profile required");

    const { data: job, error } = await supabase
      .from("jobs")
      .insert({ ...data, recruiter_id: recruiter.id })
      .select()
      .single();
    if (error) throw new Error(error.message);

    const { writeAudit } = await import("@/lib/audit.server");
    await writeAudit(supabase, { actorId: userId, action: "job.create", entityType: "job", entityId: job.id });
    return job;
  });

export const updateJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid(), patch: jobInputSchema.partial() }))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: job, error } = await supabase
      .from("jobs")
      .update(data.patch)
      .eq("id", data.id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return job;
  });

export const publishJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: job, error } = await supabase
      .from("jobs")
      .update({ status: "published", published_at: new Date().toISOString() })
      .eq("id", data.id)
      .select()
      .single();
    if (error) throw new Error(error.message);

    const { writeAudit } = await import("@/lib/audit.server");
    await writeAudit(supabase, { actorId: userId, action: "job.publish", entityType: "job", entityId: data.id });
    void embedJobInternal(data.id);
    return job;
  });

export const closeJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: job, error } = await supabase
      .from("jobs")
      .update({ status: "closed" })
      .eq("id", data.id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    const { writeAudit } = await import("@/lib/audit.server");
    await writeAudit(supabase, { actorId: userId, action: "job.close", entityType: "job", entityId: data.id });
    return job;
  });

async function embedJobInternal(jobId: string) {
  try {
    const { embedText, buildJobEmbedText } = await import("@/lib/ai-gateway.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: job } = await supabaseAdmin.from("jobs").select("*").eq("id", jobId).single();
    if (!job) return;
    const embedding = await embedText(buildJobEmbedText(job));
    await supabaseAdmin.from("jobs").update({ embedding: JSON.stringify(embedding) }).eq("id", jobId);
  } catch (e) {
    console.error("[embedJob]", e);
  }
}

export const listPublishedJobs = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      filters: z
        .object({
          query: z.string().optional(),
          location_country: z.string().optional(),
          remote_ok: z.boolean().optional(),
          employment_type: z.string().optional(),
        })
        .default({}),
      page: z.number().int().min(1).default(1),
    }),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const pageSize = 12;
    const from = (data.page - 1) * pageSize;

    let q = supabaseAdmin
      .from("jobs")
      .select("id, title, company_name, description, required_skills, location_country, location_region, remote_ok, employment_type, salary_min, salary_max, currency, published_at", { count: "exact" })
      .eq("status", "published")
      .range(from, from + pageSize - 1)
      .order("published_at", { ascending: false });

    if (data.filters.query) q = q.ilike("title", `%${data.filters.query}%`);
    if (data.filters.location_country) q = q.eq("location_country", data.filters.location_country);
    if (data.filters.remote_ok) q = q.eq("remote_ok", true);
    if (data.filters.employment_type) q = q.eq("employment_type", data.filters.employment_type);

    const { data: jobs, count, error } = await q;
    if (error) throw new Error(error.message);
    return { jobs: jobs ?? [], total: count ?? 0, page: data.page, pageSize };
  });

export const getPublishedJob = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: job, error } = await supabaseAdmin
      .from("jobs")
      .select("id, title, company_name, description, required_skills, preferred_skills, languages, location_country, location_region, remote_ok, employment_type, salary_min, salary_max, currency, published_at, closes_at")
      .eq("id", data.id)
      .eq("status", "published")
      .single();
    if (error) throw new Error("Job not found");
    return job;
  });

export const applyToJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      jobId: z.string().uuid(),
      survivorId: z.string().uuid(),
      coverNote: z.string().max(2000).optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: survivor } = await supabase
      .from("survivors")
      .select("id, ngo_id")
      .eq("id", data.survivorId)
      .single();
    if (!survivor) throw new Error("Survivor not found");

    const { data: app, error } = await supabase
      .from("job_applications")
      .insert({
        job_id: data.jobId,
        survivor_id: data.survivorId,
        ngo_id: survivor.ngo_id,
        cover_note: data.coverNote ?? null,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);

    const { writeAudit } = await import("@/lib/audit.server");
    await writeAudit(supabase, {
      actorId: userId,
      action: "application.submit",
      entityType: "job_application",
      entityId: app.id,
    });

    const { data: job } = await supabase
      .from("jobs")
      .select("title, recruiters(user_id)")
      .eq("id", data.jobId)
      .single();
    const recruiterUserId = (job?.recruiters as { user_id: string } | null)?.user_id;
    if (recruiterUserId) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { notify } = await import("@/lib/notify.server");
      await notify(supabaseAdmin, {
        userId: recruiterUserId,
        kind: "job_application_received",
        payload: { applicationId: app.id, jobTitle: job?.title },
      });
    }

    return app;
  });

export const updateApplicationStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      id: z.string().uuid(),
      status: z.enum(["reviewing", "shortlisted", "rejected", "hired"]),
    }),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: app, error } = await supabase
      .from("job_applications")
      .update({ status: data.status })
      .eq("id", data.id)
      .select("*, survivors(ngo_id, ngos(owner_id))")
      .single();
    if (error) throw new Error(error.message);

    const { writeAudit } = await import("@/lib/audit.server");
    await writeAudit(supabase, {
      actorId: userId,
      action: "application.status_change",
      entityType: "job_application",
      entityId: data.id,
      metadata: { status: data.status },
    });

    const ownerId = (
      app.survivors as { ngos: { owner_id: string } | null } | null
    )?.ngos?.owner_id;
    if (ownerId) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { notify } = await import("@/lib/notify.server");
      await notify(supabaseAdmin, {
        userId: ownerId,
        kind: "application_status_changed",
        payload: { applicationId: data.id, status: data.status },
      });
    }

    return app;
  });

export const listRecruiterJobs = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: recruiter } = await supabase.from("recruiters").select("id").eq("user_id", userId).single();
    if (!recruiter) return [];
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("recruiter_id", recruiter.id)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const searchFiltersSchema = z.object({
  skills: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  location_country: z.string().optional(),
  location_region: z.string().optional(),
  availability: z.string().optional(),
  query: z.string().optional(),
});

export const searchSurvivors = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ filters: searchFiltersSchema, page: z.number().int().min(1).default(1) }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const pageSize = 12;
    const from = (data.page - 1) * pageSize;

    const { data: allowed } = await supabase.rpc("is_recruiter_approved", { _user_id: userId });
    if (!allowed) throw new Error("Recruiter not verified");

    const { data: ok } = await supabase.rpc("check_rate_limit", {
      _user_id: userId,
      _action: "recruiter_search",
      _max: 30,
    });
    if (!ok) throw new Error("Rate limit exceeded. Try again in a minute.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin
      .from("survivor_directory")
      .select("*", { count: "exact" })
      .eq("searchable", true)
      .range(from, from + pageSize - 1);

    if (data.filters.skills?.length) {
      q = q.overlaps("skills", data.filters.skills);
    }
    if (data.filters.languages?.length) {
      q = q.overlaps("languages", data.filters.languages);
    }
    if (data.filters.location_country) {
      q = q.eq("location_country", data.filters.location_country);
    }
    if (data.filters.location_region) {
      q = q.ilike("location_region", `%${data.filters.location_region}%`);
    }
    if (data.filters.availability) {
      q = q.eq("availability", data.filters.availability);
    }
    if (data.filters.query) {
      q = q.ilike("bio_excerpt", `%${data.filters.query}%`);
    }

    const { data: results, count, error } = await q;
    if (error) throw new Error(error.message);

    const { writeAudit } = await import("@/lib/audit.server");
    await writeAudit(supabase, {
      actorId: userId,
      action: "recruiter.search",
      entityType: "survivor_directory",
      metadata: { filters: data.filters, page: data.page, resultCount: results?.length ?? 0 },
    });

    return { results: results ?? [], total: count ?? 0, page: data.page, pageSize };
  });

export const requestIntroduction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      survivorId: z.string().uuid(),
      message: z.string().min(10).max(2000),
      jobId: z.string().uuid().optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: recruiter } = await supabase
      .from("recruiters")
      .select("id")
      .eq("user_id", userId)
      .eq("verification_status", "approved")
      .single();
    if (!recruiter) throw new Error("Recruiter not verified");

    const { data: survivor } = await supabase
      .from("survivors")
      .select("id, ngo_id, searchable")
      .eq("id", data.survivorId)
      .eq("searchable", true)
      .single();
    if (!survivor) throw new Error("Survivor not available for introduction");

    const { data: ngo } = await supabase.from("ngos").select("owner_id").eq("id", survivor.ngo_id).single();

    const { data: req, error } = await supabase
      .from("introduction_requests")
      .insert({
        recruiter_id: recruiter.id,
        survivor_id: data.survivorId,
        ngo_id: survivor.ngo_id,
        job_id: data.jobId ?? null,
        message: data.message,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);

    const { writeAudit } = await import("@/lib/audit.server");
    await writeAudit(supabase, {
      actorId: userId,
      action: "intro.request",
      entityType: "introduction_request",
      entityId: req.id,
    });

    if (ngo?.owner_id) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { notify } = await import("@/lib/notify.server");
      await notify(supabaseAdmin, {
        userId: ngo.owner_id,
        kind: "intro_request_received",
        payload: { requestId: req.id, survivorId: data.survivorId },
      });
    }

    return req;
  });

export const respondToIntroduction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      id: z.string().uuid(),
      status: z.enum(["accepted", "declined"]),
      note: z.string().max(1000).optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: req, error } = await supabase
      .from("introduction_requests")
      .update({
        status: data.status,
        response_note: data.note ?? null,
        responded_at: new Date().toISOString(),
      })
      .eq("id", data.id)
      .select("*, recruiters(user_id)")
      .single();
    if (error) throw new Error(error.message);

    const { writeAudit } = await import("@/lib/audit.server");
    await writeAudit(supabase, {
      actorId: userId,
      action: "intro.respond",
      entityType: "introduction_request",
      entityId: data.id,
      metadata: { status: data.status },
    });

    const recruiterUserId = (req.recruiters as { user_id: string } | null)?.user_id;
    if (recruiterUserId) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { notify } = await import("@/lib/notify.server");
      await notify(supabaseAdmin, {
        userId: recruiterUserId,
        kind: "intro_request_responded",
        payload: { requestId: data.id, status: data.status },
      });
    }

    return req;
  });

export const verifyRecruiter = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      id: z.string().uuid(),
      status: z.enum(["approved", "rejected"]),
      notes: z.string().optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: isAdmin } = await supabase.rpc("is_admin", { _user_id: userId });
    if (!isAdmin) throw new Error("Admin only");

    const { data: recruiter, error } = await supabase
      .from("recruiters")
      .update({
        verification_status: data.status,
        verified_by: userId,
        verified_at: new Date().toISOString(),
        notes: data.notes ?? null,
      })
      .eq("id", data.id)
      .select()
      .single();
    if (error) throw new Error(error.message);

    const { writeAudit } = await import("@/lib/audit.server");
    await writeAudit(supabase, {
      actorId: userId,
      action: "recruiter.verify",
      entityType: "recruiter",
      entityId: data.id,
      metadata: { status: data.status },
    });

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { notify } = await import("@/lib/notify.server");
    await notify(supabaseAdmin, {
      userId: recruiter.user_id,
      kind: data.status === "approved" ? "recruiter_verified" : "recruiter_rejected",
      payload: { recruiterId: data.id },
    });

    return recruiter;
  });

export const getRecruiterProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase.from("recruiters").select("*").eq("user_id", userId).maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  });

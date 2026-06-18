import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const embedSurvivor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: s, error } = await supabase.from("survivors").select("*").eq("id", data.id).single();
    if (error || !s) throw new Error("Survivor not found");

    const { embedText, buildSurvivorEmbedText } = await import("@/lib/ai-gateway.server");
    const embedding = await embedText(buildSurvivorEmbedText(s));
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("survivors").update({ embedding: JSON.stringify(embedding) }).eq("id", data.id);
    return { ok: true };
  });

export const embedJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: job, error } = await supabaseAdmin.from("jobs").select("*").eq("id", data.id).single();
    if (error || !job) throw new Error("Job not found");

    const { embedText, buildJobEmbedText } = await import("@/lib/ai-gateway.server");
    const embedding = await embedText(buildJobEmbedText(job));
    await supabaseAdmin.from("jobs").update({ embedding: JSON.stringify(embedding) }).eq("id", data.id);
    return { ok: true };
  });

function structuredScore(
  survivor: {
    skills?: string[] | null;
    languages?: string[] | null;
    location_country?: string | null;
    availability?: string | null;
    certifications?: unknown;
  },
  job: {
    required_skills?: string[] | null;
    preferred_skills?: string[] | null;
    languages?: string[] | null;
    location_country?: string | null;
    remote_ok?: boolean;
    employment_type?: string | null;
  },
): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 0;

  const sSkills = new Set((survivor.skills ?? []).map((s) => s.toLowerCase()));
  const required = job.required_skills ?? [];
  const preferred = job.preferred_skills ?? [];
  const reqHits = required.filter((r) => sSkills.has(r.toLowerCase())).length;
  const prefHits = preferred.filter((p) => sSkills.has(p.toLowerCase())).length;

  if (required.length > 0) {
    const coverage = reqHits / required.length;
    score += coverage * 0.4;
    if (coverage >= 0.5) reasons.push(`${reqHits}/${required.length} required skills matched`);
  } else {
    score += 0.2;
  }
  if (prefHits > 0) {
    score += Math.min(prefHits * 0.05, 0.15);
    reasons.push(`${prefHits} preferred skills matched`);
  }

  const sLangs = new Set((survivor.languages ?? []).map((l) => l.toLowerCase()));
  const jLangs = job.languages ?? [];
  const langOverlap = jLangs.filter((l) => sLangs.has(l.toLowerCase())).length;
  if (jLangs.length === 0 || langOverlap > 0) {
    score += 0.15;
    if (langOverlap > 0) reasons.push("Language requirements met");
  }

  if (job.remote_ok || !job.location_country || survivor.location_country === job.location_country) {
    score += 0.15;
    reasons.push("Location/remote compatible");
  }

  if (!job.employment_type || survivor.availability === job.employment_type || survivor.availability === "flexible") {
    score += 0.1;
    reasons.push("Availability aligned");
  }

  return { score: Math.min(score, 1), reasons: reasons.slice(0, 3) };
}

export const computeMatches = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      jobId: z.string().uuid().optional(),
      survivorId: z.string().uuid().optional(),
      topK: z.number().int().min(1).max(50).default(20),
    }),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const results: Array<{
      survivor_id: string;
      job_id: string;
      score: number;
      breakdown: Record<string, unknown>;
      summary?: string;
      anonymous_id?: string;
    }> = [];

    if (data.jobId) {
      const { data: job } = await supabaseAdmin.from("jobs").select("*").eq("id", data.jobId).single();
      if (!job) throw new Error("Job not found");

      const { data: survivors } = await supabaseAdmin
        .from("survivors")
        .select("id, anonymous_id, skills, languages, location_country, availability, certifications, bio, work_history, embedding")
        .eq("searchable", true)
        .limit(100);

      for (const s of survivors ?? []) {
        const { score, reasons } = structuredScore(s, job);
        let finalScore = score;
        const breakdown: Record<string, unknown> = { structured: score, reasons };

        if (s.embedding && job.embedding) {
          breakdown.vector = 0.5;
          finalScore = score * 0.6 + 0.4 * 0.5;
        }

        if (finalScore < 0.2) continue;

        await supabaseAdmin.from("match_scores").upsert(
          {
            survivor_id: s.id,
            job_id: data.jobId,
            score: finalScore,
            breakdown,
          },
          { onConflict: "survivor_id,job_id" },
        );

        results.push({
          survivor_id: s.id,
          job_id: data.jobId,
          score: finalScore,
          breakdown,
          anonymous_id: s.anonymous_id,
        });
      }
    }

    if (data.survivorId) {
      const { data: survivor } = await supabaseAdmin
        .from("survivors")
        .select("*")
        .eq("id", data.survivorId)
        .single();
      if (!survivor) throw new Error("Survivor not found");

      const { data: jobs } = await supabaseAdmin
        .from("jobs")
        .select("*")
        .eq("status", "published")
        .limit(50);

      for (const job of jobs ?? []) {
        const { score, reasons } = structuredScore(survivor, job);
        if (score < 0.2) continue;
        await supabaseAdmin.from("match_scores").upsert(
          {
            survivor_id: data.survivorId,
            job_id: job.id,
            score,
            breakdown: { structured: score, reasons },
          },
          { onConflict: "survivor_id,job_id" },
        );
        results.push({
          survivor_id: data.survivorId,
          job_id: job.id,
          score,
          breakdown: { reasons },
        });
      }
    }

    return results.sort((a, b) => b.score - a.score).slice(0, data.topK);
  });

export const getMatchScoresForJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ jobId: z.string().uuid(), topK: z.number().default(10) }))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: scores, error } = await supabase
      .from("match_scores")
      .select("*, survivors(anonymous_id, skills, availability)")
      .eq("job_id", data.jobId)
      .order("score", { ascending: false })
      .limit(data.topK);
    if (error) throw new Error(error.message);
    return scores ?? [];
  });

export const getMatchScoresForSurvivor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ survivorId: z.string().uuid(), topK: z.number().default(10) }))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: scores, error } = await supabase
      .from("match_scores")
      .select("*, jobs(id, title, company_name, employment_type, remote_ok)")
      .eq("survivor_id", data.survivorId)
      .order("score", { ascending: false })
      .limit(data.topK);
    if (error) throw new Error(error.message);
    return scores ?? [];
  });

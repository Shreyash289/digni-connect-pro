import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Returns the survivor profile linked to the authenticated user
 * (survivors.linked_user_id = auth.uid()), plus:
 *  - ngo info if associated
 *  - count of job applications
 *
 * Security: requireSupabaseAuth verifies the JWT. The supabase client
 * forwarded to the handler carries the user's token, so the Supabase RLS
 * policy "survivors read own linked profile" (linked_user_id = auth.uid())
 * is enforced at the database level — no other survivor's row can be returned.
 */
export const getSurvivorPortalData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    // 1. Load survivor profile linked to this user
    const { data: survivor, error: sErr } = await supabase
      .from("survivors")
      .select(
        [
          "id",
          "full_name",
          "anonymous_id",
          "city",
          "state",
          "country",
          "location_country",
          "location_region",
          "skills",
          "languages",
          "bio",
          "education_level",
          "education",
          "work_history",
          "certifications",
          "availability",
          "profile_completion",
          "status",
          "resume_url",
          "resume_name",
          "resume_uploaded_at",
          "consent_share_with_recruiters",
          "consent_ai_processing",
          "ngo_id",
          "created_at",
          "updated_at",
        ].join(", "),
      )
      .eq("linked_user_id", userId)
      .maybeSingle();

    if (sErr) throw new Error(sErr.message);

    if (!survivor) {
      // No profile yet — return null so the UI can show the empty state
      return { survivor: null, applicationCount: 0, applicationsByStatus: {}, ngo: null };
    }

    // 2. Load NGO info if associated
    let ngo: { id: string; name: string; status: string } | null = null;
    if (survivor.ngo_id) {
      const { data: ngoData } = await supabase
        .from("ngos")
        .select("id, name, status")
        .eq("id", survivor.ngo_id)
        .maybeSingle();
      ngo = ngoData ?? null;
    }

    // 3. Count job applications for this survivor (RLS on job_applications
    //    allows NGO-owned survivors; self-registered survivors with linked_user_id
    //    read via the "survivors read own linked profile" policy chain).
    const { count: applicationCount, error: appCountErr } = await supabase
      .from("job_applications")
      .select("id", { count: "exact", head: true })
      .eq("survivor_id", survivor.id);

    if (appCountErr) {
      // Non-fatal: count unavailable — default to 0
      console.error("[getSurvivorPortalData] application count error:", appCountErr.message);
    }

    // 4. Count by status for a meaningful breakdown
    const { data: statusRows } = await supabase
      .from("job_applications")
      .select("status")
      .eq("survivor_id", survivor.id);

    const applicationsByStatus: Record<string, number> = {};
    for (const row of statusRows ?? []) {
      applicationsByStatus[row.status] = (applicationsByStatus[row.status] ?? 0) + 1;
    }

    return {
      survivor,
      applicationCount: applicationCount ?? 0,
      applicationsByStatus,
      ngo,
    };
  });

const certificationItemSchema = z.object({
  name: z.string().min(1, "Certification name is required"),
  issuer: z.string().min(1, "Issuer is required"),
  year: z.number().optional(),
  url: z.string().url().optional().or(z.literal("")),
});

const workHistoryItemSchema = z.object({
  role: z.string().min(1, "Role is required"),
  org: z.string().min(1, "Organization is required"),
  start: z.string().min(1, "Start date is required"),
  end: z.string().optional(),
  description: z.string().optional(),
});

const educationItemSchema = z.object({
  level: z.string().min(1, "Education level is required"),
  institution: z.string().min(1, "Institution is required"),
  field: z.string().optional(),
  year: z.number().optional(),
});

export const survivorProfileSaveSchema = z.object({
  full_name: z.string().min(1, "Full name is required").max(100),
  pronouns: z.string().max(50).optional().nullable(),
  gender: z.string().max(50).optional().nullable(),
  date_of_birth: z.string().optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal("")),
  emergency_contact: z.string().max(200).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  location_region: z.string().max(100).optional().nullable(),
  location_country: z.string().max(100).optional().nullable(),
  bio: z.string().max(2000).optional().nullable(),
  skills: z.array(z.string()).optional().default([]),
  languages: z.array(z.string()).optional().default([]),
  interests: z.array(z.string()).optional().default([]),
  education_level: z.string().max(100).optional().nullable(),
  education: z.array(educationItemSchema).optional().default([]),
  work_history: z.array(workHistoryItemSchema).optional().default([]),
  certifications: z.array(certificationItemSchema).optional().default([]),
  availability: z
    .enum(["full_time", "part_time", "remote", "onsite", "flexible"])
    .optional()
    .nullable(),
  consent_share_with_recruiters: z.boolean().optional().default(false),
  consent_ai_processing: z.boolean().optional().default(true),
});

/**
 * Returns full survivor profile details for the authenticated user to edit.
 */
export const getMySurvivorProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { data: survivor, error } = await supabase
      .from("survivors")
      .select("*")
      .eq("linked_user_id", userId)
      .maybeSingle();

    if (error) throw new Error(error.message);

    // If no survivor profile exists yet, grab default full_name from profiles
    if (!survivor) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, phone")
        .eq("id", userId)
        .maybeSingle();

      return {
        survivor: null,
        defaultName: profile?.full_name ?? "",
        defaultPhone: profile?.phone ?? "",
      };
    }

    return {
      survivor,
      defaultName: survivor.full_name,
      defaultPhone: survivor.phone ?? "",
    };
  });

/**
 * Saves (inserts or updates) the authenticated survivor's profile.
 * Double-enforces security: linked_user_id is strictly derived from the verified JWT.
 */
export const saveMySurvivorProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ data: survivorProfileSaveSchema }))
  .handler(async ({ data: input, context }) => {
    const { supabase, userId } = context;
    const values = input.data;

    // Check if survivor profile already exists for this user
    const { data: existing, error: findErr } = await supabase
      .from("survivors")
      .select("id, status")
      .eq("linked_user_id", userId)
      .maybeSingle();

    if (findErr) throw new Error(findErr.message);

    const payload = {
      full_name: values.full_name.trim(),
      pronouns: values.pronouns?.trim() || null,
      gender: values.gender?.trim() || null,
      date_of_birth: values.date_of_birth || null,
      phone: values.phone?.trim() || null,
      email: values.email?.trim() || null,
      emergency_contact: values.emergency_contact?.trim() || null,
      city: values.city?.trim() || null,
      state: values.state?.trim() || null,
      country: values.country?.trim() || "India",
      location_region: values.location_region?.trim() || values.city?.trim() || null,
      location_country: values.location_country?.trim() || values.country?.trim() || "India",
      bio: values.bio?.trim() || null,
      skills: values.skills,
      languages: values.languages,
      interests: values.interests,
      education_level: values.education_level || null,
      education: values.education,
      work_history: values.work_history,
      certifications: values.certifications,
      availability: values.availability || null,
      consent_share_with_recruiters: values.consent_share_with_recruiters,
      consent_ai_processing: values.consent_ai_processing,
      updated_at: new Date().toISOString(),
      updated_by: userId,
    };

    let resultSurvivor;

    if (existing) {
      // Update existing record
      const { data: updated, error: updateErr } = await supabase
        .from("survivors")
        .update(payload)
        .eq("id", existing.id)
        .eq("linked_user_id", userId) // Extra safety guarantee
        .select()
        .single();

      if (updateErr) throw new Error(updateErr.message);
      resultSurvivor = updated;
    } else {
      // Insert new record linked to this user
      const { data: inserted, error: insertErr } = await supabase
        .from("survivors")
        .insert({
          ...payload,
          linked_user_id: userId,
          created_by: userId,
          status: "approved",
        })
        .select()
        .single();

      if (insertErr) throw new Error(insertErr.message);
      resultSurvivor = inserted;
    }

    // Keep profiles table full_name in sync
    await supabase
      .from("profiles")
      .update({ full_name: values.full_name.trim(), updated_at: new Date().toISOString() })
      .eq("id", userId);

    return { ok: true, survivor: resultSurvivor };
  });

/**
 * Returns all job_applications for the authenticated survivor,
 * joined with the job title and company name.
 *
 * Security: same RLS chain as getSurvivorPortalData — the survivor_id is
 * looked up from the authenticated user's linked_user_id, not from a URL param.
 */
export const getSurvivorApplications = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    // First resolve the survivor_id from linked_user_id
    const { data: survivor, error: sErr } = await supabase
      .from("survivors")
      .select("id")
      .eq("linked_user_id", userId)
      .maybeSingle();

    if (sErr) throw new Error(sErr.message);
    if (!survivor) return [];

    const { data: applications, error } = await supabase
      .from("job_applications")
      .select(
        "id, status, cover_note, created_at, updated_at, jobs(id, title, company_name, employment_type, location_country, location_region, remote_ok)",
      )
      .eq("survivor_id", survivor.id)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return applications ?? [];
  });


import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const certificationSchema = z.object({
  name: z.string(),
  issuer: z.string(),
  year: z.number().optional(),
  url: z.string().url().optional(),
});

const workHistorySchema = z.object({
  role: z.string(),
  org: z.string(),
  start: z.string(),
  end: z.string().optional(),
  description: z.string().optional(),
});

const educationSchema = z.object({
  level: z.string(),
  institution: z.string(),
  field: z.string().optional(),
  year: z.number().optional(),
});

const profilePatchSchema = z.object({
  pronouns: z.string().max(50).optional(),
  date_of_birth: z.string().nullable().optional(),
  gender: z.string().max(50).optional(),
  languages: z.array(z.string()).optional(),
  location_country: z.string().max(100).optional(),
  location_region: z.string().max(100).optional(),
  bio: z.string().max(2000).optional(),
  skills: z.array(z.string()).optional(),
  certifications: z.array(certificationSchema).optional(),
  work_history: z.array(workHistorySchema).optional(),
  education: z.array(educationSchema).optional(),
  interests: z.array(z.string()).optional(),
  availability: z.enum(["full_time", "part_time", "remote", "onsite", "flexible"]).optional(),
  consent_share_with_recruiters: z.boolean().optional(),
  consent_ai_processing: z.boolean().optional(),
});

export const getSurvivorDetail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: survivor, error } = await supabase
      .from("survivors")
      .select("*, survivor_documents(*)")
      .eq("id", data.id)
      .single();
    if (error) throw new Error(error.message);
    return survivor;
  });

export const updateSurvivorProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid(), patch: profilePatchSchema }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const patch: Record<string, unknown> = { ...data.patch, updated_by: userId };

    if (data.patch.consent_share_with_recruiters !== undefined) {
      patch.consent_share_changed_at = new Date().toISOString();
    }
    if (data.patch.consent_ai_processing !== undefined) {
      patch.consent_ai_changed_at = new Date().toISOString();
    }

    const { data: updated, error } = await supabase
      .from("survivors")
      .update(patch)
      .eq("id", data.id)
      .select()
      .single();
    if (error) throw new Error(error.message);

    const { writeAudit } = await import("@/lib/audit.server");
    await writeAudit(supabase, {
      actorId: userId,
      action: "survivor.update",
      entityType: "survivor",
      entityId: data.id,
      metadata: { fields: Object.keys(data.patch) },
    });

    // Debounced re-embed (fire-and-forget within handler)
    void embedSurvivorInternal(supabase, userId, data.id);

    return updated;
  });

async function embedSurvivorInternal(
  supabase: Awaited<ReturnType<typeof import("@supabase/supabase-js").createClient>>,
  _userId: string,
  survivorId: string,
) {
  await new Promise((r) => setTimeout(r, 100));
  try {
    const { buildSurvivorEmbedText, embedText } = await import("@/lib/ai-gateway.server");
    const { data: s } = await supabase.from("survivors").select("*").eq("id", survivorId).single();
    if (!s) return;
    const text = buildSurvivorEmbedText(s);
    const embedding = await embedText(text);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin
      .from("survivors")
      .update({ embedding: JSON.stringify(embedding) })
      .eq("id", survivorId);
  } catch (e) {
    console.error("[embedSurvivor]", e);
  }
}

export const uploadSurvivorDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      survivorId: z.string().uuid(),
      fileName: z.string().min(1).max(255),
      mimeType: z.string(),
      sizeBytes: z.number().positive().max(10_485_760),
      kind: z.enum(["ID", "Certificate", "Reference", "Medical", "Other"]),
    }),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: survivor, error: sErr } = await supabase
      .from("survivors")
      .select("id, ngo_id")
      .eq("id", data.survivorId)
      .single();
    if (sErr || !survivor) throw new Error("Survivor not found");

    const storagePath = `${survivor.ngo_id}/${data.survivorId}/${crypto.randomUUID()}-${data.fileName}`;

    const { data: signed, error: signErr } = await supabase.storage
      .from("survivor-documents")
      .createSignedUploadUrl(storagePath);
    if (signErr) throw new Error(signErr.message);

    const { data: doc, error: docErr } = await supabase
      .from("survivor_documents")
      .insert({
        survivor_id: data.survivorId,
        uploaded_by: userId,
        doc_type: data.kind,
        file_name: data.fileName,
        storage_path: storagePath,
        mime_type: data.mimeType,
        size_bytes: data.sizeBytes,
        status: "verified",
      })
      .select()
      .single();
    if (docErr) throw new Error(docErr.message);

    const { writeAudit } = await import("@/lib/audit.server");
    await writeAudit(supabase, {
      actorId: userId,
      action: "survivor.document.upload",
      entityType: "survivor_document",
      entityId: doc.id,
    });

    return { doc, uploadUrl: signed.signedUrl, token: signed.token };
  });

export const deleteSurvivorDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ docId: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: doc, error } = await supabase
      .from("survivor_documents")
      .select("*")
      .eq("id", data.docId)
      .single();
    if (error || !doc) throw new Error("Document not found");

    await supabase.storage.from("survivor-documents").remove([doc.storage_path]);
    await supabase
      .from("survivor_documents")
      .update({ status: "deleted", deleted_at: new Date().toISOString() })
      .eq("id", data.docId);

    const { writeAudit } = await import("@/lib/audit.server");
    await writeAudit(supabase, {
      actorId: userId,
      action: "survivor.document.delete",
      entityType: "survivor_document",
      entityId: data.docId,
    });

    return { ok: true };
  });

export const getSignedDocumentUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ docId: z.string().uuid(), ttlSeconds: z.number().min(60).max(300).default(300) }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: doc, error } = await supabase
      .from("survivor_documents")
      .select("storage_path, file_name")
      .eq("id", data.docId)
      .single();
    if (error || !doc) throw new Error("Document not found");

    const { data: signed, error: signErr } = await supabase.storage
      .from("survivor-documents")
      .createSignedUrl(doc.storage_path, data.ttlSeconds);
    if (signErr) throw new Error(signErr.message);

    const { writeAudit } = await import("@/lib/audit.server");
    await writeAudit(supabase, {
      actorId: userId,
      action: "survivor.document.access",
      entityType: "survivor_document",
      entityId: data.docId,
    });

    return { url: signed.signedUrl, fileName: doc.file_name };
  });

export const recomputeCompletion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: s, error } = await supabase.from("survivors").select("*").eq("id", data.id).single();
    if (error || !s) throw new Error("Survivor not found");
    const { data: updated, error: uErr } = await supabase
      .from("survivors")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", data.id)
      .select("profile_completion")
      .single();
    if (uErr) throw new Error(uErr.message);
    return { profile_completion: updated.profile_completion };
  });

export const searchSkillsTaxonomy = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ query: z.string().max(100).default("") }))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    let q = supabase.from("survivor_skills_taxonomy").select("slug, label, category").limit(20);
    if (data.query) {
      q = q.or(`label.ilike.%${data.query}%,slug.ilike.%${data.query}%`);
    }
    const { data: skills, error } = await q;
    if (error) throw new Error(error.message);
    return skills ?? [];
  });

export const getOrCreateSurvivorProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    // Check if profile exists
    const { data: survivor, error } = await supabase
      .from("survivors")
      .select("*, survivor_documents(*)")
      .eq("linked_user_id", userId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (survivor) return survivor;

    // If profile does not exist, fetch user profile for fallback name, and create a new survivor row
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .maybeSingle();

    const { data: newSurvivor, error: createError } = await supabase
      .from("survivors")
      .insert({
        linked_user_id: userId,
        created_by: userId,
        full_name: profile?.full_name || "Survivor",
        status: "approved"
      })
      .select("*, survivor_documents(*)")
      .single();

    if (createError) throw new Error(createError.message);
    return newSurvivor;
  });

export const getSignedResumeUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { data: survivor, error } = await supabase
      .from("survivors")
      .select("resume_url")
      .eq("linked_user_id", userId)
      .single();

    if (error || !survivor || !survivor.resume_url) {
      throw new Error("Resume not found");
    }

    const storagePath = `${userId}/resume.pdf`;
    const { data, error: signedError } = await supabase.storage
      .from("resumes")
      .createSignedUrl(storagePath, 300);

    if (signedError) throw new Error(signedError.message);
    return { url: data.signedUrl };
  });

export const updateResumeMetadata = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      resumeUrl: z.string().nullable(),
      resumeName: z.string().nullable(),
    }),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("survivors")
      .update({
        resume_url: data.resumeUrl,
        resume_name: data.resumeName,
        resume_uploaded_at: data.resumeUrl ? new Date().toISOString() : null,
        uploaded_at: data.resumeUrl ? new Date().toISOString() : null,
      })
      .eq("linked_user_id", userId);

    if (error) throw new Error(error.message);
    return { ok: true };
  });

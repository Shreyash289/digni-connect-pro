import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type AuditAction =
  | "survivor.update"
  | "survivor.document.upload"
  | "survivor.document.delete"
  | "survivor.document.access"
  | "recruiter.search"
  | "intro.request"
  | "intro.respond"
  | "job.create"
  | "job.publish"
  | "job.close"
  | "application.submit"
  | "application.status_change"
  | "recruiter.verify"
  | "ngo.approve"
  | "ngo.reject";

export async function writeAudit(
  supabase: SupabaseClient<Database>,
  params: {
    actorId: string;
    action: AuditAction;
    entityType: string;
    entityId?: string;
    metadata?: Record<string, unknown>;
  },
) {
  await supabase.from("audit_logs").insert({
    actor_id: params.actorId,
    action: params.action,
    entity_type: params.entityType,
    entity_id: params.entityId ?? null,
    metadata: params.metadata ?? null,
  });
}

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type NotificationKind = Database["public"]["Enums"]["notification_kind"];

export async function notify(
  supabaseAdmin: SupabaseClient<Database>,
  params: {
    userId: string;
    kind: NotificationKind;
    payload: Record<string, unknown>;
  },
) {
  const { data: pref } = await supabaseAdmin
    .from("notification_preferences")
    .select("in_app, email")
    .eq("user_id", params.userId)
    .eq("kind", params.kind)
    .maybeSingle();

  const inApp = pref?.in_app ?? true;
  if (!inApp) return;

  await supabaseAdmin.from("notifications").insert({
    user_id: params.userId,
    kind: params.kind,
    payload: params.payload,
  });

  // Email transport deferred until Resend API key is provided (Phase 8)
  const sendEmail = pref?.email ?? true;
  if (sendEmail && process.env.RESEND_API_KEY) {
    // Scaffold: wire React Email templates when key is available
    console.info(`[notify] email queued for ${params.kind} → ${params.userId}`);
  }
}

import { createFileRoute } from "@tanstack/react-router";
import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { getGoogleAi, DEFAULT_CHAT_MODEL } from "@/lib/ai-gateway.server";

const CRISIS_KEYWORDS = [
  "suicide", "kill myself", "end my life", "self-harm", "hurt myself",
  "want to die", "no reason to live",
];

const SYSTEM_PROMPT = `You are a warm, trauma-informed career mentor for CAREVIA's Digital Survivor Repository.
You help survivors and NGO partners with career guidance, skill suggestions, interview preparation, and strengths-based coaching.

IMPORTANT RULES:
- You are NOT a therapist or clinician. Never provide clinical mental health advice.
- If someone expresses crisis, self-harm, or suicidal thoughts, immediately acknowledge their pain with compassion,
  provide crisis resources (iCrisis Helpline India: 9152987821, Vandrevala Foundation: 1860-2662-345),
  and encourage them to speak with a qualified counselor or trusted person.
- Use strengths-based, empowering language. Respect privacy and autonomy.
- Support multilingual communication — respond in the user's language when possible.
- Never share PII or suggest sharing survivor identities with recruiters without consent.
- Keep responses concise, practical, and encouraging.`;

function checkSafety(text: string): boolean {
  const lower = text.toLowerCase();
  return CRISIS_KEYWORDS.some((kw) => lower.includes(kw));
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authHeader = request.headers.get("authorization");
        if (!authHeader?.startsWith("Bearer ")) {
          return new Response("Unauthorized", { status: 401 });
        }

        const token = authHeader.replace("Bearer ", "");
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(
          process.env.SUPABASE_URL!,
          process.env.SUPABASE_PUBLISHABLE_KEY!,
          {
            global: { headers: { Authorization: `Bearer ${token}` } },
            auth: { persistSession: false, autoRefreshToken: false },
          },
        );

        const { data: claims } = await supabase.auth.getClaims(token);
        if (!claims?.claims?.sub) {
          return new Response("Unauthorized", { status: 401 });
        }
        const userId = claims.claims.sub;

        const body = (await request.json()) as {
          id: string;
          messages: UIMessage[];
          survivorId?: string;
        };

        const threadId = body.id;
        const messages = body.messages;

        // Persist user message
        const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
        if (lastUserMsg) {
          const userText = lastUserMsg.parts
            ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
            .map((p) => p.text)
            .join("") ?? "";

          const safetyFlagged = checkSafety(userText);

          await supabase.from("mentor_messages").insert({
            thread_id: threadId,
            role: "user",
            parts: lastUserMsg.parts as unknown as Record<string, unknown>[],
            safety_flagged: safetyFlagged,
          });

          if (safetyFlagged) {
            await supabase.from("mentor_threads").update({ safety_flagged: true }).eq("id", threadId);
          }
        }

        // Build survivor context if provided
        let contextBlock = "";
        if (body.survivorId) {
          const { data: s } = await supabase
            .from("survivors")
            .select("skills, languages, bio, availability, work_history, consent_ai_processing")
            .eq("id", body.survivorId)
            .single();
          if (s?.consent_ai_processing) {
            contextBlock = `\n\nSurvivor context (consented):\nSkills: ${(s.skills ?? []).join(", ")}\nLanguages: ${(s.languages ?? []).join(", ")}\nBio: ${s.bio ?? "N/A"}\nAvailability: ${s.availability ?? "N/A"}`;
          }
        }

        const google = getGoogleAi();
        const result = streamText({
          model: google(DEFAULT_CHAT_MODEL),
          system: SYSTEM_PROMPT + contextBlock,
          messages: await convertToModelMessages(messages),
          onFinish: async ({ text }) => {
            await supabase.from("mentor_messages").insert({
              thread_id: threadId,
              role: "assistant",
              parts: [{ type: "text", text }],
            });
            await supabase
              .from("mentor_threads")
              .update({ updated_at: new Date().toISOString() })
              .eq("id", threadId);
          },
        });

        return result.toUIMessageStreamResponse({ originalMessages: messages });
      },
    },
  },
});

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { embed } from "ai";

export const DEFAULT_CHAT_MODEL = "gemini-2.5-flash";
export const DEFAULT_EMBED_MODEL = "text-embedding-004";

function getApiKey(): string {
  const key =
    process.env.GEMINI_API_KEY ??
    process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!key) {
    throw new Error(
      "GEMINI_API_KEY is not configured in server environment variables.",
    );
  }
  return key;
}

export function getGoogleAi() {
  return createGoogleGenerativeAI({ apiKey: getApiKey() });
}

/** @deprecated Use getGoogleAi() + model id directly */
export function getAiGateway() {
  return getGoogleAi();
}

export async function embedText(text: string): Promise<number[]> {
  const google = getGoogleAi();
  const { embedding } = await embed({
    model: google.textEmbeddingModel(DEFAULT_EMBED_MODEL),
    value: text.slice(0, 8000),
  });
  return embedding;
}

export function buildSurvivorEmbedText(survivor: {
  bio?: string | null;
  skills?: string[] | null;
  work_history?: unknown;
  languages?: string[] | null;
  interests?: string[] | null;
}): string {
  const parts = [
    survivor.bio ?? "",
    (survivor.skills ?? []).join(", "),
    (survivor.languages ?? []).join(", "),
    (survivor.interests ?? []).join(", "),
    JSON.stringify(survivor.work_history ?? []),
  ];
  return parts.filter(Boolean).join("\n");
}

export function buildJobEmbedText(job: {
  title: string;
  description?: string | null;
  required_skills?: string[] | null;
  preferred_skills?: string[] | null;
}): string {
  return [
    job.title,
    job.description ?? "",
    (job.required_skills ?? []).join(", "),
    (job.preferred_skills ?? []).join(", "),
  ].join("\n");
}

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getGoogleAi } from "@/lib/ai-gateway.server";
import { generateText } from "ai";

export const saveResumeBuilderData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ data: z.any() }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("survivors")
      .update({
        resume_builder_data: data.data,
      })
      .eq("linked_user_id", userId);

    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getResumeBuilderData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: survivor, error } = await supabase
      .from("survivors")
      .select("resume_builder_data")
      .eq("linked_user_id", userId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return survivor?.resume_builder_data || null;
  });

export const generateSummaryAi = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    skills: z.array(z.string()),
    experience: z.array(z.any()),
    education: z.array(z.any()),
  }))
  .handler(async ({ data, context }) => {
    const google = getGoogleAi();
    const model = google("gemini-2.5-flash");

    const prompt = `Write a professional, compelling 3-4 sentence professional summary for a resume. 
The summary should highlight the following skills: ${data.skills.join(", ")}.
Here is the work experience: ${JSON.stringify(data.experience)}.
Here is the education: ${JSON.stringify(data.education)}.
Keep it engaging, professional, and do not use generic fluff. Use active, strong language.`;

    const { text } = await generateText({
      model,
      prompt,
    });

    return { text: text.trim() };
  });

export const improveTextAi = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    text: z.string(),
    type: z.enum(["summary", "experience", "project", "skills"]),
  }))
  .handler(async ({ data, context }) => {
    const google = getGoogleAi();
    const model = google("gemini-2.5-flash");

    let prompt = "";
    if (data.type === "summary") {
      prompt = `Improve the following professional summary to make it more professional, impactful, and concise. Make sure it is ATS-friendly:\n\n"${data.text}"`;
    } else if (data.type === "experience") {
      prompt = `Improve the following work experience description to use strong action verbs, focus on achievements rather than duties, and be more professional. Make it bullet points if appropriate:\n\n"${data.text}"`;
    } else if (data.type === "project") {
      prompt = `Improve the following project description to make it professional, impact-oriented, and highlighting the technologies used:\n\n"${data.text}"`;
    } else if (data.type === "skills") {
      prompt = `The user lists these skills: ${data.text}. Suggest related professional skills or standard terms that will optimize their resume for ATS, formatted as a comma-separated list. Limit to the best 10 skills.`;
    }

    const { text } = await generateText({
      model,
      prompt,
    });

    return { text: text.trim() };
  });

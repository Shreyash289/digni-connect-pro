import { l as createServerFn } from "./esm-9EjmF9OT.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-pFu6bPsK.mjs";
import { Ct as stringType, St as objectType, xt as numberType } from "../_libs/@ai-sdk/gateway+[...].mjs";
import { t as createServerRpc } from "./createServerRpc-TAUNrjZd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/matcher.functions-Dns82iiV.js
var embedSurvivor_createServerFn_handler = createServerRpc({
	id: "4475024260a7e65ae97f24152c6a1c7dcf57d4f0c1c9730f29919c4f7f54ce01",
	name: "embedSurvivor",
	filename: "src/lib/matcher.functions.ts"
}, (opts) => embedSurvivor.__executeServer(opts));
var embedSurvivor = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(objectType({ id: stringType().uuid() })).handler(embedSurvivor_createServerFn_handler, async ({ data, context }) => {
	const { supabase } = context;
	const { data: s, error } = await supabase.from("survivors").select("*").eq("id", data.id).single();
	if (error || !s) throw new Error("Survivor not found");
	const { embedText, buildSurvivorEmbedText } = await import("./ai-gateway.server-DnPLjrXx.mjs").then((n) => n.n);
	const embedding = await embedText(buildSurvivorEmbedText(s));
	const { supabaseAdmin } = await import("./client.server-qo1ynXyP.mjs");
	await supabaseAdmin.from("survivors").update({ embedding: JSON.stringify(embedding) }).eq("id", data.id);
	return { ok: true };
});
var embedJob_createServerFn_handler = createServerRpc({
	id: "cf9aa5246c81a254c63187a0983e548ee631519a8a07da7be9b9ae915a967cce",
	name: "embedJob",
	filename: "src/lib/matcher.functions.ts"
}, (opts) => embedJob.__executeServer(opts));
var embedJob = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(objectType({ id: stringType().uuid() })).handler(embedJob_createServerFn_handler, async ({ data }) => {
	const { supabaseAdmin } = await import("./client.server-qo1ynXyP.mjs");
	const { data: job, error } = await supabaseAdmin.from("jobs").select("*").eq("id", data.id).single();
	if (error || !job) throw new Error("Job not found");
	const { embedText, buildJobEmbedText } = await import("./ai-gateway.server-DnPLjrXx.mjs").then((n) => n.n);
	const embedding = await embedText(buildJobEmbedText(job));
	await supabaseAdmin.from("jobs").update({ embedding: JSON.stringify(embedding) }).eq("id", data.id);
	return { ok: true };
});
function structuredScore(survivor, job) {
	const reasons = [];
	let score = 0;
	const sSkills = new Set((survivor.skills ?? []).map((s) => s.toLowerCase()));
	const required = job.required_skills ?? [];
	const preferred = job.preferred_skills ?? [];
	const reqHits = required.filter((r) => sSkills.has(r.toLowerCase())).length;
	const prefHits = preferred.filter((p) => sSkills.has(p.toLowerCase())).length;
	if (required.length > 0) {
		const coverage = reqHits / required.length;
		score += coverage * .4;
		if (coverage >= .5) reasons.push(`${reqHits}/${required.length} required skills matched`);
	} else score += .2;
	if (prefHits > 0) {
		score += Math.min(prefHits * .05, .15);
		reasons.push(`${prefHits} preferred skills matched`);
	}
	const sLangs = new Set((survivor.languages ?? []).map((l) => l.toLowerCase()));
	const jLangs = job.languages ?? [];
	const langOverlap = jLangs.filter((l) => sLangs.has(l.toLowerCase())).length;
	if (jLangs.length === 0 || langOverlap > 0) {
		score += .15;
		if (langOverlap > 0) reasons.push("Language requirements met");
	}
	if (job.remote_ok || !job.location_country || survivor.location_country === job.location_country) {
		score += .15;
		reasons.push("Location/remote compatible");
	}
	if (!job.employment_type || survivor.availability === job.employment_type || survivor.availability === "flexible") {
		score += .1;
		reasons.push("Availability aligned");
	}
	return {
		score: Math.min(score, 1),
		reasons: reasons.slice(0, 3)
	};
}
var computeMatches_createServerFn_handler = createServerRpc({
	id: "75423c3c990ab5fd7c811a7de9155acc9e806084a0cc723b86f1e51dbea0c668",
	name: "computeMatches",
	filename: "src/lib/matcher.functions.ts"
}, (opts) => computeMatches.__executeServer(opts));
var computeMatches = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(objectType({
	jobId: stringType().uuid().optional(),
	survivorId: stringType().uuid().optional(),
	topK: numberType().int().min(1).max(50).default(20)
})).handler(computeMatches_createServerFn_handler, async ({ data, context }) => {
	const { supabaseAdmin } = await import("./client.server-qo1ynXyP.mjs");
	const results = [];
	if (data.jobId) {
		const { data: job } = await supabaseAdmin.from("jobs").select("*").eq("id", data.jobId).single();
		if (!job) throw new Error("Job not found");
		const { data: survivors } = await supabaseAdmin.from("survivors").select("id, anonymous_id, skills, languages, location_country, availability, certifications, bio, work_history, embedding").eq("searchable", true).limit(100);
		for (const s of survivors ?? []) {
			const { score, reasons } = structuredScore(s, job);
			let finalScore = score;
			const breakdown = {
				structured: score,
				reasons
			};
			if (s.embedding && job.embedding) {
				breakdown.vector = .5;
				finalScore = score * .6 + .4 * .5;
			}
			if (finalScore < .2) continue;
			await supabaseAdmin.from("match_scores").upsert({
				survivor_id: s.id,
				job_id: data.jobId,
				score: finalScore,
				breakdown
			}, { onConflict: "survivor_id,job_id" });
			results.push({
				survivor_id: s.id,
				job_id: data.jobId,
				score: finalScore,
				breakdown,
				anonymous_id: s.anonymous_id
			});
		}
	}
	if (data.survivorId) {
		const { data: survivor } = await supabaseAdmin.from("survivors").select("*").eq("id", data.survivorId).single();
		if (!survivor) throw new Error("Survivor not found");
		const { data: jobs } = await supabaseAdmin.from("jobs").select("*").eq("status", "published").limit(50);
		for (const job of jobs ?? []) {
			const { score, reasons } = structuredScore(survivor, job);
			if (score < .2) continue;
			await supabaseAdmin.from("match_scores").upsert({
				survivor_id: data.survivorId,
				job_id: job.id,
				score,
				breakdown: {
					structured: score,
					reasons
				}
			}, { onConflict: "survivor_id,job_id" });
			results.push({
				survivor_id: data.survivorId,
				job_id: job.id,
				score,
				breakdown: { reasons }
			});
		}
	}
	return results.sort((a, b) => b.score - a.score).slice(0, data.topK);
});
var getMatchScoresForJob_createServerFn_handler = createServerRpc({
	id: "3e8adb2e169a4b426bd5e57aacf822572d82c909471406f76e9fd8bbe29159ff",
	name: "getMatchScoresForJob",
	filename: "src/lib/matcher.functions.ts"
}, (opts) => getMatchScoresForJob.__executeServer(opts));
var getMatchScoresForJob = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(objectType({
	jobId: stringType().uuid(),
	topK: numberType().default(10)
})).handler(getMatchScoresForJob_createServerFn_handler, async ({ data, context }) => {
	const { supabase } = context;
	const { data: scores, error } = await supabase.from("match_scores").select("*, survivors(anonymous_id, skills, availability)").eq("job_id", data.jobId).order("score", { ascending: false }).limit(data.topK);
	if (error) throw new Error(error.message);
	return scores ?? [];
});
var getMatchScoresForSurvivor_createServerFn_handler = createServerRpc({
	id: "8afc4f1944e1dea4696e9d64263b656002aab6ed2f624a9b6c4fa2b45ddc2f1f",
	name: "getMatchScoresForSurvivor",
	filename: "src/lib/matcher.functions.ts"
}, (opts) => getMatchScoresForSurvivor.__executeServer(opts));
var getMatchScoresForSurvivor = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(objectType({
	survivorId: stringType().uuid(),
	topK: numberType().default(10)
})).handler(getMatchScoresForSurvivor_createServerFn_handler, async ({ data, context }) => {
	const { supabase } = context;
	const { data: scores, error } = await supabase.from("match_scores").select("*, jobs(id, title, company_name, employment_type, remote_ok)").eq("survivor_id", data.survivorId).order("score", { ascending: false }).limit(data.topK);
	if (error) throw new Error(error.message);
	return scores ?? [];
});
//#endregion
export { computeMatches_createServerFn_handler, embedJob_createServerFn_handler, embedSurvivor_createServerFn_handler, getMatchScoresForJob_createServerFn_handler, getMatchScoresForSurvivor_createServerFn_handler };

import { l as createServerFn } from "./esm-9EjmF9OT.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-pFu6bPsK.mjs";
import { Ct as stringType, St as objectType, bt as enumType, vt as arrayType, xt as numberType, yt as booleanType } from "../_libs/@ai-sdk/gateway+[...].mjs";
import { t as createServerRpc } from "./createServerRpc-TAUNrjZd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/jobs.functions-CFXPLvia.js
var jobInputSchema = objectType({
	title: stringType().min(3).max(200),
	company_name: stringType().min(2).max(200),
	description: stringType().max(1e4).default(""),
	required_skills: arrayType(stringType()).default([]),
	preferred_skills: arrayType(stringType()).default([]),
	languages: arrayType(stringType()).default([]),
	location_country: stringType().optional(),
	location_region: stringType().optional(),
	remote_ok: booleanType().default(false),
	employment_type: enumType([
		"full_time",
		"part_time",
		"contract",
		"internship"
	]).default("full_time"),
	salary_min: numberType().int().positive().optional(),
	salary_max: numberType().int().positive().optional(),
	currency: stringType().default("INR"),
	closes_at: stringType().optional()
});
var createJob_createServerFn_handler = createServerRpc({
	id: "ab0e7c09b47d7ada2f8e5674d2a34621a0be302c11db7c58ae029c8e93152a4c",
	name: "createJob",
	filename: "src/lib/jobs.functions.ts"
}, (opts) => createJob.__executeServer(opts));
var createJob = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(jobInputSchema).handler(createJob_createServerFn_handler, async ({ data, context }) => {
	const { supabase, userId } = context;
	const { data: recruiter } = await supabase.from("recruiters").select("id").eq("user_id", userId).single();
	if (!recruiter) throw new Error("Recruiter profile required");
	const { data: job, error } = await supabase.from("jobs").insert({
		...data,
		recruiter_id: recruiter.id
	}).select().single();
	if (error) throw new Error(error.message);
	const { writeAudit } = await import("./audit.server-CIDtzNHk.mjs");
	await writeAudit(supabase, {
		actorId: userId,
		action: "job.create",
		entityType: "job",
		entityId: job.id
	});
	return job;
});
var updateJob_createServerFn_handler = createServerRpc({
	id: "b04a7dd5fe6d3ab53e9a31603660271b9c3b5510d7c6be92f02f78bf5e625c8c",
	name: "updateJob",
	filename: "src/lib/jobs.functions.ts"
}, (opts) => updateJob.__executeServer(opts));
var updateJob = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(objectType({
	id: stringType().uuid(),
	patch: jobInputSchema.partial()
})).handler(updateJob_createServerFn_handler, async ({ data, context }) => {
	const { supabase } = context;
	const { data: job, error } = await supabase.from("jobs").update(data.patch).eq("id", data.id).select().single();
	if (error) throw new Error(error.message);
	return job;
});
var publishJob_createServerFn_handler = createServerRpc({
	id: "894909696a6d8c76c01d7ff4005884490258561dc68b806f58dbb7f5bb101ab6",
	name: "publishJob",
	filename: "src/lib/jobs.functions.ts"
}, (opts) => publishJob.__executeServer(opts));
var publishJob = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(objectType({ id: stringType().uuid() })).handler(publishJob_createServerFn_handler, async ({ data, context }) => {
	const { supabase, userId } = context;
	const { data: job, error } = await supabase.from("jobs").update({
		status: "published",
		published_at: (/* @__PURE__ */ new Date()).toISOString()
	}).eq("id", data.id).select().single();
	if (error) throw new Error(error.message);
	const { writeAudit } = await import("./audit.server-CIDtzNHk.mjs");
	await writeAudit(supabase, {
		actorId: userId,
		action: "job.publish",
		entityType: "job",
		entityId: data.id
	});
	embedJobInternal(data.id);
	return job;
});
var closeJob_createServerFn_handler = createServerRpc({
	id: "41bc2a181a9f9fefd6c09195024d765d12869783991ab291a1ba80ad892fb621",
	name: "closeJob",
	filename: "src/lib/jobs.functions.ts"
}, (opts) => closeJob.__executeServer(opts));
var closeJob = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(objectType({ id: stringType().uuid() })).handler(closeJob_createServerFn_handler, async ({ data, context }) => {
	const { supabase, userId } = context;
	const { data: job, error } = await supabase.from("jobs").update({ status: "closed" }).eq("id", data.id).select().single();
	if (error) throw new Error(error.message);
	const { writeAudit } = await import("./audit.server-CIDtzNHk.mjs");
	await writeAudit(supabase, {
		actorId: userId,
		action: "job.close",
		entityType: "job",
		entityId: data.id
	});
	return job;
});
async function embedJobInternal(jobId) {
	try {
		const { embedText, buildJobEmbedText } = await import("./ai-gateway.server-DnPLjrXx.mjs").then((n) => n.n);
		const { supabaseAdmin } = await import("./client.server-qo1ynXyP.mjs");
		const { data: job } = await supabaseAdmin.from("jobs").select("*").eq("id", jobId).single();
		if (!job) return;
		const embedding = await embedText(buildJobEmbedText(job));
		await supabaseAdmin.from("jobs").update({ embedding: JSON.stringify(embedding) }).eq("id", jobId);
	} catch (e) {
		console.error("[embedJob]", e);
	}
}
var listPublishedJobs_createServerFn_handler = createServerRpc({
	id: "9b4d8f35741d658d0b0b56de2a6bc0edf26871c59132fed013a3d27ed651b316",
	name: "listPublishedJobs",
	filename: "src/lib/jobs.functions.ts"
}, (opts) => listPublishedJobs.__executeServer(opts));
var listPublishedJobs = createServerFn({ method: "POST" }).inputValidator(objectType({
	filters: objectType({
		query: stringType().optional(),
		location_country: stringType().optional(),
		remote_ok: booleanType().optional(),
		employment_type: stringType().optional()
	}).default({}),
	page: numberType().int().min(1).default(1)
})).handler(listPublishedJobs_createServerFn_handler, async ({ data }) => {
	const { supabaseAdmin } = await import("./client.server-qo1ynXyP.mjs");
	const pageSize = 12;
	const from = (data.page - 1) * pageSize;
	let q = supabaseAdmin.from("jobs").select("id, title, company_name, description, required_skills, location_country, location_region, remote_ok, employment_type, salary_min, salary_max, currency, published_at", { count: "exact" }).eq("status", "published").range(from, from + pageSize - 1).order("published_at", { ascending: false });
	if (data.filters.query) q = q.ilike("title", `%${data.filters.query}%`);
	if (data.filters.location_country) q = q.eq("location_country", data.filters.location_country);
	if (data.filters.remote_ok) q = q.eq("remote_ok", true);
	if (data.filters.employment_type) q = q.eq("employment_type", data.filters.employment_type);
	const { data: jobs, count, error } = await q;
	if (error) throw new Error(error.message);
	return {
		jobs: jobs ?? [],
		total: count ?? 0,
		page: data.page,
		pageSize
	};
});
var getPublishedJob_createServerFn_handler = createServerRpc({
	id: "d89231277d7a274571db47a6b53f29171ae7f6347636f62cea5ca730f5448724",
	name: "getPublishedJob",
	filename: "src/lib/jobs.functions.ts"
}, (opts) => getPublishedJob.__executeServer(opts));
var getPublishedJob = createServerFn({ method: "POST" }).inputValidator(objectType({ id: stringType().uuid() })).handler(getPublishedJob_createServerFn_handler, async ({ data }) => {
	const { supabaseAdmin } = await import("./client.server-qo1ynXyP.mjs");
	const { data: job, error } = await supabaseAdmin.from("jobs").select("id, title, company_name, description, required_skills, preferred_skills, languages, location_country, location_region, remote_ok, employment_type, salary_min, salary_max, currency, published_at, closes_at").eq("id", data.id).eq("status", "published").single();
	if (error) throw new Error("Job not found");
	return job;
});
var applyToJob_createServerFn_handler = createServerRpc({
	id: "85740c9ced03db0602f420a6a1df3f2dc074bb31cf5ab6f2a31b1644a86ad1bf",
	name: "applyToJob",
	filename: "src/lib/jobs.functions.ts"
}, (opts) => applyToJob.__executeServer(opts));
var applyToJob = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(objectType({
	jobId: stringType().uuid(),
	survivorId: stringType().uuid(),
	coverNote: stringType().max(2e3).optional()
})).handler(applyToJob_createServerFn_handler, async ({ data, context }) => {
	const { supabase, userId } = context;
	const { data: survivor } = await supabase.from("survivors").select("id, ngo_id").eq("id", data.survivorId).single();
	if (!survivor) throw new Error("Survivor not found");
	const { data: app, error } = await supabase.from("job_applications").insert({
		job_id: data.jobId,
		survivor_id: data.survivorId,
		ngo_id: survivor.ngo_id,
		cover_note: data.coverNote ?? null
	}).select().single();
	if (error) throw new Error(error.message);
	const { writeAudit } = await import("./audit.server-CIDtzNHk.mjs");
	await writeAudit(supabase, {
		actorId: userId,
		action: "application.submit",
		entityType: "job_application",
		entityId: app.id
	});
	const { data: job } = await supabase.from("jobs").select("title, recruiters(user_id)").eq("id", data.jobId).single();
	const recruiterUserId = (job?.recruiters)?.user_id;
	if (recruiterUserId) {
		const { supabaseAdmin } = await import("./client.server-qo1ynXyP.mjs");
		const { notify } = await import("./notify.server-BUKOSlyD.mjs");
		await notify(supabaseAdmin, {
			userId: recruiterUserId,
			kind: "job_application_received",
			payload: {
				applicationId: app.id,
				jobTitle: job?.title
			}
		});
	}
	return app;
});
var updateApplicationStatus_createServerFn_handler = createServerRpc({
	id: "cf2fc3790c9565cb8102dd1541c13c1d18c82368a35e19401f6a0fca49d02438",
	name: "updateApplicationStatus",
	filename: "src/lib/jobs.functions.ts"
}, (opts) => updateApplicationStatus.__executeServer(opts));
var updateApplicationStatus = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(objectType({
	id: stringType().uuid(),
	status: enumType([
		"reviewing",
		"shortlisted",
		"rejected",
		"hired"
	])
})).handler(updateApplicationStatus_createServerFn_handler, async ({ data, context }) => {
	const { supabase, userId } = context;
	const { data: app, error } = await supabase.from("job_applications").update({ status: data.status }).eq("id", data.id).select("*, survivors(ngo_id, ngos(owner_id))").single();
	if (error) throw new Error(error.message);
	const { writeAudit } = await import("./audit.server-CIDtzNHk.mjs");
	await writeAudit(supabase, {
		actorId: userId,
		action: "application.status_change",
		entityType: "job_application",
		entityId: data.id,
		metadata: { status: data.status }
	});
	const ownerId = app.survivors?.ngos?.owner_id;
	if (ownerId) {
		const { supabaseAdmin } = await import("./client.server-qo1ynXyP.mjs");
		const { notify } = await import("./notify.server-BUKOSlyD.mjs");
		await notify(supabaseAdmin, {
			userId: ownerId,
			kind: "application_status_changed",
			payload: {
				applicationId: data.id,
				status: data.status
			}
		});
	}
	return app;
});
var listRecruiterJobs_createServerFn_handler = createServerRpc({
	id: "5b92ebd0ac5cbfd3ceebeaf360829c3a57a5ca3aa5a1d0e2bf5a50ee9d838c5b",
	name: "listRecruiterJobs",
	filename: "src/lib/jobs.functions.ts"
}, (opts) => listRecruiterJobs.__executeServer(opts));
var listRecruiterJobs = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(listRecruiterJobs_createServerFn_handler, async ({ context }) => {
	const { supabase, userId } = context;
	const { data: recruiter } = await supabase.from("recruiters").select("id").eq("user_id", userId).single();
	if (!recruiter) return [];
	const { data, error } = await supabase.from("jobs").select("*").eq("recruiter_id", recruiter.id).order("created_at", { ascending: false });
	if (error) throw new Error(error.message);
	return data ?? [];
});
//#endregion
export { applyToJob_createServerFn_handler, closeJob_createServerFn_handler, createJob_createServerFn_handler, getPublishedJob_createServerFn_handler, listPublishedJobs_createServerFn_handler, listRecruiterJobs_createServerFn_handler, publishJob_createServerFn_handler, updateApplicationStatus_createServerFn_handler, updateJob_createServerFn_handler };

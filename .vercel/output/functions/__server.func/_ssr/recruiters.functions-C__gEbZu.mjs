import { l as createServerFn } from "./esm-9EjmF9OT.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-Dpn8S0gM.mjs";
import { Ct as stringType, St as objectType, bt as enumType, vt as arrayType, xt as numberType } from "../_libs/@ai-sdk/gateway+[...].mjs";
import { t as createServerRpc } from "./createServerRpc-TAUNrjZd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/recruiters.functions-C__gEbZu.js
var searchFiltersSchema = objectType({
	skills: arrayType(stringType()).optional(),
	languages: arrayType(stringType()).optional(),
	location_country: stringType().optional(),
	location_region: stringType().optional(),
	availability: stringType().optional(),
	query: stringType().optional()
});
var searchSurvivors_createServerFn_handler = createServerRpc({
	id: "ce420a8ba5db2b24c369e6fde139d08a5db7d25b3ffbbe2e5b8980183a8fa020",
	name: "searchSurvivors",
	filename: "src/lib/recruiters.functions.ts"
}, (opts) => searchSurvivors.__executeServer(opts));
var searchSurvivors = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(objectType({
	filters: searchFiltersSchema,
	page: numberType().int().min(1).default(1)
})).handler(searchSurvivors_createServerFn_handler, async ({ data, context }) => {
	const { supabase, userId } = context;
	const pageSize = 12;
	const from = (data.page - 1) * pageSize;
	const { data: allowed } = await supabase.rpc("is_recruiter_approved", { _user_id: userId });
	if (!allowed) throw new Error("Recruiter not verified");
	const { data: ok } = await supabase.rpc("check_rate_limit", {
		_user_id: userId,
		_action: "recruiter_search",
		_max: 30
	});
	if (!ok) throw new Error("Rate limit exceeded. Try again in a minute.");
	const { supabaseAdmin } = await import("./client.server-D1oHePJa.mjs");
	let q = supabaseAdmin.from("survivor_directory").select("*", { count: "exact" }).eq("searchable", true).range(from, from + pageSize - 1);
	if (data.filters.skills?.length) q = q.overlaps("skills", data.filters.skills);
	if (data.filters.languages?.length) q = q.overlaps("languages", data.filters.languages);
	if (data.filters.location_country) q = q.eq("location_country", data.filters.location_country);
	if (data.filters.location_region) q = q.ilike("location_region", `%${data.filters.location_region}%`);
	if (data.filters.availability) q = q.eq("availability", data.filters.availability);
	if (data.filters.query) q = q.ilike("bio_excerpt", `%${data.filters.query}%`);
	const { data: results, count, error } = await q;
	if (error) throw new Error(error.message);
	const { writeAudit } = await import("./audit.server-CIDtzNHk.mjs");
	await writeAudit(supabase, {
		actorId: userId,
		action: "recruiter.search",
		entityType: "survivor_directory",
		metadata: {
			filters: data.filters,
			page: data.page,
			resultCount: results?.length ?? 0
		}
	});
	return {
		results: results ?? [],
		total: count ?? 0,
		page: data.page,
		pageSize
	};
});
var requestIntroduction_createServerFn_handler = createServerRpc({
	id: "71ac1436ebf243c965778d3a81c36fbe5261787846fe45954537522ca71a4f3a",
	name: "requestIntroduction",
	filename: "src/lib/recruiters.functions.ts"
}, (opts) => requestIntroduction.__executeServer(opts));
var requestIntroduction = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(objectType({
	survivorId: stringType().uuid(),
	message: stringType().min(10).max(2e3),
	jobId: stringType().uuid().optional()
})).handler(requestIntroduction_createServerFn_handler, async ({ data, context }) => {
	const { supabase, userId } = context;
	const { data: recruiter } = await supabase.from("recruiters").select("id").eq("user_id", userId).eq("verification_status", "approved").single();
	if (!recruiter) throw new Error("Recruiter not verified");
	const { data: survivor } = await supabase.from("survivors").select("id, ngo_id, searchable").eq("id", data.survivorId).eq("searchable", true).single();
	if (!survivor) throw new Error("Survivor not available for introduction");
	const { data: ngo } = await supabase.from("ngos").select("owner_id").eq("id", survivor.ngo_id).single();
	const { data: req, error } = await supabase.from("introduction_requests").insert({
		recruiter_id: recruiter.id,
		survivor_id: data.survivorId,
		ngo_id: survivor.ngo_id,
		job_id: data.jobId ?? null,
		message: data.message
	}).select().single();
	if (error) throw new Error(error.message);
	const { writeAudit } = await import("./audit.server-CIDtzNHk.mjs");
	await writeAudit(supabase, {
		actorId: userId,
		action: "intro.request",
		entityType: "introduction_request",
		entityId: req.id
	});
	if (ngo?.owner_id) {
		const { supabaseAdmin } = await import("./client.server-D1oHePJa.mjs");
		const { notify } = await import("./notify.server-BUKOSlyD.mjs");
		await notify(supabaseAdmin, {
			userId: ngo.owner_id,
			kind: "intro_request_received",
			payload: {
				requestId: req.id,
				survivorId: data.survivorId
			}
		});
	}
	return req;
});
var respondToIntroduction_createServerFn_handler = createServerRpc({
	id: "4560e5baf601260f8eff5f32d573a8e167ae7a715b83fd93bf79f8390ae7d780",
	name: "respondToIntroduction",
	filename: "src/lib/recruiters.functions.ts"
}, (opts) => respondToIntroduction.__executeServer(opts));
var respondToIntroduction = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(objectType({
	id: stringType().uuid(),
	status: enumType(["accepted", "declined"]),
	note: stringType().max(1e3).optional()
})).handler(respondToIntroduction_createServerFn_handler, async ({ data, context }) => {
	const { supabase, userId } = context;
	const { data: req, error } = await supabase.from("introduction_requests").update({
		status: data.status,
		response_note: data.note ?? null,
		responded_at: (/* @__PURE__ */ new Date()).toISOString()
	}).eq("id", data.id).select("*, recruiters(user_id)").single();
	if (error) throw new Error(error.message);
	const { writeAudit } = await import("./audit.server-CIDtzNHk.mjs");
	await writeAudit(supabase, {
		actorId: userId,
		action: "intro.respond",
		entityType: "introduction_request",
		entityId: data.id,
		metadata: { status: data.status }
	});
	const recruiterUserId = req.recruiters?.user_id;
	if (recruiterUserId) {
		const { supabaseAdmin } = await import("./client.server-D1oHePJa.mjs");
		const { notify } = await import("./notify.server-BUKOSlyD.mjs");
		await notify(supabaseAdmin, {
			userId: recruiterUserId,
			kind: "intro_request_responded",
			payload: {
				requestId: data.id,
				status: data.status
			}
		});
	}
	return req;
});
var verifyRecruiter_createServerFn_handler = createServerRpc({
	id: "3f766c80d1eb959b4648bb2b6458eb4160b80cc00805010a32d9fba015df29ac",
	name: "verifyRecruiter",
	filename: "src/lib/recruiters.functions.ts"
}, (opts) => verifyRecruiter.__executeServer(opts));
var verifyRecruiter = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(objectType({
	id: stringType().uuid(),
	status: enumType(["approved", "rejected"]),
	notes: stringType().optional()
})).handler(verifyRecruiter_createServerFn_handler, async ({ data, context }) => {
	const { supabase, userId } = context;
	const { data: isAdmin } = await supabase.rpc("is_admin", { _user_id: userId });
	if (!isAdmin) throw new Error("Admin only");
	const { data: recruiter, error } = await supabase.from("recruiters").update({
		verification_status: data.status,
		verified_by: userId,
		verified_at: (/* @__PURE__ */ new Date()).toISOString(),
		notes: data.notes ?? null
	}).eq("id", data.id).select().single();
	if (error) throw new Error(error.message);
	const { writeAudit } = await import("./audit.server-CIDtzNHk.mjs");
	await writeAudit(supabase, {
		actorId: userId,
		action: "recruiter.verify",
		entityType: "recruiter",
		entityId: data.id,
		metadata: { status: data.status }
	});
	const { supabaseAdmin } = await import("./client.server-D1oHePJa.mjs");
	const { notify } = await import("./notify.server-BUKOSlyD.mjs");
	await notify(supabaseAdmin, {
		userId: recruiter.user_id,
		kind: data.status === "approved" ? "recruiter_verified" : "recruiter_rejected",
		payload: { recruiterId: data.id }
	});
	return recruiter;
});
var getRecruiterProfile_createServerFn_handler = createServerRpc({
	id: "71bc64ac4c2291eb683306b08241ece1e3d8f578ef593857f7e0fa03ac317555",
	name: "getRecruiterProfile",
	filename: "src/lib/recruiters.functions.ts"
}, (opts) => getRecruiterProfile.__executeServer(opts));
var getRecruiterProfile = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(getRecruiterProfile_createServerFn_handler, async ({ context }) => {
	const { supabase, userId } = context;
	const { data, error } = await supabase.from("recruiters").select("*").eq("user_id", userId).maybeSingle();
	if (error) throw new Error(error.message);
	return data;
});
//#endregion
export { getRecruiterProfile_createServerFn_handler, requestIntroduction_createServerFn_handler, respondToIntroduction_createServerFn_handler, searchSurvivors_createServerFn_handler, verifyRecruiter_createServerFn_handler };

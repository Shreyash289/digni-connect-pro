import { l as createServerFn } from "./esm-9EjmF9OT.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-Dpn8S0gM.mjs";
import { t as createSsrRpc } from "./createSsrRpc-v2xHyLJ2.mjs";
import { Ct as stringType, St as objectType, bt as enumType, vt as arrayType, xt as numberType, yt as booleanType } from "../_libs/@ai-sdk/gateway+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/jobs.functions-CeKCNQiV.js
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
var createJob = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(jobInputSchema).handler(createSsrRpc("ab0e7c09b47d7ada2f8e5674d2a34621a0be302c11db7c58ae029c8e93152a4c"));
createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(objectType({
	id: stringType().uuid(),
	patch: jobInputSchema.partial()
})).handler(createSsrRpc("b04a7dd5fe6d3ab53e9a31603660271b9c3b5510d7c6be92f02f78bf5e625c8c"));
var publishJob = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(objectType({ id: stringType().uuid() })).handler(createSsrRpc("894909696a6d8c76c01d7ff4005884490258561dc68b806f58dbb7f5bb101ab6"));
var closeJob = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(objectType({ id: stringType().uuid() })).handler(createSsrRpc("41bc2a181a9f9fefd6c09195024d765d12869783991ab291a1ba80ad892fb621"));
var listPublishedJobs = createServerFn({ method: "POST" }).inputValidator(objectType({
	filters: objectType({
		query: stringType().optional(),
		location_country: stringType().optional(),
		remote_ok: booleanType().optional(),
		employment_type: stringType().optional()
	}).default({}),
	page: numberType().int().min(1).default(1)
})).handler(createSsrRpc("9b4d8f35741d658d0b0b56de2a6bc0edf26871c59132fed013a3d27ed651b316"));
var getPublishedJob = createServerFn({ method: "POST" }).inputValidator(objectType({ id: stringType().uuid() })).handler(createSsrRpc("d89231277d7a274571db47a6b53f29171ae7f6347636f62cea5ca730f5448724"));
createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(objectType({
	jobId: stringType().uuid(),
	survivorId: stringType().uuid(),
	coverNote: stringType().max(2e3).optional()
})).handler(createSsrRpc("85740c9ced03db0602f420a6a1df3f2dc074bb31cf5ab6f2a31b1644a86ad1bf"));
createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(objectType({
	id: stringType().uuid(),
	status: enumType([
		"reviewing",
		"shortlisted",
		"rejected",
		"hired"
	])
})).handler(createSsrRpc("cf2fc3790c9565cb8102dd1541c13c1d18c82368a35e19401f6a0fca49d02438"));
var listRecruiterJobs = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("5b92ebd0ac5cbfd3ceebeaf360829c3a57a5ca3aa5a1d0e2bf5a50ee9d838c5b"));
//#endregion
export { listRecruiterJobs as a, listPublishedJobs as i, createJob as n, publishJob as o, getPublishedJob as r, closeJob as t };

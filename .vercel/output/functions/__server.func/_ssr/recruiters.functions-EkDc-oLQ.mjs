import { l as createServerFn } from "./esm-9EjmF9OT.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-Dpn8S0gM.mjs";
import { t as createSsrRpc } from "./createSsrRpc-v2xHyLJ2.mjs";
import { Ct as stringType, St as objectType, bt as enumType, vt as arrayType, xt as numberType } from "../_libs/@ai-sdk/gateway+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/recruiters.functions-EkDc-oLQ.js
var searchFiltersSchema = objectType({
	skills: arrayType(stringType()).optional(),
	languages: arrayType(stringType()).optional(),
	location_country: stringType().optional(),
	location_region: stringType().optional(),
	availability: stringType().optional(),
	query: stringType().optional()
});
var searchSurvivors = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(objectType({
	filters: searchFiltersSchema,
	page: numberType().int().min(1).default(1)
})).handler(createSsrRpc("ce420a8ba5db2b24c369e6fde139d08a5db7d25b3ffbbe2e5b8980183a8fa020"));
var requestIntroduction = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(objectType({
	survivorId: stringType().uuid(),
	message: stringType().min(10).max(2e3),
	jobId: stringType().uuid().optional()
})).handler(createSsrRpc("71ac1436ebf243c965778d3a81c36fbe5261787846fe45954537522ca71a4f3a"));
var respondToIntroduction = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(objectType({
	id: stringType().uuid(),
	status: enumType(["accepted", "declined"]),
	note: stringType().max(1e3).optional()
})).handler(createSsrRpc("4560e5baf601260f8eff5f32d573a8e167ae7a715b83fd93bf79f8390ae7d780"));
var verifyRecruiter = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(objectType({
	id: stringType().uuid(),
	status: enumType(["approved", "rejected"]),
	notes: stringType().optional()
})).handler(createSsrRpc("3f766c80d1eb959b4648bb2b6458eb4160b80cc00805010a32d9fba015df29ac"));
var getRecruiterProfile = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("71bc64ac4c2291eb683306b08241ece1e3d8f578ef593857f7e0fa03ac317555"));
//#endregion
export { verifyRecruiter as a, searchSurvivors as i, requestIntroduction as n, respondToIntroduction as r, getRecruiterProfile as t };

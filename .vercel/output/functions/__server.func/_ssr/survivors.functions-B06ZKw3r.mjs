import { l as createServerFn } from "./esm-9EjmF9OT.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-pFu6bPsK.mjs";
import { Ct as stringType, St as objectType, bt as enumType, vt as arrayType, xt as numberType, yt as booleanType } from "../_libs/@ai-sdk/gateway+[...].mjs";
import { t as createServerRpc } from "./createServerRpc-TAUNrjZd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/survivors.functions-B06ZKw3r.js
var certificationSchema = objectType({
	name: stringType(),
	issuer: stringType(),
	year: numberType().optional(),
	url: stringType().url().optional()
});
var workHistorySchema = objectType({
	role: stringType(),
	org: stringType(),
	start: stringType(),
	end: stringType().optional(),
	description: stringType().optional()
});
var educationSchema = objectType({
	level: stringType(),
	institution: stringType(),
	field: stringType().optional(),
	year: numberType().optional()
});
var profilePatchSchema = objectType({
	pronouns: stringType().max(50).optional(),
	date_of_birth: stringType().nullable().optional(),
	gender: stringType().max(50).optional(),
	languages: arrayType(stringType()).optional(),
	location_country: stringType().max(100).optional(),
	location_region: stringType().max(100).optional(),
	bio: stringType().max(2e3).optional(),
	skills: arrayType(stringType()).optional(),
	certifications: arrayType(certificationSchema).optional(),
	work_history: arrayType(workHistorySchema).optional(),
	education: arrayType(educationSchema).optional(),
	interests: arrayType(stringType()).optional(),
	availability: enumType([
		"full_time",
		"part_time",
		"remote",
		"onsite",
		"flexible"
	]).optional(),
	consent_share_with_recruiters: booleanType().optional(),
	consent_ai_processing: booleanType().optional()
});
var getSurvivorDetail_createServerFn_handler = createServerRpc({
	id: "b7a4981dafb703e0e2e08ff52cefa0e97e4cd53d4655fed2c17f305fc8b38dbc",
	name: "getSurvivorDetail",
	filename: "src/lib/survivors.functions.ts"
}, (opts) => getSurvivorDetail.__executeServer(opts));
var getSurvivorDetail = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(objectType({ id: stringType().uuid() })).handler(getSurvivorDetail_createServerFn_handler, async ({ data, context }) => {
	const { supabase, userId } = context;
	const { data: survivor, error } = await supabase.from("survivors").select("*, survivor_documents(*)").eq("id", data.id).single();
	if (error) throw new Error(error.message);
	return survivor;
});
var updateSurvivorProfile_createServerFn_handler = createServerRpc({
	id: "3eb347d9ef2d1599c650206e4b718495655c4ac641c08ddbd79e5f748c95a091",
	name: "updateSurvivorProfile",
	filename: "src/lib/survivors.functions.ts"
}, (opts) => updateSurvivorProfile.__executeServer(opts));
var updateSurvivorProfile = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(objectType({
	id: stringType().uuid(),
	patch: profilePatchSchema
})).handler(updateSurvivorProfile_createServerFn_handler, async ({ data, context }) => {
	const { supabase, userId } = context;
	const patch = {
		...data.patch,
		updated_by: userId
	};
	if (data.patch.consent_share_with_recruiters !== void 0) patch.consent_share_changed_at = (/* @__PURE__ */ new Date()).toISOString();
	if (data.patch.consent_ai_processing !== void 0) patch.consent_ai_changed_at = (/* @__PURE__ */ new Date()).toISOString();
	const { data: updated, error } = await supabase.from("survivors").update(patch).eq("id", data.id).select().single();
	if (error) throw new Error(error.message);
	const { writeAudit } = await import("./audit.server-CIDtzNHk.mjs");
	await writeAudit(supabase, {
		actorId: userId,
		action: "survivor.update",
		entityType: "survivor",
		entityId: data.id,
		metadata: { fields: Object.keys(data.patch) }
	});
	embedSurvivorInternal(supabase, userId, data.id);
	return updated;
});
async function embedSurvivorInternal(supabase, _userId, survivorId) {
	await new Promise((r) => setTimeout(r, 100));
	try {
		const { buildSurvivorEmbedText, embedText } = await import("./ai-gateway.server-DnPLjrXx.mjs").then((n) => n.n);
		const { data: s } = await supabase.from("survivors").select("*").eq("id", survivorId).single();
		if (!s) return;
		const embedding = await embedText(buildSurvivorEmbedText(s));
		const { supabaseAdmin } = await import("./client.server-qo1ynXyP.mjs");
		await supabaseAdmin.from("survivors").update({ embedding: JSON.stringify(embedding) }).eq("id", survivorId);
	} catch (e) {
		console.error("[embedSurvivor]", e);
	}
}
var uploadSurvivorDocument_createServerFn_handler = createServerRpc({
	id: "a4e06d520b8004e8b43537c474ac81c39db1c5187ea5988326ac7520d6bc9267",
	name: "uploadSurvivorDocument",
	filename: "src/lib/survivors.functions.ts"
}, (opts) => uploadSurvivorDocument.__executeServer(opts));
var uploadSurvivorDocument = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(objectType({
	survivorId: stringType().uuid(),
	fileName: stringType().min(1).max(255),
	mimeType: stringType(),
	sizeBytes: numberType().positive().max(10485760),
	kind: enumType([
		"ID",
		"Certificate",
		"Reference",
		"Medical",
		"Other"
	])
})).handler(uploadSurvivorDocument_createServerFn_handler, async ({ data, context }) => {
	const { supabase, userId } = context;
	const { data: survivor, error: sErr } = await supabase.from("survivors").select("id, ngo_id").eq("id", data.survivorId).single();
	if (sErr || !survivor) throw new Error("Survivor not found");
	const storagePath = `${survivor.ngo_id}/${data.survivorId}/${crypto.randomUUID()}-${data.fileName}`;
	const { data: signed, error: signErr } = await supabase.storage.from("survivor-documents").createSignedUploadUrl(storagePath);
	if (signErr) throw new Error(signErr.message);
	const { data: doc, error: docErr } = await supabase.from("survivor_documents").insert({
		survivor_id: data.survivorId,
		uploaded_by: userId,
		doc_type: data.kind,
		file_name: data.fileName,
		storage_path: storagePath,
		mime_type: data.mimeType,
		size_bytes: data.sizeBytes,
		status: "verified"
	}).select().single();
	if (docErr) throw new Error(docErr.message);
	const { writeAudit } = await import("./audit.server-CIDtzNHk.mjs");
	await writeAudit(supabase, {
		actorId: userId,
		action: "survivor.document.upload",
		entityType: "survivor_document",
		entityId: doc.id
	});
	return {
		doc,
		uploadUrl: signed.signedUrl,
		token: signed.token
	};
});
var deleteSurvivorDocument_createServerFn_handler = createServerRpc({
	id: "e7cff9b5d637af3bb43625b02faeac3479ea4415d2168c4f7f3b28e345c332fd",
	name: "deleteSurvivorDocument",
	filename: "src/lib/survivors.functions.ts"
}, (opts) => deleteSurvivorDocument.__executeServer(opts));
var deleteSurvivorDocument = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(objectType({ docId: stringType().uuid() })).handler(deleteSurvivorDocument_createServerFn_handler, async ({ data, context }) => {
	const { supabase, userId } = context;
	const { data: doc, error } = await supabase.from("survivor_documents").select("*").eq("id", data.docId).single();
	if (error || !doc) throw new Error("Document not found");
	await supabase.storage.from("survivor-documents").remove([doc.storage_path]);
	await supabase.from("survivor_documents").update({
		status: "deleted",
		deleted_at: (/* @__PURE__ */ new Date()).toISOString()
	}).eq("id", data.docId);
	const { writeAudit } = await import("./audit.server-CIDtzNHk.mjs");
	await writeAudit(supabase, {
		actorId: userId,
		action: "survivor.document.delete",
		entityType: "survivor_document",
		entityId: data.docId
	});
	return { ok: true };
});
var getSignedDocumentUrl_createServerFn_handler = createServerRpc({
	id: "0bd9677271185ee7ae790773f53fc7121d68bd4ce3598717e8233eda0a8159dd",
	name: "getSignedDocumentUrl",
	filename: "src/lib/survivors.functions.ts"
}, (opts) => getSignedDocumentUrl.__executeServer(opts));
var getSignedDocumentUrl = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(objectType({
	docId: stringType().uuid(),
	ttlSeconds: numberType().min(60).max(300).default(300)
})).handler(getSignedDocumentUrl_createServerFn_handler, async ({ data, context }) => {
	const { supabase, userId } = context;
	const { data: doc, error } = await supabase.from("survivor_documents").select("storage_path, file_name").eq("id", data.docId).single();
	if (error || !doc) throw new Error("Document not found");
	const { data: signed, error: signErr } = await supabase.storage.from("survivor-documents").createSignedUrl(doc.storage_path, data.ttlSeconds);
	if (signErr) throw new Error(signErr.message);
	const { writeAudit } = await import("./audit.server-CIDtzNHk.mjs");
	await writeAudit(supabase, {
		actorId: userId,
		action: "survivor.document.access",
		entityType: "survivor_document",
		entityId: data.docId
	});
	return {
		url: signed.signedUrl,
		fileName: doc.file_name
	};
});
var recomputeCompletion_createServerFn_handler = createServerRpc({
	id: "107ebfe9c626cccd440c10be618bbca8ca4c0d51bf885a30125d9ec8e08d78ae",
	name: "recomputeCompletion",
	filename: "src/lib/survivors.functions.ts"
}, (opts) => recomputeCompletion.__executeServer(opts));
var recomputeCompletion = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(objectType({ id: stringType().uuid() })).handler(recomputeCompletion_createServerFn_handler, async ({ data, context }) => {
	const { supabase } = context;
	const { data: s, error } = await supabase.from("survivors").select("*").eq("id", data.id).single();
	if (error || !s) throw new Error("Survivor not found");
	const { data: updated, error: uErr } = await supabase.from("survivors").update({ updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", data.id).select("profile_completion").single();
	if (uErr) throw new Error(uErr.message);
	return { profile_completion: updated.profile_completion };
});
var searchSkillsTaxonomy_createServerFn_handler = createServerRpc({
	id: "ea31354dcacf9249dfc4c8eb6b7afa596f1c58317a8444aebc2b14d30db21df2",
	name: "searchSkillsTaxonomy",
	filename: "src/lib/survivors.functions.ts"
}, (opts) => searchSkillsTaxonomy.__executeServer(opts));
var searchSkillsTaxonomy = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(objectType({ query: stringType().max(100).default("") })).handler(searchSkillsTaxonomy_createServerFn_handler, async ({ data, context }) => {
	const { supabase } = context;
	let q = supabase.from("survivor_skills_taxonomy").select("slug, label, category").limit(20);
	if (data.query) q = q.or(`label.ilike.%${data.query}%,slug.ilike.%${data.query}%`);
	const { data: skills, error } = await q;
	if (error) throw new Error(error.message);
	return skills ?? [];
});
//#endregion
export { deleteSurvivorDocument_createServerFn_handler, getSignedDocumentUrl_createServerFn_handler, getSurvivorDetail_createServerFn_handler, recomputeCompletion_createServerFn_handler, searchSkillsTaxonomy_createServerFn_handler, updateSurvivorProfile_createServerFn_handler, uploadSurvivorDocument_createServerFn_handler };

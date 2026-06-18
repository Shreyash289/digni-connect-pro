//#region node_modules/.nitro/vite/services/ssr/assets/audit.server-CIDtzNHk.js
async function writeAudit(supabase, params) {
	await supabase.from("audit_logs").insert({
		actor_id: params.actorId,
		action: params.action,
		entity_type: params.entityType,
		entity_id: params.entityId ?? null,
		metadata: params.metadata ?? null
	});
}
//#endregion
export { writeAudit };

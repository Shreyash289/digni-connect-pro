//#region node_modules/.nitro/vite/services/ssr/assets/notify.server-BUKOSlyD.js
async function notify(supabaseAdmin, params) {
	const { data: pref } = await supabaseAdmin.from("notification_preferences").select("in_app, email").eq("user_id", params.userId).eq("kind", params.kind).maybeSingle();
	if (!(pref?.in_app ?? true)) return;
	await supabaseAdmin.from("notifications").insert({
		user_id: params.userId,
		kind: params.kind,
		payload: params.payload
	});
	if ((pref?.email ?? true) && process.env.RESEND_API_KEY) console.info(`[notify] email queued for ${params.kind} → ${params.userId}`);
}
//#endregion
export { notify };

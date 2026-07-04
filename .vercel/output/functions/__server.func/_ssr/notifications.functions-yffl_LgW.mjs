import { l as createServerFn } from "./esm-9EjmF9OT.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-pFu6bPsK.mjs";
import { Ct as stringType, St as objectType, xt as numberType, yt as booleanType } from "../_libs/@ai-sdk/gateway+[...].mjs";
import { t as createServerRpc } from "./createServerRpc-TAUNrjZd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/notifications.functions-yffl_LgW.js
var listNotifications_createServerFn_handler = createServerRpc({
	id: "c017b24a4940a916334ff23b3f3461893d7b3f151e06bac76f968dd27c3f187b",
	name: "listNotifications",
	filename: "src/lib/notifications.functions.ts"
}, (opts) => listNotifications.__executeServer(opts));
var listNotifications = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(objectType({ limit: numberType().default(20) })).handler(listNotifications_createServerFn_handler, async ({ data, context }) => {
	const { supabase, userId } = context;
	const { data: notifications, error } = await supabase.from("notifications").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(data.limit);
	if (error) throw new Error(error.message);
	return notifications ?? [];
});
var getUnreadCount_createServerFn_handler = createServerRpc({
	id: "7a8d8a8062bc44cd915da21e8e341e8e8ca1e6e7506033d99b11c684fc5bcadb",
	name: "getUnreadCount",
	filename: "src/lib/notifications.functions.ts"
}, (opts) => getUnreadCount.__executeServer(opts));
var getUnreadCount = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(getUnreadCount_createServerFn_handler, async ({ context }) => {
	const { supabase, userId } = context;
	const { count, error } = await supabase.from("notifications").select("id", {
		count: "exact",
		head: true
	}).eq("user_id", userId).is("read_at", null);
	if (error) throw new Error(error.message);
	return { count: count ?? 0 };
});
var markNotificationRead_createServerFn_handler = createServerRpc({
	id: "385e76cdf807dd53711b6f969d894db85cf9b0ca7a6373bb34c6352adedccb64",
	name: "markNotificationRead",
	filename: "src/lib/notifications.functions.ts"
}, (opts) => markNotificationRead.__executeServer(opts));
var markNotificationRead = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(objectType({ id: stringType().uuid() })).handler(markNotificationRead_createServerFn_handler, async ({ data, context }) => {
	const { supabase, userId } = context;
	await supabase.from("notifications").update({ read_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", data.id).eq("user_id", userId);
	return { ok: true };
});
var markAllNotificationsRead_createServerFn_handler = createServerRpc({
	id: "9450c15293c0a6ae5fe14448bd9f3e0ad58f596f22af371b91f88b98002e414b",
	name: "markAllNotificationsRead",
	filename: "src/lib/notifications.functions.ts"
}, (opts) => markAllNotificationsRead.__executeServer(opts));
var markAllNotificationsRead = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(markAllNotificationsRead_createServerFn_handler, async ({ context }) => {
	const { supabase, userId } = context;
	await supabase.from("notifications").update({ read_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("user_id", userId).is("read_at", null);
	return { ok: true };
});
var getNotificationPreferences_createServerFn_handler = createServerRpc({
	id: "2f9732ba170a6fe5b8b981bd6c85fd09169bf5fce09828e2f3a2e7753fad3c67",
	name: "getNotificationPreferences",
	filename: "src/lib/notifications.functions.ts"
}, (opts) => getNotificationPreferences.__executeServer(opts));
var getNotificationPreferences = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(getNotificationPreferences_createServerFn_handler, async ({ context }) => {
	const { supabase, userId } = context;
	const { data, error } = await supabase.from("notification_preferences").select("*").eq("user_id", userId);
	if (error) throw new Error(error.message);
	return data ?? [];
});
var updateNotificationPreference_createServerFn_handler = createServerRpc({
	id: "4c54821fffe7cd33d8889f8143e3b85390bb49aad6db639fd45ca310e96db7ab",
	name: "updateNotificationPreference",
	filename: "src/lib/notifications.functions.ts"
}, (opts) => updateNotificationPreference.__executeServer(opts));
var updateNotificationPreference = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(objectType({
	kind: stringType(),
	in_app: booleanType(),
	email: booleanType()
})).handler(updateNotificationPreference_createServerFn_handler, async ({ data, context }) => {
	const { supabase, userId } = context;
	const { error } = await supabase.from("notification_preferences").upsert({
		user_id: userId,
		kind: data.kind,
		in_app: data.in_app,
		email: data.email
	}, { onConflict: "user_id,kind" });
	if (error) throw new Error(error.message);
	return { ok: true };
});
var createMentorThread_createServerFn_handler = createServerRpc({
	id: "6ef84f3b68ac75d78d23e4a4d4ad8efba3e05de2e4ccfc6696bb6f761403f9a5",
	name: "createMentorThread",
	filename: "src/lib/notifications.functions.ts"
}, (opts) => createMentorThread.__executeServer(opts));
var createMentorThread = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(objectType({
	survivorId: stringType().uuid().optional(),
	title: stringType().optional()
})).handler(createMentorThread_createServerFn_handler, async ({ data, context }) => {
	const { supabase, userId } = context;
	const { data: thread, error } = await supabase.from("mentor_threads").insert({
		user_id: userId,
		survivor_id: data.survivorId ?? null,
		title: data.title ?? "New conversation"
	}).select().single();
	if (error) throw new Error(error.message);
	return thread;
});
var listMentorThreads_createServerFn_handler = createServerRpc({
	id: "de3980a9f8eaf6529a0919b1a4cb09f3697de41cdccaa6c66a9d326550f79935",
	name: "listMentorThreads",
	filename: "src/lib/notifications.functions.ts"
}, (opts) => listMentorThreads.__executeServer(opts));
var listMentorThreads = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(listMentorThreads_createServerFn_handler, async ({ context }) => {
	const { supabase, userId } = context;
	const { data, error } = await supabase.from("mentor_threads").select("*").eq("user_id", userId).order("updated_at", { ascending: false });
	if (error) throw new Error(error.message);
	return data ?? [];
});
var getMentorMessages_createServerFn_handler = createServerRpc({
	id: "561fa604cdba2e8132359e0372c83ea6a193a05e7c45f7fc0b57713b73076916",
	name: "getMentorMessages",
	filename: "src/lib/notifications.functions.ts"
}, (opts) => getMentorMessages.__executeServer(opts));
var getMentorMessages = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(objectType({ threadId: stringType().uuid() })).handler(getMentorMessages_createServerFn_handler, async ({ data, context }) => {
	const { supabase, userId } = context;
	const { data: thread } = await supabase.from("mentor_threads").select("id").eq("id", data.threadId).eq("user_id", userId).single();
	if (!thread) throw new Error("Thread not found");
	const { data: messages, error } = await supabase.from("mentor_messages").select("*").eq("thread_id", data.threadId).order("created_at", { ascending: true });
	if (error) throw new Error(error.message);
	return messages ?? [];
});
//#endregion
export { createMentorThread_createServerFn_handler, getMentorMessages_createServerFn_handler, getNotificationPreferences_createServerFn_handler, getUnreadCount_createServerFn_handler, listMentorThreads_createServerFn_handler, listNotifications_createServerFn_handler, markAllNotificationsRead_createServerFn_handler, markNotificationRead_createServerFn_handler, updateNotificationPreference_createServerFn_handler };

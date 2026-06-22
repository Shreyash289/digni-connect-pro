import { l as createServerFn } from "./esm-9EjmF9OT.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-Dpn8S0gM.mjs";
import { t as createServerRpc } from "./createServerRpc-TAUNrjZd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.functions-dyK6zOj8.js
var getAdminIntroRequests_createServerFn_handler = createServerRpc({
	id: "cec961d6bfac801b3a68e637813e8cc50f8beba4c2d2d98ed99a6b2dbc992d98",
	name: "getAdminIntroRequests",
	filename: "src/lib/admin.functions.ts"
}, (opts) => getAdminIntroRequests.__executeServer(opts));
var getAdminIntroRequests = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(getAdminIntroRequests_createServerFn_handler, async ({ context }) => {
	const { supabase, userId } = context;
	const { data: isAdmin } = await supabase.rpc("is_admin", { _user_id: userId });
	if (!isAdmin) throw new Error("Admin only");
	const { data, error } = await supabase.from("introduction_requests").select("*, survivors(anonymous_id,full_name), recruiters(company_name), ngos(name)").order("created_at", { ascending: false });
	if (error) throw new Error(error.message);
	return data ?? [];
});
var getAdminUsers_createServerFn_handler = createServerRpc({
	id: "10168707f826b5e8e54808aba2070948c8b2fb5ddd7006123ad782c227604c98",
	name: "getAdminUsers",
	filename: "src/lib/admin.functions.ts"
}, (opts) => getAdminUsers.__executeServer(opts));
var getAdminUsers = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(getAdminUsers_createServerFn_handler, async ({ context }) => {
	const { supabase, userId } = context;
	const { data: isAdmin } = await supabase.rpc("is_admin", { _user_id: userId });
	if (!isAdmin) throw new Error("Admin only");
	const { supabaseAdmin } = await import("./client.server-D1oHePJa.mjs");
	const { data: roles, error: rolesError } = await supabaseAdmin.from("user_roles").select("user_id, role, created_at");
	if (rolesError) throw new Error(rolesError.message);
	const { data: usersPayload, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
	if (usersError) throw new Error(usersError.message);
	const users = usersPayload?.users ?? [];
	const usersMap = new Map(users.map((user) => [user.id, user]));
	return Array.from((roles ?? []).reduce((map, item) => {
		const existing = map.get(item.user_id) ?? {
			userId: item.user_id,
			email: usersMap.get(item.user_id)?.email ?? null,
			createdAt: usersMap.get(item.user_id)?.created_at ?? null,
			roles: [],
			roleAssignedAt: item.created_at
		};
		if (!existing.email) existing.email = usersMap.get(item.user_id)?.email ?? existing.email;
		if (!existing.createdAt) existing.createdAt = usersMap.get(item.user_id)?.created_at ?? existing.createdAt;
		existing.roles.push(item.role);
		map.set(item.user_id, existing);
		return map;
	}, /* @__PURE__ */ new Map())).sort((a, b) => {
		const createdA = a.createdAt ?? "";
		const createdB = b.createdAt ?? "";
		return createdA < createdB ? 1 : createdA > createdB ? -1 : 0;
	});
});
//#endregion
export { getAdminIntroRequests_createServerFn_handler, getAdminUsers_createServerFn_handler };

import { l as createServerFn } from "./esm-9EjmF9OT.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-pFu6bPsK.mjs";
import { t as createServerRpc } from "./createServerRpc-TAUNrjZd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.functions-COAXzQLO.js
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
var requestAdminSignupRole_createServerFn_handler = createServerRpc({
	id: "a12e460ba72c2e448b617626ddc37530e332db234b156491274c13dd7babae8d",
	name: "requestAdminSignupRole",
	filename: "src/lib/admin.functions.ts"
}, (opts) => requestAdminSignupRole.__executeServer(opts));
var requestAdminSignupRole = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(requestAdminSignupRole_createServerFn_handler, async ({ data, context }) => {
	const inviteCode = String(data.inviteCode ?? "").trim();
	const ADMIN_SIGNUP_CODE = process.env.ADMIN_SIGNUP_CODE;
	if (!ADMIN_SIGNUP_CODE) throw new Error("Admin signup is not enabled.");
	if (!inviteCode || inviteCode !== ADMIN_SIGNUP_CODE) throw new Error("Invalid admin signup code.");
	const { supabaseAdmin, supabase } = await import("./client.server-qo1ynXyP.mjs");
	const { userId } = context;
	const { data: existingRole, error: existingError } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", userId).limit(1).maybeSingle();
	if (existingError) throw new Error(existingError.message);
	if (existingRole) throw new Error("A role is already assigned to this account.");
	const { error } = await supabaseAdmin.from("user_roles").insert({
		user_id: userId,
		role: "admin"
	});
	if (error) throw new Error(error.message);
	return { success: true };
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
	const { supabaseAdmin } = await import("./client.server-qo1ynXyP.mjs");
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
export { getAdminIntroRequests_createServerFn_handler, getAdminUsers_createServerFn_handler, requestAdminSignupRole_createServerFn_handler };

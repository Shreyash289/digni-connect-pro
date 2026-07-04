import { o as __toESM } from "../_runtime.mjs";
import { o as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { t as supabase } from "./client-LWzhPH_U.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/useAuth-YqmynGW9.js
var import_react = /* @__PURE__ */ __toESM(require_react());
function useAuth() {
	const [state, setState] = (0, import_react.useState)({
		user: null,
		session: null,
		roles: [],
		loading: true,
		error: null
	});
	async function loadRoles(userId) {
		const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId);
		if (error) throw error;
		return (data ?? []).map((r) => r.role);
	}
	async function handleSession(session) {
		if (!session) {
			setState({
				user: null,
				session: null,
				roles: [],
				loading: false,
				error: null
			});
			return;
		}
		setState((s) => ({
			...s,
			user: session.user,
			session,
			loading: true,
			error: null
		}));
		try {
			const roles = await loadRoles(session.user.id);
			setState({
				user: session.user,
				session,
				roles,
				loading: false,
				error: null
			});
		} catch (error) {
			console.error(error);
			setState({
				user: session.user,
				session,
				roles: [],
				loading: false,
				error: error instanceof Error ? error.message : String(error)
			});
		}
	}
	async function reload() {
		const { data: { session } } = await supabase.auth.getSession();
		await handleSession(session);
	}
	(0, import_react.useEffect)(() => {
		let mounted = true;
		const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
			if (!mounted) return;
			if (!session) {
				setState({
					user: null,
					session: null,
					roles: [],
					loading: false,
					error: null
				});
				return;
			}
			handleSession(session);
		});
		supabase.auth.getSession().then(async ({ data: { session } }) => {
			if (!mounted) return;
			await handleSession(session);
		});
		return () => {
			mounted = false;
			sub.subscription.unsubscribe();
		};
	}, []);
	return {
		...state,
		reload
	};
}
function primaryRole(roles) {
	for (const r of [
		"super_admin",
		"admin",
		"ngo_partner",
		"recruiter",
		"survivor"
	]) if (roles.includes(r)) return r;
	return null;
}
function dashboardPathFor(roles) {
	const p = primaryRole(roles);
	if (p === "super_admin" || p === "admin") return "/admin";
	if (p === "ngo_partner") return "/ngo";
	if (p === "recruiter") return "/recruiter";
	if (p === "survivor") return "/mentor";
	return "/onboarding";
}
//#endregion
export { useAuth as n, dashboardPathFor as t };

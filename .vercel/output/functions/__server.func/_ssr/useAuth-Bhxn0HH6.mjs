import { o as __toESM } from "../_runtime.mjs";
import { o as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { t as supabase } from "./client-CLN0XX6A.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/useAuth-Bhxn0HH6.js
var import_react = /* @__PURE__ */ __toESM(require_react());
function useAuth() {
	const [state, setState] = (0, import_react.useState)({
		user: null,
		session: null,
		roles: [],
		loading: true
	});
	(0, import_react.useEffect)(() => {
		let mounted = true;
		async function loadRoles(userId) {
			const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
			return (data ?? []).map((r) => r.role);
		}
		const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
			if (!mounted) return;
			if (!session) {
				setState({
					user: null,
					session: null,
					roles: [],
					loading: false
				});
				return;
			}
			setState((s) => ({
				...s,
				user: session.user,
				session,
				loading: true
			}));
			setTimeout(async () => {
				const roles = await loadRoles(session.user.id);
				if (mounted) setState({
					user: session.user,
					session,
					roles,
					loading: false
				});
			}, 0);
		});
		supabase.auth.getSession().then(async ({ data: { session } }) => {
			if (!mounted) return;
			if (!session) {
				setState({
					user: null,
					session: null,
					roles: [],
					loading: false
				});
				return;
			}
			const roles = await loadRoles(session.user.id);
			if (mounted) setState({
				user: session.user,
				session,
				roles,
				loading: false
			});
		});
		return () => {
			mounted = false;
			sub.subscription.unsubscribe();
		};
	}, []);
	return state;
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

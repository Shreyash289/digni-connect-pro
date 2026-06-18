import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { t as supabase } from "./client-CLN0XX6A.mjs";
import { n as useAuth } from "./useAuth-Bhxn0HH6.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { m as LoaderCircle } from "../_libs/lucide-react.mjs";
import { t as PortalShell } from "./PortalShell-DAzdbuLY.mjs";
import { n as StatusBadge } from "./ngo.dashboard-C5-FWAWA.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/recruiter.requests-ClYrRNeT.js
var import_jsx_runtime = require_jsx_runtime();
var RECRUITER_NAV = [
	{
		to: "/recruiter/search",
		label: "Search"
	},
	{
		to: "/recruiter/jobs",
		label: "Jobs"
	},
	{
		to: "/recruiter/requests",
		label: "Requests"
	},
	{
		to: "/recruiter/analytics",
		label: "Analytics"
	}
];
function RecruiterRequests() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PortalShell, {
		title: "Recruiter Portal",
		nav: RECRUITER_NAV,
		allow: [
			"recruiter",
			"admin",
			"super_admin"
		],
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Inner, {})
	});
}
function Inner() {
	const { user } = useAuth();
	const { data: recruiter } = useQuery({
		queryKey: ["recruiter-profile"],
		enabled: !!user,
		queryFn: async () => {
			const { data } = await supabase.from("recruiters").select("id").eq("user_id", user.id).single();
			return data;
		}
	});
	const { data: requests, isLoading } = useQuery({
		queryKey: ["recruiter-requests", recruiter?.id],
		enabled: !!recruiter,
		queryFn: async () => {
			const { data, error } = await supabase.from("introduction_requests").select("*, survivors(anonymous_id)").eq("recruiter_id", recruiter.id).order("created_at", { ascending: false });
			if (error) throw error;
			return data;
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-3xl font-bold text-primary",
			children: "Introduction requests"
		}), isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-6 animate-spin" }) : !requests?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "No requests yet."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "divide-y divide-border rounded-2xl border border-border bg-card",
			children: requests.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-4 p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium",
						children: r.survivors?.anonymous_id
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: r.message
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted-foreground",
						children: new Date(r.created_at).toLocaleString()
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: r.status })]
			}, r.id))
		})]
	});
}
//#endregion
export { RecruiterRequests as component };

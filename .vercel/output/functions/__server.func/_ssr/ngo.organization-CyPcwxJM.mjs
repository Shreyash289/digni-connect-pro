import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { t as supabase } from "./client-LWzhPH_U.mjs";
import { n as useAuth } from "./useAuth-YqmynGW9.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as PortalShell } from "./PortalShell-DPiHV71Y.mjs";
import { n as StatusBadge } from "./ngo.dashboard-lcMfFS7g.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ngo.organization-CyPcwxJM.js
var import_jsx_runtime = require_jsx_runtime();
var NGO_NAV = [
	{
		to: "/ngo/dashboard",
		label: "Dashboard"
	},
	{
		to: "/ngo/survivors",
		label: "Survivors"
	},
	{
		to: "/ngo/organization",
		label: "Organization"
	}
];
function Org() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PortalShell, {
		title: "NGO Portal",
		nav: NGO_NAV,
		allow: [
			"ngo_partner",
			"admin",
			"super_admin"
		],
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Inner, {})
	});
}
function Inner() {
	const { user } = useAuth();
	const { data: ngo, isLoading } = useQuery({
		queryKey: ["my-ngo", user?.id],
		enabled: !!user,
		queryFn: async () => {
			const { data, error } = await supabase.from("ngos").select("*").eq("owner_id", user.id).maybeSingle();
			if (error) throw error;
			return data;
		}
	});
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "text-sm text-muted-foreground",
		children: "Loading…"
	});
	if (!ngo) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "text-sm text-muted-foreground",
		children: "No NGO registered."
	});
	const rows = [
		["Name", ngo.name],
		["Registration number", ngo.registration_number],
		["Contact email", ngo.contact_email],
		["Contact phone", ngo.contact_phone],
		["City", ngo.city],
		["State", ngo.state],
		["Country", ngo.country],
		["About", ngo.description]
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-end justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl font-bold text-primary",
				children: ngo.name
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: "Organization profile"
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: ngo.status })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "overflow-hidden rounded-2xl border border-border bg-card",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
				className: "divide-y divide-border",
				children: rows.map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-[180px_1fr] gap-4 px-5 py-3 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-muted-foreground",
						children: k
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "text-foreground",
						children: v || "—"
					})]
				}, k))
			})
		})]
	});
}
//#endregion
export { Org as component };

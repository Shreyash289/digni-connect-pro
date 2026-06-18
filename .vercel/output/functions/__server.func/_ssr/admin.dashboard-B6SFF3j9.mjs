import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { t as supabase } from "./client-CLN0XX6A.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { T as Building2, m as LoaderCircle, n as Users, x as CircleCheck, y as Clock } from "../_libs/lucide-react.mjs";
import { t as PortalShell } from "./PortalShell-DAzdbuLY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.dashboard-B6SFF3j9.js
var import_jsx_runtime = require_jsx_runtime();
var ADMIN_NAV = [
	{
		to: "/admin/dashboard",
		label: "Overview"
	},
	{
		to: "/admin/ngos",
		label: "NGO approvals"
	},
	{
		to: "/admin/recruiters",
		label: "Recruiters"
	},
	{
		to: "/admin/analytics",
		label: "Analytics"
	}
];
function AdminDashboard() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PortalShell, {
		title: "Admin",
		nav: ADMIN_NAV,
		allow: ["admin", "super_admin"],
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Inner, {})
	});
}
function Inner() {
	const { data, isLoading } = useQuery({
		queryKey: ["admin-overview"],
		queryFn: async () => {
			const [ngos, survivors] = await Promise.all([supabase.from("ngos").select("id,status", { count: "exact" }), supabase.from("survivors").select("id", {
				count: "exact",
				head: true
			})]);
			const all = ngos.data ?? [];
			return {
				ngoTotal: all.length,
				ngoPending: all.filter((n) => n.status === "pending").length,
				ngoApproved: all.filter((n) => n.status === "approved").length,
				survivorTotal: survivors.count ?? 0
			};
		}
	});
	if (isLoading || !data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid place-items-center py-24",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-6 animate-spin text-muted-foreground" })
	});
	const cards = [
		{
			label: "Total NGOs",
			value: data.ngoTotal,
			icon: Building2
		},
		{
			label: "Pending approval",
			value: data.ngoPending,
			icon: Clock,
			tone: "warning"
		},
		{
			label: "Approved NGOs",
			value: data.ngoApproved,
			icon: CircleCheck,
			tone: "success"
		},
		{
			label: "Survivors on platform",
			value: data.survivorTotal,
			icon: Users
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl font-bold text-primary",
				children: "Platform overview"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: "High-level metrics across CAREVIA."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
				children: cards.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-border bg-card p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: c.label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(c.icon, { className: `size-4 ${c.tone === "success" ? "text-success" : c.tone === "warning" ? "text-warning-foreground" : "text-accent"}` })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 font-display text-3xl font-bold text-primary",
						children: c.value
					})]
				}, c.label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center text-sm text-muted-foreground",
				children: "Recruiter portal, AI mentor, job board, and analytics are coming in the next phases."
			})
		]
	});
}
//#endregion
export { AdminDashboard as component };

import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { t as Button } from "./button-DHpxc22r.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { m as LoaderCircle, v as Download } from "../_libs/lucide-react.mjs";
import { t as PortalShell } from "./PortalShell-DPiHV71Y.mjs";
import { n as getAdminAnalytics, t as exportAdminCsv } from "./analytics.functions-CmvfZ7cU.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.analytics-Ch32GgSf.js
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
		to: "/admin/requests",
		label: "Requests"
	},
	{
		to: "/admin/users",
		label: "Users"
	},
	{
		to: "/admin/analytics",
		label: "Analytics"
	}
];
function AdminAnalytics() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PortalShell, {
		title: "Admin",
		nav: ADMIN_NAV,
		allow: ["admin", "super_admin"],
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Inner, {})
	});
}
function Inner() {
	const { data, isLoading } = useQuery({
		queryKey: ["admin-analytics"],
		queryFn: () => getAdminAnalytics()
	});
	async function downloadCsv() {
		const { csv } = await exportAdminCsv();
		const blob = new Blob([csv], { type: "text/csv" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "carevia-survivors.csv";
		a.click();
	}
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-6 animate-spin" });
	const metrics = [
		{
			label: "Total survivors",
			value: data?.totalSurvivors
		},
		{
			label: "Active NGOs",
			value: data?.activeNgos
		},
		{
			label: "Pending NGO approvals",
			value: data?.pendingNgoApprovals
		},
		{
			label: "Pending recruiter approvals",
			value: data?.pendingRecruiterApprovals
		},
		{
			label: "Introductions sent",
			value: data?.introductionsSent
		},
		{
			label: "Introductions accepted",
			value: data?.introductionsAccepted
		},
		{
			label: "Jobs posted",
			value: data?.jobsPosted
		},
		{
			label: "Jobs published",
			value: data?.jobsPublished
		},
		{
			label: "Applications",
			value: data?.applicationsSubmitted
		},
		{
			label: "Hires",
			value: data?.hires
		},
		{
			label: "Safety-flagged messages",
			value: data?.safetyFlaggedMessages
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl font-bold text-primary",
				children: "Platform analytics"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "outline",
				className: "gap-2",
				onClick: downloadCsv,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), " Export CSV"]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
			children: metrics.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-border bg-card p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: m.label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 font-display text-3xl font-bold text-primary",
					children: m.value ?? 0
				})]
			}, m.label))
		})]
	});
}
//#endregion
export { AdminAnalytics as component };

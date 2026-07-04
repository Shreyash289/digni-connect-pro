import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { m as LoaderCircle } from "../_libs/lucide-react.mjs";
import { t as PortalShell } from "./PortalShell-DPiHV71Y.mjs";
import { r as getNgoAnalytics } from "./analytics.functions-CmvfZ7cU.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ngo.analytics-Cy3h8jb4.js
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
		to: "/ngo/requests",
		label: "Intro requests"
	},
	{
		to: "/ngo/analytics",
		label: "Analytics"
	},
	{
		to: "/ngo/organization",
		label: "Organization"
	}
];
function NgoAnalytics() {
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
	const { data, isLoading } = useQuery({
		queryKey: ["ngo-analytics"],
		queryFn: () => getNgoAnalytics()
	});
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-6 animate-spin" });
	const metrics = [
		{
			label: "Survivors managed",
			value: data?.survivorsManaged
		},
		{
			label: "Avg profile completion",
			value: `${data?.avgProfileCompletion ?? 0}%`
		},
		{
			label: "Intros received",
			value: data?.introsReceived
		},
		{
			label: "Intros accepted",
			value: data?.introsAccepted
		},
		{
			label: "Applications submitted",
			value: data?.applicationsSubmitted
		},
		{
			label: "Hires",
			value: data?.hires
		},
		{
			label: "Mentor sessions",
			value: data?.mentorSessions
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-3xl font-bold text-primary",
			children: "NGO analytics"
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
export { NgoAnalytics as component };

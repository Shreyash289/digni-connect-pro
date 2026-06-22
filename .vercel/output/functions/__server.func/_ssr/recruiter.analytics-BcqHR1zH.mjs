import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { m as LoaderCircle } from "../_libs/lucide-react.mjs";
import { t as PortalShell } from "./PortalShell-DowbbmyM.mjs";
import { i as getRecruiterAnalytics } from "./analytics.functions-B3-EOTOo.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/recruiter.analytics-BcqHR1zH.js
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
function RecruiterAnalytics() {
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
	const { data, isLoading } = useQuery({
		queryKey: ["recruiter-analytics"],
		queryFn: () => getRecruiterAnalytics()
	});
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-6 animate-spin" });
	const metrics = [
		{
			label: "Active jobs",
			value: data?.activeJobs
		},
		{
			label: "Intros sent",
			value: data?.introsSent
		},
		{
			label: "Intros accepted",
			value: data?.introsAccepted
		},
		{
			label: "Applications received",
			value: data?.applicationsReceived
		},
		{
			label: "Hires",
			value: data?.hires
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-3xl font-bold text-primary",
			children: "Recruiter analytics"
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
export { RecruiterAnalytics as component };

import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { m as LoaderCircle } from "../_libs/lucide-react.mjs";
import { t as PortalShell } from "./PortalShell-DPiHV71Y.mjs";
import { n as StatusBadge } from "./ngo.dashboard-lcMfFS7g.mjs";
import { t as getAdminIntroRequests } from "./admin.functions-Dv_MNoXz.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.requests-BUgPFsB8.js
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
function AdminRequests() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PortalShell, {
		title: "Admin",
		nav: ADMIN_NAV,
		allow: ["admin", "super_admin"],
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Inner, {})
	});
}
function Inner() {
	const { data, isLoading } = useQuery({
		queryKey: ["admin-requests"],
		queryFn: () => getAdminIntroRequests()
	});
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid place-items-center py-24",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-6 animate-spin text-muted-foreground" })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-3xl font-bold text-primary",
			children: "Introduction requests"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-muted-foreground",
			children: "Review every recruiter introduction request on the platform."
		})] }), !data?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground",
			children: "No introduction requests found."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-4",
			children: data.map((request) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-border bg-card p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-start justify-between gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-medium text-foreground",
							children: [
								request.survivors?.full_name ?? "Unknown survivor",
								" · ",
								request.survivors?.anonymous_id ?? request.survivor_id
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted-foreground",
							children: ["Recruiter: ", request.recruiters?.company_name ?? "Unknown"]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: request.status })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 grid gap-3 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs uppercase tracking-wide text-muted-foreground",
							children: "NGO"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-foreground",
							children: request.ngos?.name ?? "Unknown NGO"
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs uppercase tracking-wide text-muted-foreground",
							children: "Job"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-foreground",
							children: request.job_id ? request.job_id : "No job selected"
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 text-sm text-foreground",
						children: request.message
					}),
					request.response_note && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 rounded-2xl border border-border bg-muted p-4 text-sm text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium",
							children: "NGO response note"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: request.response_note })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-xs text-muted-foreground",
						children: ["Submitted ", new Date(request.created_at).toLocaleString()]
					})
				]
			}, request.id))
		})]
	});
}
//#endregion
export { AdminRequests as component };

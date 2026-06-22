import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { m as LoaderCircle } from "../_libs/lucide-react.mjs";
import { t as PortalShell } from "./PortalShell-DowbbmyM.mjs";
import { n as getAdminUsers } from "./admin.functions-BoPKzY7g.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.users-DuaqbfyY.js
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
function AdminUsers() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PortalShell, {
		title: "Admin",
		nav: ADMIN_NAV,
		allow: ["admin", "super_admin"],
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Inner, {})
	});
}
function Inner() {
	const { data, isLoading } = useQuery({
		queryKey: ["admin-users"],
		queryFn: () => getAdminUsers()
	});
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid place-items-center py-24",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-6 animate-spin text-muted-foreground" })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-3xl font-bold text-primary",
			children: "Current users"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-muted-foreground",
			children: "View user accounts and assigned roles across the platform."
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-2xl border border-border bg-card overflow-hidden",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-[minmax(220px,_1.5fr)_1fr_1fr] gap-4 border-b border-border px-5 py-3 text-xs uppercase tracking-wide text-muted-foreground",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "User" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Roles" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Joined" })
				]
			}), !data?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "p-8 text-center text-sm text-muted-foreground",
				children: "No users found."
			}) : data.map((user) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-[minmax(220px,_1.5fr)_1fr_1fr] gap-4 border-t border-border px-5 py-4 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium text-foreground",
						children: user.email ?? user.userId
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: user.userId
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-sm text-foreground",
						children: (user.roles ?? []).join(", ")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-sm text-foreground",
						children: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"
					})
				]
			}, user.userId))]
		})]
	});
}
//#endregion
export { AdminUsers as component };

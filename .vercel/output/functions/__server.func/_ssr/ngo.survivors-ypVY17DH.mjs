import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as supabase } from "./client-CLN0XX6A.mjs";
import { n as useAuth } from "./useAuth-Bhxn0HH6.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { m as LoaderCircle, n as Users } from "../_libs/lucide-react.mjs";
import { t as PortalShell } from "./PortalShell-DowbbmyM.mjs";
import { n as StatusBadge } from "./ngo.dashboard-BYK7HnHv.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ngo.survivors-ypVY17DH.js
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
function NgoSurvivors() {
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
	const { data: ngo } = useQuery({
		queryKey: ["my-ngo", user?.id],
		enabled: !!user,
		queryFn: async () => {
			const { data, error } = await supabase.from("ngos").select("*").eq("owner_id", user.id).maybeSingle();
			if (error) throw error;
			return data;
		}
	});
	const { data: survivors, isLoading } = useQuery({
		queryKey: ["my-survivors", ngo?.id],
		enabled: !!ngo && ngo.status === "approved",
		queryFn: async () => {
			const { data, error } = await supabase.from("survivors").select("id, anonymous_id, full_name, status, profile_completion, city, state, created_at").eq("ngo_id", ngo.id).order("created_at", { ascending: false });
			if (error) throw error;
			return data;
		}
	});
	if (!ngo || ngo.status !== "approved") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground",
		children: "Your NGO must be approved before you can view survivors."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-3xl font-bold text-primary",
			children: "Survivors"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "overflow-hidden rounded-2xl border border-border bg-card",
			children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid place-items-center py-16",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-5 animate-spin text-muted-foreground" })
			}) : !survivors || survivors.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid place-items-center py-16 text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "mb-2 size-7 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "No survivors added yet."
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3",
							children: "Name"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3",
							children: "ID"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3",
							children: "Location"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3",
							children: "Progress"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3",
							children: "Status"
						})
					] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
					className: "divide-y divide-border",
					children: survivors.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "hover:bg-muted/30",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3 font-medium",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/ngo/survivors/$id",
									params: { id: s.id },
									className: "hover:text-accent",
									children: s.full_name
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3 text-muted-foreground",
								children: s.anonymous_id
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3 text-muted-foreground",
								children: [s.city, s.state].filter(Boolean).join(", ") || "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "h-1.5 w-24 overflow-hidden rounded-full bg-muted",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "h-full bg-accent",
											style: { width: `${s.profile_completion}%` }
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-xs text-muted-foreground",
										children: [s.profile_completion, "%"]
									})]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: s.status })
							})
						]
					}, s.id))
				})]
			})
		})]
	});
}
//#endregion
export { NgoSurvivors as component };

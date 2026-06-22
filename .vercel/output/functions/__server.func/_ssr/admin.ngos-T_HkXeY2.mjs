import { o as __toESM } from "../_runtime.mjs";
import { o as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { t as Button } from "./button-DHpxc22r.mjs";
import { t as supabase } from "./client-CLN0XX6A.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { m as LoaderCircle, t as X, w as Check } from "../_libs/lucide-react.mjs";
import { t as PortalShell } from "./PortalShell-DowbbmyM.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-DIo89e4g.mjs";
import { t as Textarea } from "./textarea-kko37XEX.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.ngos-T_HkXeY2.js
var import_react = /* @__PURE__ */ __toESM(require_react());
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
function AdminNgos() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PortalShell, {
		title: "Admin",
		nav: ADMIN_NAV,
		allow: ["admin", "super_admin"],
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Inner, {})
	});
}
function Inner() {
	const qc = useQueryClient();
	const [rejectFor, setRejectFor] = (0, import_react.useState)(null);
	const [reason, setReason] = (0, import_react.useState)("");
	const { data, isLoading } = useQuery({
		queryKey: ["admin-ngos"],
		queryFn: async () => {
			const { data, error } = await supabase.from("ngos").select("*").order("created_at", { ascending: false });
			if (error) throw error;
			return data;
		}
	});
	const approve = useMutation({
		mutationFn: async (n) => {
			const { data: u } = await supabase.auth.getUser();
			const { error } = await supabase.from("ngos").update({
				status: "approved",
				approved_at: (/* @__PURE__ */ new Date()).toISOString(),
				approved_by: u.user?.id,
				rejection_reason: null
			}).eq("id", n.id);
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("NGO approved");
			qc.invalidateQueries({ queryKey: ["admin-ngos"] });
			qc.invalidateQueries({ queryKey: ["admin-overview"] });
		},
		onError: (e) => toast.error(e.message)
	});
	const reject = useMutation({
		mutationFn: async () => {
			if (!rejectFor) return;
			const { error } = await supabase.from("ngos").update({
				status: "rejected",
				rejection_reason: reason || "Not approved"
			}).eq("id", rejectFor.id);
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("NGO rejected");
			setRejectFor(null);
			setReason("");
			qc.invalidateQueries({ queryKey: ["admin-ngos"] });
		},
		onError: (e) => toast.error(e.message)
	});
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid place-items-center py-24",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-6 animate-spin text-muted-foreground" })
	});
	const pending = data?.filter((n) => n.status === "pending") ?? [];
	const others = data?.filter((n) => n.status !== "pending") ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl font-bold text-primary",
				children: "NGO approvals"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: "Review NGO partner applications."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
				className: "mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground",
				children: [
					"Pending (",
					pending.length,
					")"
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-3",
				children: pending.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground",
					children: "Nothing to review."
				}) : pending.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NgoCard, {
					ngo: n,
					actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "outline",
						onClick: () => setRejectFor(n),
						className: "gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }), " Reject"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						disabled: approve.isPending,
						onClick: () => approve.mutate(n),
						className: "gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" }), " Approve"]
					})] })
				}, n.id))
			})] }),
			others.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground",
				children: "Recently reviewed"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-3",
				children: others.slice(0, 20).map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NgoCard, { ngo: n }, n.id))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: !!rejectFor,
				onOpenChange: (o) => !o && setRejectFor(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, { children: [
						"Reject ",
						rejectFor?.name,
						"?"
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "The NGO will see this reason on their dashboard." })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						placeholder: "Reason (optional)",
						rows: 4,
						value: reason,
						onChange: (e) => setReason(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						onClick: () => setRejectFor(null),
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "destructive",
						disabled: reject.isPending,
						onClick: () => reject.mutate(),
						children: "Confirm reject"
					})] })
				] })
			})
		]
	});
}
function NgoCard({ ngo, actions }) {
	const tone = ngo.status === "approved" ? "bg-success/15 text-success" : ngo.status === "rejected" ? "bg-destructive/15 text-destructive" : "bg-warning/15 text-warning-foreground";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-start sm:justify-between",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex-1",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-semibold text-primary",
						children: ngo.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "secondary",
						className: tone,
						children: ngo.status
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: [
						ngo.contact_email,
						" ",
						ngo.contact_phone ? `· ${ngo.contact_phone}` : ""
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted-foreground",
					children: [[
						ngo.city,
						ngo.state,
						ngo.country
					].filter(Boolean).join(", ") || "—", ngo.registration_number ? ` · Reg ${ngo.registration_number}` : ""]
				}),
				ngo.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-foreground/80",
					children: ngo.description
				}),
				ngo.rejection_reason && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-xs text-destructive",
					children: ["Reason: ", ngo.rejection_reason]
				})
			]
		}), actions && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex gap-2",
			children: actions
		})]
	});
}
//#endregion
export { AdminNgos as component };

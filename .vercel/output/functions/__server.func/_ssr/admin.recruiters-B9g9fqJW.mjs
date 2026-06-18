import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { t as Button } from "./button-DHpxc22r.mjs";
import { t as supabase } from "./client-CLN0XX6A.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { m as LoaderCircle } from "../_libs/lucide-react.mjs";
import { t as PortalShell } from "./PortalShell-DAzdbuLY.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as StatusBadge } from "./ngo.dashboard-C5-FWAWA.mjs";
import { a as verifyRecruiter } from "./recruiters.functions-EkDc-oLQ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.recruiters-B9g9fqJW.js
var import_jsx_runtime = require_jsx_runtime();
var ADMIN_NAV = [
	{
		to: "/admin/dashboard",
		label: "Dashboard"
	},
	{
		to: "/admin/ngos",
		label: "NGOs"
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
function AdminRecruiters() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PortalShell, {
		title: "Admin",
		nav: ADMIN_NAV,
		allow: ["admin", "super_admin"],
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Inner, {})
	});
}
function Inner() {
	const qc = useQueryClient();
	const { data: recruiters, isLoading } = useQuery({
		queryKey: ["admin-recruiters"],
		queryFn: async () => {
			const { data, error } = await supabase.from("recruiters").select("*, profiles:user_id(full_name)").order("created_at", { ascending: false });
			if (error) throw error;
			return data;
		}
	});
	const verify = useMutation({
		mutationFn: ({ id, status }) => verifyRecruiter({ data: {
			id,
			status
		} }),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["admin-recruiters"] });
			toast.success("Recruiter updated");
		},
		onError: (e) => toast.error(e.message)
	});
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-6 animate-spin" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-3xl font-bold text-primary",
			children: "Recruiter verification"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "divide-y divide-border rounded-2xl border border-border bg-card",
			children: (recruiters ?? []).map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-4 p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-medium",
					children: r.company_name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: r.company_website ?? "No website"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: r.verification_status }), r.verification_status === "pending" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						onClick: () => verify.mutate({
							id: r.id,
							status: "approved"
						}),
						children: "Approve"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "outline",
						onClick: () => verify.mutate({
							id: r.id,
							status: "rejected"
						}),
						children: "Reject"
					})] })]
				})]
			}, r.id))
		})]
	});
}
//#endregion
export { AdminRecruiters as component };

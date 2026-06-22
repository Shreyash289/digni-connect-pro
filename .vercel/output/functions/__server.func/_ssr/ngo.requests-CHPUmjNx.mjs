import { o as __toESM } from "../_runtime.mjs";
import { o as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { t as Button } from "./button-DHpxc22r.mjs";
import { t as supabase } from "./client-CLN0XX6A.mjs";
import { n as useAuth } from "./useAuth-Bhxn0HH6.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { m as LoaderCircle } from "../_libs/lucide-react.mjs";
import { t as PortalShell } from "./PortalShell-DowbbmyM.mjs";
import { t as Textarea } from "./textarea-kko37XEX.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as StatusBadge } from "./ngo.dashboard-BYK7HnHv.mjs";
import { r as respondToIntroduction } from "./recruiters.functions-PwJfShde.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ngo.requests-CHPUmjNx.js
var import_react = /* @__PURE__ */ __toESM(require_react());
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
function NgoRequests() {
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
	const qc = useQueryClient();
	const { data: ngo } = useQuery({
		queryKey: ["my-ngo", user?.id],
		enabled: !!user,
		queryFn: async () => {
			const { data } = await supabase.from("ngos").select("id").eq("owner_id", user.id).single();
			return data;
		}
	});
	const { data: requests, isLoading } = useQuery({
		queryKey: ["ngo-intro-requests", ngo?.id],
		enabled: !!ngo,
		queryFn: async () => {
			const { data, error } = await supabase.from("introduction_requests").select("*, survivors(anonymous_id, full_name), recruiters(company_name)").eq("ngo_id", ngo.id).order("created_at", { ascending: false });
			if (error) throw error;
			return data;
		}
	});
	const respond = useMutation({
		mutationFn: ({ id, status, note }) => respondToIntroduction({ data: {
			id,
			status,
			note
		} }),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["ngo-intro-requests"] });
			toast.success("Response sent");
		},
		onError: (e) => toast.error(e.message)
	});
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-6 animate-spin" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl font-bold text-primary",
				children: "Introduction requests"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Review recruiter requests before sharing survivor contact details."
			}),
			!requests?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "No pending requests."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-4",
				children: requests.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequestCard, {
					request: r,
					onRespond: (status, note) => respond.mutate({
						id: r.id,
						status,
						note
					})
				}, r.id))
			})
		]
	});
}
function RequestCard({ request: r, onRespond }) {
	const [note, setNote] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-border bg-card p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "font-medium",
					children: [
						r.survivors?.full_name,
						" (",
						r.survivors?.anonymous_id,
						")"
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted-foreground",
					children: ["From: ", r.recruiters?.company_name]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: r.status })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm",
				children: r.message
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-muted-foreground",
				children: new Date(r.created_at).toLocaleString()
			}),
			r.status === "pending" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					rows: 2,
					placeholder: "Optional note to recruiter…",
					value: note,
					onChange: (e) => setNote(e.target.value)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						onClick: () => onRespond("accepted", note),
						children: "Accept"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "outline",
						onClick: () => onRespond("declined", note),
						children: "Decline"
					})]
				})]
			})
		]
	});
}
//#endregion
export { NgoRequests as component };

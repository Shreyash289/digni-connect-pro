import { o as __toESM } from "../_runtime.mjs";
import { o as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { t as Button } from "./button-DHpxc22r.mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { l as Plus, m as LoaderCircle } from "../_libs/lucide-react.mjs";
import { t as PortalShell } from "./PortalShell-DAzdbuLY.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, s as DialogTrigger, t as Dialog } from "./dialog-DIo89e4g.mjs";
import { t as Textarea } from "./textarea-kko37XEX.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as StatusBadge } from "./ngo.dashboard-C5-FWAWA.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { a as listRecruiterJobs, n as createJob, o as publishJob, t as closeJob } from "./jobs.functions-CeKCNQiV.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/recruiter.jobs-DldeMH8N.js
var import_react = /* @__PURE__ */ __toESM(require_react());
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
function RecruiterJobs() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PortalShell, {
		title: "Recruiter Portal",
		nav: RECRUITER_NAV,
		allow: [
			"recruiter",
			"admin",
			"super_admin"
		],
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(JobsInner, {})
	});
}
function JobsInner() {
	const qc = useQueryClient();
	const { data: jobs, isLoading } = useQuery({
		queryKey: ["recruiter-jobs"],
		queryFn: () => listRecruiterJobs()
	});
	const publish = useMutation({
		mutationFn: (id) => publishJob({ data: { id } }),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["recruiter-jobs"] });
			toast.success("Job published");
		},
		onError: (e) => toast.error(e.message)
	});
	const close = useMutation({
		mutationFn: (id) => closeJob({ data: { id } }),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["recruiter-jobs"] });
			toast.success("Job closed");
		},
		onError: (e) => toast.error(e.message)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl font-bold text-primary",
				children: "Your jobs"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NewJobDialog, { onCreated: () => qc.invalidateQueries({ queryKey: ["recruiter-jobs"] }) })]
		}), isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-6 animate-spin" }) : !jobs?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "No jobs yet. Create your first listing."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "divide-y divide-border rounded-2xl border border-border bg-card",
			children: jobs.map((j) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-4 p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/recruiter/jobs/$id/edit",
					params: { id: j.id },
					className: "font-medium hover:text-accent",
					children: j.title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: j.company_name
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: j.status }),
						j.status === "draft" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							onClick: () => publish.mutate(j.id),
							children: "Publish"
						}),
						j.status === "published" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "outline",
							onClick: () => close.mutate(j.id),
							children: "Close"
						})
					]
				})]
			}, j.id))
		})]
	});
}
function NewJobDialog({ onCreated }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [form, setForm] = (0, import_react.useState)({
		title: "",
		company_name: "",
		description: "",
		required_skills: ""
	});
	async function submit(e) {
		e.preventDefault();
		try {
			await createJob({ data: {
				title: form.title,
				company_name: form.company_name,
				description: form.description,
				required_skills: form.required_skills.split(",").map((s) => s.trim()).filter(Boolean)
			} });
			toast.success("Job created");
			setOpen(false);
			onCreated();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Failed");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
		open,
		onOpenChange: setOpen,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				className: "gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), " New job"]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Create job listing" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: submit,
			className: "space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Title" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					className: "mt-2",
					value: form.title,
					onChange: (e) => setForm({
						...form,
						title: e.target.value
					}),
					required: true
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Company" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					className: "mt-2",
					value: form.company_name,
					onChange: (e) => setForm({
						...form,
						company_name: e.target.value
					}),
					required: true
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Description" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					className: "mt-2",
					rows: 4,
					value: form.description,
					onChange: (e) => setForm({
						...form,
						description: e.target.value
					})
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Required skills (comma)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					className: "mt-2",
					value: form.required_skills,
					onChange: (e) => setForm({
						...form,
						required_skills: e.target.value
					})
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					children: "Create draft"
				}) })
			]
		})] })]
	});
}
//#endregion
export { RecruiterJobs as component };

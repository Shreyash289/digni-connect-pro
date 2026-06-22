import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { n as Logo, t as Button } from "./button-DHpxc22r.mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { d as MapPin, k as ArrowLeft, m as LoaderCircle } from "../_libs/lucide-react.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { t as Route } from "./jobs._id-3Est0Jw8.mjs";
import { r as getPublishedJob } from "./jobs.functions-0fLSw_uU.mjs";
import { t as Markdown } from "../_libs/react-markdown+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/jobs._id-QCk7npYO.js
var import_jsx_runtime = require_jsx_runtime();
function JobDetail() {
	const { id } = Route.useParams();
	const { data: job, isLoading, error } = useQuery({
		queryKey: ["job", id],
		queryFn: () => getPublishedJob({ data: { id } })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-muted/30",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
			className: "border-b border-border bg-background",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto flex h-16 max-w-3xl items-center justify-between px-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, { className: "h-8 w-auto" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/jobs",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "ghost",
						size: "sm",
						className: "gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), " All jobs"]
					})
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
			className: "mx-auto max-w-3xl px-4 py-12",
			children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-6 animate-spin" }) : error || !job ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-muted-foreground",
				children: "Job not found or no longer available."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl font-bold text-primary",
					children: job.title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-lg text-muted-foreground",
					children: job.company_name
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex flex-wrap gap-2",
					children: [
						job.remote_ok && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "Remote OK" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "outline",
							children: job.employment_type?.replace("_", " ")
						}),
						(job.required_skills ?? []).map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "secondary",
							children: s
						}, s))
					]
				}),
				(job.location_country || job.location_region) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 flex items-center gap-1 text-sm text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-4" }),
						" ",
						[job.location_region, job.location_country].filter(Boolean).join(", ")
					]
				}),
				(job.salary_min || job.salary_max) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: job.salary_min && job.salary_max ? `${job.currency} ${job.salary_min.toLocaleString()} – ${job.salary_max.toLocaleString()}` : job.salary_min ? `From ${job.currency} ${job.salary_min.toLocaleString()}` : `Up to ${job.currency} ${job.salary_max?.toLocaleString()}`
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "prose prose-sm mt-8 max-w-none dark:prose-invert",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Markdown, { children: job.description || "No description provided." })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-8 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground",
					children: "To apply, contact your NGO partner or sign in to the CAREVIA platform."
				})
			] })
		})]
	});
}
//#endregion
export { JobDetail as component };

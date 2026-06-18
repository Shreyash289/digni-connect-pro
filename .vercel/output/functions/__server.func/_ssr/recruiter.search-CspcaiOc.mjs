import { o as __toESM } from "../_runtime.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { o as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { t as Button } from "./button-DHpxc22r.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { E as Briefcase, c as Search, d as MapPin, m as LoaderCircle } from "../_libs/lucide-react.mjs";
import { t as PortalShell } from "./PortalShell-DAzdbuLY.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, t as Dialog } from "./dialog-DIo89e4g.mjs";
import { t as Textarea } from "./textarea-kko37XEX.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as searchSurvivors, n as requestIntroduction, t as getRecruiterProfile } from "./recruiters.functions-EkDc-oLQ.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/recruiter.search-CspcaiOc.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Card = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("rounded-xl border bg-card text-card-foreground shadow", className),
	...props
}));
Card.displayName = "Card";
var CardHeader = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("flex flex-col space-y-1.5 p-6", className),
	...props
}));
CardHeader.displayName = "CardHeader";
var CardTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("font-semibold leading-none tracking-tight", className),
	...props
}));
CardTitle.displayName = "CardTitle";
var CardDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
CardDescription.displayName = "CardDescription";
var CardContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("p-6 pt-0", className),
	...props
}));
CardContent.displayName = "CardContent";
var CardFooter = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("flex items-center p-6 pt-0", className),
	...props
}));
CardFooter.displayName = "CardFooter";
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
function RecruiterSearch() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PortalShell, {
		title: "Recruiter Portal",
		nav: RECRUITER_NAV,
		allow: [
			"recruiter",
			"admin",
			"super_admin"
		],
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchInner, {})
	});
}
function SearchInner() {
	const [filters, setFilters] = (0, import_react.useState)({
		query: "",
		skills: "",
		location_country: "",
		availability: ""
	});
	const [page, setPage] = (0, import_react.useState)(1);
	const [introTarget, setIntroTarget] = (0, import_react.useState)(null);
	const [message, setMessage] = (0, import_react.useState)("");
	const { data: profile } = useQuery({
		queryKey: ["recruiter-profile"],
		queryFn: () => getRecruiterProfile()
	});
	const { data, isLoading, refetch } = useQuery({
		queryKey: [
			"recruiter-search",
			filters,
			page
		],
		enabled: profile?.verification_status === "approved",
		queryFn: () => searchSurvivors({ data: {
			filters: {
				query: filters.query || void 0,
				skills: filters.skills ? filters.skills.split(",").map((s) => s.trim()) : void 0,
				location_country: filters.location_country || void 0,
				availability: filters.availability || void 0
			},
			page
		} })
	});
	if (profile && profile.verification_status !== "approved") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-warning/30 bg-warning/10 p-8 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-semibold",
			children: "Verification pending"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-2 text-sm text-muted-foreground",
			children: [
				"Your recruiter account is ",
				profile.verification_status,
				". You'll be able to search once approved."
			]
		})]
	});
	async function sendIntro() {
		if (!introTarget || message.length < 10) {
			toast.error("Message must be at least 10 characters");
			return;
		}
		try {
			await requestIntroduction({ data: {
				survivorId: introTarget.id,
				message
			} });
			toast.success("Introduction request sent");
			setIntroTarget(null);
			setMessage("");
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Failed");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl font-bold text-primary",
				children: "Search survivors"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Only anonymized profiles with consent are shown. No names or documents."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						placeholder: "Search bio…",
						value: filters.query,
						onChange: (e) => setFilters({
							...filters,
							query: e.target.value
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						placeholder: "Skills (comma)",
						value: filters.skills,
						onChange: (e) => setFilters({
							...filters,
							skills: e.target.value
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						placeholder: "Country",
						value: filters.location_country,
						onChange: (e) => setFilters({
							...filters,
							location_country: e.target.value
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: () => {
							setPage(1);
							refetch();
						},
						className: "gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-4" }), " Search"]
					})
				]
			}),
			isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid place-items-center py-16",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-6 animate-spin" })
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted-foreground",
				children: [data?.total ?? 0, " results"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
				children: (data?.results ?? []).map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-lg",
						children: s.anonymous_id
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "space-y-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-wrap gap-1",
								children: (s.skills ?? []).slice(0, 5).map((sk) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "secondary",
									className: "text-xs",
									children: sk
								}, sk))
							}),
							(s.location_country || s.location_region) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "flex items-center gap-1 text-xs text-muted-foreground",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-3" }),
									" ",
									[s.location_region, s.location_country].filter(Boolean).join(", ")
								]
							}),
							s.availability && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "flex items-center gap-1 text-xs text-muted-foreground",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Briefcase, { className: "size-3" }),
									" ",
									s.availability.replace("_", " ")
								]
							}),
							s.bio_excerpt && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground line-clamp-2",
								children: s.bio_excerpt
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardFooter, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						onClick: () => setIntroTarget({
							id: s.id,
							anonymous_id: s.anonymous_id
						}),
						children: "Request introduction"
					}) })
				] }, s.id))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: !!introTarget,
				onOpenChange: () => setIntroTarget(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, { children: ["Request introduction to ", introTarget?.anonymous_id] }) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						rows: 4,
						placeholder: "Introduce your company and the opportunity…",
						value: message,
						onChange: (e) => setMessage(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						onClick: () => setIntroTarget(null),
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: sendIntro,
						children: "Send request"
					})] })
				] })
			})
		]
	});
}
//#endregion
export { RecruiterSearch as component };

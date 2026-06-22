import { o as __toESM } from "../_runtime.mjs";
import { o as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { t as Button } from "./button-DHpxc22r.mjs";
import { t as supabase } from "./client-CLN0XX6A.mjs";
import { n as useAuth } from "./useAuth-Bhxn0HH6.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { S as CircleAlert, l as Plus, m as LoaderCircle, n as Users, x as CircleCheck, y as Clock } from "../_libs/lucide-react.mjs";
import { t as PortalShell } from "./PortalShell-DowbbmyM.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, s as DialogTrigger, t as Dialog } from "./dialog-DIo89e4g.mjs";
import { t as Textarea } from "./textarea-kko37XEX.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ngo.dashboard-CBmRVunB.js
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
function NgoDashboard() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PortalShell, {
		title: "NGO Portal",
		nav: NGO_NAV,
		allow: [
			"ngo_partner",
			"admin",
			"super_admin"
		],
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardInner, {})
	});
}
function DashboardInner() {
	const { user } = useAuth();
	const qc = useQueryClient();
	const { data: ngo, isLoading: ngoLoading } = useQuery({
		queryKey: ["my-ngo", user?.id],
		enabled: !!user,
		queryFn: async () => {
			const { data, error } = await supabase.from("ngos").select("*").eq("owner_id", user.id).maybeSingle();
			if (error) throw error;
			return data;
		}
	});
	const { data: survivors } = useQuery({
		queryKey: ["my-survivors", ngo?.id],
		enabled: !!ngo && ngo.status === "approved",
		queryFn: async () => {
			const { data, error } = await supabase.from("survivors").select("id, full_name, status, profile_completion, created_at, anonymous_id").eq("ngo_id", ngo.id).order("created_at", { ascending: false });
			if (error) throw error;
			return data;
		}
	});
	if (ngoLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loader, {});
	if (!ngo) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
		icon: CircleAlert,
		title: "No NGO registered yet",
		body: "You haven't registered an NGO. Head to onboarding to create one."
	});
	if (ngo.status === "pending") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBanner, {
		icon: Clock,
		tone: "warning",
		title: "Your NGO is under review",
		body: "A CAREVIA admin will verify your organization shortly. You'll be able to onboard survivors once approved."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-6 flex flex-wrap gap-2",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/auth",
			className: "inline-flex",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				size: "sm",
				children: "Admin sign in"
			})
		})
	})] });
	if (ngo.status === "rejected") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBanner, {
		icon: CircleAlert,
		tone: "destructive",
		title: "Your application was not approved",
		body: ngo.rejection_reason ?? "Please contact CAREVIA support for more information."
	});
	if (ngo.status === "suspended") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBanner, {
		icon: CircleAlert,
		tone: "destructive",
		title: "Account suspended",
		body: "Your NGO account is currently suspended. Please contact CAREVIA support."
	});
	const stats = {
		total: survivors?.length ?? 0,
		draft: survivors?.filter((s) => s.status === "draft").length ?? 0,
		submitted: survivors?.filter((s) => s.status === "submitted").length ?? 0,
		approved: survivors?.filter((s) => s.status === "approved").length ?? 0
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-wrap items-end justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl font-bold text-primary",
					children: ngo.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: "Welcome back. Here's what's happening today."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddSurvivorDialog, {
					ngoId: ngo.id,
					onCreated: () => qc.invalidateQueries({ queryKey: ["my-survivors"] })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Total survivors",
						value: stats.total,
						icon: Users
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "In draft",
						value: stats.draft,
						icon: Clock
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Submitted",
						value: stats.submitted,
						icon: CircleCheck
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Approved",
						value: stats.approved,
						icon: CircleCheck,
						tone: "success"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-border bg-card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "border-b border-border p-5",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-semibold text-primary",
						children: "Recent survivors"
					})
				}), !survivors || survivors.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "p-10 text-center text-sm text-muted-foreground",
					children: "No survivors yet. Click \"Add survivor\" to get started."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "divide-y divide-border",
					children: survivors.slice(0, 8).map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center justify-between gap-4 px-5 py-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium text-foreground",
							children: s.full_name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground",
							children: [
								s.anonymous_id,
								" · ",
								Math.round(s.profile_completion),
								"% complete"
							]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: s.status })]
					}, s.id))
				})]
			})
		]
	});
}
function StatCard({ label, value, icon: Icon, tone = "default" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-border bg-card p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: `size-4 ${tone === "success" ? "text-success" : "text-accent"}` })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 font-display text-3xl font-bold text-primary",
			children: value
		})]
	});
}
function StatusBadge({ status }) {
	const v = {
		draft: {
			label: "Draft",
			cls: "bg-muted text-muted-foreground"
		},
		submitted: {
			label: "Submitted",
			cls: "bg-accent/15 text-accent-foreground"
		},
		under_review: {
			label: "Under review",
			cls: "bg-warning/15 text-warning-foreground"
		},
		approved: {
			label: "Approved",
			cls: "bg-success/15 text-success"
		},
		rejected: {
			label: "Rejected",
			cls: "bg-destructive/15 text-destructive"
		},
		pending: {
			label: "Pending",
			cls: "bg-warning/15 text-warning-foreground"
		},
		suspended: {
			label: "Suspended",
			cls: "bg-destructive/15 text-destructive"
		}
	}[status] ?? {
		label: status,
		cls: "bg-muted text-muted-foreground"
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		variant: "secondary",
		className: v.cls,
		children: v.label
	});
}
function StatusBanner({ icon: Icon, tone, title, body }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `flex gap-4 rounded-2xl border p-6 ${tone === "warning" ? "border-warning/30 bg-warning/10" : "border-destructive/30 bg-destructive/10"}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: `mt-0.5 size-5 ${tone === "warning" ? "text-warning-foreground" : "text-destructive"}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-semibold text-foreground",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-muted-foreground",
			children: body
		})] })]
	});
}
function EmptyState({ icon: Icon, title, body }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-dashed border-border bg-card p-12 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "mx-auto size-8 text-muted-foreground" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 font-semibold text-foreground",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: body
			})
		]
	});
}
function Loader() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid place-items-center py-24",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-6 animate-spin text-muted-foreground" })
	});
}
function AddSurvivorDialog({ ngoId, onCreated }) {
	const { user } = useAuth();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [form, setForm] = (0, import_react.useState)({
		full_name: "",
		age: "",
		gender: "",
		city: "",
		state: "",
		phone: "",
		email: "",
		education_level: "",
		skills: "",
		languages: ""
	});
	const mut = useMutation({
		mutationFn: async () => {
			if (!user) throw new Error("Not signed in");
			const skills = form.skills.split(",").map((s) => s.trim()).filter(Boolean);
			const languages = form.languages.split(",").map((s) => s.trim()).filter(Boolean);
			const payload = {
				ngo_id: ngoId,
				created_by: user.id,
				full_name: form.full_name,
				age: form.age ? Number(form.age) : null,
				gender: form.gender || null,
				city: form.city || null,
				state: form.state || null,
				phone: form.phone || null,
				email: form.email || null,
				education_level: form.education_level || null,
				skills,
				languages
			};
			const { error } = await supabase.from("survivors").insert(payload);
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Survivor added");
			setOpen(false);
			setForm({
				full_name: "",
				age: "",
				gender: "",
				city: "",
				state: "",
				phone: "",
				email: "",
				education_level: "",
				skills: "",
				languages: ""
			});
			onCreated();
		},
		onError: (e) => toast.error(e.message)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
		open,
		onOpenChange: setOpen,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				className: "gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), " Add survivor"]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-2xl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Add a new survivor" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Only basic information is required. You can edit and add documents later." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "grid gap-4 sm:grid-cols-2",
				onSubmit: (e) => {
					e.preventDefault();
					mut.mutate();
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Full name *",
						v: form.full_name,
						on: (v) => setForm({
							...form,
							full_name: v
						}),
						required: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Age",
						type: "number",
						v: String(form.age),
						on: (v) => setForm({
							...form,
							age: v
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Gender",
						v: form.gender,
						on: (v) => setForm({
							...form,
							gender: v
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Education",
						v: form.education_level,
						on: (v) => setForm({
							...form,
							education_level: v
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "City",
						v: form.city,
						on: (v) => setForm({
							...form,
							city: v
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "State",
						v: form.state,
						on: (v) => setForm({
							...form,
							state: v
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Phone",
						v: form.phone,
						on: (v) => setForm({
							...form,
							phone: v
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Email",
						type: "email",
						v: form.email,
						on: (v) => setForm({
							...form,
							email: v
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "sm:col-span-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Skills (comma separated)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							className: "mt-2",
							rows: 2,
							value: form.skills,
							onChange: (e) => setForm({
								...form,
								skills: e.target.value
							}),
							placeholder: "e.g. Tailoring, Hospitality, English"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "sm:col-span-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Languages (comma separated)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							className: "mt-2",
							value: form.languages,
							onChange: (e) => setForm({
								...form,
								languages: e.target.value
							}),
							placeholder: "e.g. Hindi, English, Bengali"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
						className: "sm:col-span-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "ghost",
							onClick: () => setOpen(false),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							disabled: mut.isPending,
							children: mut.isPending ? "Saving…" : "Add survivor"
						})]
					})
				]
			})]
		})]
	});
}
function Field({ label, v, on, type = "text", required }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
		className: "mt-2",
		type,
		value: v,
		onChange: (e) => on(e.target.value),
		required
	})] });
}
//#endregion
export { StatusBadge, NgoDashboard as component };

import { o as __toESM } from "../_runtime.mjs";
import { o as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { n as Logo, t as Button } from "./button-DHpxc22r.mjs";
import { g as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as supabase } from "./client-CLN0XX6A.mjs";
import { n as useAuth, t as dashboardPathFor } from "./useAuth-Bhxn0HH6.mjs";
import { E as Briefcase, T as Building2, f as LogOut, h as HeartHandshake } from "../_libs/lucide-react.mjs";
import { t as Textarea } from "./textarea-kko37XEX.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/onboarding-CfqWC3U4.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Onboarding() {
	const { user, roles, loading } = useAuth();
	const navigate = useNavigate();
	const [step, setStep] = (0, import_react.useState)("role");
	const [chosen, setChosen] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (loading) return;
		if (!user) navigate({ to: "/auth" });
		else if (roles.length > 0) navigate({ to: dashboardPathFor(roles) });
	}, [
		loading,
		user,
		roles,
		navigate
	]);
	if (loading || !user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CenteredMessage, { children: "Loading…" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-muted/30",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
			className: "border-b border-border bg-background",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, { className: "h-8 w-auto" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "ghost",
					size: "sm",
					onClick: async () => {
						await supabase.auth.signOut();
						navigate({ to: "/" });
					},
					className: "gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-4" }), " Sign out"]
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
			className: "mx-auto max-w-3xl px-4 py-12 sm:px-6",
			children: step === "role" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoleChooser, { onPick: (r) => {
				setChosen(r);
				if (r === "ngo_partner") setStep("ngo");
				else if (r === "recruiter") setStep("recruiter");
				else grantRoleAndGo(r, navigate);
			} }) : step === "ngo" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NgoForm, {
				onDone: async () => {
					if (!chosen) return;
					await grantRoleAndGo(chosen, navigate);
				},
				onBack: () => setStep("role")
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecruiterForm, {
				onDone: async () => {
					toast.success("Recruiter application submitted for review.");
					navigate({ to: "/recruiter" });
				},
				onBack: () => setStep("role")
			})
		})]
	});
}
async function grantRoleAndGo(role, navigate) {
	const { data: userResp } = await supabase.auth.getUser();
	if (!userResp.user?.id) {
		toast.error("Session expired. Please sign in again.");
		navigate({ to: "/auth" });
		return;
	}
	const { error } = await supabase.rpc("self_assign_initial_role", { _role: role });
	if (error) {
		toast.error(`Could not set role: ${error.message}`);
		return;
	}
	toast.success("You're all set.");
	navigate({ to: dashboardPathFor([role]) });
}
function RoleChooser({ onPick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-3xl font-bold text-primary",
			children: "Welcome to CAREVIA"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-muted-foreground",
			children: "Choose how you'll use the platform. You can be invited to more roles later."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoleCard, {
					icon: HeartHandshake,
					title: "NGO Partner",
					body: "I represent an NGO and want to onboard survivors, manage their profiles, and track placements.",
					cta: "Continue as NGO Partner",
					onClick: () => onPick("ngo_partner")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoleCard, {
					icon: Briefcase,
					title: "Recruiter",
					body: "I hire ethically and want to discover consented, anonymized survivor profiles through NGO introductions.",
					cta: "Continue as Recruiter",
					onClick: () => onPick("recruiter")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoleCard, {
					icon: Building2,
					title: "Survivor / exploring",
					body: "Set up a personal account with access to the AI career mentor.",
					cta: "Continue as survivor",
					onClick: () => onPick("survivor"),
					subtle: true
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-6 text-xs text-muted-foreground",
			children: "Admin roles are granted by the CAREVIA team after verification."
		})
	] });
}
function RoleCard({ icon: Icon, title, body, cta, onClick, subtle }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		onClick,
		className: `text-left rounded-2xl border p-6 transition-all ${subtle ? "border-border bg-card hover:border-primary/40" : "border-primary/20 bg-card shadow-sm hover:border-primary/60 hover:shadow-md"}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid size-10 place-items-center rounded-xl bg-primary-soft text-primary",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mt-4 text-lg font-semibold text-primary",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: body
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "mt-4 inline-block text-sm font-medium text-accent",
				children: [cta, " →"]
			})
		]
	});
}
function NgoForm({ onDone, onBack }) {
	const { user } = useAuth();
	const [form, setForm] = (0, import_react.useState)({
		name: "",
		registration_number: "",
		contact_email: user?.email ?? "",
		contact_phone: "",
		city: "",
		state: "",
		country: "India",
		description: ""
	});
	const [saving, setSaving] = (0, import_react.useState)(false);
	async function save(e) {
		e.preventDefault();
		if (!user) return;
		setSaving(true);
		const { error } = await supabase.from("ngos").insert({
			owner_id: user.id,
			...form
		});
		setSaving(false);
		if (error) {
			toast.error(error.message);
			return;
		}
		toast.success("NGO submitted for review.");
		onDone();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit: save,
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onBack,
					className: "text-sm text-muted-foreground hover:text-foreground",
					children: "← Back"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-2 font-display text-3xl font-bold text-primary",
					children: "Register your NGO"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-muted-foreground",
					children: "Tell us about your organization. A CAREVIA admin will review and approve your account before you can add survivors."
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 rounded-2xl border border-border bg-card p-6 sm:grid-cols-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "NGO name *",
						v: form.name,
						on: (v) => setForm({
							...form,
							name: v
						}),
						required: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Registration number",
						v: form.registration_number,
						on: (v) => setForm({
							...form,
							registration_number: v
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Contact email *",
						type: "email",
						v: form.contact_email,
						on: (v) => setForm({
							...form,
							contact_email: v
						}),
						required: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Contact phone",
						v: form.contact_phone,
						on: (v) => setForm({
							...form,
							contact_phone: v
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
						label: "Country",
						v: form.country,
						on: (v) => setForm({
							...form,
							country: v
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "sm:col-span-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "About your work" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							value: form.description,
							onChange: (e) => setForm({
								...form,
								description: e.target.value
							}),
							placeholder: "Briefly describe your mission and the population you serve.",
							rows: 4,
							className: "mt-2"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "submit",
				disabled: saving,
				children: saving ? "Submitting…" : "Submit for review"
			})
		]
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
function CenteredMessage({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-screen place-items-center text-muted-foreground",
		children
	});
}
function RecruiterForm({ onDone, onBack }) {
	const [form, setForm] = (0, import_react.useState)({
		company_name: "",
		company_website: ""
	});
	const [saving, setSaving] = (0, import_react.useState)(false);
	async function save(e) {
		e.preventDefault();
		setSaving(true);
		const { error } = await supabase.rpc("self_assign_recruiter_role", {
			_company_name: form.company_name,
			_company_website: form.company_website || null
		});
		setSaving(false);
		if (error) {
			toast.error(error.message);
			return;
		}
		onDone();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit: save,
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onBack,
					className: "text-sm text-muted-foreground hover:text-foreground",
					children: "← Back"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-2 font-display text-3xl font-bold text-primary",
					children: "Register as recruiter"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-muted-foreground",
					children: "Your account will be reviewed by CAREVIA before you can search survivors."
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 rounded-2xl border border-border bg-card p-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Company name *",
					v: form.company_name,
					on: (v) => setForm({
						...form,
						company_name: v
					}),
					required: true
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Company website",
					v: form.company_website,
					on: (v) => setForm({
						...form,
						company_website: v
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "submit",
				disabled: saving,
				children: saving ? "Submitting…" : "Submit for review"
			})
		]
	});
}
//#endregion
export { Onboarding as component };

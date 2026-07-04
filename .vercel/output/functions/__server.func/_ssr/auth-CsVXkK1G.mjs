import { o as __toESM } from "../_runtime.mjs";
import { o as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { n as Logo, t as Button } from "./button-DHpxc22r.mjs";
import { _ as useSearch, g as useNavigate, h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as supabase } from "./client-LWzhPH_U.mjs";
import { t as dashboardPathFor } from "./useAuth-YqmynGW9.mjs";
import { k as ArrowLeft } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-CCJRliUM.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-CsVXkK1G.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AuthPage() {
	const initial = useSearch({ from: "/auth" }).mode ?? "signin";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid min-h-screen lg:grid-cols-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "gradient-navy relative hidden overflow-hidden p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/",
					className: "inline-flex items-center gap-2 text-sm text-white/80 hover:text-white",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), " Back home"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, { className: "h-10 w-auto brightness-0 invert" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-8 max-w-md font-display text-4xl font-bold leading-tight",
						children: "A second chance, built on dignity."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 max-w-md text-white/80",
						children: "CAREVIA connects survivors with dignified work through verified NGOs and recruiters."
					})
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-white/60",
					children: "Guided by values. Driven by people."
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex items-center justify-center bg-background p-6 sm:p-10",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-full max-w-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					className: "mb-6 inline-flex items-center gap-2 lg:hidden",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, { className: "h-8 w-auto" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
					defaultValue: initial,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
							className: "grid w-full grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "signin",
								children: "Sign in"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "signup",
								children: "Create account"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
							value: "signin",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignInForm, {})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
							value: "signup",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignUpForm, {})
						})
					]
				})]
			})
		})]
	});
}
async function loadRoles(userId) {
	const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId);
	if (error) throw error;
	return (data ?? []).map((r) => r.role);
}
function SignInForm() {
	const navigate = useNavigate();
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(false);
	async function onSubmit(e) {
		e.preventDefault();
		setLoading(true);
		const { error } = await supabase.auth.signInWithPassword({
			email,
			password
		});
		if (error) {
			setLoading(false);
			toast.error(error.message);
			return;
		}
		const { data: userResp } = await supabase.auth.getUser();
		const userId = userResp.user?.id;
		if (!userId) {
			setLoading(false);
			toast.error("Unable to load user session. Please try again.");
			return;
		}
		const roles = await loadRoles(userId);
		setLoading(false);
		toast.success("Welcome back!");
		navigate({ to: dashboardPathFor(roles) });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit,
		className: "mt-6 space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "email",
					children: "Email"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "email",
					type: "email",
					required: true,
					autoComplete: "email",
					value: email,
					onChange: (e) => setEmail(e.target.value)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "password",
					children: "Password"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "password",
					type: "password",
					required: true,
					autoComplete: "current-password",
					value: password,
					onChange: (e) => setPassword(e.target.value)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "If you have admin access, sign in with your admin credentials to manage approvals and review pending requests."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "submit",
				disabled: loading,
				className: "w-full",
				children: loading ? "Signing in…" : "Sign in"
			})
		]
	});
}
function SignUpForm() {
	const navigate = useNavigate();
	const [fullName, setFullName] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(false);
	async function onSubmit(e) {
		e.preventDefault();
		if (password.length < 8) {
			toast.error("Password must be at least 8 characters.");
			return;
		}
		setLoading(true);
		const redirectUrl = `${window.location.origin}/onboarding`;
		const { error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				emailRedirectTo: redirectUrl,
				data: { full_name: fullName }
			}
		});
		setLoading(false);
		if (error) {
			toast.error(error.message);
			return;
		}
		toast.success("Account created. Let's choose your role.");
		navigate({ to: "/onboarding" });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit,
		className: "mt-6 space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "full_name",
					children: "Full name"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "full_name",
					required: true,
					value: fullName,
					onChange: (e) => setFullName(e.target.value)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "email2",
					children: "Email"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "email2",
					type: "email",
					required: true,
					autoComplete: "email",
					value: email,
					onChange: (e) => setEmail(e.target.value)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "password2",
						children: "Password"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "password2",
						type: "password",
						required: true,
						minLength: 8,
						autoComplete: "new-password",
						value: password,
						onChange: (e) => setPassword(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "At least 8 characters."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "submit",
				disabled: loading,
				className: "w-full",
				children: loading ? "Creating…" : "Create account"
			})
		]
	});
}
//#endregion
export { AuthPage as component };

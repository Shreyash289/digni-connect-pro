import { o as __toESM } from "../_runtime.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { o as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { n as Logo, t as Button } from "./button-DHpxc22r.mjs";
import { d as Outlet, g as useNavigate, h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { l as createServerFn } from "./esm-9EjmF9OT.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-pFu6bPsK.mjs";
import { t as supabase } from "./client-LWzhPH_U.mjs";
import { n as useAuth, t as dashboardPathFor } from "./useAuth-YqmynGW9.mjs";
import { t as createSsrRpc } from "./createSsrRpc-CnhdtqBy.mjs";
import { Ct as stringType, St as objectType, xt as numberType, yt as booleanType } from "../_libs/@ai-sdk/gateway+[...].mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { C as ChevronRight, D as Bell, b as Circle, f as LogOut, w as Check } from "../_libs/lucide-react.mjs";
import { a as Label2, c as Root2, d as SubTrigger2, f as Trigger, i as ItemIndicator2, l as Separator2, n as Content2, o as Portal2, r as Item2, s as RadioItem2, t as CheckboxItem2, u as SubContent2 } from "../_libs/@radix-ui/react-dropdown-menu+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/PortalShell-DPiHV71Y.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var DropdownMenu = Root2;
var DropdownMenuTrigger = Trigger;
var DropdownMenuSubTrigger = import_react.forwardRef(({ className, inset, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SubTrigger2, {
	ref,
	className: cn("flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", inset && "pl-8", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "ml-auto" })]
}));
DropdownMenuSubTrigger.displayName = SubTrigger2.displayName;
var DropdownMenuSubContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SubContent2, {
	ref,
	className: cn("z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-dropdown-menu-content-transform-origin)", className),
	...props
}));
DropdownMenuSubContent.displayName = SubContent2.displayName;
var DropdownMenuContent = import_react.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal2, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
	ref,
	sideOffset,
	className: cn("z-50 max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md", "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-dropdown-menu-content-transform-origin)", className),
	...props
}) }));
DropdownMenuContent.displayName = Content2.displayName;
var DropdownMenuItem = import_react.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item2, {
	ref,
	className: cn("relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0", inset && "pl-8", className),
	...props
}));
DropdownMenuItem.displayName = Item2.displayName;
var DropdownMenuCheckboxItem = import_react.forwardRef(({ className, children, checked, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CheckboxItem2, {
	ref,
	className: cn("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className),
	checked,
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemIndicator2, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" }) })
	}), children]
}));
DropdownMenuCheckboxItem.displayName = CheckboxItem2.displayName;
var DropdownMenuRadioItem = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(RadioItem2, {
	ref,
	className: cn("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemIndicator2, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Circle, { className: "h-2 w-2 fill-current" }) })
	}), children]
}));
DropdownMenuRadioItem.displayName = RadioItem2.displayName;
var DropdownMenuLabel = import_react.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label2, {
	ref,
	className: cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className),
	...props
}));
DropdownMenuLabel.displayName = Label2.displayName;
var DropdownMenuSeparator = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator2, {
	ref,
	className: cn("-mx-1 my-1 h-px bg-muted", className),
	...props
}));
DropdownMenuSeparator.displayName = Separator2.displayName;
var DropdownMenuShortcut = ({ className, ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("ml-auto text-xs tracking-widest opacity-60", className),
		...props
	});
};
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";
var listNotifications = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(objectType({ limit: numberType().default(20) })).handler(createSsrRpc("c017b24a4940a916334ff23b3f3461893d7b3f151e06bac76f968dd27c3f187b"));
var getUnreadCount = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("7a8d8a8062bc44cd915da21e8e341e8e8ca1e6e7506033d99b11c684fc5bcadb"));
var markNotificationRead = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(objectType({ id: stringType().uuid() })).handler(createSsrRpc("385e76cdf807dd53711b6f969d894db85cf9b0ca7a6373bb34c6352adedccb64"));
var markAllNotificationsRead = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("9450c15293c0a6ae5fe14448bd9f3e0ad58f596f22af371b91f88b98002e414b"));
var getNotificationPreferences = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("2f9732ba170a6fe5b8b981bd6c85fd09169bf5fce09828e2f3a2e7753fad3c67"));
var updateNotificationPreference = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(objectType({
	kind: stringType(),
	in_app: booleanType(),
	email: booleanType()
})).handler(createSsrRpc("4c54821fffe7cd33d8889f8143e3b85390bb49aad6db639fd45ca310e96db7ab"));
var createMentorThread = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(objectType({
	survivorId: stringType().uuid().optional(),
	title: stringType().optional()
})).handler(createSsrRpc("6ef84f3b68ac75d78d23e4a4d4ad8efba3e05de2e4ccfc6696bb6f761403f9a5"));
var listMentorThreads = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("de3980a9f8eaf6529a0919b1a4cb09f3697de41cdccaa6c66a9d326550f79935"));
var getMentorMessages = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(objectType({ threadId: stringType().uuid() })).handler(createSsrRpc("561fa604cdba2e8132359e0372c83ea6a193a05e7c45f7fc0b57713b73076916"));
var KIND_LABELS = {
	ngo_approved: "NGO approved",
	ngo_rejected: "NGO rejected",
	recruiter_verified: "Recruiter verified",
	recruiter_rejected: "Recruiter rejected",
	intro_request_received: "Introduction request",
	intro_request_responded: "Introduction response",
	job_application_received: "New application",
	application_status_changed: "Application update",
	mentor_safety_flag: "Safety alert",
	weekly_digest: "Weekly digest"
};
function NotificationBell() {
	const qc = useQueryClient();
	const { data: unread } = useQuery({
		queryKey: ["notifications-unread"],
		queryFn: () => getUnreadCount(),
		refetchInterval: 5e3
	});
	const { data: notifications } = useQuery({
		queryKey: ["notifications"],
		queryFn: () => listNotifications({ data: { limit: 15 } })
	});
	const markRead = useMutation({
		mutationFn: (id) => markNotificationRead({ data: { id } }),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["notifications"] });
			qc.invalidateQueries({ queryKey: ["notifications-unread"] });
		}
	});
	const markAll = useMutation({
		mutationFn: () => markAllNotificationsRead(),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["notifications"] });
			qc.invalidateQueries({ queryKey: ["notifications-unread"] });
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			variant: "ghost",
			size: "icon",
			className: "relative",
			"aria-label": "Notifications",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-5" }), (unread?.count ?? 0) > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground",
				children: unread.count > 9 ? "9+" : unread.count
			})]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
		align: "end",
		className: "w-80",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between px-3 py-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm font-semibold",
					children: "Notifications"
				}), (unread?.count ?? 0) > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "text-xs text-accent hover:underline",
					onClick: () => markAll.mutate(),
					children: "Mark all read"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
			!notifications || notifications.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "px-3 py-4 text-center text-sm text-muted-foreground",
				children: "No notifications yet"
			}) : notifications.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
				className: `flex flex-col items-start gap-0.5 px-3 py-2 ${!n.read_at ? "bg-accent/5" : ""}`,
				onClick: () => !n.read_at && markRead.mutate(n.id),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm font-medium",
					children: KIND_LABELS[n.kind] ?? n.kind
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs text-muted-foreground",
					children: new Date(n.created_at).toLocaleString()
				})]
			}, n.id)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/settings/notifications",
					className: "w-full text-center text-sm text-accent",
					children: "Notification settings"
				})
			})
		]
	})] });
}
function PortalShell({ title, nav, allow, children }) {
	const { user, roles, loading, error } = useAuth();
	const navigate = useNavigate();
	(0, import_react.useEffect)(() => {
		if (loading) return;
		if (error) return;
		if (!user) {
			navigate({ to: "/auth" });
			return;
		}
		if (roles.length === 0) {
			navigate({ to: "/onboarding" });
			return;
		}
		if (!roles.some((r) => allow.includes(r))) navigate({ to: dashboardPathFor(roles) });
	}, [
		user,
		roles,
		loading,
		error,
		navigate,
		allow
	]);
	if (loading || !user || roles.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-screen place-items-center text-muted-foreground",
		children: "Loading…"
	});
	if (error) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-screen place-items-center px-6 text-center text-sm text-destructive",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md rounded-2xl border border-destructive/20 bg-destructive/5 p-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-semibold text-foreground",
					children: "Unable to load your session."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-muted-foreground",
					children: error
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: () => navigate({ to: "/auth" }),
						children: "Sign in again"
					})
				})
			]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-muted/30",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "fixed inset-y-0 left-0 hidden w-60 flex-col gap-1 border-r border-border bg-sidebar p-4 text-sidebar-foreground lg:flex",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					className: "px-2 py-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, { className: "h-8 w-auto brightness-0 invert" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60",
					children: title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "mt-1 flex flex-col gap-0.5",
					children: nav.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: n.to,
						className: "rounded-lg px-3 py-2 text-sm text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground [&.active]:bg-sidebar-accent [&.active]:text-sidebar-accent-foreground",
						activeProps: { className: "active" },
						children: n.label
					}, n.to))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-auto border-t border-sidebar-border pt-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between px-3 py-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-sidebar-foreground/70 truncate",
							children: user.email
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotificationBell, {})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "ghost",
						size: "sm",
						onClick: async () => {
							await supabase.auth.signOut();
							navigate({ to: "/" });
						},
						className: "w-full justify-start gap-2 text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-4" }), " Sign out"]
					})]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "lg:pl-60",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "border-b border-border bg-background px-4 py-3 lg:hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, { className: "h-7 w-auto" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "sm",
						onClick: async () => {
							await supabase.auth.signOut();
							navigate({ to: "/" });
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-4" })
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "mt-3 flex gap-2 overflow-x-auto",
					children: nav.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: n.to,
						className: "whitespace-nowrap rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground [&.active]:bg-primary [&.active]:text-primary-foreground",
						activeProps: { className: "active" },
						children: n.label
					}, n.to))
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10",
				children: children ?? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
			})]
		})]
	});
}
//#endregion
export { listMentorThreads as a, getNotificationPreferences as i, createMentorThread as n, updateNotificationPreference as o, getMentorMessages as r, PortalShell as t };

import { o as __toESM } from "../_runtime.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { n as DefaultChatTransport, o as require_react, t as useChat } from "../_libs/@ai-sdk/react+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { t as Button } from "./button-DHpxc22r.mjs";
import { g as useNavigate, h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as supabase } from "./client-CLN0XX6A.mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { i as TriangleAlert, l as Plus, m as LoaderCircle } from "../_libs/lucide-react.mjs";
import { a as listMentorThreads, n as createMentorThread, r as getMentorMessages, t as PortalShell } from "./PortalShell-DAzdbuLY.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Markdown } from "../_libs/react-markdown+[...].mjs";
import { t as Route } from "./mentor._threadId-VX9L5y4N.mjs";
import { a as Viewport, i as ScrollAreaThumb, n as Root, r as ScrollAreaScrollbar, t as Corner } from "../_libs/radix-ui__react-scroll-area.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/mentor._threadId-XF7gPbrn.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ScrollArea = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Root, {
	ref,
	className: cn("relative overflow-hidden", className),
	...props,
	children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Viewport, {
			className: "h-full w-full rounded-[inherit]",
			children
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollBar, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Corner, {})
	]
}));
ScrollArea.displayName = Root.displayName;
var ScrollBar = import_react.forwardRef(({ className, orientation = "vertical", ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollAreaScrollbar, {
	ref,
	orientation,
	className: cn("flex touch-none select-none transition-colors", orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent p-[1px]", orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent p-[1px]", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollAreaThumb, { className: "relative flex-1 rounded-full bg-border" })
}));
ScrollBar.displayName = ScrollAreaScrollbar.displayName;
var MENTOR_NAV = [{
	to: "/mentor",
	label: "Conversations"
}];
function MentorChat() {
	const { threadId } = Route.useParams();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PortalShell, {
		title: "AI Mentor",
		nav: MENTOR_NAV,
		allow: [
			"ngo_partner",
			"survivor",
			"admin",
			"super_admin"
		],
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatInner, { threadId })
	});
}
function ChatInner({ threadId }) {
	const navigate = useNavigate();
	const inputRef = (0, import_react.useRef)(null);
	const [token, setToken] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		supabase.auth.getSession().then(({ data }) => setToken(data.session?.access_token ?? null));
	}, []);
	const { data: threads } = useQuery({
		queryKey: ["mentor-threads"],
		queryFn: () => listMentorThreads()
	});
	const { data: loaderMessages } = useQuery({
		queryKey: ["mentor-messages", threadId],
		queryFn: () => getMentorMessages({ data: { threadId } })
	});
	const { messages, sendMessage, status } = useChat({
		id: threadId,
		messages: (loaderMessages ?? []).map((m) => ({
			id: m.id,
			role: m.role,
			parts: m.parts
		})),
		transport: new DefaultChatTransport({
			api: "/api/chat",
			headers: token ? { Authorization: `Bearer ${token}` } : {}
		})
	});
	const [input, setInput] = (0, import_react.useState)("");
	const safetyFlagged = threads?.find((t) => t.id === threadId)?.safety_flagged;
	(0, import_react.useEffect)(() => {
		inputRef.current?.focus();
	}, [threadId]);
	async function newThread() {
		navigate({
			to: "/mentor/$threadId",
			params: { threadId: (await createMentorThread({ data: {} })).id }
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-[calc(100vh-8rem)] gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "hidden w-56 shrink-0 flex-col gap-2 lg:flex",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "outline",
				size: "sm",
				className: "gap-2",
				onClick: newThread,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), " New chat"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
				className: "flex-1",
				children: (threads ?? []).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/mentor/$threadId",
					params: { threadId: t.id },
					className: `block rounded-lg px-3 py-2 text-sm hover:bg-muted [&.active]:bg-accent/10 ${t.id === threadId ? "active bg-accent/10 font-medium" : "text-muted-foreground"}`,
					children: t.title
				}, t.id))
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-1 flex-col rounded-2xl border border-border bg-card",
			children: [
				safetyFlagged && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 border-b border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-4 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "If you or someone you know is in crisis, please contact iCrisis Helpline: 9152987821 or Vandrevala Foundation: 1860-2662-345. This mentor is not a substitute for professional mental health care." })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
					className: "flex-1 p-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-4",
						children: [messages.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: `max-w-[85%] rounded-2xl px-4 py-3 text-sm ${m.role === "user" ? "ml-auto bg-primary text-primary-foreground" : "bg-muted text-foreground"}`,
							children: m.parts?.map((part, i) => part.type === "text" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Markdown, {
								className: "prose prose-sm dark:prose-invert max-w-none",
								children: part.text
							}, i) : null)
						}, m.id)), status === "submitted" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 text-sm text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }), " Thinking…"]
						})]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "flex gap-2 border-t border-border p-4",
					onSubmit: (e) => {
						e.preventDefault();
						if (!input.trim()) return;
						sendMessage({ text: input });
						setInput("");
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						ref: inputRef,
						value: input,
						onChange: (e) => setInput(e.target.value),
						placeholder: "Ask about careers, skills, interviews…",
						disabled: status === "submitted"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						disabled: status === "submitted" || !input.trim(),
						children: "Send"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "border-t border-border px-4 py-2 text-center text-xs text-muted-foreground",
					children: [
						"AI mentor provides career coaching only, not clinical advice.",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "https://www.vandrevalafoundation.com",
							target: "_blank",
							rel: "noopener noreferrer",
							className: "text-accent underline",
							children: "Crisis resources"
						})
					]
				})
			]
		})]
	});
}
//#endregion
export { MentorChat as component };

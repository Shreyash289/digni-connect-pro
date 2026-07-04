import { o as __toESM } from "../_runtime.mjs";
import { o as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { t as Button } from "./button-DHpxc22r.mjs";
import { g as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { l as Plus, m as LoaderCircle, u as MessageCircle } from "../_libs/lucide-react.mjs";
import { a as listMentorThreads, n as createMentorThread, t as PortalShell } from "./PortalShell-DPiHV71Y.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/mentor.index-uzShySpe.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var MENTOR_NAV = [{
	to: "/mentor",
	label: "Conversations"
}];
function MentorIndex() {
	const navigate = useNavigate();
	const { data: threads, isLoading } = useQuery({
		queryKey: ["mentor-threads"],
		queryFn: () => listMentorThreads()
	});
	(0, import_react.useEffect)(() => {
		if (!isLoading && threads && threads.length > 0) navigate({
			to: "/mentor/$threadId",
			params: { threadId: threads[0].id }
		});
	}, [
		threads,
		isLoading,
		navigate
	]);
	async function newThread() {
		navigate({
			to: "/mentor/$threadId",
			params: { threadId: (await createMentorThread({ data: {} })).id }
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PortalShell, {
		title: "AI Mentor",
		nav: MENTOR_NAV,
		allow: [
			"ngo_partner",
			"survivor",
			"admin",
			"super_admin"
		],
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-col items-center justify-center py-24 text-center",
			children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-6 animate-spin text-muted-foreground" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-12 text-accent" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-4 font-display text-2xl font-bold text-primary",
					children: "AI Career Mentor"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 max-w-md text-sm text-muted-foreground",
					children: "Get trauma-informed career guidance, skill suggestions, and interview prep. This is coaching, not therapy — crisis resources are always available."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					className: "mt-6 gap-2",
					onClick: newThread,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), " Start a conversation"]
				})
			] })
		})
	});
}
//#endregion
export { MentorIndex as component };

import { o as __toESM } from "../_runtime.mjs";
import { a as streamText, o as require_react, r as convertToModelMessages } from "../_libs/@ai-sdk/react+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { c as HeadContent, d as Outlet, f as lazyRouteComponent, h as Link, j as redirect, m as createRootRouteWithContext, p as createFileRoute, s as Scripts, u as createRouter, v as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { Ct as stringType, St as objectType, bt as enumType } from "../_libs/@ai-sdk/gateway+[...].mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { r as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
import { t as Route$25 } from "./ngo.dashboard-BYK7HnHv.mjs";
import { r as getGoogleAi, t as DEFAULT_CHAT_MODEL } from "./ai-gateway.server-Bqa6mA37.mjs";
import { t as Route$26 } from "./jobs._id-3Est0Jw8.mjs";
import { t as Route$27 } from "./mentor._threadId-_FsY11Xc.mjs";
import { t as Route$28 } from "./ngo.survivors._id-X7A-RQK_.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-ZjsEin5_.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var styles_default = "/assets/styles-UaxWLRCm.css";
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
}
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Page not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Go home"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong on our end. You can try refreshing or head back home."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$24 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "CAREVIA — Digital Survivor Repository" },
			{
				name: "description",
				content: "CAREVIA connects survivors of violence, exploitation, and trauma with dignified employment through NGOs and recruiters. Guided by values. Driven by people."
			},
			{
				name: "author",
				content: "CAREVIA"
			},
			{
				property: "og:title",
				content: "CAREVIA — Digital Survivor Repository"
			},
			{
				property: "og:description",
				content: "An AI-powered employment & talent discovery platform built on dignity, privacy, and care."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			},
			{
				name: "theme-color",
				content: "#0B2F66"
			}
		],
		links: [
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$24.useRouteContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(QueryClientProvider, {
		client: queryClient,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
			richColors: true,
			position: "top-right"
		})]
	});
}
var $$splitComponentImporter$19 = () => import("./onboarding-CfqWC3U4.mjs");
var Route$23 = createFileRoute("/onboarding")({
	head: () => ({ meta: [{ title: "Get started · CAREVIA" }] }),
	component: lazyRouteComponent($$splitComponentImporter$19, "component")
});
var $$splitComponentImporter$18 = () => import("./auth-C6t4oFSx.mjs");
var searchSchema = objectType({
	mode: enumType(["signin", "signup"]).optional(),
	redirect: stringType().optional()
});
var Route$22 = createFileRoute("/auth")({
	validateSearch: searchSchema,
	head: () => ({ meta: [{ title: "Sign in · CAREVIA" }, {
		name: "description",
		content: "Sign in or create your CAREVIA account."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$18, "component")
});
var $$splitComponentImporter$17 = () => import("./routes-y-qwWcqv.mjs");
var Route$21 = createFileRoute("/")({
	head: () => ({ meta: [{ title: "CAREVIA — Dignified employment for survivors" }, {
		name: "description",
		content: "CAREVIA is a secure platform that helps survivors of violence and trauma connect with dignified employment through trusted NGOs and recruiters."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$17, "component")
});
var Route$20 = createFileRoute("/recruiter/")({ beforeLoad: () => {
	throw redirect({ to: "/recruiter/search" });
} });
var Route$19 = createFileRoute("/ngo/")({ beforeLoad: () => {
	throw redirect({ to: "/ngo/dashboard" });
} });
var $$splitComponentImporter$16 = () => import("./mentor.index-CNLx996R.mjs");
var Route$18 = createFileRoute("/mentor/")({
	head: () => ({ meta: [{ title: "AI Mentor · CAREVIA" }] }),
	component: lazyRouteComponent($$splitComponentImporter$16, "component")
});
var $$splitComponentImporter$15 = () => import("./jobs.index-C7bLsh5V.mjs");
var Route$17 = createFileRoute("/jobs/")({
	head: () => ({ meta: [
		{ title: "Job opportunities · CAREVIA" },
		{
			name: "description",
			content: "Browse career opportunities for survivors supported by CAREVIA partner NGOs."
		},
		{
			property: "og:title",
			content: "Job opportunities · CAREVIA"
		},
		{
			property: "og:description",
			content: "Browse career opportunities for survivors supported by CAREVIA partner NGOs."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$15, "component")
});
var Route$16 = createFileRoute("/admin/")({ beforeLoad: () => {
	throw redirect({ to: "/admin/dashboard" });
} });
var $$splitComponentImporter$14 = () => import("./settings.notifications-BzCAj8_S.mjs");
var Route$15 = createFileRoute("/settings/notifications")({
	head: () => ({ meta: [{ title: "Notification settings · CAREVIA" }] }),
	component: lazyRouteComponent($$splitComponentImporter$14, "component")
});
var $$splitComponentImporter$13 = () => import("./recruiter.search-2-wGSWTg.mjs");
var Route$14 = createFileRoute("/recruiter/search")({
	head: () => ({ meta: [{ title: "Search survivors · CAREVIA" }] }),
	component: lazyRouteComponent($$splitComponentImporter$13, "component")
});
var $$splitComponentImporter$12 = () => import("./recruiter.requests-DHWshfwn.mjs");
var Route$13 = createFileRoute("/recruiter/requests")({
	head: () => ({ meta: [{ title: "Introduction requests · CAREVIA" }] }),
	component: lazyRouteComponent($$splitComponentImporter$12, "component")
});
var $$splitComponentImporter$11 = () => import("./recruiter.jobs-B0bPnb4h.mjs");
var Route$12 = createFileRoute("/recruiter/jobs")({
	head: () => ({ meta: [{ title: "Jobs · CAREVIA" }] }),
	component: lazyRouteComponent($$splitComponentImporter$11, "component")
});
var $$splitComponentImporter$10 = () => import("./recruiter.analytics-BcqHR1zH.mjs");
var Route$11 = createFileRoute("/recruiter/analytics")({
	head: () => ({ meta: [{ title: "Analytics · CAREVIA" }] }),
	component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
var $$splitComponentImporter$9 = () => import("./ngo.survivors-ypVY17DH.mjs");
var Route$10 = createFileRoute("/ngo/survivors")({
	head: () => ({ meta: [{ title: "Survivors · CAREVIA" }] }),
	component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
var $$splitComponentImporter$8 = () => import("./ngo.requests-CHPUmjNx.mjs");
var Route$9 = createFileRoute("/ngo/requests")({
	head: () => ({ meta: [{ title: "Introduction requests · CAREVIA" }] }),
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
var $$splitComponentImporter$7 = () => import("./ngo.organization-BvX6VlW9.mjs");
var Route$8 = createFileRoute("/ngo/organization")({
	head: () => ({ meta: [{ title: "Organization · CAREVIA" }] }),
	component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
var $$splitComponentImporter$6 = () => import("./ngo.analytics-C7Qa0Sxa.mjs");
var Route$7 = createFileRoute("/ngo/analytics")({
	head: () => ({ meta: [{ title: "Analytics · CAREVIA" }] }),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var CRISIS_KEYWORDS = [
	"suicide",
	"kill myself",
	"end my life",
	"self-harm",
	"hurt myself",
	"want to die",
	"no reason to live"
];
var SYSTEM_PROMPT = `You are a warm, trauma-informed career mentor for CAREVIA's Digital Survivor Repository.
You help survivors and NGO partners with career guidance, skill suggestions, interview preparation, and strengths-based coaching.

IMPORTANT RULES:
- You are NOT a therapist or clinician. Never provide clinical mental health advice.
- If someone expresses crisis, self-harm, or suicidal thoughts, immediately acknowledge their pain with compassion,
  provide crisis resources (iCrisis Helpline India: 9152987821, Vandrevala Foundation: 1860-2662-345),
  and encourage them to speak with a qualified counselor or trusted person.
- Use strengths-based, empowering language. Respect privacy and autonomy.
- Support multilingual communication — respond in the user's language when possible.
- Never share PII or suggest sharing survivor identities with recruiters without consent.
- Keep responses concise, practical, and encouraging.`;
function checkSafety(text) {
	const lower = text.toLowerCase();
	return CRISIS_KEYWORDS.some((kw) => lower.includes(kw));
}
var Route$6 = createFileRoute("/api/chat")({ server: { handlers: { POST: async ({ request }) => {
	const authHeader = request.headers.get("authorization");
	if (!authHeader?.startsWith("Bearer ")) return new Response("Unauthorized", { status: 401 });
	const token = authHeader.replace("Bearer ", "");
	const { createClient } = await import("../_libs/supabase__supabase-js.mjs").then((n) => n.n);
	const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_PUBLISHABLE_KEY, {
		global: { headers: { Authorization: `Bearer ${token}` } },
		auth: {
			persistSession: false,
			autoRefreshToken: false
		}
	});
	const { data: claims } = await supabase.auth.getClaims(token);
	if (!claims?.claims?.sub) return new Response("Unauthorized", { status: 401 });
	claims.claims.sub;
	const body = await request.json();
	const threadId = body.id;
	const messages = body.messages;
	const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
	if (lastUserMsg) {
		const safetyFlagged = checkSafety(lastUserMsg.parts?.filter((p) => p.type === "text").map((p) => p.text).join("") ?? "");
		await supabase.from("mentor_messages").insert({
			thread_id: threadId,
			role: "user",
			parts: lastUserMsg.parts,
			safety_flagged: safetyFlagged
		});
		if (safetyFlagged) await supabase.from("mentor_threads").update({ safety_flagged: true }).eq("id", threadId);
	}
	let contextBlock = "";
	if (body.survivorId) {
		const { data: s } = await supabase.from("survivors").select("skills, languages, bio, availability, work_history, consent_ai_processing").eq("id", body.survivorId).single();
		if (s?.consent_ai_processing) contextBlock = `\n\nSurvivor context (consented):\nSkills: ${(s.skills ?? []).join(", ")}\nLanguages: ${(s.languages ?? []).join(", ")}\nBio: ${s.bio ?? "N/A"}\nAvailability: ${s.availability ?? "N/A"}`;
	}
	return streamText({
		model: getGoogleAi()(DEFAULT_CHAT_MODEL),
		system: SYSTEM_PROMPT + contextBlock,
		messages: await convertToModelMessages(messages),
		onFinish: async ({ text }) => {
			await supabase.from("mentor_messages").insert({
				thread_id: threadId,
				role: "assistant",
				parts: [{
					type: "text",
					text
				}]
			});
			await supabase.from("mentor_threads").update({ updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", threadId);
		}
	}).toUIMessageStreamResponse({ originalMessages: messages });
} } } });
var $$splitComponentImporter$5 = () => import("./admin.users-DuaqbfyY.mjs");
var Route$5 = createFileRoute("/admin/users")({
	head: () => ({ meta: [{ title: "Users · CAREVIA" }] }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./admin.requests-Cv7_Gb59.mjs");
var Route$4 = createFileRoute("/admin/requests")({
	head: () => ({ meta: [{ title: "Requests · CAREVIA" }] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./admin.recruiters-BtF4Kmcg.mjs");
var Route$3 = createFileRoute("/admin/recruiters")({
	head: () => ({ meta: [{ title: "Recruiter verification · CAREVIA" }] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("./admin.ngos-T_HkXeY2.mjs");
var Route$2 = createFileRoute("/admin/ngos")({
	head: () => ({ meta: [{ title: "NGO approvals · CAREVIA" }] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./admin.dashboard-D6CywGlB.mjs");
var Route$1 = createFileRoute("/admin/dashboard")({
	head: () => ({ meta: [{ title: "Admin · CAREVIA" }] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("./admin.analytics-C10m7n7E.mjs");
var Route = createFileRoute("/admin/analytics")({
	head: () => ({ meta: [{ title: "Analytics · CAREVIA" }] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var OnboardingRoute = Route$23.update({
	id: "/onboarding",
	path: "/onboarding",
	getParentRoute: () => Route$24
});
var AuthRoute = Route$22.update({
	id: "/auth",
	path: "/auth",
	getParentRoute: () => Route$24
});
var IndexRoute = Route$21.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$24
});
var RecruiterIndexRoute = Route$20.update({
	id: "/recruiter/",
	path: "/recruiter/",
	getParentRoute: () => Route$24
});
var NgoIndexRoute = Route$19.update({
	id: "/ngo/",
	path: "/ngo/",
	getParentRoute: () => Route$24
});
var MentorIndexRoute = Route$18.update({
	id: "/mentor/",
	path: "/mentor/",
	getParentRoute: () => Route$24
});
var JobsIndexRoute = Route$17.update({
	id: "/jobs/",
	path: "/jobs/",
	getParentRoute: () => Route$24
});
var AdminIndexRoute = Route$16.update({
	id: "/admin/",
	path: "/admin/",
	getParentRoute: () => Route$24
});
var SettingsNotificationsRoute = Route$15.update({
	id: "/settings/notifications",
	path: "/settings/notifications",
	getParentRoute: () => Route$24
});
var RecruiterSearchRoute = Route$14.update({
	id: "/recruiter/search",
	path: "/recruiter/search",
	getParentRoute: () => Route$24
});
var RecruiterRequestsRoute = Route$13.update({
	id: "/recruiter/requests",
	path: "/recruiter/requests",
	getParentRoute: () => Route$24
});
var RecruiterJobsRoute = Route$12.update({
	id: "/recruiter/jobs",
	path: "/recruiter/jobs",
	getParentRoute: () => Route$24
});
var RecruiterAnalyticsRoute = Route$11.update({
	id: "/recruiter/analytics",
	path: "/recruiter/analytics",
	getParentRoute: () => Route$24
});
var NgoSurvivorsRoute = Route$10.update({
	id: "/ngo/survivors",
	path: "/ngo/survivors",
	getParentRoute: () => Route$24
});
var NgoRequestsRoute = Route$9.update({
	id: "/ngo/requests",
	path: "/ngo/requests",
	getParentRoute: () => Route$24
});
var NgoOrganizationRoute = Route$8.update({
	id: "/ngo/organization",
	path: "/ngo/organization",
	getParentRoute: () => Route$24
});
var NgoDashboardRoute = Route$25.update({
	id: "/ngo/dashboard",
	path: "/ngo/dashboard",
	getParentRoute: () => Route$24
});
var NgoAnalyticsRoute = Route$7.update({
	id: "/ngo/analytics",
	path: "/ngo/analytics",
	getParentRoute: () => Route$24
});
var MentorThreadIdRoute = Route$27.update({
	id: "/mentor/$threadId",
	path: "/mentor/$threadId",
	getParentRoute: () => Route$24
});
var JobsIdRoute = Route$26.update({
	id: "/jobs/$id",
	path: "/jobs/$id",
	getParentRoute: () => Route$24
});
var ApiChatRoute = Route$6.update({
	id: "/api/chat",
	path: "/api/chat",
	getParentRoute: () => Route$24
});
var AdminUsersRoute = Route$5.update({
	id: "/admin/users",
	path: "/admin/users",
	getParentRoute: () => Route$24
});
var AdminRequestsRoute = Route$4.update({
	id: "/admin/requests",
	path: "/admin/requests",
	getParentRoute: () => Route$24
});
var AdminRecruitersRoute = Route$3.update({
	id: "/admin/recruiters",
	path: "/admin/recruiters",
	getParentRoute: () => Route$24
});
var AdminNgosRoute = Route$2.update({
	id: "/admin/ngos",
	path: "/admin/ngos",
	getParentRoute: () => Route$24
});
var AdminDashboardRoute = Route$1.update({
	id: "/admin/dashboard",
	path: "/admin/dashboard",
	getParentRoute: () => Route$24
});
var AdminAnalyticsRoute = Route.update({
	id: "/admin/analytics",
	path: "/admin/analytics",
	getParentRoute: () => Route$24
});
var NgoSurvivorsRouteChildren = { NgoSurvivorsIdRoute: Route$28.update({
	id: "/$id",
	path: "/$id",
	getParentRoute: () => NgoSurvivorsRoute
}) };
var rootRouteChildren = {
	IndexRoute,
	AuthRoute,
	OnboardingRoute,
	AdminAnalyticsRoute,
	AdminDashboardRoute,
	AdminNgosRoute,
	AdminRecruitersRoute,
	AdminRequestsRoute,
	AdminUsersRoute,
	ApiChatRoute,
	JobsIdRoute,
	MentorThreadIdRoute,
	NgoAnalyticsRoute,
	NgoDashboardRoute,
	NgoOrganizationRoute,
	NgoRequestsRoute,
	NgoSurvivorsRoute: NgoSurvivorsRoute._addFileChildren(NgoSurvivorsRouteChildren),
	RecruiterAnalyticsRoute,
	RecruiterJobsRoute,
	RecruiterRequestsRoute,
	RecruiterSearchRoute,
	SettingsNotificationsRoute,
	AdminIndexRoute,
	JobsIndexRoute,
	MentorIndexRoute,
	NgoIndexRoute,
	RecruiterIndexRoute
};
var routeTree = Route$24._addFileChildren(rootRouteChildren)._addFileTypes();
var getRouter = () => {
	return createRouter({
		routeTree,
		context: { queryClient: new QueryClient() },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter };

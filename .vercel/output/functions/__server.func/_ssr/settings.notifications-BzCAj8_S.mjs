import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { m as LoaderCircle } from "../_libs/lucide-react.mjs";
import { i as getNotificationPreferences, o as updateNotificationPreference, t as PortalShell } from "./PortalShell-DowbbmyM.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { t as Switch } from "./switch-Cn1w-cIH.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings.notifications-BzCAj8_S.js
var import_jsx_runtime = require_jsx_runtime();
var SETTINGS_NAV = [{
	to: "/settings/notifications",
	label: "Notifications"
}];
var NOTIFICATION_KINDS = [
	{
		kind: "intro_request_received",
		label: "Introduction requests"
	},
	{
		kind: "intro_request_responded",
		label: "Introduction responses"
	},
	{
		kind: "job_application_received",
		label: "Job applications"
	},
	{
		kind: "application_status_changed",
		label: "Application status changes"
	},
	{
		kind: "ngo_approved",
		label: "NGO approval"
	},
	{
		kind: "recruiter_verified",
		label: "Recruiter verification"
	},
	{
		kind: "mentor_safety_flag",
		label: "Safety alerts"
	},
	{
		kind: "weekly_digest",
		label: "Weekly digest"
	}
];
function NotificationSettings() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PortalShell, {
		title: "Settings",
		nav: SETTINGS_NAV,
		allow: [
			"ngo_partner",
			"recruiter",
			"survivor",
			"admin",
			"super_admin"
		],
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Inner, {})
	});
}
function Inner() {
	const qc = useQueryClient();
	const { data: prefs, isLoading } = useQuery({
		queryKey: ["notification-prefs"],
		queryFn: () => getNotificationPreferences()
	});
	const update = useMutation({
		mutationFn: (p) => updateNotificationPreference({ data: p }),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["notification-prefs"] });
			toast.success("Preference saved");
		}
	});
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-6 animate-spin" });
	function getPref(kind) {
		return prefs?.find((p) => p.kind === kind) ?? {
			in_app: true,
			email: true
		};
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-3xl font-bold text-primary",
			children: "Notification preferences"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-4",
			children: NOTIFICATION_KINDS.map(({ kind, label }) => {
				const pref = getPref(kind);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-border bg-card p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium",
						children: label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex flex-wrap gap-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
								id: `${kind}-in-app`,
								checked: pref.in_app,
								onCheckedChange: (v) => update.mutate({
									kind,
									in_app: v,
									email: pref.email
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: `${kind}-in-app`,
								children: "In-app"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
								id: `${kind}-email`,
								checked: pref.email,
								onCheckedChange: (v) => update.mutate({
									kind,
									in_app: pref.in_app,
									email: v
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: `${kind}-email`,
								children: "Email"
							})]
						})]
					})]
				}, kind);
			})
		})]
	});
}
//#endregion
export { NotificationSettings as component };

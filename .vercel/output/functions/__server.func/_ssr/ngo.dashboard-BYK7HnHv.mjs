import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { f as lazyRouteComponent, p as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ngo.dashboard-BYK7HnHv.js
var import_jsx_runtime = require_jsx_runtime();
var $$splitComponentImporter = () => import("./ngo.dashboard-CBmRVunB.mjs");
var Route = createFileRoute("/ngo/dashboard")({
	head: () => ({ meta: [{ title: "NGO Dashboard · CAREVIA" }] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
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
//#endregion
export { StatusBadge as n, Route as t };

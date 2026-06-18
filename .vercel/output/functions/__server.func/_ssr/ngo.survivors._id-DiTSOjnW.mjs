import { f as lazyRouteComponent, p as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
import { Ct as stringType, St as objectType, yt as booleanType } from "../_libs/@ai-sdk/gateway+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ngo.survivors._id-DiTSOjnW.js
var $$splitComponentImporter = () => import("./ngo.survivors._id-3vpPtGaV.mjs");
var Route = createFileRoute("/ngo/survivors/$id")({
	head: () => ({ meta: [{ title: "Survivor profile · CAREVIA" }] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
objectType({
	pronouns: stringType().optional(),
	bio: stringType().max(2e3).optional(),
	location_country: stringType().optional(),
	location_region: stringType().optional(),
	languages: stringType().optional(),
	skills: stringType().optional(),
	availability: stringType().optional(),
	consent_share_with_recruiters: booleanType(),
	consent_ai_processing: booleanType()
});
//#endregion
export { Route as t };

import { f as lazyRouteComponent, p as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/jobs._id-BfJH-d4S.js
var $$splitComponentImporter = () => import("./jobs._id-qXE_4Ego.mjs");
var Route = createFileRoute("/jobs/$id")({
	head: ({ params }) => ({ meta: [
		{ title: `Job · CAREVIA` },
		{
			name: "description",
			content: "View job details on CAREVIA"
		},
		{
			property: "og:title",
			content: `Job · CAREVIA`
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };

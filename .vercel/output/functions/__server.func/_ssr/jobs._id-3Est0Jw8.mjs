import { f as lazyRouteComponent, p as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/jobs._id-3Est0Jw8.js
var $$splitComponentImporter = () => import("./jobs._id-QCk7npYO.mjs");
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

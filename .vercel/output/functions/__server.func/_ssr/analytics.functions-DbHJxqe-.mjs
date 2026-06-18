import { l as createServerFn } from "./esm-9EjmF9OT.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-Dpn8S0gM.mjs";
import { t as createSsrRpc } from "./createSsrRpc-v2xHyLJ2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/analytics.functions-DbHJxqe-.js
var getAdminAnalytics = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("52a55324d8a6e06dd67ad67256b022a8674c46d777604cbee675d6fb01db9853"));
var getNgoAnalytics = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("f78bbfe42ddf4f99c8c694c0f4cfc2580fffd5e47b2d1dd9302c4399c68459c4"));
var getRecruiterAnalytics = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("eb999d63774b4337aad690ce403056ce1b08bd621f83fd3376e250495ec98e4d"));
var exportAdminCsv = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("9592e7244ab19b915707bdf1aba80ffccbc51ac6b74fd8aebd57a8d0dae72fd7"));
//#endregion
export { getRecruiterAnalytics as i, getAdminAnalytics as n, getNgoAnalytics as r, exportAdminCsv as t };

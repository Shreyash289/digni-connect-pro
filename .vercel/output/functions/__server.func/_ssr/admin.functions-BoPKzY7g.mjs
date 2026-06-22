import { l as createServerFn } from "./esm-9EjmF9OT.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-Dpn8S0gM.mjs";
import { t as createSsrRpc } from "./createSsrRpc-BjdNkxGo.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.functions-BoPKzY7g.js
var getAdminIntroRequests = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("cec961d6bfac801b3a68e637813e8cc50f8beba4c2d2d98ed99a6b2dbc992d98"));
var getAdminUsers = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("10168707f826b5e8e54808aba2070948c8b2fb5ddd7006123ad782c227604c98"));
//#endregion
export { getAdminUsers as n, getAdminIntroRequests as t };

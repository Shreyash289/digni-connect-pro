import { l as createServerFn } from "./esm-9EjmF9OT.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-pFu6bPsK.mjs";
import { t as createSsrRpc } from "./createSsrRpc-CnhdtqBy.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.functions-Dv_MNoXz.js
var getAdminIntroRequests = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("cec961d6bfac801b3a68e637813e8cc50f8beba4c2d2d98ed99a6b2dbc992d98"));
var requestAdminSignupRole = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("a12e460ba72c2e448b617626ddc37530e332db234b156491274c13dd7babae8d"));
var getAdminUsers = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("10168707f826b5e8e54808aba2070948c8b2fb5ddd7006123ad782c227604c98"));
//#endregion
export { getAdminUsers as n, requestAdminSignupRole as r, getAdminIntroRequests as t };

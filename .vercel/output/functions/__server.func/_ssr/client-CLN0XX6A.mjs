import { t as createClient } from "../_libs/supabase__supabase-js.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/client-CLN0XX6A.js
function createSupabaseClient() {
	return createClient("https://zdqszfpslrrpypfxpmkd.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkcXN6ZnBzbHJycHlwZnhwbWtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1MDIzNTcsImV4cCI6MjA5NzA3ODM1N30.2G_M2LKFQffJM8I2vEJnPcrH0cdJcd1wAzzo7Fwi1TM", { auth: {
		storage: typeof window !== "undefined" ? localStorage : void 0,
		persistSession: true,
		autoRefreshToken: true
	} });
}
var _supabase;
var supabase = new Proxy({}, { get(_, prop, receiver) {
	if (!_supabase) _supabase = createSupabaseClient();
	return Reflect.get(_supabase, prop, receiver);
} });
//#endregion
export { supabase as t };

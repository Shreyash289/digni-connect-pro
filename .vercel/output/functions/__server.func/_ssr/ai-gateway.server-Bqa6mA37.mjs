import { i as embed } from "../_libs/@ai-sdk/react+[...].mjs";
import { t as createGoogleGenerativeAI } from "../_libs/ai-sdk__google.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ai-gateway.server-Bqa6mA37.js
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var ai_gateway_server_exports = /* @__PURE__ */ __exportAll({
	DEFAULT_CHAT_MODEL: () => DEFAULT_CHAT_MODEL,
	DEFAULT_EMBED_MODEL: () => DEFAULT_EMBED_MODEL,
	buildJobEmbedText: () => buildJobEmbedText,
	buildSurvivorEmbedText: () => buildSurvivorEmbedText,
	embedText: () => embedText,
	getGoogleAi: () => getGoogleAi
});
var DEFAULT_CHAT_MODEL = "gemini-2.0-flash";
var DEFAULT_EMBED_MODEL = "text-embedding-004";
function getApiKey() {
	const key = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY;
	if (!key) throw new Error("GEMINI_API_KEY is not configured. Add it to your .env file.");
	return key;
}
function getGoogleAi() {
	return createGoogleGenerativeAI({ apiKey: getApiKey() });
}
async function embedText(text) {
	const { embedding } = await embed({
		model: getGoogleAi().textEmbeddingModel(DEFAULT_EMBED_MODEL),
		value: text.slice(0, 8e3)
	});
	return embedding;
}
function buildSurvivorEmbedText(survivor) {
	return [
		survivor.bio ?? "",
		(survivor.skills ?? []).join(", "),
		(survivor.languages ?? []).join(", "),
		(survivor.interests ?? []).join(", "),
		JSON.stringify(survivor.work_history ?? [])
	].filter(Boolean).join("\n");
}
function buildJobEmbedText(job) {
	return [
		job.title,
		job.description ?? "",
		(job.required_skills ?? []).join(", "),
		(job.preferred_skills ?? []).join(", ")
	].join("\n");
}
//#endregion
export { ai_gateway_server_exports as n, getGoogleAi as r, DEFAULT_CHAT_MODEL as t };

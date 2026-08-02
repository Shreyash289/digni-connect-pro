import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(request: Request, response: Response): Promise<Response> {
  if (response.status < 500) return response;

  const acceptHeader = request.headers.get("accept") ?? "";
  const isHtmlRequest = acceptHeader.includes("text/html");
  if (!isHtmlRequest) return response;

  const contentType = response.headers.get("content-type") ?? "";
  const body = await response.clone().text();
  const bodyLooksLikeSwallowedH3Error =
    body.includes('"unhandled":true') ||
    body.includes('"message":"HTTPError"') ||
    body.includes('"message":"H3Error"') ||
    body.includes("HTTPError");

  if (!contentType.includes("application/json") && !bodyLooksLikeSwallowedH3Error) {
    return response;
  }

  if (!bodyLooksLikeSwallowedH3Error) {
    return response;
  }

  const error = consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`);
  console.error(error);
  return new Response(renderErrorPage(error), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(request, response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(error), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};

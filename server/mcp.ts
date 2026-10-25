/**
 * /api/mcp — read-only remote MCP server for agentnative.build (Streamable HTTP, JSON responses).
 * Stateless: every request is self-contained, no session id, no handshake required before tools/call.
 * Tools are the same definitions the page registers through WebMCP (src/lib/tools.ts).
 */
import { TOOLS as SHARED, ToolError, toolResult, errorResult, type ToolDef } from "../src/lib/tools";
import { limited, parseTarget, probeHost } from "./probe";
import { SITE } from "../src/lib/data";

// The server adds one tool the browser cannot offer: probing a public site from outside.
const probeTool: ToolDef = {
  name: "probe_site",
  title: "Probe a public site for agent-native signals",
  description: "Checks a public https site for llms.txt and Markdown docs, an OpenAPI file or MCP server, and a structured error response. Answers up to three scorecard questions (3, 2, and 6); the rest need source access. Returns one finding per question with a verdict of yes, no, or unknown, and short evidence.",
  inputSchema: { type: "object", properties: { url: { type: "string", description: "Public https URL or hostname, for example https://example.com" } }, required: ["url"], additionalProperties: false },
  run: async ({ url }: { url: string }) => {
    const t = parseTarget(String(url ?? ""));
    if ("error" in t) throw new ToolError("invalid_url", t.error, "Send a public https:// hostname, for example https://example.com.");
    if (limited("mcp", 30)) throw new ToolError("rate_limited", "Too many probes right now", "Wait a minute and retry.", true);
    return { host: t.host, findings: await probeHost(t.host) };
  },
};
const TOOLS: ToolDef[] = [...SHARED, probeTool];

const SUPPORTED = ["2025-11-25", "2025-06-18", "2025-03-26", "2024-11-05"];
const MAX_BODY = 64 * 1024;
const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-allow-headers": "content-type, accept, mcp-protocol-version, mcp-session-id",
};

const reply = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store", ...CORS } });

const ok = (id: unknown, result: unknown) => ({ jsonrpc: "2.0", id, result });
const fail = (id: unknown, code: number, message: string, data?: unknown) => ({ jsonrpc: "2.0", id: id ?? null, error: { code, message, ...(data ? { data } : {}) } });

async function handle(msg: any): Promise<unknown | null> {
  if (!msg || msg.jsonrpc !== "2.0" || typeof msg.method !== "string") return fail(msg?.id, -32600, "Invalid Request");
  const { id, method, params } = msg;
  const isNotification = id === undefined;

  switch (method) {
    case "initialize": {
      const asked = params?.protocolVersion;
      return ok(id, {
        protocolVersion: SUPPORTED.includes(asked) ? asked : SUPPORTED[0],
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: "agentnative-build", title: SITE.name, version: "1.0.0" },
        instructions: "Read-only tools about agent-native software. Call get_scorecard, inspect the product, then send answers to score_product to rate it; probe_site checks a public site from outside. Use search_site to find passages, get_page for full Markdown.",
      });
    }
    case "ping": return ok(id, {});
    case "tools/list":
      return ok(id, { tools: TOOLS.map((t) => ({ name: t.name, title: t.title, description: t.description, inputSchema: t.inputSchema, annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: t.name === "probe_site" } })) });
    case "tools/call": {
      const tool = TOOLS.find((t) => t.name === params?.name);
      if (!tool) return fail(id, -32602, `Unknown tool: ${params?.name}`, { fix: "Call tools/list and use one of the returned names.", retryable: false });
      try { return ok(id, await toolResult(tool, params?.arguments)); }
      catch (e) { return ok(id, errorResult(e)); }
    }
    default:
      return isNotification ? null : fail(id, -32601, `Method not found: ${method}`, { fix: "Supported methods: initialize, ping, tools/list, tools/call.", retryable: false });
  }
}

async function post(request: Request) {
  const raw = await request.text();
  if (raw.length > MAX_BODY) return reply(fail(null, -32600, "Request too large"), 413);
  let body: unknown;
  try { body = JSON.parse(raw); } catch { return reply(fail(null, -32700, "Parse error"), 400); }

  if (Array.isArray(body)) {
    const out = (await Promise.all(body.map(handle))).filter((r) => r !== null);
    return out.length ? reply(out) : new Response(null, { status: 202, headers: CORS });
  }
  const out = await handle(body);
  return out === null ? new Response(null, { status: 202, headers: CORS }) : reply(out);
}

function get() {
  return reply({
    name: "agentnative-build",
    description: "Read-only MCP server for agentnative.build. POST JSON-RPC 2.0 to this URL.",
    docs: SITE.url + "/agents",
    tools: TOOLS.map((t) => t.name),
  });
}

function options() {
  return new Response(null, { status: 204, headers: CORS });
}

export default {
  async fetch(request: Request) {
    switch (request.method) {
      case "POST": return post(request);
      case "GET": return get();
      case "OPTIONS": return options();
      default: return reply(fail(null, -32600, "Method not allowed"), 405);
    }
  },
};

/**
 * /api/probe?url=https://example.com — looks at a site from the outside and answers the scorecard
 * questions that are visible without credentials or source code: llms.txt and Markdown docs (Q3),
 * machine-readable interface descriptions (Q2), and structured errors (Q6).
 *
 * It fetches a stranger-supplied URL, so it is strict: HTTPS on 443 only, no IP literals, every resolved
 * address checked at connect time (blocks private, loopback, link-local, and metadata ranges, and closes the
 * DNS-rebinding gap), small responses, short timeouts, redirects followed only within the same host, and it
 * returns derived verdicts and short evidence strings, never the fetched bodies.
 */
import dns from "node:dns";
import https from "node:https";
import net from "node:net";

const TIMEOUT_MS = 4000;
const MAX_BYTES = 64 * 1024;
const CORS = { "access-control-allow-origin": "*", "access-control-allow-methods": "GET, OPTIONS" };

const reply = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store", ...CORS } });
const err = (status: number, code: string, message: string, fix: string, retryable = false) => reply({ error: { code, message, fix, retryable } }, status);

/* ── address safety ── */
function privateV4(ip: string) {
  const [a, b] = ip.split(".").map(Number);
  return a === 0 || a === 10 || a === 127 || a >= 224 ||
    (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && (b === 168 || (b === 0 && ip.startsWith("192.0.0.")))) || (a === 198 && (b === 18 || b === 19));
}
function privateIp(ip: string): boolean {
  if (net.isIPv4(ip)) return privateV4(ip);
  const low = ip.toLowerCase();
  const mapped = low.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return privateV4(mapped[1]);
  return low === "::" || low === "::1" || /^f[cd]/.test(low) || /^fe[89ab]/.test(low) || low.startsWith("ff");
}

const safeLookup: any = (hostname: string, opts: any, cb: any) => {
  dns.lookup(hostname, { all: true }, (e, addrs) => {
    if (e) return cb(e);
    if (!addrs.length || addrs.some((a) => privateIp(a.address))) return cb(new Error("blocked_address"));
    if (opts?.all) return cb(null, addrs);
    cb(null, addrs[0].address, addrs[0].family);
  });
};

interface Res { status: number; type: string; text: string; location?: string }

function get(host: string, path: string, init: { method?: string; headers?: Record<string, string>; body?: string } = {}): Promise<Res> {
  return new Promise((resolve, reject) => {
    const req = https.request(
      { host, port: 443, path, method: init.method ?? "GET", lookup: safeLookup, agent: false, timeout: TIMEOUT_MS, servername: host,
        headers: { "user-agent": "agentnative-build-probe/1.0 (+https://agentnative.build/agents)", ...init.headers } },
      (res) => {
        const chunks: Buffer[] = [];
        let size = 0;
        res.on("data", (c: Buffer) => {
          size += c.length;
          if (size > MAX_BYTES) { res.destroy(); return; }
          chunks.push(c);
        });
        const done = () => resolve({ status: res.statusCode ?? 0, type: String(res.headers["content-type"] ?? ""), text: Buffer.concat(chunks).toString("utf8"), location: res.headers.location });
        res.on("end", done);
        res.on("close", done);
        res.on("error", reject);
      },
    );
    req.on("timeout", () => req.destroy(new Error("timeout")));
    req.on("error", reject);
    if (init.body) req.write(init.body);
    req.end();
  });
}

/** Same-host redirects only, two hops. */
async function fetchSame(host: string, path: string, init = {}): Promise<Res | null> {
  try {
    let r = await get(host, path, init);
    for (let i = 0; i < 2 && [301, 302, 307, 308].includes(r.status) && r.location; i++) {
      const next = new URL(r.location, `https://${host}${path}`);
      if (next.protocol !== "https:" || next.hostname !== host) break;
      r = await get(host, next.pathname + next.search, init);
    }
    return r;
  } catch { return null; }
}

/* ── the probe ── */
const bad = (r: Res | null) => !r || r.status < 200 || r.status >= 300;
const INIT = JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "agentnative-probe", version: "1.0.0" } } });

export type Verdict = "yes" | "no" | "unknown";
export interface Finding { n: number; verdict: Verdict; evidence: string }

export function parseTarget(input: string): { host: string } | { error: string } {
  let u: URL;
  try { u = new URL(/^https?:\/\//i.test(input.trim()) ? input.trim() : "https://" + input.trim()); } catch { return { error: "That does not look like a URL." }; }
  if (u.protocol !== "https:") return { error: "Only https:// sites can be probed." };
  if (u.username || u.password) return { error: "Remove credentials from the URL." };
  if (u.port && u.port !== "443") return { error: "Only the default HTTPS port can be probed." };
  const host = u.hostname.toLowerCase();
  if (net.isIP(host) || host === "localhost" || !host.includes(".") || host.endsWith(".local") || host.endsWith(".internal")) return { error: "Use a public hostname, not an IP address or a local name." };
  return { host };
}

export async function probeHost(host: string) {
  const [llms, llmsFull, md, ...rest] = await Promise.all([
    fetchSame(host, "/llms.txt"),
    fetchSame(host, "/llms-full.txt"),
    fetchSame(host, "/", { headers: { accept: "text/markdown" } }),
    ...["/openapi.json", "/openapi.yaml", "/.well-known/openapi.json", "/swagger.json"].map((p) => fetchSame(host, p)),
    ...["/mcp", "/api/mcp", "/.well-known/mcp"].map((p) => fetchSame(host, p, { method: "POST", headers: { "content-type": "application/json", accept: "application/json, text/event-stream" }, body: INIT })),
    fetchSame(host, "/api/__agentnative_probe_404", { headers: { accept: "application/json" } }),
  ]);
  const specs = rest.slice(0, 4), mcps = rest.slice(4, 7), notFound = rest[7];
  const findings: Finding[] = [];

  // Q3: llms.txt, and docs that arrive as Markdown
  const llmsOk = !bad(llms) && !/html/i.test(llms!.type) && /(^#|\]\()/m.test(llms!.text);
  const markdown = (!bad(md) && /markdown/i.test(md!.type)) || (!bad(llmsFull) && !/html/i.test(llmsFull!.type) && /(^#|\]\()/m.test(llmsFull!.text)) || (llmsOk && /\.md\b/.test(llms!.text));
  findings.push(llmsOk && markdown
    ? { n: 3, verdict: "yes", evidence: `/llms.txt found (${llms!.status}) and Markdown is served (${!bad(md) && /markdown/i.test(md!.type) ? "Accept: text/markdown" : !bad(llmsFull) ? "/llms-full.txt" : ".md links"}).` }
    : llmsOk ? { n: 3, verdict: "unknown", evidence: "/llms.txt found, but no Markdown version of the docs was detected. Confirm that docs load as plain Markdown." }
    : { n: 3, verdict: "no", evidence: llms ? `/llms.txt returned ${llms.status}${/html/i.test(llms.type) ? " as HTML" : ""}.` : "/llms.txt did not respond." });

  // Q2: an OpenAPI file or an MCP server at a standard location
  const specAt = ["/openapi.json", "/openapi.yaml", "/.well-known/openapi.json", "/swagger.json"].find((_, i) => !bad(specs[i]) && /(openapi|swagger)["']?\s*[:=]/i.test(specs[i]!.text.slice(0, 2048)));
  const mcpAt = ["/mcp", "/api/mcp", "/.well-known/mcp"].find((_, i) => !bad(mcps[i]) && /"jsonrpc"/.test(mcps[i]!.text) && /protocolVersion/.test(mcps[i]!.text));
  findings.push(specAt || mcpAt
    ? { n: 2, verdict: "yes", evidence: [specAt && `OpenAPI at ${specAt}`, mcpAt && `MCP server at ${mcpAt} answers initialize`].filter(Boolean).join("; ") + ". Confirm it covers the main workflows." }
    : { n: 2, verdict: "unknown", evidence: "No OpenAPI file or MCP server at the standard paths. If one exists elsewhere, answer yes yourself." });

  // Q6: an error an agent can act on
  let q6: Finding = { n: 6, verdict: "unknown", evidence: "No API error could be sampled from outside. Trigger a real failure and check it has a code, cause, and fix." };
  if (notFound && notFound.status >= 400) {
    if (/json/i.test(notFound.type)) {
      try {
        const j: any = JSON.parse(notFound.text);
        const o = j?.error && typeof j.error === "object" ? j.error : j;
        const keys = Object.keys(o ?? {}).map((k) => k.toLowerCase());
        const hasCode = keys.some((k) => ["code", "type", "error"].includes(k));
        const hasFix = keys.some((k) => ["fix", "hint", "suggestion", "remediation", "retryable", "detail", "instance"].includes(k));
        q6 = hasCode && hasFix
          ? { n: 6, verdict: "yes", evidence: `A missing API route returned JSON with ${keys.slice(0, 5).join(", ")}. Confirm real failures look the same.` }
          : { n: 6, verdict: "unknown", evidence: `A missing API route returned JSON (${keys.slice(0, 5).join(", ") || "no keys"}) without a suggested fix.` };
      } catch { /* not JSON despite the header */ }
    } else q6 = { n: 6, verdict: "unknown", evidence: `A missing API route returned ${notFound.status} as ${notFound.type.split(";")[0] || "an unknown type"}, not JSON. Check your real API routes.` };
  }
  findings.push(q6);

  return findings.sort((a, b) => a.n - b.n);
}

/* ── rate limit: best effort, per warm instance ── */
const hits = new Map<string, number[]>();
export function limited(ip: string, max = 8) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > max;
}

export async function handleProbe(request: Request, ip = "unknown") {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  if (request.method !== "GET") return err(405, "method_not_allowed", "Use GET.", "Send GET /api/probe?url=https://example.com.");
  const url = new URL(request.url).searchParams.get("url");
  if (!url) return err(400, "missing_url", "The url parameter is required.", "Send GET /api/probe?url=https://example.com.");
  const target = parseTarget(url);
  if ("error" in target) return err(400, "invalid_url", target.error, "Send a public https:// hostname, for example https://example.com.");
  if (limited(ip)) return err(429, "rate_limited", "Too many probes from this address.", "Wait a minute and retry.", true);
  const findings = await probeHost(target.host);
  return reply({
    host: target.host,
    scope: "Three of the twelve questions are visible from outside. The other nine need source access, credentials, or a running workflow: hand them to your agent.",
    findings,
  });
}

export default {
  async fetch(request: Request) {
    return handleProbe(request, request.headers.get("x-forwarded-for")?.split(",")[0]?.trim());
  },
};

// server/probe.ts
import dns from "node:dns";
import https from "node:https";
import net from "node:net";
var TIMEOUT_MS = 4e3;
var DEADLINE_MS = 6e3;
var MAX_BYTES = 64 * 1024;
var CORS = { "access-control-allow-origin": "*", "access-control-allow-methods": "GET, OPTIONS" };
var reply = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store", ...CORS } });
var err = (status, code, message, fix, retryable = false) => reply({ error: { code, message, fix, retryable } }, status);
function privateV4(ip) {
  const [a, b] = ip.split(".").map(Number);
  return a === 0 || a === 10 || a === 127 || a >= 224 || a === 100 && b >= 64 && b <= 127 || a === 169 && b === 254 || a === 172 && b >= 16 && b <= 31 || a === 192 && (b === 168 || b === 0 && ip.startsWith("192.0.0.")) || a === 198 && (b === 18 || b === 19);
}
function privateIp(ip) {
  if (net.isIPv4(ip)) return privateV4(ip);
  const low = ip.toLowerCase();
  const mapped = low.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return privateV4(mapped[1]);
  const hex = low.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
  if (hex) {
    const a = parseInt(hex[1], 16), b = parseInt(hex[2], 16);
    return privateV4(`${a >> 8}.${a & 255}.${b >> 8}.${b & 255}`);
  }
  return low === "::" || low === "::1" || /^f[cd]/.test(low) || /^fe[89ab]/.test(low) || low.startsWith("ff");
}
var safeLookup = (hostname, opts, cb) => {
  dns.lookup(hostname, { all: true }, (e, addrs) => {
    if (e) return cb(e);
    if (!addrs.length || addrs.some((a) => privateIp(a.address))) return cb(new Error("blocked_address"));
    if (opts?.all) return cb(null, addrs);
    cb(null, addrs[0].address, addrs[0].family);
  });
};
function get(host, path, init = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        host,
        port: 443,
        path,
        method: init.method ?? "GET",
        lookup: safeLookup,
        agent: false,
        timeout: TIMEOUT_MS,
        servername: host,
        headers: { "user-agent": "agentnative-build-probe/1.0 (+https://agentnative.build/agents)", ...init.headers }
      },
      (res) => {
        const chunks = [];
        let size = 0;
        res.on("data", (c) => {
          size += c.length;
          if (size > MAX_BYTES) {
            res.destroy();
            return;
          }
          chunks.push(c);
        });
        const done = () => resolve({ status: res.statusCode ?? 0, type: String(res.headers["content-type"] ?? ""), text: Buffer.concat(chunks).toString("utf8"), location: res.headers.location });
        res.on("end", done);
        res.on("close", done);
        res.on("error", reject);
      }
    );
    req.on("timeout", () => req.destroy(new Error("timeout")));
    const deadline = setTimeout(() => req.destroy(new Error("deadline")), DEADLINE_MS);
    req.on("close", () => clearTimeout(deadline));
    req.on("error", reject);
    if (init.body) req.write(init.body);
    req.end();
  });
}
async function fetchSame(host, path, init = {}) {
  try {
    let r = await get(host, path, init);
    for (let i = 0; i < 2 && [301, 302, 307, 308].includes(r.status) && r.location; i++) {
      const next = new URL(r.location, `https://${host}${path}`);
      if (next.protocol !== "https:" || next.hostname !== host) break;
      r = await get(host, next.pathname + next.search, init);
    }
    return r;
  } catch {
    return null;
  }
}
var bad = (r) => !r || r.status < 200 || r.status >= 300;
var INIT = JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "agentnative-probe", version: "1.0.0" } } });
var isMap = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
function isSpec(text) {
  try {
    const j = JSON.parse(text);
    return /^[23]\.\d+(\.\d+)?/.test(String(j?.openapi ?? j?.swagger ?? "")) && isMap(j.paths) && Object.keys(j.paths).some((k) => k.startsWith("/"));
  } catch {
    return /^(openapi|swagger):\s*["']?[23]\.\d+(\.\d+)?["']?\s*$/m.test(text) && /^paths:\s*\n[ \t]+["']?\/\S*["']?:/m.test(text);
  }
}
function isMcpInit(text) {
  const body = text.trimStart().startsWith("{") ? text : text.split("\n").find((l) => l.startsWith("data:"))?.slice(5) ?? "";
  try {
    const j = JSON.parse(body);
    return j?.jsonrpc === "2.0" && isMap(j.result) && typeof j.result.protocolVersion === "string" && isMap(j.result.serverInfo) && typeof j.result.serverInfo.name === "string";
  } catch {
    return false;
  }
}
function parseTarget(input) {
  let u;
  try {
    u = new URL(/^https?:\/\//i.test(input.trim()) ? input.trim() : "https://" + input.trim());
  } catch {
    return { error: "That does not look like a URL." };
  }
  if (u.protocol !== "https:") return { error: "Only https:// sites can be probed." };
  if (u.username || u.password) return { error: "Remove credentials from the URL." };
  if (u.port && u.port !== "443") return { error: "Only the default HTTPS port can be probed." };
  const host = u.hostname.toLowerCase();
  if (net.isIP(host) || host === "localhost" || !host.includes(".") || host.endsWith(".local") || host.endsWith(".internal")) return { error: "Use a public hostname, not an IP address or a local name." };
  return { host };
}
async function probeHost(host) {
  const [llms, llmsFull, md, ...rest] = await Promise.all([
    fetchSame(host, "/llms.txt"),
    fetchSame(host, "/llms-full.txt"),
    fetchSame(host, "/", { headers: { accept: "text/markdown" } }),
    ...["/openapi.json", "/openapi.yaml", "/.well-known/openapi.json", "/swagger.json"].map((p) => fetchSame(host, p)),
    ...["/mcp", "/api/mcp", "/.well-known/mcp"].map((p) => fetchSame(host, p, { method: "POST", headers: { "content-type": "application/json", accept: "application/json, text/event-stream" }, body: INIT })),
    fetchSame(host, "/api/__agentnative_probe_404", { headers: { accept: "application/json" } })
  ]);
  const specs = rest.slice(0, 4), mcps = rest.slice(4, 7), notFound = rest[7];
  const findings = [];
  const llmsOk = !bad(llms) && !/html/i.test(llms.type) && /(^#|\]\()/m.test(llms.text);
  const markdown = !bad(md) && /markdown/i.test(md.type) || !bad(llmsFull) && !/html/i.test(llmsFull.type) && /(^#|\]\()/m.test(llmsFull.text) || llmsOk && /\.md\b/.test(llms.text);
  findings.push(llmsOk && markdown ? { n: 3, verdict: "yes", evidence: `/llms.txt found (${llms.status}) and Markdown is served (${!bad(md) && /markdown/i.test(md.type) ? "Accept: text/markdown" : !bad(llmsFull) ? "/llms-full.txt" : ".md links"}).` } : llmsOk ? { n: 3, verdict: "unknown", evidence: "/llms.txt found, but no Markdown version of the docs was detected. Confirm that docs load as plain Markdown." } : { n: 3, verdict: "no", evidence: llms ? `/llms.txt returned ${llms.status}${/html/i.test(llms.type) ? " as HTML" : ""}.` : "/llms.txt did not respond." });
  const specAt = ["/openapi.json", "/openapi.yaml", "/.well-known/openapi.json", "/swagger.json"].find((_, i) => !bad(specs[i]) && isSpec(specs[i].text));
  const mcpAt = ["/mcp", "/api/mcp", "/.well-known/mcp"].find((_, i) => !bad(mcps[i]) && isMcpInit(mcps[i].text));
  findings.push(specAt || mcpAt ? { n: 2, verdict: "yes", evidence: [specAt && `OpenAPI at ${specAt}`, mcpAt && `MCP server at ${mcpAt} answers initialize`].filter(Boolean).join("; ") + ". Confirm it covers the main workflows." } : { n: 2, verdict: "unknown", evidence: "No OpenAPI file or MCP server at the standard paths. If one exists elsewhere, answer yes yourself." });
  let q6 = { n: 6, verdict: "unknown", evidence: "No API error could be sampled from outside. Trigger a real failure and check it has a code, cause, and fix." };
  if (notFound && notFound.status >= 400) {
    if (/json/i.test(notFound.type)) {
      try {
        const j = JSON.parse(notFound.text);
        const o = j?.error && typeof j.error === "object" ? j.error : j;
        const keys = new Set(Object.keys(o && typeof o === "object" ? o : {}).map((k) => k.toLowerCase()));
        const hasCode = ["code", "type"].some((k) => keys.has(k));
        const hasFix = ["fix", "hint", "suggestion", "remediation", "how_to_fix"].some((k) => keys.has(k));
        q6 = hasCode && hasFix ? { n: 6, verdict: "yes", evidence: "A missing API route returned JSON with a code and a suggested fix. Confirm real failures look the same." } : { n: 6, verdict: "unknown", evidence: "A missing API route returned JSON without both a code and a suggested fix." };
      } catch {
      }
    } else q6 = { n: 6, verdict: "unknown", evidence: `A missing API route returned ${notFound.status} as ${/html/i.test(notFound.type) ? "HTML" : "a non-JSON type"}, not JSON. Check your real API routes.` };
  }
  findings.push(q6);
  return findings.sort((a, b) => a.n - b.n);
}
var hits = /* @__PURE__ */ new Map();
function limited(ip, max = 8) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 6e4);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5e3) hits.clear();
  return recent.length > max;
}
async function handleProbe(request, ip = "unknown") {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  if (request.method !== "GET") return err(405, "method_not_allowed", "Use GET.", "Send GET /api/probe?url=https://example.com.");
  const url = new URL(request.url).searchParams.get("url");
  if (!url) return err(400, "missing_url", "The url parameter is required.", "Send GET /api/probe?url=https://example.com.");
  const target = parseTarget(url);
  if ("error" in target) return err(400, "invalid_url", target.error, "Send a public https:// hostname, for example https://example.com.");
  if (limited(ip) || limited("global", 60)) return err(429, "rate_limited", "Too many probes from this address.", "Wait a minute and retry.", true);
  const findings = await probeHost(target.host);
  return reply({
    host: target.host,
    scope: "Three of the twelve questions are visible from outside. The other nine need source access, credentials, or a running workflow: hand them to your agent.",
    findings
  });
}
var probe_default = {
  async fetch(request) {
    const xff = request.headers.get("x-forwarded-for")?.split(",").map((v) => v.trim()).filter(Boolean);
    return handleProbe(request, request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() || xff?.[xff.length - 1]);
  }
};
export {
  probe_default as default,
  handleProbe,
  isMcpInit,
  isSpec,
  limited,
  parseTarget,
  probeHost
};

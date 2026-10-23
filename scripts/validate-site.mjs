/**
 * validate-site.mjs — fails the build if SEO/AEO invariants break.
 * Checks title/description length, canonical, one H1, JSON-LD parses, FAQ schema matches visible FAQ,
 * Markdown twin exists, banned words absent, "open-source" never hyphenated.
 */
import fs from "node:fs";
import path from "node:path";

const dist = path.resolve(import.meta.dirname, "..", "dist");
const routes = [["/", "index.html", "index.md"], ["/future", "future/index.html", "future.md"], ["/examples", "examples/index.html", "examples.md"], ["/product-managers", "product-managers/index.html", "product-managers.md"], ["/agents", "agents/index.html", "agents.md"], ["/reference", "reference/index.html", "reference.md"], ["/about", "about/index.html", "about.md"]];
const banned = ["delve", "realm", "unleash", "tapestry", "paradigm", "landscape", "cornerstone", "game-changer", "revolutionary", "unlock potential"];
let failures = 0;
const fail = (m) => { failures++; console.error("  ✗ " + m); };

for (const [route, file, md] of routes) {
  console.log(route);
  const html = fs.readFileSync(path.join(dist, file), "utf8");
  const title = html.match(/<title>(.*?)<\/title>/s)?.[1] ?? "";
  const desc = html.match(/<meta name="description" content="(.*?)"/s)?.[1] ?? "";
  if (!title || title.length > 62) fail(`title length ${title.length} (max 62): ${title}`);
  if (desc.length < 140 || desc.length > 165) fail(`description length ${desc.length} (want 140-165)`);
  if (!html.includes(`<link rel="canonical" href="https://agentnative.build${route === "/" ? "/" : route}"`)) fail("canonical missing/wrong");
  const h1s = (html.match(/<h1[\s>]/g) ?? []).length;
  if (h1s !== 1) fail(`expected 1 <h1>, found ${h1s}`);
  const ld = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)];
  if (!ld.length) fail("no JSON-LD");
  for (const m of ld) {
    try {
      const j = JSON.parse(m[1]);
      const faq = j["@graph"]?.find((n) => n["@type"] === "FAQPage");
      if (faq) for (const q of faq.mainEntity) if (!html.includes(q.acceptedAnswer.text.replace(/&/g, "&amp;").replace(/'/g, "&#x27;").replace(/"/g, "&quot;").slice(0, 40)) && !html.includes(q.acceptedAnswer.text.slice(0, 40))) fail(`FAQ answer not visible in HTML: ${q.name}`);
    } catch { fail("JSON-LD does not parse"); }
  }
  if (!fs.existsSync(path.join(dist, md))) fail(`missing Markdown twin ${md}`);
  const text = html.replace(/<script.*?<\/script>/gs, "").replace(/<[^>]+>/g, " ").toLowerCase();
  for (const w of banned) if (text.includes(w)) fail(`banned word "${w}"`);
  if (/open-source/i.test(text)) fail('"open-source" hyphenated; the style is "open source"');
  if (html.includes("Loading")) fail("placeholder text present");
}
for (const f of ["llms.txt", "llms-full.txt", "sitemap.xml", "robots.txt", "404.html"]) if (!fs.existsSync(path.join(dist, f))) fail(`missing ${f}`);

if (failures) { console.error(`\n${failures} validation failure(s)`); process.exit(1); }
console.log("\nvalidate-site: all checks passed");

/**
 * prerender.mjs — build-time SSR for every route.
 * Injects per-page <head> (title, description, canonical, OG, JSON-LD) and the rendered React HTML,
 * then writes the Markdown twins, llms.txt and sitemap.xml from the same data.
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "..");
const dist = path.join(root, "dist");
const ssr = await import(pathToFileURL(path.join(root, "dist-server", "entry-server.js")).href);
const template = fs.readFileSync(path.join(dist, "index.html"), "utf8").replace(/<title>.*?<\/title>\s*/s, "");

const SITE = "https://agentnative.build";
const write = (rel, body) => {
  const file = path.join(dist, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, body);
};

for (const page of ssr.PAGES) {
  const html = template
    .replace("<!--app-head-->", ssr.headHtml(page))
    .replace("<!--app-html-->", ssr.render(page.path));
  write(page.path === "/" ? "index.html" : path.join(page.path.slice(1), "index.html"), html);
  write(page.md.slice(1), ssr.markdownFor(page.path));
  console.log(`[prerender] ${page.path}  ->  ${page.md}`);
}

// 404 shell (served by Vercel for unknown routes)
write("404.html", template
  .replace("<!--app-head-->", `<title>Page not found | Agent Native</title>\n<meta name="robots" content="noindex" />`)
  .replace("<!--app-html-->", ssr.render("/404")));

write("llms.txt", ssr.llmsTxt());
write("llms-full.txt", ssr.llmsFullTxt());
const lastmod = ssr.SITE.modified;
write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${ssr.PAGES.map((p) => `  <url><loc>${SITE}${p.path === "/" ? "/" : p.path}</loc><lastmod>${lastmod}</lastmod></url>`).join("\n")}\n</urlset>\n`);
console.log("[prerender] llms.txt, llms-full.txt, sitemap.xml written");

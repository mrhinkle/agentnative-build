/**
 * Routing Middleware: Markdown content negotiation. A request that prefers text/markdown to a page URL
 * is answered with that page's Markdown twin; everything else passes through untouched.
 */
import { next, rewrite } from "@vercel/functions";

export const config = { matcher: ["/", "/future", "/examples", "/product-managers", "/agents", "/reference", "/about"] };

const TWINS: Record<string, string> = { "/": "/index.md", "/future": "/future.md", "/examples": "/examples.md", "/product-managers": "/product-managers.md", "/agents": "/agents.md", "/reference": "/reference.md", "/about": "/about.md" };

export default function middleware(request: Request) {
  const accept = request.headers.get("accept") ?? "";
  const { pathname } = new URL(request.url);
  const wantsMarkdown = /text\/markdown/i.test(accept) && !/text\/html/i.test(accept.split(/text\/markdown/i)[0] ?? "");
  const twin = TWINS[pathname];
  if (wantsMarkdown && twin) return rewrite(new URL(twin, request.url));
  return next();
}

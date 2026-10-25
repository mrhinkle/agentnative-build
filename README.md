# agentnative.build

A field guide to agent-native software: software designed so AI agents are first-class users. Published by Mark Hinkle as part of [The AIE Network](https://theaie.net). Live at https://agentnative.build.

The site practices what it teaches. One data file generates every representation of the content: HTML, Markdown, `llms.txt`, `llms-full.txt`, JSON-LD, a read-only MCP server, and WebMCP tools registered in the page.

## Stack

React 19, Vite, Tailwind 4, React Router 7, build-time SSR prerender, hosted on Vercel. The same pattern as theaie.net and allthingsai.org.

## How it works

| Path | What it is |
|---|---|
| `src/lib/data.ts` | All site content: pages, FAQs, scorecard, principles, sources. Never hardcode copy in a component. |
| `src/lib/markdown.ts` | Generates the Markdown twins, `llms.txt`, and `llms-full.txt` from the data |
| `src/lib/seo.ts` | Per-page head tags and JSON-LD |
| `src/lib/tools.ts` | Tool definitions shared by WebMCP and the MCP server |
| `src/lib/webmcp.ts` | Registers the tools through `navigator.modelContext` when the browser supports it |
| `server/mcp.ts` | Read-only remote MCP server, bundled to `api/mcp.js` at build time |
| `server/probe.ts` | `/api/probe`: checks a public https site for llms.txt, Markdown, OpenAPI or MCP, and structured errors. Bundled to `api/probe.js`. Strict about what it will fetch (see the file header) |
| `src/lib/score.ts` | Scorecard arithmetic shared by the page and the tools; result links are `/?r=` plus twelve y/n/x characters |
| `middleware.ts` | `Accept: text/markdown` content negotiation |
| `scripts/prerender.mjs` | Static HTML for every route, plus Markdown, `llms.txt`, and the sitemap |
| `scripts/validate-site.mjs` | Fails the build on SEO or content-rule violations |

`api/mcp.js` and `api/probe.js` are generated bundles. It is committed so Git-based deploys have the function; `pnpm build` regenerates it.

## Develop

```bash
pnpm install
pnpm dev        # Vite dev server
pnpm build      # bundle the MCP function, build, prerender, validate
```

## Adding or changing a page

1. Edit `src/lib/data.ts`: add a `PageMeta`, its blocks, and its FAQ.
2. Add the route in `src/App.tsx` and the page in `src/lib/seo.ts` (`PAGES`) and `src/lib/markdown.ts`.
3. Add the path to `PAGE_PATHS` in `src/lib/tools.ts` and to the routes in `scripts/validate-site.mjs`.
4. `pnpm build`. Validation checks title and description length, canonical URLs, one H1, JSON-LD, the FAQ schema against visible text, and banned words.

Editorial rules: sources are cited with dates, uncertainty is labeled, and products are scored with a strict rule (a yes only if the whole question is satisfied today). "Open source" is never hyphenated.

## Agent surfaces

`/llms.txt`, `/llms-full.txt`, a Markdown twin of every page, Markdown negotiation on the normal URLs, `/api/mcp` (JSON-RPC over HTTP, seven read-only tools), and WebMCP tools in the page. Details: https://agentnative.build/agents.

## Planning

`SEO-PLAN.md` holds the keyword research and the SEO and AEO strategy. Open work is tracked in the issues.

## License

Not yet specified. Until one is added, all rights are reserved.

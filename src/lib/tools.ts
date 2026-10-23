/**
 * tools.ts — the tool definitions shared by the WebMCP registration (browser) and the remote MCP
 * server (api/mcp.ts). Pure functions over data.ts; no DOM, no network.
 */
import { HOME_DEFINITION, PRINCIPLES, SCORE_QUESTIONS, SCORE_TIERS, SITE } from "./data";
import { markdownFor } from "./markdown";

export const PAGE_PATHS = ["/", "/future", "/examples", "/product-managers", "/agents", "/reference", "/about"];

/** An error an agent can act on: what failed, how to fix it, and whether a retry could succeed. */
export class ToolError extends Error {
  constructor(public code: string, message: string, public fix: string, public retryable = false) { super(message); }
}

export const errorResult = (e: unknown) => {
  const err = e instanceof ToolError ? e : new ToolError("internal_error", String((e as Error)?.message ?? e), "Retry once; if it persists, use /llms-full.txt instead.", true);
  const error = { code: err.code, message: err.message, fix: err.fix, retryable: err.retryable };
  return { content: [{ type: "text", text: JSON.stringify({ error }, null, 2) }], structuredContent: { error }, isError: true };
};

export interface ToolDef {
  name: string;
  title: string;
  description: string;
  inputSchema: Record<string, unknown>;
  run: (args: any) => unknown;
}

const STOP = new Set(["the", "a", "an", "of", "to", "and", "is", "in", "for", "on", "what", "how", "does", "do"]);

function search(query: string) {
  const terms = query.toLowerCase().split(/\W+/).filter((t) => t && !STOP.has(t));
  if (!terms.length) return [];
  const hits: { path: string; score: number; snippet: string }[] = [];
  for (const path of PAGE_PATHS) {
    for (const para of markdownFor(path).split(/\n{2,}/)) {
      const low = para.toLowerCase();
      const score = terms.reduce((n, t) => n + (low.includes(t) ? 1 : 0), 0);
      if (score > 0) hits.push({ path, score, snippet: para.replace(/\s+/g, " ").slice(0, 300) });
    }
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, 5);
}

export const TOOLS: ToolDef[] = [
  {
    name: "get_definition",
    title: "Get the definition of agent-native software",
    description: "Returns the one-paragraph definition of agent-native software used on this site.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    run: () => ({ definition: HOME_DEFINITION, url: SITE.url + "/" }),
  },
  {
    name: "list_principles",
    title: "List the eight agent-native design principles",
    description: "Returns the eight principles, each with a summary and a bolted-on versus native example.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    run: () => ({ principles: PRINCIPLES.map((p) => ({ name: p.title, summary: p.summary, detail: p.full, bolted_on: p.bolted, native: p.native })) }),
  },
  {
    name: "score_product",
    title: "Score a product against the 12-question agent-native scorecard",
    description: "Takes twelve booleans (true = yes, in scorecard order) and returns the score out of 12, the tier, advice, and the questions that were answered no.",
    inputSchema: {
      type: "object",
      properties: { answers: { type: "array", items: { type: "boolean" }, minItems: 12, maxItems: 12, description: "Twelve yes/no answers in scorecard order." } },
      required: ["answers"],
      additionalProperties: false,
    },
    run: ({ answers }: { answers: unknown }) => {
      if (!Array.isArray(answers) || answers.length !== SCORE_QUESTIONS.length || answers.some((a) => typeof a !== "boolean")) {
        throw new ToolError("invalid_answers", `answers must be an array of ${SCORE_QUESTIONS.length} booleans`, `Send exactly ${SCORE_QUESTIONS.length} true/false values in scorecard order (call get_page with path "/" to read the questions).`);
      }
      const score = (answers as boolean[]).filter(Boolean).length;
      const tier = SCORE_TIERS.find((t) => score <= t.max)!;
      return {
        score, out_of: SCORE_QUESTIONS.length, tier: tier.name, advice: tier.tip,
        gaps: SCORE_QUESTIONS.map((q, i) => ({ n: i + 1, question: q })).filter((_, i) => !(answers as boolean[])[i]),
        questions: SCORE_QUESTIONS,
      };
    },
  },
  {
    name: "get_page",
    title: "Get a page of this site as Markdown",
    description: "Returns the Markdown for one page. Valid paths: / , /future , /examples , /agents.",
    inputSchema: { type: "object", properties: { path: { type: "string", enum: PAGE_PATHS } }, required: ["path"], additionalProperties: false },
    run: ({ path }: { path: string }) => {
      if (!PAGE_PATHS.includes(path)) throw new ToolError("unknown_path", `No page at "${path}"`, "Use one of: " + PAGE_PATHS.join(", ") + ".");
      return { path, markdown: markdownFor(path) };
    },
  },
  {
    name: "search_site",
    title: "Search this site",
    description: "Keyword search across every page. Returns up to five matching passages with their page path.",
    inputSchema: { type: "object", properties: { query: { type: "string", minLength: 2 } }, required: ["query"], additionalProperties: false },
    run: ({ query }: { query: string }) => {
      if (typeof query !== "string" || query.trim().length < 2) throw new ToolError("query_too_short", "query must be a string of at least 2 characters", "Send a keyword or short phrase, for example \"idempotency\".");
      return { query, results: search(query) };
    },
  },
];

export const toolResult = (tool: ToolDef, args: unknown) => {
  const data = tool.run(args ?? {});
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }], structuredContent: data };
};

/**
 * tools.ts — the tool definitions shared by the WebMCP registration (browser) and the remote MCP
 * server (api/mcp.ts). Pure functions over data.ts; no DOM, no network.
 */
import { HOME_DEFINITION, PRINCIPLES, SCORE_CHECKS, SCORE_QUESTIONS, SITE } from "./data";
import { isAnswers, resultUrl, scoreAnswers } from "./score";
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
  run: (args: any) => unknown | Promise<unknown>;
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
    name: "get_scorecard",
    title: "Get the agent-native scorecard rubric",
    description: "Returns the twelve scorecard questions, how to verify each one in a codebase or running product, the fix for a miss, and the shape score_product expects. Read this first when you are asked to score a product.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    run: () => ({
      instructions: "For each question, inspect the product and answer true only if the whole question is satisfied today, false if not, null if it does not apply. Cite evidence per answer, then call score_product.",
      questions: SCORE_QUESTIONS.map((question, i) => ({ n: i + 1, question, principle: SCORE_CHECKS[i].principle, how_to_verify: SCORE_CHECKS[i].verify, fix_if_no: SCORE_CHECKS[i].fix })),
      submit: { tool: "score_product", arguments: { answers: "array of 12 values: true | false | null", evidence: "optional array of 12 strings, one per answer" } },
    }),
  },
  {
    name: "score_product",
    title: "Score a product against the 12-question agent-native scorecard",
    description: "Takes twelve answers in scorecard order (true = yes, false = no, null = does not apply) and optional evidence strings. Returns the score, tier, per-principle breakdown, the gaps with a fix for each, and a shareable result_url. Call get_scorecard first for how to verify each question.",
    inputSchema: {
      type: "object",
      properties: {
        answers: { type: "array", items: { type: ["boolean", "null"] }, minItems: 12, maxItems: 12, description: "Twelve answers in scorecard order: true, false, or null if the question does not apply." },
        evidence: { type: "array", items: { type: "string" }, maxItems: 12, description: "Optional. One short note per answer: a file path, URL, or command." },
      },
      required: ["answers"],
      additionalProperties: false,
    },
    run: ({ answers, evidence }: { answers: unknown; evidence?: unknown }) => {
      if (!isAnswers(answers)) {
        throw new ToolError("invalid_answers", `answers must be an array of ${SCORE_QUESTIONS.length} values, each true, false, or null`, `Send exactly ${SCORE_QUESTIONS.length} values in scorecard order. Call get_scorecard to read the questions.`);
      }
      if (evidence !== undefined && (!Array.isArray(evidence) || evidence.some((e) => typeof e !== "string"))) {
        throw new ToolError("invalid_evidence", "evidence must be an array of strings", "Send one short string per answer, or omit evidence.");
      }
      const result = scoreAnswers(answers);
      if (!result.applicable) throw new ToolError("nothing_to_score", "Every answer is null, so there is nothing to score", "Answer at least one question with true or false.");
      return { ...result, result_url: resultUrl(answers), evidence_received: Array.isArray(evidence) ? evidence.length : 0 };
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

export const toolResult = async (tool: ToolDef, args: unknown) => {
  const data = await tool.run(args ?? {});
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }], structuredContent: data };
};

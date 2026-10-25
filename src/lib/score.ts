/**
 * score.ts — scorecard arithmetic shared by the page, WebMCP, the MCP server, and the build.
 * Pure functions over data.ts; no DOM, no network.
 * An answer is true (yes), false (no), or null (does not apply, left out of the denominator).
 */
import { SCORE_CHECKS, SCORE_PRINCIPLES, SCORE_QUESTIONS, SCORE_TIERS, SITE } from "./data";

export type Answer = boolean | null;

export const isAnswers = (a: unknown): a is Answer[] =>
  Array.isArray(a) && a.length === SCORE_QUESTIONS.length && a.every((v) => v === true || v === false || v === null);

export function scoreAnswers(answers: Answer[]) {
  const applicable = answers.filter((a) => a !== null).length;
  const score = answers.filter((a) => a === true).length;
  const scaled = applicable ? Math.round((score / applicable) * SCORE_QUESTIONS.length) : 0;
  const tier = SCORE_TIERS.find((t) => scaled <= t.max)!;
  const principles = SCORE_PRINCIPLES.map((name) => {
    const idx = SCORE_CHECKS.flatMap((c, i) => (c.principle === name && answers[i] !== null ? [i] : []));
    return { name, yes: idx.filter((i) => answers[i] === true).length, total: idx.length };
  });
  const gaps = SCORE_QUESTIONS.flatMap((question, i) => (answers[i] === false ? [{ n: i + 1, question, principle: SCORE_CHECKS[i].principle, fix: SCORE_CHECKS[i].fix }] : []));
  return { score, applicable, out_of: SCORE_QUESTIONS.length, scaled, tier: tier.name, advice: tier.tip, principles, gaps };
}

/** y / n / x per question. Short enough to live in a URL, with no personal data in it. */
export const encodeAnswers = (a: Answer[]) => a.map((v) => (v === true ? "y" : v === false ? "n" : "x")).join("");

export function decodeAnswers(s: string | null | undefined): Answer[] | null {
  if (!s || !new RegExp(`^[ynx]{${SCORE_QUESTIONS.length}}$`).test(s)) return null;
  return [...s].map((c) => (c === "y" ? true : c === "n" ? false : null));
}

export const resultUrl = (a: Answer[]) => `${SITE.url}/?r=${encodeAnswers(a)}#score`;

/** The one-paste prompt that makes an agent run the scorecard against a product it can inspect. */
export function agentPrompt(): string {
  return [
    "Audit the product in this workspace against the Agent Native scorecard (" + SITE.url + "/scorecard.md).",
    "",
    "1. Fetch " + SITE.url + "/scorecard.json for the twelve questions and how to verify each one.",
    "2. For each question, inspect the code, docs, and running product. Answer true only if the whole question is satisfied today; false if not; null if it does not apply.",
    "3. Cite evidence for every answer: a file path and line, a URL, or a command and its output.",
    "4. Return one JSON object: {\"answers\": [12 values], \"evidence\": [12 strings]}.",
    "5. If you have the Agent Native MCP server (" + SITE.url + "/api/mcp), send that object to score_product and return its result_url.",
  ].join("\n");
}

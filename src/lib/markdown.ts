import {
  SITE, HOME, FUTURE, EXAMPLES, HOME_DEFINITION, HOME_DEFINITION_MORE, STAGES, PRINCIPLES, DEMO, ANATOMY,
  SNIPPETS, SCORE_QUESTIONS, SCORE_TIERS, AVOID, TIMELINE, HOME_FAQ, FUTURE_LEDE, FUTURE_BLOCKS, FUTURE_FAQ,
  FUTURE_SOURCES, FUTURE_SOURCES_NOTE, EXAMPLES_LEDE, PROJECTS, EXAMPLES_COMMON, EXAMPLES_FAQ,
  EXAMPLES_SCORE_BLOCKS, ABOUT, ABOUT_LEDE, ABOUT_BLOCKS, ABOUT_FAQ, AGENTS, AGENTS_LEDE, AGENTS_BLOCKS, AGENTS_FAQ, REFERENCE, REFERENCE_LEDE, REFERENCE_BLOCKS, REFERENCE_FAQ, REFERENCE_SOURCES, REFERENCE_SOURCES_NOTE, PMS, PMS_LEDE, PMS_BLOCKS, PMS_FAQ,
  AIOS_COMPANION, type Block, type Faq,
} from "./data";

const table = (head: string[], rows: string[][]) =>
  [`| ${head.join(" | ")} |`, `|${head.map(() => "---").join("|")}|`, ...rows.map((r) => `| ${r.join(" | ")} |`)].join("\n");

function blocksMd(blocks: Block[]): string {
  return blocks.map((b) => {
    switch (b.type) {
      case "h2": return `## ${b.text}`;
      case "h3": return `### ${b.text}`;
      case "answer": return `> ${b.text}`;
      case "p": return b.text;
      case "ol": return b.items.map((t, i) => `${i + 1}. ${t}`).join("\n");
      case "ul": return b.items.map((t) => `- ${t}`).join("\n");
      case "callout": return `> **${b.label}.** ${b.text}`;
      case "code": return (b.caption ? `*${b.caption}*\n\n` : "") + "```\n" + b.text + "\n```";
      case "table": return table(b.head, b.rows);
    }
  }).join("\n\n");
}

const faqMd = (faqs: Faq[]) => faqs.map((f) => `**${f.q}** ${f.a}`).join("\n\n");
const head = (title: string, path: string, desc: string) =>
  `# ${title}\n\n> ${desc}\n\nURL: ${SITE.url}${path} · By ${SITE.author} · Updated ${SITE.modified}\nMachine-readable index: ${SITE.url}/llms.txt`;

export function homeMd(): string {
  const s: string[] = [];
  s.push(head(HOME.title, "/", HOME_DEFINITION));
  s.push("## What does agent-native mean?\n\n" + HOME_DEFINITION_MORE.join("\n\n"));
  s.push("### Three stages\n\n" + table(STAGES.head.map((h, i) => (i === 0 ? "" : h)), STAGES.rows));
  s.push("## What are the principles of agent-native design?\n\n" + PRINCIPLES.map((p, i) => `${i + 1}. **${p.title}.** ${p.full}\n   - Bolted-on: ${p.bolted}\n   - Native: ${p.native}\n   - Ask your team: ${p.ask}`).join("\n"));
  s.push(`## Same task, three readers: "${DEMO.task}"\n\n` + DEMO.tabs.map((t) => `**${t.label}** (failure risk: ${t.risk}). ${t.verdict}\n` + t.steps.map((st, i) => `${i + 1}. ${st.t}${st.d ? ` (${st.d})` : ""}`).join("\n")).join("\n\n") + "\n\nIllustrative example, not a benchmark.");
  s.push("## What does an agent-native product look like?\n\n" + ANATOMY.map((a) => `${a.n}. **${a.name}**: ${a.text}`).join("\n") + "\n\nExample llms.txt:\n\n```\n" + SNIPPETS.llms + "\n```\n\nExample error an agent can act on:\n\n```json\n" + SNIPPETS.error + "\n```");
  s.push("## How agent-native is your product? A 12-question scorecard\n\nOne point per yes. " + SCORE_TIERS.map((t, i) => `${i === 0 ? 0 : SCORE_TIERS[i - 1].max + 1}-${t.max}: ${t.name}`).join("; ") + ".\n\n" + SCORE_QUESTIONS.map((q, i) => `${i + 1}. ${q}`).join("\n"));
  s.push(`## How this fits AIOS\n\nAIOS defines how people and organizations become AI-native. Agent Native defines how software becomes usable by agents. The product scorecard is used in [Appendix P of the AIOS book](${AIOS_COMPANION.bookAppendix}) as evidence for one named product surface; it is not a second maturity ladder or a certification. [Explore the AIOS operating model](${AIOS_COMPANION.operatingModel}).`);
  s.push("## Agent-washing: what to avoid\n\n" + AVOID.map((a) => `- **${a[0]}** ${a[1]}`).join("\n"));
  s.push("## How we got here\n\n" + TIMELINE.map((t) => `- **${t[0]}.** ${t[1]}`).join("\n"));
  s.push("## Go deeper\n\n- [The future of interfaces: MCP, MCP Apps, WebMCP, conversational UI](" + SITE.url + "/future)\n- [Agent-native product management: a guide for PMs](" + SITE.url + "/product-managers)\n- [Examples: ConferenceOS and Agent Kontrol, scored honestly](" + SITE.url + "/examples)");
  s.push("## Questions\n\n" + faqMd(HOME_FAQ));
  return s.join("\n\n") + "\n";
}

export function futureMd(): string {
  return [
    head(FUTURE.title, "/future", FUTURE_LEDE),
    blocksMd(FUTURE_BLOCKS),
    "## Frequently asked questions\n\n" + faqMd(FUTURE_FAQ),
    "## Sources\n\n" + FUTURE_SOURCES.map((s, i) => `${i + 1}. [${s.title}](${s.href}), ${s.publisher}`).join("\n") + "\n\n" + FUTURE_SOURCES_NOTE,
  ].join("\n\n") + "\n";
}

export function examplesMd(): string {
  return [
    head(EXAMPLES.title, "/examples", EXAMPLES_LEDE),
    ...PROJECTS.map((p) =>
      `## ${p.name}\n\n> ${p.answer}\n\nIn plain English: ${p.plain}\n\nLinks: ${p.links.map((l) => `[${l.label}](${l.href})`).join(" · ")}\n\n` +
      p.rows.map((r) => `- **${r[0]}:** ${r[1]}`).join("\n") +
      `\n\n### What a product manager should notice\n\n` + p.pm.map((t) => `- ${t}`).join("\n") +
      `\n\n### What is still open\n\n` + p.open.map((t) => `- ${t}`).join("\n")),
    blocksMd(EXAMPLES_SCORE_BLOCKS),
    "## What do the two have in common?\n\n" + EXAMPLES_COMMON.map((t, i) => `${i + 1}. ${t}`).join("\n") + "\n\nCompare your own product with the [12-question scorecard](" + SITE.url + "/#score), or read about [where interfaces are heading](" + SITE.url + "/future).",
    "## Frequently asked questions\n\n" + faqMd(EXAMPLES_FAQ),
  ].join("\n\n") + "\n";
}

export function aboutMd(): string {
  return [
    head(ABOUT.title, "/about", ABOUT_LEDE),
    blocksMd(ABOUT_BLOCKS),
    "## Frequently asked questions\n\n" + faqMd(ABOUT_FAQ),
    `Part of [${SITE.network.name}](${SITE.network.url}).`,
  ].join("\n\n") + "\n";
}

export function pmsMd(): string {
  return [
    head(PMS.title, "/product-managers", PMS_LEDE),
    blocksMd(PMS_BLOCKS),
    "## Frequently asked questions\n\n" + faqMd(PMS_FAQ),
  ].join("\n\n") + "\n";
}

export function agentsMd(): string {
  return [
    head(AGENTS.title, "/agents", AGENTS_LEDE),
    blocksMd(AGENTS_BLOCKS),
    "## Frequently asked questions\n\n" + faqMd(AGENTS_FAQ),
  ].join("\n\n") + "\n";
}

export function referenceMd(): string {
  return [
    head(REFERENCE.title, "/reference", REFERENCE_LEDE),
    blocksMd(REFERENCE_BLOCKS),
    "## Frequently asked questions\n\n" + faqMd(REFERENCE_FAQ),
    "## Sources\n\n" + REFERENCE_SOURCES.map((s, i) => `${i + 1}. [${s.title}](${s.href}), ${s.publisher}`).join("\n") + "\n\n" + REFERENCE_SOURCES_NOTE,
  ].join("\n\n") + "\n";
}

export function markdownFor(path: string): string {
  if (path === "/reference") return referenceMd();
  if (path === "/agents") return agentsMd();
  if (path === "/about") return aboutMd();
  if (path === "/product-managers") return pmsMd();
  if (path === "/future") return futureMd();
  if (path === "/examples") return examplesMd();
  return homeMd();
}

export function llmsTxt(): string {
  return `# ${SITE.name}
> What it means for software to be agent-native: designed so AI agents are first-class users. Definition, eight principles, a 12-question scorecard, the future of interfaces (MCP, MCP Apps, WebMCP, conversational UI), and real examples.

## Pages
- [What is agent-native software?](${SITE.url}/index.md): definition, principles, anatomy, scorecard, anti-patterns
- [The future of agent-native interfaces](${SITE.url}/future.md): MCP, MCP Apps, WebMCP, and conversational UI that complements forms
- [Agent-native examples](${SITE.url}/examples.md): ConferenceOS and Agent Kontrol, with strict scorecard results
- [Agent-native product management: a guide for PMs](${SITE.url}/product-managers.md): use cases, questions for engineering, metrics, roadmap, PRD checklist, glossary\n- [About Agent Native](${SITE.url}/about.md): who publishes it (part of The AIE Network, theaie.net) and how we source, score, and correct\n- [Reference: every agent-native technology](${SITE.url}/reference.md): llms.txt, MCP, MCP Apps, WebMCP, A2A, OpenAPI, scoped credentials, idempotency, with status and a check for each\n- [For agents](${SITE.url}/agents.md): every agent surface on this site (WebMCP, MCP server, llms-full.txt, Markdown negotiation)

## Optional
- [Full site as one file](${SITE.url}/llms-full.txt)
- [MCP server (JSON-RPC over HTTP)](${SITE.url}/api/mcp)
- [Sitemap](${SITE.url}/sitemap.xml)

## Related Field Guide
- [AIOS operating model](${AIOS_COMPANION.operatingModel}): how enterprises, professionals, and builders become organized around AI.
- [AIOS book and Appendix P](${AIOS_COMPANION.bookAppendix}): applies the Agent Native scorecard as product evidence inside the broader AIOS journey.

## Network
- [The AIE Network](${SITE.network.url}): newsletters, training, events, and field guides for professionals navigating the AI-native transition.
`;
}

export function llmsFullTxt(): string {
  const pages = ["/", "/future", "/examples", "/product-managers", "/agents", "/reference", "/about"];
  return `# ${SITE.name}: full site\n\n> The complete content of ${SITE.url} as one Markdown file. Index: ${SITE.url}/llms.txt\n\n` +
    pages.map((p) => markdownFor(p).trim()).join("\n\n---\n\n") + "\n";
}

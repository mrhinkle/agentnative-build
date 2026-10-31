/**
 * data.ts — single source of truth for agentnative.build
 *
 * Every page, the Markdown twins (/index.md, /future.md, /examples.md), llms.txt,
 * the sitemap and the JSON-LD are generated from this file. Never hardcode copy in
 * a page component. Inline text uses a tiny Markdown subset: **bold**, *em*, `code`,
 * [text](href).
 */

export const SITE = {
  name: "Agent Native",
  url: "https://agentnative.build",
  author: "Mark Hinkle",
  published: "2026-10-21",
  modified: "2026-10-24",
  tagline: "Software built for a new reader",
  network: { name: "The AIE Network", url: "https://theaie.net" },
};

export const CONSENT = {
  title: "Analytics, only if you say yes",
  body: "We'd like to use Google Analytics to count visits and see which pages help. It sets cookies, so it stays off unless you allow it. No ads, no selling data. Agents and readers who decline see the same site.",
  accept: "Allow",
  decline: "No thanks",
  link: "Cookie preferences",
};

export const AIOS_COMPANION = {
  operatingModel: "https://aios-site-pink.vercel.app/the-operating-model",
  bookAppendix: "https://aios-site-pink.vercel.app/book#agent-native-scorecard",
};

export const NAV_ITEMS = [
  { label: "Definition", href: "/" },
  { label: "Future", href: "/future" },
  { label: "Examples", href: "/examples" },
  { label: "For PMs", href: "/product-managers" },
  { label: "Reference", href: "/reference" },
  { label: "For agents", href: "/agents" },
  { label: "About", href: "/about" },
];

/* ───────────────────────── Types ───────────────────────── */

export type Block =
  | { type: "h2"; text: string; id?: string }
  | { type: "h3"; text: string }
  | { type: "answer"; text: string }
  | { type: "p"; text: string }
  | { type: "ol"; items: string[] }
  | { type: "ul"; items: string[] }
  | { type: "callout"; label: string; text: string }
  | { type: "code"; caption?: string; text: string }
  | { type: "table"; head: string[]; rows: string[][] };

export interface Faq { q: string; a: string }
export interface Source { title: string; publisher: string; href: string }

export interface PageMeta {
  path: string;
  title: string; // <60 chars
  description: string; // 150-160 chars
  label: string;
  h1: string;
  crumb?: string;
  md: string;
}

/* ───────────────────────── Home ───────────────────────── */

export const HOME: PageMeta = {
  path: "/",
  title: "What Is Agent-Native Software? Definition & Scorecard",
  description:
    "Agent-native software treats AI agents as first-class users. Learn the definition, eight design principles, and a 12-question scorecard to rate your product.",
  label: "A field guide",
  h1: "Agent-native: software for a new primary reader.",
  md: "/index.md",
};

export const HOME_DEFINITION =
  "Agent-native software is software designed so an AI agent is a first-class user: it can discover the product, understand it, act in it, be limited inside it, and verify what happened, without a human translating. It is not a chatbot bolted on, and not a scraper in disguise.";

export const HOME_DEFINITION_MORE = [
  "The human is still in the loop, but at the points that matter: approval, oversight, and outcomes. Not at every click.",
  "Cloud-native meant designing for the datacenter you actually run on. Mobile-native meant designing for a thumb and a small screen. Agent-native means designing for a reader that is fast, literal, tireless, token-limited, and has no eyes.",
];

export const STAGES = {
  head: ["", "Agent-bolted-on", "Agent-ready", "Agent-native"],
  rows: [
    ["Interface", "Chat widget over the same UI; agents drive a browser", "Public API, partial coverage", "Every capability is a tool, API, or CLI call; the UI is one client of many"],
    ["Docs", "PDFs, videos, marketing pages", "Human docs plus an OpenAPI file", "llms.txt, clean Markdown, schemas with examples, tool descriptions written for models"],
    ["Auth", "Shared human login, CAPTCHA", "API keys, coarse scopes", "Delegated, scoped, revocable agent identities with spend and rate limits"],
    ["Errors", "HTML pages, “something went wrong”", "JSON with a status code", "Code, cause, fix, and a retryable flag"],
    ["State changes", "Fire and hope", "Sometimes idempotent", "Idempotency keys, dry-run, receipts"],
    ["Verification", "Eyeball it", "Logs for engineers", "Queryable receipts; actor recorded as human or agent"],
  ],
};

export const PRINCIPLES = [
  { title: "Parity", ask: "Which of our five most common customer tasks cannot be done without the screen?", summary: "Anything a person can do, an agent can do.", full: "Anything a person can do in the UI, an agent can do through a stable interface. If the only way in is a button, the product is not agent-native.", bolted: "A “Refund” button with no endpoint behind it.", native: "Refund is a tool; the button calls the same tool." },
  { title: "Legibility", ask: "If an assistant had only our public docs, could it finish a task?", summary: "The product describes itself.", full: "Schemas, examples, and tool descriptions are written so a model can pick the right call without a human reading the docs first.", bolted: "Docs live in a video and a PDF. The agent guesses.", native: "Schemas, examples, and tool descriptions written for models, plus llms.txt." },
  { title: "Idempotent by default", ask: "If the same request arrives twice, does the customer get charged twice?", summary: "Agents retry. Make retries safe.", full: "Writes accept idempotency keys, costly actions offer dry-run, and side effects are stated up front.", bolted: "A timeout, a retry, and the customer is refunded twice.", native: "Idempotency key on every write; dry_run on costly calls." },
  { title: "Errors that teach", ask: "When something fails, does the message say what to do next?", summary: "A good error is the next prompt.", full: "Return a machine-readable code, the cause, a suggested fix, and whether a retry can succeed.", bolted: "“Something went wrong” in an HTML page.", native: "{code, cause, fix, retryable}. The agent corrects itself." },
  { title: "Scoped authority", ask: "Can we give an assistant less access than a person has?", summary: "Autonomy is granted in amounts.", full: "Least privilege, delegated tokens, spend caps, and human approval gates for irreversible actions.", bolted: "The agent borrows the owner’s full-power login.", native: "Per-agent identity, narrow scopes, spend caps, approval on irreversible actions." },
  { title: "Verifiable", ask: "For any action, can we show who did it and what happened?", summary: "Every action leaves evidence.", full: "Every action returns a receipt and lands in an audit log. Agents can check their own work, and humans can check the agents.", bolted: "No record of who or what clicked the button.", native: "A receipt per action and an audit log that records human vs agent." },
  { title: "Context-thrifty", ask: "Does a simple question get a short answer, or a data dump?", summary: "Tokens are the new bandwidth.", full: "Support pagination, field selection, and concise formats. Prefer Markdown to markup soup.", bolted: "A 4,000-row response and 90% markup.", native: "Pagination, field selection, Markdown, and summaries on request." },
  { title: "Composable", ask: "Can small pieces be combined, or is there one big workflow?", summary: "Small primitives beat grand platforms.", full: "Small primitives with text in and text out (CLIs, files, narrow tools) that agents can chain in ways you did not plan for.", bolted: "One monolithic “do everything” endpoint.", native: "Narrow tools and CLIs with text in, text out, ready to chain." },
];

export const DEMO = {
  task: "refund order #1042",
  tabs: [
    { key: "human", label: "A person", risk: "Low", verdict: "Works, because the UI was built for eyes and a mouse.", steps: [
      { t: "Log in" }, { t: "Search orders", d: "type “1042”" }, { t: "Open order #1042" }, { t: "Click Refund" },
      { t: "Choose a reason", d: "dropdown" }, { t: "Confirm amount" }, { t: "Confirm again", d: "modal" } ] },
    { key: "bolted", label: "Bolted-on agent", risk: "High", verdict: "Sometimes works. Nobody can say whether it refunded twice.", steps: [
      { t: "Screenshot the login page" }, { t: "Guess the password field selector" }, { t: "Dismiss cookie banner" },
      { t: "CAPTCHA: verify you are human", d: "blocked", tone: "bad" }, { t: "Retry from the top" },
      { t: "Parse the HTML orders table", d: "column order changed" }, { t: "Click Refund", d: "modal not found", tone: "bad" },
      { t: "Retry click", d: "unknown: did it fire twice?", tone: "bad" } ] },
    { key: "native", label: "Agent-native", risk: "Low", verdict: "Deterministic, previewed, retry-safe, and verified.", steps: [
      { t: "Read tool schema", d: "refund_order(order_id, amount, reason, dry_run, idempotency_key)", tone: "good" },
      { t: "refund_order(dry_run: true)", d: "preview: refund 80.00 to card ••4242", tone: "good" },
      { t: "refund_order(idempotency_key: \"a1f9…\")", d: "receipt: {refund_id: \"rf_77\", status: \"succeeded\"}", tone: "good" },
      { t: "get_refund(\"rf_77\")", d: "verified: succeeded, actor: agent", tone: "good" } ] },
  ],
};

export const ANATOMY = [
  { n: "1", name: "Discover", text: "llms.txt · AGENTS.md · Markdown pages · clean sitemap" },
  { n: "2", name: "Describe", text: "OpenAPI · JSON Schema · MCP tool definitions written for models" },
  { n: "3", name: "Act", text: "API · CLI · MCP server · packaged skills, with UI parity" },
  { n: "4", name: "Authorize", text: "Narrow scopes · per-agent identity · spend limits · approval gates" },
  { n: "5", name: "Verify", text: "Receipts · audit log · actor attribution · evals in CI" },
];

export const SNIPPETS = {
  llms: `# Acme Payments
> Payments API. Refunds, charges, disputes.
> Start with /docs/quickstart.md

## Docs
- [Quickstart](/docs/quickstart.md): first charge in 5 calls
- [Errors](/docs/errors.md): every code and its fix

## Optional
- [Changelog](/changelog.md)`,
  error: `{
  "error": {
    "code": "refund_exceeds_balance",
    "message": "Refund 120.00 exceeds refundable 80.00.",
    "fix": "Retry with amount <= 80.00.",
    "retryable": false
  }
}`,
};

export const SCORE_QUESTIONS = [
  "Everything a user can do in the UI is available through an API, CLI, or tool interface.",
  "Interfaces are described machine-readably (OpenAPI, JSON Schema, MCP).",
  "There is an llms.txt or equivalent, and docs are available as clean Markdown.",
  "Write operations accept idempotency keys.",
  "Destructive or costly actions support dry-run or preview.",
  "Errors are structured, with a code, cause, and suggested fix.",
  "Agents can get scoped credentials without a human clicking through each session.",
  "Spend, rate, and permission limits can be set per agent identity.",
  "Every action returns a receipt or lands in an audit log an agent can query.",
  "Responses support pagination, field selection, and concise formats.",
  "You can tell whether a human or an agent performed an action.",
  "Agents are tested against the product (evals or CI), not just humans.",
];

export const SCORE_TIERS = [
  { max: 3, name: "Agent-hostile", tip: "Agents will scrape and break. Start with parity: expose your top workflow as an API." },
  { max: 6, name: "Agent-tolerant", tip: "Agents can limp through. Add machine-readable descriptions and structured errors next." },
  { max: 9, name: "Agent-ready", tip: "Good bones. Close the gaps in authority and verification: scopes, limits, receipts." },
  { max: 12, name: "Agent-native", tip: "Agents are first-class users. Keep testing with real agents and watch the logs." },
];

/** One entry per SCORE_QUESTIONS item, in order: the principle it measures, how an agent verifies it, and the fix for a miss. */
export const SCORE_CHECKS: { principle: string; verify: string; fix: string }[] = [
  { principle: "Parity", verify: "List the five most common user tasks. For each, find the API route, CLI command, or tool that does it without the UI. Yes only if all five exist.", fix: "Expose your top workflow as an API or tool, then make the button call it." },
  { principle: "Legibility", verify: "Find an OpenAPI file, JSON Schema, or MCP tool list that covers the main workflows, and check that descriptions say when to use each call.", fix: "Publish an OpenAPI spec or MCP tool list with model-readable descriptions." },
  { principle: "Legibility", verify: "Fetch /llms.txt and confirm it links to docs that load as Markdown without JavaScript.", fix: "Add /llms.txt and serve every docs page as Markdown." },
  { principle: "Idempotent by default", verify: "Search write endpoints for an Idempotency-Key header or equivalent, and check that a repeated request returns the first result.", fix: "Accept an idempotency key on every write." },
  { principle: "Idempotent by default", verify: "Find a dry_run, preview, or plan mode on delete, refund, send, and billing actions.", fix: "Add dry_run to destructive and costly calls." },
  { principle: "Errors that teach", verify: "Trigger three failures (bad input, missing record, no permission). Yes only if each returns JSON with a code, a cause, and a suggested fix.", fix: "Return {code, cause, fix, retryable} instead of an HTML page or a bare message." },
  { principle: "Scoped authority", verify: "Find a way to mint a scoped, expiring credential for an agent without a person clicking through each session.", fix: "Add delegated or service tokens with narrow scopes." },
  { principle: "Scoped authority", verify: "Find per-agent spend, rate, or permission limits that an admin can set and that are enforced server-side.", fix: "Add per-identity limits and an approval gate for irreversible actions." },
  { principle: "Verifiable", verify: "Run one write action and confirm it returns a receipt or an audit entry that an agent can query afterward.", fix: "Return a receipt per action and expose the audit log through the same interface." },
  { principle: "Context-thrifty", verify: "Call a list endpoint and check for pagination, field selection, and a concise or Markdown response option.", fix: "Add pagination, a fields parameter, and a concise format." },
  { principle: "Verifiable", verify: "Find an actor or source field on audit records that separates a human from an agent.", fix: "Record actor type on every action." },
  { principle: "Verifiable", verify: "Find evals, CI jobs, or scripted agent runs that exercise the product's tools and fail the build on regression.", fix: "Add a small eval suite that runs an agent through your top five tasks." },
];

export const SCORE_PRINCIPLES = ["Parity", "Legibility", "Idempotent by default", "Errors that teach", "Scoped authority", "Verifiable", "Context-thrifty"];

export const AVOID = [
  ["The corner chatbot", "that no other agent can call."],
  ["CAPTCHA walls", "in front of a legitimate workflow with no API behind them."],
  ["Docs as PDFs or video,", "or pages that only exist after JavaScript runs."],
  ["Errors as HTML", "pages."],
  ["OAuth that needs a human click", "on every call."],
  ["Infinite scroll", "as the only way to get a list."],
  ["The human’s full-power login", "handed to the agent “to keep it simple”."],
];

export const TIMELINE = [
  ["2023", "Function calling and plugins let models call developer-defined tools."],
  ["2024", "llms.txt is proposed as a model-readable site index; Anthropic introduces the Model Context Protocol."],
  ["2025", "AGENTS.md and agent skills spread as ways to hand agents project and procedural context; coding agents make “agent as user” routine."],
  ["Now", "Products get judged on how well agents can use them, not just people."],
];

export const HOME_FAQ: Faq[] = [
  { q: "Is agent-native just having an API?", a: "An API is necessary, not sufficient. Agent-native adds self-description, safe retries, teaching errors, scoped delegated authority, and verification." },
  { q: "Do humans get worse software when it is agent-native?", a: "No. Clear errors, undo, audit trails, and least privilege make products better for people too." },
  { q: "What is the difference between agent-native and AI-native?", a: "AI-native describes a company, team, or person whose work is organized around AI. The AIOS operating model applies that idea to enterprises, professionals, and builders. Agent-native answers a different question about a different subject: whether software can be discovered, understood, operated safely, and verified by AI agents. A product can be agent-native whether or not the organization that built it is AI-native." },
  { q: "Where do I start making a product agent-native?", a: "Take the scorecard, pick the lowest-scoring principle, and fix it for your single most-used workflow." },
];

/* ───────────────────────── Future ───────────────────────── */

export const FUTURE: PageMeta = {
  path: "/future",
  title: "MCP, MCP Apps, WebMCP & Conversational UI: What's Next",
  description:
    "How MCP, MCP Apps, and WebMCP change interfaces, and how to add conversational UI that complements forms instead of replacing them. Sourced and dated.",
  label: "The future",
  h1: "MCP, WebMCP, and conversational interfaces: what comes next",
  crumb: "The future of interfaces",
  md: "/future.md",
};

export const FUTURE_LEDE =
  "Interfaces are splitting into three layers that share one set of tools. MCP exposes capabilities to agents, MCP Apps lets those agents summon real UI inside a conversation, and WebMCP lets a web page offer tools to the browser’s agent. Conversation becomes the front door. Forms do not disappear; they become the place you review and commit.";

export const FUTURE_BLOCKS: Block[] = [
  { type: "h2", text: "What is MCP, and why does it matter for agent-native software?" },
  { type: "answer", text: "The Model Context Protocol (MCP) is an open protocol for connecting AI applications to tools and data. Build your product’s capabilities once as MCP tools and any compatible agent can use them." },
  { type: "callout", label: "In plain English", text: "MCP is a standard plug between AI assistants and your product. Build the plug once and any assistant that supports the standard can use your product, instead of building a separate integration for each assistant." },
  { type: "p", text: "Anthropic introduced MCP in November 2024 and donated it to the Linux Foundation’s Agentic AI Foundation on December 9, 2025, so it now has vendor-neutral governance [[6]](#src-6). The published 2026-07-28 specification describes stateless, self-contained requests with per-request capability negotiation, and lists Tasks, Skills over MCP, and MCP Apps as optional extensions [[1]](#src-1). The release post adds a formal extensions framework and hardened authorization [[2]](#src-2)." },
  { type: "p", text: "For product teams, MCP is the “Act” layer in the [anatomy of an agent-native product](/#anatomy). It is where parity, scoped authority, and receipts get implemented." },

  { type: "h2", text: "What are MCP Apps?" },
  { type: "answer", text: "MCP Apps is the first official extension to MCP. A tool can return an interactive HTML interface, declared ahead of time, which the host renders in a sandboxed iframe inside the chat [[3]](#src-3)." },
  { type: "callout", label: "In plain English", text: "Instead of replying only with text, the assistant can show a small screen from your product inside the chat: a date picker, a chart, a confirm button. People get a real interface exactly when a sentence is not enough." },
  { type: "p", text: "It went live on January 26, 2026, and the announcement names Claude, ChatGPT, Goose, and Visual Studio Code among supporting clients [[3]](#src-3); coverage varies by client. This is what makes conversation *functional*: the agent can ask for a date range in plain language, then show a real picker, a diff, a chart, or an approval card when precision matters." },
  { type: "callout", label: "Why it matters", text: "Before MCP Apps, a conversational product had two weak options: make the user type everything, or send them to another tab. Now the interface can arrive inside the conversation, exactly when it is needed." },

  { type: "h2", text: "What is WebMCP?" },
  { type: "answer", text: "WebMCP is a proposed browser API that lets a web page expose JavaScript functions as tools to AI agents. It is a Draft Community Group Report from the W3C Web Machine Learning Community Group, authored by people at Google and Microsoft. It is not a finished standard [[4]](#src-4)." },
  { type: "callout", label: "In plain English", text: "A website can tell the browser’s built-in assistant what it can do on that page, so the assistant does not have to guess where to click. It is still a draft proposal, so treat it as something to watch and prototype, not something to depend on." },
  { type: "p", text: "The proposal describes an *imperative* API, where the page registers tools in JavaScript, and a *declarative* approach for standard actions defined in HTML forms. Tools run in the page, in the user’s own session, and the browser mediates consent [[4]](#src-4). Secondary reports say Chrome began an early preview in February 2026; support in other browsers is unconfirmed." },
  { type: "callout", label: "Try it here", text: "This site registers its own WebMCP tools when your browser supports the API, and also runs a remote MCP server. See [every agent surface on this site](/agents)." },
  { type: "code", caption: "Illustrative, based on the proposal. Naming has shifted between drafts: check the current spec before building.", text: `navigator.modelContext.registerTool({
  name: "add-to-schedule",
  description: "Add a session to the attendee's personal schedule",
  inputSchema: {
    type: "object",
    properties: { sessionId: { type: "string" } },
    required: ["sessionId"]
  },
  async execute({ sessionId }, agent) {
    await agent.requestUserInteraction(() => confirmDialog(sessionId));
    return { content: [{ type: "text", text: "Added " + sessionId }] };
  }
});` },

  { type: "h3", text: "MCP, MCP Apps, WebMCP, and the rest: which is which?" },
  { type: "table", head: ["Layer", "Runs where", "What it does", "Status"], rows: [
    ["llms.txt", "A file on your site", "Indexes your content for models", "Community convention"],
    ["OpenAPI / JSON Schema", "Your API", "Describes endpoints and shapes", "Mature"],
    ["MCP", "A server you run", "Exposes tools, resources, prompts to any agent", "Open spec; Linux Foundation"],
    ["MCP Apps", "Inside the AI client", "Returns interactive UI from a tool", "Official extension"],
    ["WebMCP", "Inside the web page", "Page offers tools to the browser agent, using the user’s session", "Draft proposal"],
  ] },
  { type: "p", text: "They are complements. A server-side MCP tool works when no browser is open. A WebMCP tool works because the user is already signed in and looking at the page. Many products will want both, backed by the same business logic." },

  { type: "h2", text: "Will conversational interfaces replace forms?" },
  { type: "answer", text: "No. Conversation is best for stating intent and exploring options. Structured UI is best for review, precision, and commitment. Design the conversation as an additional front door, with the form still there as the place to verify and the fallback when talking is slower." },
  { type: "p", text: "Forms are not a failure mode; they are compressed knowledge about what a system needs. A conversational layer that discards that knowledge produces ambiguity, so the better pattern is to use conversation to *fill in* the structure." },

  { type: "h2", text: "How do you make a conversational interface functional, not just chatty?" },
  { type: "answer", text: "Put the same tools under both the chat and the UI, have the agent produce a structured proposal, and require a visible confirmation before anything irreversible. These six patterns are design guidance, not a standard." },
  { type: "callout", label: "For product managers", text: "The decision to make is which tasks start in conversation and which stay in a form. A good rule: let people *describe* a task in conversation, but have them *approve* anything costly or irreversible on a screen. The [product manager guide](/product-managers) has a prioritization table for this." },
  { type: "ol", items: [
    "**One set of tools.** The chat, the buttons, and any outside agent all call the same operations. If the chat can do something the UI cannot (or the reverse), you have two products.",
    "**Intent in, proposal out.** The user says “move the keynote to Thursday.” The agent returns a typed change set (what, where, what it affects), not a paragraph.",
    "**Chat plans, UI commits.** Render the proposal as an approval card with a diff. The user confirms with a click. This is where MCP Apps earns its keep.",
    "**Dry-run before write.** Every costly or destructive tool supports preview, so the proposal is real, not a guess.",
    "**Keep the escape hatch.** Every conversational flow links to the equivalent form with fields pre-filled. Power users and edge cases need it.",
    "**Receipts and undo.** After the action, show what happened, who did it (human or agent), and how to reverse it.",
  ] },

  { type: "h2", text: "What should you do this quarter?" },
  { type: "ol", items: [
    "Publish `/llms.txt` and Markdown versions of your key docs.",
    "Expose your single most-used workflow as an MCP tool with a schema, dry-run, and idempotency key.",
    "Add structured errors and receipts to that workflow.",
    "Add one approval card via MCP Apps for the riskiest action.",
    "Prototype WebMCP behind a flag on one page, and treat it as an experiment.",
    "Test with real agents. Watch where they fail, and fix the interface, not the prompt.",
  ] },
  { type: "p", text: "See how we apply this in the [shipped examples](/examples), then [score your own product](/#score)." },

  { type: "h2", text: "What is still uncertain?" },
  { type: "ul", items: [
    "**WebMCP’s API surface.** Secondary sources disagree on whether the entry point is `navigator.modelContext` or a document-level property, and the official proposal page uses an older shape. Check the spec.",
    "**Browser support.** Chrome’s preview is reported; Firefox and Safari commitments are not confirmed in the sources we found.",
    "**MCP Apps host coverage.** Support varies by client and is changing quickly.",
    "**Standards drift.** MCP’s 2026-07-28 release deprecates Roots, Sampling, and Logging (deprecated, not removed) [[2]](#src-2). Build against the current spec, not a blog post.",
  ] },
];

export const FUTURE_FAQ: Faq[] = [
  { q: "What is MCP?", a: "The Model Context Protocol is an open protocol for connecting AI applications to tools and data. Anthropic introduced it in November 2024 and donated it to the Linux Foundation’s Agentic AI Foundation in December 2025." },
  { q: "What are MCP Apps?", a: "MCP Apps is the first official MCP extension. It lets a tool return an interactive HTML interface that the host, such as Claude or ChatGPT, renders in a sandboxed frame inside the conversation." },
  { q: "What is WebMCP?", a: "WebMCP is a proposed browser API that lets a web page expose JavaScript functions as tools for AI agents. It is a draft from the W3C Web Machine Learning Community Group, not a finished standard." },
  { q: "Will conversational interfaces replace forms?", a: "No. Conversation is best for stating intent and exploring options. Structured interfaces are best for review, precision, and commitment. The strongest products use both over the same underlying tools." },
];

export const FUTURE_SOURCES: Source[] = [
  { title: "Model Context Protocol Specification, version 2026-07-28", publisher: "modelcontextprotocol.io", href: "https://modelcontextprotocol.io/specification/2026-07-28" },
  { title: "The 2026-07-28 MCP Specification Release Candidate", publisher: "Model Context Protocol blog", href: "https://blog.modelcontextprotocol.io/posts/2026-07-28-release-candidate/" },
  { title: "MCP Apps: bringing UI capabilities to MCP clients (2026-01-26)", publisher: "Model Context Protocol blog", href: "https://blog.modelcontextprotocol.io/posts/2026-01-26-mcp-apps/" },
  { title: "WebMCP API Proposal", publisher: "W3C Web Machine Learning Community Group", href: "https://webmachinelearning.github.io/webmcp/docs/proposal.html" },
  { title: "WebMCP Technical Notes", publisher: "W3C Community Group", href: "https://w3c-cg.github.io/aikr/webMCP/webmcp-technical-notes.html" },
  { title: "Model Context Protocol (governance timeline)", publisher: "Wikipedia", href: "https://en.wikipedia.org/wiki/Model_Context_Protocol" },
];

export const FUTURE_SOURCES_NOTE =
  "Dates and status reflect sources read on 2026-10-21. The MCP and MCP Apps claims were checked against the primary pages above. Chrome’s WebMCP preview comes from secondary reports. Verify details before relying on them.";

/* ───────────────────────── Examples ───────────────────────── */

export const EXAMPLES: PageMeta = {
  path: "/examples",
  title: "Agent-Native Examples: ConferenceOS and Agent Kontrol",
  description:
    "Two real products built for AI agents as users: ConferenceOS for running events and Agent Kontrol for supervising AI agents. What works, and what is still open.",
  label: "Examples",
  h1: "Agent-native in practice: ConferenceOS and Agent Kontrol",
  crumb: "Examples",
  md: "/examples.md",
};

export const EXAMPLES_LEDE =
  "Two real products, described by what they do, how they keep agents under control, and what a product manager can borrow. ConferenceOS is software that agents operate on behalf of event teams. Agent Kontrol is software for supervising the agents themselves. We build both, so treat this as a first-party account, not an independent review.";

export interface Project {
  name: string;
  kicker: string;
  answer: string;
  plain: string;
  links: { label: string; href: string }[];
  rows: [string, string][];
  pm: string[];
  open: string[];
}

export const PROJECTS: Project[] = [
  {
    name: "ConferenceOS: conference software that agents can operate",
    kicker: "Example 1 · A product agents operate",
    answer: "ConferenceOS is an all-in-one platform for running conferences, built so authorized AI agents can work inside it under the same roles and approvals as staff. Event teams hand off plain-language requests and keep control of anything sensitive.",
    plain: "Think of the agent as a new staff member with a badge. The badge decides what doors open, and the product asks a human before anything big happens.",
    links: [{ label: "conferenceos.io", href: "https://conferenceos.io" }],
    rows: [
      ["What it is", "A platform for the whole event lifecycle: call for papers, scheduling, ticketing, check-in, communications, sponsorships, reporting, and the public event site. One installation can run several events."],
      ["Who the agent is", "An authorized assistant working for an event team. It connects with a key tied to a role, the same way a staff member signs in with a role."],
      ["What an agent can do", "The server exposes 57 tools: 26 for reading and 31 for writing. Any authenticated key can read event details, sessions, speakers, venue, sponsors, and FAQs, and check whether one email address is registered. Keys with a writing role can also edit speaker fields, change a call-for-papers decision (which may email the speaker), update event settings, create or edit sessions, and add FAQ answers."],
      ["How it stays safe", "A key with no role is read-only. Each key is limited to one event, with its own role and expiry. Changes to sponsor records, expenses, and policies preview by default. Core edits such as event settings and call-for-papers decisions do not preview. System-level tools need a special admin key, and a signed-in person cannot use them. Every call is written to an audit log."],
      ["How an agent learns what it may do", "It asks the server for its tool list, which contains only what that key’s role allows, so the agent never sees buttons it cannot press. The app also serves an OpenAPI 3.1 description and a tool manifest for machines."],
      ["Ready-made workflows", "Organizer playbooks packaged as agent skills: run the call for papers, draft a schedule, run the launch checklist. Each one starts in preview mode."],
      ["Example requests", "“Is jordan@example.com registered?” · “Which 2025 sponsors have not renewed for 2026?” · “Build a schedule draft for accepted talks, preview only.”"],
      ["Attendee side", "Event sites include an AI chat that answers attendee questions from a knowledge base the organizer edits."],
    ],
    pm: [
      "**The role is the permission model.** Agent access reuses the roles the product already had instead of inventing a separate system. That made the safe default (read-only) simple to explain to customers.",
      "**Preview before commit is a product decision.** Someone had to decide which changes preview by default. It was applied to sponsor, expense, and policy records, and not yet to core event edits, which is exactly the kind of gap a PM should look for.",
      "**Agents discover capabilities at runtime.** Adding a capability does not require re-teaching every assistant, because the tool list updates with the role.",
      "**Expertise became a reusable workflow.** Packaging “how to run a call for papers” as a skill turned the team’s know-how into something an assistant can follow.",
    ],
    open: [
      "Agents cover a fraction of what organizers do in the interface. Ticketing, discount codes, messaging, volunteers, and user administration have no agent tools yet, and check-in is available only through the REST API.",
      "The README still says write operations are “in development” even though 31 write tools exist. The documentation is behind the product.",
      "A sponsor team calendar driven by a chat planner is an idea on the backlog, not something that exists. Sponsor teams still coordinate rooms and shifts over texts and spreadsheets.",
    ],
  },
  {
    name: "Agent Kontrol: a control room for your AI agents",
    kicker: "Example 2 · A product for supervising agents",
    answer: "Agent Kontrol is an open source control room for the AI coding agents you run, such as Claude Code, Codex, Grok, and Hermes. It shows what each is doing, lets you queue work for them, and checks whether the backlog is actually shrinking.",
    plain: "If agents are the new workforce, this is the manager’s dashboard: who is working on what, what is stuck, and what needs a person right now.",
    links: [
      { label: "GitHub repository", href: "https://github.com/mrhinkle/agent-kontrol" },
      { label: "MCP documentation", href: "https://github.com/mrhinkle/agent-kontrol/blob/main/docs/MCP.md" },
    ],
    rows: [
      ["What it is", "One dashboard for a fleet of agents across machines and vendors: live status, a task queue, a progress board, messaging, traces, and shared notes."],
      ["Who the users are", "Two kinds. Agents are the primary users: they report their status in and pick up tasks. People supervise: they watch the dashboard, answer messages, and decide what needs attention."],
      ["How agents connect", "Through lifecycle hooks, watchers, and an MCP server with eleven tools: report status, read the fleet, check the inbox, reply to the operator, create and claim tasks, and save and recall notes."],
      ["How it stays safe", "The agent endpoint refuses unauthenticated requests and points compatible clients to a standard sign-in flow (OAuth with PKCE), where a person approves with the dashboard password. Command-line agents use one shared bearer token. Credentials are not issued per agent, and permission scopes are not enforced yet."],
      ["How it stays honest", "Status comes from automatic hooks and watchers, not from agents remembering to report. The progress board counts net backlog (issues opened minus closed), because a day full of merges can still leave the backlog deeper."],
      ["A stable promise", "The eleven tool names are part of the public API and will not change within version 1.x. One deprecated alias is also still accepted."],
      ["Where it runs", "Self-hosted with Docker, Vercel and Postgres, Fly.io, or any Node host. Currently 1.0 beta under the Apache 2.0 license."],
    ],
    pm: [
      "**Name your user honestly.** Agents are the primary users, so the product is built around what they need: a stable report format, a task to claim, and a way to ask a human a question.",
      "**Design the human’s job as supervision, not operation.** The screen answers “what needs me right now?” instead of showing everything.",
      "**Measure the outcome, not the activity.** Net backlog replaced “merges today” because activity can hide a growing pile.",
      "**Promise a stable interface.** Freezing the tool names for the 1.x line is a roadmap commitment that other people can build on.",
    ],
    open: [
      "Agents are not individually identified. The server cannot tell which agent, or whether a person or an agent, made a change, and there is no per-agent limit or revocation.",
      "Operators can do some things only through the REST API, not the agent interface: change watched repositories, send a message to an agent, and requeue a task.",
      "Usage and cost reporting is labeled experimental.",
      "No vendor offers a “what are my agents doing” API, so every agent has to report in, and coverage depends on each adapter.",
      "The product is in beta: the interface is meant to stay stable, but it is still maturing.",
    ],
  },
];

export const EXAMPLES_SCORE_BLOCKS: Block[] = [
  { type: "h2", text: "How do the two products score on the twelve-question scorecard?" },
  { type: "answer", text: "Neither scores high, and that is the useful part. Both were built with agents in mind, but a strict read-only audit of each codebase on 2026-10-22 (a yes only if the whole question is satisfied today) gave ConferenceOS 1 yes, 8 partial, and 3 no, and Agent Kontrol 0 yes, 7 partial, and 5 no." },
  { type: "p", text: "The scores come from an automated code audit with file-level evidence, not from a customer test, and we build both products. Read them as a to-do list, not a rating. The same scorecard on this site’s own pages is on the [for agents page](/agents)." },
  { type: "table", head: ["#", "Question", "ConferenceOS", "Agent Kontrol"], rows: [
    ["1", "Everything in the UI is available to agents", "Partial: 57 tools, but ticketing, messaging, and volunteers are not covered", "Partial: nearly everything over REST, about half over the agent interface"],
    ["2", "Described machine-readably", "Yes: OpenAPI 3.1 and tool schemas", "Partial: tool schemas, but no OpenAPI for REST"],
    ["3", "llms.txt and Markdown docs", "No", "No"],
    ["4", "Idempotency keys on writes", "No: only on payment webhooks", "Partial: notes are safe to repeat, but task creation duplicates on retry"],
    ["5", "Preview for costly actions", "Partial: sponsor, expense, and policy changes preview; core edits do not", "No"],
    ["6", "Structured errors with a fix", "Partial: stable error codes, but no fix or cause", "No: mostly a bare message"],
    ["7", "Scoped credentials without a human click", "Partial: per-key role and scope, but the first admin key and OAuth approval need a person", "Partial: OAuth works, but a person enters a password each time, and scopes are not enforced"],
    ["8", "Per-agent limits", "Partial: per-key role and expiry, a fixed rate limit, no spend limit", "No"],
    ["9", "Receipts or a queryable audit log", "Partial: every call is logged, but no receipt and no way for an agent to query it", "Partial: short text receipts and recent events, no audit endpoint"],
    ["10", "Pagination and concise formats", "Partial: paging on REST, no field selection", "Partial: limits and a trace cursor, no field selection"],
    ["11", "Human versus agent recorded", "Partial: distinguishes a person from an API key, but agents appear as keys", "Partial: a free-text field the caller fills in"],
    ["12", "Agents tested against the product", "No: unit tests with mocks", "No: the MCP test only checks tool names"],
  ] },
  { type: "p", text: "The pattern is the same in both. Each is strong on the safety half (roles, previews, authentication, audit trails) and weaker on the machine-friendliness half (llms.txt, idempotency keys, errors that say how to fix the problem, receipts)." },
  { type: "callout", label: "The biggest gap in each", text: "ConferenceOS: an audit trail an agent can query, with a receipt for every write, so an agent can verify what it did and retry safely. Agent Kontrol: a separate identity for each agent, with enforced permissions and a record of which actor made each change." },
];

export const EXAMPLES_COMMON = [
  "**Agents are users from day one,** not added after launch.",
  "**Authority is scoped,** and humans keep the irreversible decisions. Both are stronger here than on machine-friendliness.",
  "**Every capability is discoverable by the agent itself,** not described in a separate manual.",
  "**Conversation sits on top of structure,** never instead of it.",
];

export const EXAMPLES_FAQ: Faq[] = [
  { q: "What is an example of an agent-native product?", a: "ConferenceOS is a conference management platform where authorized AI agents work under staff roles, with previews for some changes and an audit log for every call. Agent Kontrol is a control room for supervising a fleet of AI agents. Neither is a perfect example: strict scoring found gaps in both, and we publish them." },
  { q: "What is Agent Kontrol?", a: "Agent Kontrol is an open source control room for the AI coding agents you run. It shows what each agent is doing, queues work for them, and tracks whether the backlog is shrinking. It has an MCP server with eleven tools and is in 1.0 beta under the Apache 2.0 license. Its code audit scored 0 yes, 7 partial, and 5 no on the agent-native scorecard." },
  { q: "How does ConferenceOS keep AI agents safe?", a: "Access is tied to roles and limited to one event. A key with no role is read-only, changes to sponsor, expense, and policy records preview by default, system-level tools need a special admin key, and every call is audit-logged. Core edits such as event settings do not preview yet." },
];

/* ───────────────────────── For agents ───────────────────────── */

export const AGENTS: PageMeta = {
  path: "/agents",
  title: "How This Site Serves Agents: WebMCP, MCP, llms.txt",
  description:
    "Every way an AI agent can use this site: WebMCP tools in the page, a remote MCP server, llms.txt and llms-full.txt, Markdown negotiation, and an honest self-score.",
  label: "For agents",
  h1: "For agents: WebMCP, MCP, and llms.txt on this site",
  crumb: "For agents",
  md: "/agents.md",
};

export const AGENTS_LEDE =
  "This site is built to be easy for agents to read and query, and it is honest about how far that goes. It exposes its content and a few tools through eight surfaces. It is a read-only content site, so it is agent-readable rather than fully agent-native: most of the scorecard measures what happens when an agent changes something, and this site changes nothing. Its own score is below.";

export const MCP_ENDPOINT = SITE.url + "/api/mcp";

export const AGENTS_BLOCKS: Block[] = [
  { type: "h2", text: "What surfaces does this site expose to agents?" },
  { type: "answer", text: "Eight: an llms.txt index, a single-file llms-full.txt, Markdown twins of every page, Markdown content negotiation on the normal URLs, a remote MCP server, WebMCP tools registered in the page, a machine-readable scorecard rubric, and JSON-LD structured data." },
  { type: "table", head: ["Surface", "Where", "What an agent gets"], rows: [
    ["llms.txt", "/llms.txt", "A short index of pages, one line each"],
    ["llms-full.txt", "/llms-full.txt", "The whole site as one Markdown file, for a single fetch"],
    ["Markdown twins", "/index.md, /future.md, /examples.md, /product-managers.md, /agents.md, /reference.md, /about.md", "Each page as clean Markdown"],
    ["Content negotiation", "Any page with `Accept: text/markdown`", "The same URL, answered as Markdown"],
    ["Remote MCP server", "/api/mcp", "Seven read-only tools over JSON-RPC, including get_scorecard, score_product, and probe_site"],
    ["WebMCP tools", "In the page, via `navigator.modelContext`", "The same tools plus reader-view and navigation control, for browser agents"],
    ["Scorecard rubric", "/scorecard.json, /scorecard.md", "The twelve questions, how to verify each in a codebase, and the fix for a miss, so an agent can score its own product"],
    ["Structured data", "JSON-LD in each page head", "Article, FAQPage, and BreadcrumbList"],
  ] },

  { type: "h2", text: "What is the difference between llms.txt and llms-full.txt?" },
  { type: "answer", text: "llms.txt is a short Markdown index that tells a model which pages exist and where to find clean versions. llms-full.txt carries the full content inline, so an agent can load the entire site in one request." },
  { type: "p", text: "Both are community conventions, not standards. Support from search engines and model providers is not confirmed, so treat them as a low-cost courtesy to agents and developer tools that do read them, not as a ranking lever." },

  { type: "h2", text: "Which WebMCP tools does this page register?" },
  { type: "answer", text: "When the browser exposes the WebMCP API, the page registers eight tools. Six mirror the MCP server and two control the page itself. If the API is absent, nothing is registered and the page works as normal." },
  { type: "ul", items: [
    "`get_definition`: the definition of agent-native software.",
    "`list_principles`: the eight design principles with bolted-on and native examples.",
    "`get_scorecard`: the twelve questions, how to verify each, and the fix for a miss.",
    "`score_product`: takes twelve answers (yes, no, or not applicable) with optional evidence, and returns the score, tier, per-principle breakdown, the gaps to close, and a shareable result link.",
    "`get_page`: any page as Markdown.",
    "`search_site`: keyword search across every page.",
    "`set_reader_view`: switch the page between the human view and the agent view.",
    "`open_page`: navigate to a page on this site.",
  ] },
  { type: "callout", label: "Status", text: "WebMCP is a draft proposal. The entry point has shifted between drafts, so the page checks for both `navigator.modelContext` and `document.modelContext` and registers nothing if neither exists." },

  { type: "h2", text: "How do I call the MCP server?" },
  { type: "answer", text: `Send JSON-RPC 2.0 over HTTP POST to ${MCP_ENDPOINT}. Every request is self-contained: there is no session, and no handshake is required before calling a tool.` },
  { type: "code", caption: "List the tools", text: `curl -s ${MCP_ENDPOINT} \
  -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'` },
  { type: "answer", text: "To have an agent score its own product, call get_scorecard for the questions and how to verify each, inspect the product, then send the answers and evidence to score_product. The result includes a link a person can open on the home page." },
  { type: "code", caption: "Score a product (first four answers yes, the last one not applicable)", text: `curl -s ${MCP_ENDPOINT} \
  -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{
    "name":"score_product",
    "arguments":{"answers":[true,true,true,true,false,false,false,false,false,false,false,null]}}}'` },

  { type: "h2", text: "How does Markdown content negotiation work?" },
  { type: "answer", text: "Request any page with an Accept header that prefers text/markdown and the server answers with the Markdown twin at the same URL. Browsers still get HTML." },
  { type: "code", caption: "Same URL, different representation", text: `curl -s -H 'Accept: text/markdown' ${SITE.url}/future` },

  { type: "h2", text: "How agent-native is this site, honestly?" },
  { type: "answer", text: "Of the twelve scorecard questions, six do not apply to a read-only site. Of the six that do, it passes four and misses two. That makes it agent-readable, not a full example of agent-native design. The products on the examples page are better tests of the harder half." },
  { type: "table", head: ["#", "Question", "Verdict", "Why"], rows: [
    ["1", "Everything in the UI is available as a tool", "Yes", "Reading, searching, scoring, switching the reader view, and navigating all have a tool"],
    ["2", "Described machine-readably", "Yes", "Every tool has a JSON Schema"],
    ["3", "llms.txt and clean Markdown docs", "Yes", "llms.txt, llms-full.txt, and a Markdown twin of every page"],
    ["4", "Idempotency keys on writes", "Not applicable", "The site has no writes"],
    ["5", "Dry-run for costly actions", "Not applicable", "Nothing is costly or destructive"],
    ["6", "Structured errors with a fix", "Yes", "Tool errors return a code, message, fix, and a retryable flag"],
    ["7", "Scoped credentials without a human click", "Not applicable", "Public content needs no credentials"],
    ["8", "Per-agent spend, rate, and permission limits", "Not applicable", "There are no agent identities"],
    ["9", "Receipts or a queryable audit log", "Not applicable", "Reads change nothing"],
    ["10", "Pagination, field selection, concise formats", "No", "get_page returns the whole page, with no paging or field selection"],
    ["11", "Human versus agent recorded", "Not applicable", "No actions are recorded"],
    ["12", "Agents tested against the product", "No", "Protocol tests were run by hand; there are no agent-driven evals in CI"],
  ] },

  { type: "h2", text: "What is deliberately not here?" },
  { type: "ul", items: [
    "**Declarative WebMCP.** The proposal marks the form-based syntax as to be determined, so only the imperative API is used.",
    "**Authentication.** The content is public and read-only. Write tools would need scoped, per-agent credentials.",
    "**Server discovery metadata.** Discovery conventions for MCP servers are still moving, so none is published yet.",
    "**Write tools.** Nothing on this site changes state, so there is nothing to approve, undo, or audit.",
  ] },
];

export const AGENTS_FAQ: Faq[] = [
  { q: "What is llms-full.txt?", a: "A single Markdown file that contains the full content of a site, so an agent can load everything in one request. It is a community convention that complements the shorter llms.txt index." },
  { q: "Does this site have an MCP server?", a: `Yes. A read-only remote MCP server runs at ${MCP_ENDPOINT} and exposes seven tools: get_definition, list_principles, get_scorecard, score_product, get_page, search_site, and probe_site.` },
  { q: "Does this site support WebMCP?", a: "Yes, when the browser exposes the WebMCP API. The page registers eight tools through navigator.modelContext and registers nothing otherwise." },
];

/* ───────────────────────── Reference ───────────────────────── */

export const REFERENCE: PageMeta = {
  path: "/reference",
  title: "Agent-Native Reference: MCP, WebMCP, llms.txt & More",
  description:
    "A plain-language reference to every technology behind agent-native software: llms.txt, MCP, MCP Apps, WebMCP, A2A, OpenAPI, OAuth scopes, idempotency, and more.",
  label: "Reference",
  h1: "The agent-native reference: every technology, what it does, and how to check it",
  crumb: "Reference",
  md: "/reference.md",
};

export const REFERENCE_LEDE =
  "Agent-native software is built from about twenty small pieces, and most of them are not new inventions: files, headers, schemas, and protocols. This page names each one, says who defines it, how settled it is, and how to tell whether your product has it. Status labels matter here. Some are mature standards, some are community conventions, and a few are drafts that may still change.";

export const REFERENCE_BLOCKS: Block[] = [
  { type: "h2", text: "What does an agent-native product look like, piece by piece?" },
  { type: "answer", text: "It can be found, understood, used, trusted, and tested by an agent. Each of those five jobs has a small set of technologies behind it, listed below from the most settled to the least." },
  { type: "table", head: ["Job", "Technologies", "Status"], rows: [
    ["Be found", "llms.txt, llms-full.txt, Markdown pages, AGENTS.md, sitemap.xml, robots.txt, JSON-LD", "Mostly conventions and mature web standards"],
    ["Be understood", "OpenAPI, JSON Schema, tool descriptions", "Mature"],
    ["Be used", "MCP, MCP Apps, WebMCP, A2A", "One open spec, one official extension, one draft, one young protocol"],
    ["Be trusted", "Scoped credentials (OAuth), idempotency keys, dry-run, structured errors, receipts and audit logs, limits", "Mixed: standards plus design patterns"],
    ["Be tested", "Agent-driven evals in CI", "A practice, not a standard"],
  ] },
  { type: "callout", label: "How to use this page", text: "Score your product on the [12-question scorecard](/#score) first. Then use this page to look up the pieces behind each question you missed. Each entry ends with a one-line check you can run." },

  { type: "h2", text: "What is llms.txt?" },
  { type: "answer", text: "llms.txt is a Markdown file at the root of your site that lists your most useful pages, one line each, so a model or developer tool can find clean content without crawling your navigation." },
  { type: "callout", label: "In plain English", text: "It is a table of contents written for AI instead of a sitemap written for search engines." },
  { type: "ul", items: [
    "**Defined by:** a community proposal published at llmstxt.org. It is not an IETF or W3C standard.",
    "**Status:** convention. Support from search engines and model providers is not confirmed, so treat it as a low-cost courtesy that some agents and developer tools read.",
    "**Check it:** `curl -s https://yoursite.com/llms.txt` returns Markdown with a title and links, not an HTML page.",
  ] },

  { type: "h2", text: "What is llms-full.txt?" },
  { type: "answer", text: "llms-full.txt is the same idea with the content inline: your whole site (or docs) as one Markdown file, so an agent can load everything in a single request." },
  { type: "ul", items: [
    "**Defined by:** community convention, a companion to llms.txt.",
    "**Status:** convention. Keep it under the size an agent can reasonably read; split large documentation sets.",
    "**Check it:** `curl -s https://yoursite.com/llms-full.txt | wc -c` returns a plausible size and the text matches what is on the pages.",
  ] },

  { type: "h2", text: "What are Markdown pages and content negotiation?" },
  { type: "answer", text: "Serve a clean Markdown version of each page (for example `/pricing.md`), and also answer the normal URL with Markdown when the request says `Accept: text/markdown`. Agents spend fewer tokens on Markdown than on HTML, and they skip the page chrome." },
  { type: "ul", items: [
    "**Defined by:** HTTP content negotiation (the `Accept` header) is a mature web standard. Publishing a `.md` twin is a convention.",
    "**Status:** the negotiation mechanism is mature; how many agents ask for Markdown is not yet widespread.",
    "**Check it:** `curl -s -H 'Accept: text/markdown' https://yoursite.com/` returns Markdown, and a browser still gets HTML.",
  ] },

  { type: "h2", text: "What is AGENTS.md?" },
  { type: "answer", text: "AGENTS.md is a plain Markdown file at the root of a code repository that tells coding agents how to build, test, and work in the project: the commands to run, the conventions to follow, the things not to touch." },
  { type: "callout", label: "In plain English", text: "It is a README for the AI that works on your code, as opposed to the people who read it." },
  { type: "ul", items: [
    "**Defined by:** an open format, contributed by OpenAI and one of the founding projects of the Linux Foundation's Agentic AI Foundation, announced December 9, 2025 [[1]](#src-1).",
    "**Status:** widely read by coding agents; a convention rather than a protocol.",
    "**Check it:** `AGENTS.md` exists at the repo root and lists the exact commands that build and test the project.",
  ] },

  { type: "h2", text: "Do sitemap.xml, robots.txt, and JSON-LD still matter?" },
  { type: "answer", text: "Yes. They are how crawlers, including the ones that feed AI answers, discover and understand your pages. They are mature and unglamorous, and they come before any agent-specific file." },
  { type: "ul", items: [
    "**sitemap.xml:** the sitemaps.org protocol lists your URLs and last-modified dates.",
    "**robots.txt:** the Robots Exclusion Protocol (RFC 9309) says which crawlers may fetch what. AI companies publish their own crawler names, so decide deliberately which to allow; llms.txt does not control crawling [[2]](#src-2).",
    "**JSON-LD:** structured data in the page head, using schema.org types such as Article, FAQPage, and Product. It states facts (who wrote this, when, what the questions are) in a form a machine does not have to guess.",
    "**Check it:** `/sitemap.xml` and `/robots.txt` resolve, and a structured-data validator shows no errors on your key pages.",
  ] },

  { type: "h2", text: "What are OpenAPI and JSON Schema, and why do agents need them?" },
  { type: "answer", text: "OpenAPI describes your HTTP API (endpoints, parameters, responses) in a machine-readable file. JSON Schema describes the exact shape of a piece of data. Together they let an agent call your product correctly without reading a human manual." },
  { type: "callout", label: "In plain English", text: "If your API is a restaurant, OpenAPI is the menu in a format a robot can read, and JSON Schema is the exact order form for each dish." },
  { type: "ul", items: [
    "**Defined by:** the OpenAPI Initiative (Linux Foundation) and the JSON Schema project [[3]](#src-3).",
    "**Status:** mature. MCP tools and WebMCP tools both describe their inputs with JSON Schema.",
    "**Check it:** your API has a published spec file, and every field an agent must send has a type and a description.",
  ] },

  { type: "h2", text: "What is MCP?" },
  { type: "answer", text: "The Model Context Protocol (MCP) is an open protocol that lets AI applications discover and call tools, read resources, and use prompts that a server exposes. Build a capability once as an MCP tool and any compatible agent can use it." },
  { type: "ul", items: [
    "**Defined by:** Anthropic introduced it in November 2024. It moved to the Linux Foundation's Agentic AI Foundation on December 9, 2025 [[1]](#src-1). The current published specification is 2026-07-28 [[4]](#src-4).",
    "**Status:** open specification with vendor-neutral governance and wide client support.",
    "**Check it:** a standard MCP client can connect to your server, list tools, and call one successfully. Details and a live example: [the future of interfaces](/future) and [this site's server](/agents).",
  ] },

  { type: "h2", text: "What are MCP Apps?" },
  { type: "answer", text: "MCP Apps is an official extension that lets a tool return an interactive interface, such as a picker, a chart, or an approval card, which the AI client shows inside the conversation." },
  { type: "ul", items: [
    "**Defined by:** the MCP project, announced January 26, 2026 [[5]](#src-5).",
    "**Status:** official extension. Client support varies and is changing.",
    "**Check it:** your riskiest action returns an approval screen the user can read before confirming. See [the future of interfaces](/future).",
  ] },

  { type: "h2", text: "What is WebMCP?" },
  { type: "answer", text: "WebMCP is a proposed browser API that lets a web page register JavaScript functions as tools for the browser's AI agent, running in the user's own signed-in session." },
  { type: "ul", items: [
    "**Defined by:** the W3C Web Machine Learning Community Group.",
    "**Status:** draft proposal. The entry point has changed between drafts, so prototype behind a flag and check the current spec [[6]](#src-6).",
    "**Check it:** open your page in a browser that supports the API and list the registered tools; an agent should be able to complete your main task without clicking through the interface.",
  ] },

  { type: "h2", text: "What is A2A, and how is it different from MCP?" },
  { type: "answer", text: "The Agent2Agent protocol (A2A) lets one AI agent discover and delegate work to another agent, even when they come from different vendors. MCP connects an agent to tools and data; A2A connects agents to each other." },
  { type: "callout", label: "In plain English", text: "MCP is how an assistant uses your product. A2A is how an assistant hands a job to another assistant, such as a travel agent passing a booking to an airline's agent." },
  { type: "ul", items: [
    "**Defined by:** created at Google and contributed to the Linux Foundation in 2025. An agent publishes an Agent Card, a JSON description of what it can do, at a well-known URL [[7]](#src-7).",
    "**Status:** young open protocol with a 1.0 line. Many published agent cards use an older path, so read the current specification before building.",
    "**Do you need it?** Most products start with MCP. Reach for A2A when your product is itself an agent that other agents should delegate to.",
  ] },

  { type: "h2", text: "How should an agent get permission: what are scoped credentials?" },
  { type: "answer", text: "Give each agent its own credential that is limited to named actions, can expire, and can be revoked without affecting anyone else. A shared admin key fails this test." },
  { type: "ul", items: [
    "**Defined by:** OAuth is the mature standard; MCP's authorization model builds on it. Per-agent keys with named scopes are a common pattern when OAuth is more than a product needs.",
    "**Status:** standard plus pattern. Hash credentials at rest and show the secret only once.",
    "**Check it:** you can create a key that can read but not write, use it, and revoke it, all without a human logging in as an administrator for each call. [Agent Kontrol](/examples) is building exactly this.",
  ] },

  { type: "h2", text: "What are idempotency keys?" },
  { type: "answer", text: "An idempotency key is a unique token the caller sends with a write. If the same request arrives twice, because an agent retried after a timeout, the server performs it once and returns the original result." },
  { type: "callout", label: "In plain English", text: "It is what stops an agent that retries from charging a card, booking a seat, or sending an email twice." },
  { type: "ul", items: [
    "**Defined by:** an `Idempotency-Key` HTTP header, popularized by payment APIs and described in an IETF draft that has been revised several times [[8]](#src-8).",
    "**Status:** widely used pattern; the IETF specification is a draft.",
    "**Check it:** send the same write twice with the same key and confirm exactly one change happened.",
  ] },

  { type: "h2", text: "What is dry-run or preview?" },
  { type: "answer", text: "Every costly or irreversible action offers a mode that shows exactly what would happen without doing it. The agent proposes, the human reviews the preview, and only then does the real call run." },
  { type: "ul", items: [
    "**Defined by:** a design pattern, not a standard. Common forms are a `dry_run` flag or a separate preview tool that returns the same change set the real call would apply.",
    "**Check it:** the preview and the real call share one code path, and the preview changes nothing.",
  ] },

  { type: "h2", text: "What does a structured error look like?" },
  { type: "answer", text: "A structured error tells an agent what went wrong in a machine-readable code, what to do about it in plain words, and whether trying again can help. A bare status code or a prose message does not." },
  { type: "code", caption: "A flat, additive shape an agent can act on", text: `{
  "error": "title is required",
  "code": "missing_field",
  "fix": "Add the fields listed in fields and send the request again.",
  "retryable": false,
  "fields": { "title": "title is required" }
}` },
  { type: "ul", items: [
    "**Defined by:** RFC 9457 (Problem Details for HTTP APIs) is the standard shape for HTTP; the `code`, `fix`, and `retryable` fields shown here are a design pattern in the same spirit [[9]](#src-9).",
    "**Check it:** trigger a bad request on purpose and confirm the response says what to change and whether to retry.",
  ] },

  { type: "h2", text: "What are receipts and audit logs?" },
  { type: "answer", text: "After an agent acts, the product records who did it (this person, or this agent acting for them), what changed, and how to undo it, and lets you query that record." },
  { type: "ul", items: [
    "**Defined by:** a design pattern. Record the actor type separately from the account, so \"a human did this\" and \"an agent did this\" are different facts.",
    "**Check it:** pick any change made by an agent last week and find who made it, when, and how to reverse it.",
  ] },

  { type: "h2", text: "What are pagination, field selection, and concise responses?" },
  { type: "answer", text: "Agents pay for every token they read. Let them page through long lists, ask for only the fields they need, and request a short format, so a lookup does not return a whole database." },
  { type: "ul", items: [
    "**Defined by:** API design practice. Typical forms are `limit` and `cursor` parameters, a `fields` parameter, and a `format=concise` option.",
    "**Check it:** your biggest list endpoint can return ten rows with only two fields each, and says how to get the next ten.",
  ] },

  { type: "h2", text: "What are agent limits?" },
  { type: "answer", text: "Budgets and rate limits set per agent, not per account: how many calls, how much spend, which actions. They keep one runaway agent from using up everyone's allowance or doing damage." },
  { type: "ul", items: [
    "**Defined by:** a design pattern. HTTP `429` with a `Retry-After` header is the standard way to say slow down.",
    "**Check it:** you can cap one agent credential without affecting any other, and you can see its usage.",
  ] },

  { type: "h2", text: "How do you test that an agent can really use your product?" },
  { type: "answer", text: "Run a real agent client against your product in continuous integration, with a task and a pass or fail result. Reading the protocol docs is not a test; an agent completing the task is." },
  { type: "ul", items: [
    "**Defined by:** a practice. A minimal version connects the official MCP client to your server, lists the tools, calls them, and fails the build if a call breaks.",
    "**Check it:** a pull request that breaks a tool's schema turns CI red.",
  ] },

  { type: "h2", text: "Where should you start?" },
  { type: "ol", items: [
    "Publish `/llms.txt`, clean Markdown for your key pages, and a sitemap.",
    "Describe your API with OpenAPI and give every field a type and a description.",
    "Expose your most-used workflow as an MCP tool with a schema, a dry-run, and an idempotency key.",
    "Return structured errors and keep a receipt for every agent action.",
    "Issue scoped, revocable credentials per agent, with limits.",
    "Add an agent to CI. Then look at MCP Apps and WebMCP as the interface layer.",
  ] },
  { type: "p", text: "See how two real products fare on [the examples page](/examples), and the [product manager guide](/product-managers) for how to prioritize this work." },
];

export const REFERENCE_FAQ: Faq[] = [
  { q: "What is the difference between MCP and A2A?", a: "MCP connects an AI agent to tools and data that a server exposes. A2A, the Agent2Agent protocol, connects one agent to another so they can delegate work across vendors. Most products start with MCP." },
  { q: "Is llms.txt a standard?", a: "No. It is a community convention published at llmstxt.org. Support from search engines and model providers is not confirmed, so treat it as a low-cost courtesy to agents and developer tools that read it." },
  { q: "What is the difference between llms.txt and AGENTS.md?", a: "llms.txt describes a website's content for models that read the site. AGENTS.md sits in a code repository and tells coding agents how to build, test, and work in that project." },
  { q: "What is an idempotency key?", a: "A unique token sent with a write request so that a retried request is performed once. It stops an agent that retries after a timeout from, for example, charging a card twice." },
  { q: "Do I need WebMCP to be agent-native?", a: "No. WebMCP is a draft browser proposal. A server-side MCP tool works when no browser is open and is the safer first step; WebMCP is worth prototyping behind a flag." },
];

export const REFERENCE_SOURCES: Source[] = [
  { title: "Linux Foundation announces the formation of the Agentic AI Foundation (MCP, goose, AGENTS.md)", publisher: "Linux Foundation", href: "https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation" },
  { title: "Robots Exclusion Protocol, RFC 9309", publisher: "IETF", href: "https://www.rfc-editor.org/rfc/rfc9309" },
  { title: "OpenAPI Specification and JSON Schema", publisher: "OpenAPI Initiative", href: "https://www.openapis.org/" },
  { title: "Model Context Protocol Specification, version 2026-07-28", publisher: "modelcontextprotocol.io", href: "https://modelcontextprotocol.io/specification/2026-07-28" },
  { title: "MCP Apps: bringing UI capabilities to MCP clients (2026-01-26)", publisher: "Model Context Protocol blog", href: "https://blog.modelcontextprotocol.io/posts/2026-01-26-mcp-apps/" },
  { title: "WebMCP API Proposal", publisher: "W3C Web Machine Learning Community Group", href: "https://webmachinelearning.github.io/webmcp/docs/proposal.html" },
  { title: "Agent2Agent (A2A) Protocol", publisher: "a2a-protocol.org", href: "https://a2a-protocol.org/" },
  { title: "The Idempotency-Key HTTP Header Field (Internet-Draft)", publisher: "IETF HTTPAPI Working Group", href: "https://datatracker.ietf.org/doc/html/draft-ietf-httpapi-idempotency-key-header" },
  { title: "Problem Details for HTTP APIs, RFC 9457", publisher: "IETF", href: "https://www.rfc-editor.org/rfc/rfc9457" },
];

export const REFERENCE_SOURCES_NOTE =
  "Status labels reflect sources read on 2026-10-23. The AGENTS.md, MCP, A2A, and idempotency-draft details were checked against the pages above or search results that cite them. llms.txt and the design patterns have no single authority, so their status is our reading. Specifications change: check the current version before building.";

/* ───────────────────────── For product managers ───────────────────────── */

export const PMS: PageMeta = {
  path: "/product-managers",
  title: "Agent-Native Product Management: A Guide for PMs",
  description:
    "A plain-language guide for product managers on building for AI agents: use cases, questions for engineering, metrics, a roadmap, and a PRD checklist.",
  label: "For product managers",
  h1: "Agent-native product management: what PMs need to decide",
  crumb: "For product managers",
  md: "/product-managers.md",
};

export const PMS_LEDE =
  "You do not need to understand the protocols to make the right product calls. This guide is written for product managers: how to find the right agent use cases, what to ask your engineering team, what to measure, and what to put in the spec. Technical terms are explained in plain language, and there is a glossary at the end.";

export const PMS_BLOCKS: Block[] = [
  { type: "h2", text: "Why should product managers care about agents as users?" },
  { type: "answer", text: "Because people are starting to hand tasks to AI assistants that operate software for them. If an assistant cannot use your product, the person asking it will use a product it can. Agents are a new kind of user with their own needs: they cannot see your screen, they retry when something fails, and they act at machine speed." },
  { type: "p", text: "Agents do not replace your customer. They act on your customer’s behalf. The customer still owns the goal and the decision, and the agent does the clicking." },
  { type: "callout", label: "A useful comparison", text: "Around 2010, “does it work on a phone?” became a standard question in every launch review. “Can an assistant operate it?” is heading the same way. This is an analogy, not a forecast, but it explains why the question belongs on your checklist now." },

  { type: "h2", text: "How do you find the right agent use cases?" },
  { type: "answer", text: "Start with jobs your customers already do repeatedly in your product and would happily hand off: lookups, reports, bulk edits, scheduling, approvals. Write each as a job story, then check whether an agent could finish it without seeing a screen." },
  { type: "ol", items: [
    "**List the ten most repeated tasks** from support tickets, analytics, and customer calls.",
    "**Write each as a job story:** “When [situation], I want to [task], so I can [outcome].”",
    "**Sort each task** into read-only, reversible change, or irreversible change.",
    "**Decide who approves** anything that is not read-only, and how fast they can respond.",
    "**Start with the read-only tasks.** They are the safest and show you where agents get stuck.",
  ] },

  { type: "h2", text: "Which agent use cases should you build first?" },
  { type: "answer", text: "Build in order of risk: lookups first, then summaries, then reversible edits with a preview. Keep anything that moves money, messages customers, or deletes data behind human approval until you have evidence it works." },
  { type: "table", head: ["Type of task", "Example", "Risk", "When"], rows: [
    ["Lookups", "Is this attendee registered?", "Low", "First"],
    ["Summaries and reports", "Which sponsors have not renewed?", "Low", "First"],
    ["Reversible edits", "Rename a session", "Medium", "Next, with undo"],
    ["Bulk changes", "Move forty sessions to Thursday", "High", "Only with preview and approval"],
    ["Money or customer messages", "Issue a refund, email a speaker", "High", "Later, with human approval"],
    ["Destructive actions", "Delete an event", "Highest", "Keep human-only at first"],
  ] },

  { type: "h2", text: "What should you ask your engineering team?" },
  { type: "answer", text: "Ten questions that reveal how ready the product is. None needs technical knowledge to ask, and the answers map directly to the twelve-question scorecard on the home page." },
  { type: "ol", items: [
    "Can everything a user does in the app be done without the screen? Which of our top five workflows cannot?",
    "What happens if the same request is sent twice? Could a retry charge a customer twice?",
    "Can an action be previewed before it happens?",
    "When something fails, does the response say what went wrong and what to try next?",
    "How do we give an assistant access without handing over a person’s full login?",
    "Can we limit what an assistant may do, and how much it may spend?",
    "Can we tell from the logs whether a person or an assistant did something?",
    "How would we know an assistant is struggling with our product?",
    "Are our docs readable by a machine (plain text), or only in PDFs and videos?",
    "Who approves the risky actions, and how long can they take?",
  ] },

  { type: "h2", text: "What should you measure?" },
  { type: "answer", text: "Track whether agents finish tasks, how often they need retries, and whether they recover from errors. These are suggested starting metrics, not an industry standard." },
  { type: "table", head: ["Metric", "In plain English", "Why it matters"], rows: [
    ["Task success rate", "Share of agent tasks that finish correctly", "The headline number: does it actually work?"],
    ["Time to first success", "How long until an agent completes its first task", "Shows how easy the product is to discover and start using"],
    ["Retry rate", "How often an agent has to try again", "High retries point to unclear errors or flaky behavior"],
    ["Error recovery rate", "Share of failures the agent fixes by itself", "Measures how helpful your error messages are"],
    ["Approval rate and wait time", "How often humans approve, and how long it takes", "Shows whether approvals are a bottleneck or too loose"],
    ["Share of agent activity", "Portion of actions taken by agents", "Tells you when agents have become a real user segment"],
    ["Cost per completed task", "What each finished task costs to run", "Keeps spending predictable"],
  ] },

  { type: "h2", text: "What does a sensible roadmap look like?" },
  { type: "answer", text: "Three stages: make the product readable, make it safely actionable, then make it conversational. Each stage is useful on its own, so you can stop at any point and still have shipped value." },
  { type: "ol", items: [
    "**Crawl: be readable.** Publish plain-text docs and an llms.txt file, take the scorecard to set a baseline, and expose one read-only workflow to assistants.",
    "**Walk: be safely actionable.** Add reversible changes with preview and undo, give each assistant its own limited access, set spending and rate limits, and record who did what.",
    "**Run: be conversational.** Add approval cards inside conversations, track agent-specific metrics, test with real assistants before each release, and open access to partners.",
  ] },

  { type: "h2", text: "What belongs in a PRD for an agent-ready feature?" },
  { type: "answer", text: "Add a short “agent behavior” section to any feature spec. It answers who may act, what needs approval, and what happens when things go wrong." },
  { type: "ul", items: [
    "**User goal:** the job the person wants done.",
    "**Allowed actors:** people, assistants, or both.",
    "**Permissions:** which roles can do it, and what the default is for a new assistant.",
    "**Preview:** what can be shown before the action happens.",
    "**Approval:** which steps need a human, and who.",
    "**Errors:** the failure cases and what each response should tell the caller.",
    "**Repeats:** what happens if the same request arrives twice.",
    "**Limits:** rate, spend, and size limits.",
    "**Audit:** how we will see who did it and what changed.",
    "**Success metric:** how we will know it works.",
  ] },

  { type: "h2", text: "What can go wrong, and who owns it?" },
  { type: "answer", text: "The main risks are access that is too broad, actions that happen twice, content that tricks an assistant, and costs that run away. Each needs a named owner before launch." },
  { type: "ul", items: [
    "**Too much access.** An assistant that borrows a person’s full login can do everything that person can. Owner: product and security.",
    "**Silent double actions.** Retries without protection can charge or email twice. Owner: engineering.",
    "**Tricked assistants.** Text inside a message or web page can contain instructions meant to hijack an assistant that reads it. This is called prompt injection. Keep risky actions behind approval so a trick cannot cause harm alone. Owner: security.",
    "**Runaway cost.** Agents work fast and can loop. Set spend and rate limits. Owner: product and finance.",
    "**Unclear accountability.** Decide who answers for what an assistant did on a customer’s behalf. Owner: product and legal.",
  ] },
  { type: "p", text: "This section is practitioner guidance, not legal or security advice. Your own security and legal teams should review the high-risk items." },

  { type: "h2", text: "A plain-English glossary" },
  { type: "table", head: ["Term", "In plain English"], rows: [
    ["Agent", "Software that uses an AI model to pursue a goal across several steps, using tools along the way"],
    ["Tool", "One thing an agent can do in your product, with a name, a description, and the inputs it needs"],
    ["API", "A way for software to use your product without a screen"],
    ["MCP", "A standard plug that lets AI assistants use tools and data from your product"],
    ["MCP Apps", "A way for a tool to show a small screen, like a form or chart, inside the chat"],
    ["WebMCP", "A proposed way for a web page to tell the browser’s assistant what it can do on that page"],
    ["llms.txt", "A plain-text file that tells AI tools which pages on your site matter"],
    ["Scope", "The limit on what a given key or assistant is allowed to do"],
    ["Dry run", "A preview that shows what would happen without doing it"],
    ["Idempotency", "A safeguard so the same request sent twice has the effect of once"],
    ["Audit log", "A record of who did what and when"],
    ["Receipt", "Proof returned after an action, so it can be checked later"],
    ["Prompt injection", "Hidden instructions in content that try to hijack an assistant that reads it"],
  ] },
];

export const PMS_FAQ: Faq[] = [
  { q: "What should a product manager know about AI agents?", a: "Agents are a new kind of user that acts on a customer’s behalf. They cannot see your screen, they retry on failure, and they work fast, so products need interfaces designed for them: clear tool descriptions, safe retries, previews, limited access, and audit logs." },
  { q: "How do you prioritize agent features?", a: "Build in order of risk. Start with read-only lookups and summaries, then reversible edits with preview and undo, then bulk changes with approval. Keep money, customer messages, and deletions behind human approval until you have evidence it works." },
  { q: "What metrics matter for agent-ready products?", a: "Task success rate, time to first success, retry rate, error recovery rate, approval rate and wait time, share of agent activity, and cost per completed task. These are suggested starting points, not an industry standard." },
];

/* ───────────────────────── About ───────────────────────── */

export const ABOUT: PageMeta = {
  path: "/about",
  title: "About Agent Native: Who Publishes It and How We Work",
  description:
    "Agent Native is a free field guide to software AI agents can use, published by Mark Hinkle as part of The AIE Network. How we source, score, and correct it.",
  label: "About",
  h1: "About Agent Native",
  crumb: "About",
  md: "/about.md",
};

export const ABOUT_LEDE =
  "Agent Native is a free field guide to building software that AI agents can discover, use, and be trusted with. It is published by Mark Hinkle as part of The AIE Network, the AI education and community network at theaie.net.";

export const ABOUT_BLOCKS: Block[] = [
  { type: "h2", text: "Who publishes Agent Native?" },
  { type: "answer", text: "Mark Hinkle publishes Agent Native as part of [The AIE Network](https://theaie.net), the network behind The AI Enterprise newsletter, the All Things AI conference, and AI training for business professionals. The network is built by [Peripety Labs](https://theaie.net/peripety-labs)." },
  { type: "p", text: "Mark is the founding publisher of The Artificially Intelligent Enterprise. You can read more on the [About page at theaie.net](https://theaie.net/about) or see where he [speaks](https://theaie.net/about/speaking)." },

  { type: "h2", text: "Why does this site exist?" },
  { type: "answer", text: "Because products are starting to be used by AI agents, and most guidance on the topic is written for engineers. Agent Native explains the idea in plain language for builders and product managers, with sources, dates, and honest scoring." },
  { type: "p", text: "Agent Native is the product-design companion to [AIOS](https://aios-site-pink.vercel.app/the-operating-model), Mark Hinkle's broader operating model and living field guide for enterprises, professionals, and builders becoming AI-native. AIOS defines how people and organizations become AI-native; Agent Native defines how software becomes usable by agents." },
  { type: "p", text: "This site is also a working test. It is built the way it recommends: one data file generates the pages, the Markdown versions, the llms.txt files, the structured data, and a small MCP server. See [how the site serves agents](/agents)." },

  { type: "h2", text: "How do we source, score, and correct what we publish?" },
  { type: "ul", items: [
    "**Primary sources first.** Claims about MCP, MCP Apps, and WebMCP cite the specification, the official announcement, or the proposal itself, with dates. Where we rely on secondary reports, the page says so.",
    "**Uncertainty is labeled.** WebMCP is a draft, so the pages call it a draft and list what is still unknown.",
    "**Strict scoring.** The scorecard counts a yes only when the whole question is satisfied today. We score our own site and the two example products the same way and publish the gaps.",
    "**Corrections.** If we get something wrong, we fix the page and update its date. Tell us through the [contact page at theaie.net](https://theaie.net/contact).",
    "**No paid placement.** Nothing on this site is sponsored.",
  ] },

  { type: "h2", text: "What conflicts of interest should you know about?" },
  { type: "answer", text: "We build ConferenceOS and Agent Kontrol, the two products on the examples page, so those are first-party accounts rather than independent reviews. We apply the same scoring to them as to everything else, including where they fall short." },
  { type: "p", text: "Agent Native is independent of the standards and vendors it covers. It is not affiliated with the Model Context Protocol maintainers, the W3C, Anthropic, Google, or any other company named on these pages." },

  { type: "h2", text: "Where can you follow along?" },
  { type: "ul", items: [
    "[The AI Enterprise newsletter](https://theaie.net/newsletter): the daily business briefing from The AIE Network.",
    "[All Things AI](https://allthingsai.org): the conference and community behind the network.",
    "[The AIE Network](https://theaie.net): newsletters, training, events, and tools in one place.",
  ] },
];

export const ABOUT_FAQ: Faq[] = [
  { q: "Who publishes Agent Native?", a: "Mark Hinkle publishes Agent Native as part of The AIE Network at theaie.net. The network is built by Peripety Labs." },
  { q: "Is Agent Native affiliated with Anthropic or the MCP project?", a: "No. Agent Native is independent. It covers MCP, MCP Apps, and WebMCP from their public specifications and announcements and is not affiliated with their maintainers or any vendor." },
  { q: "Does Agent Native review its own products fairly?", a: "ConferenceOS and Agent Kontrol are products we build, so the examples are first-party accounts. They are scored with the same strict scorecard as everything else, and the gaps are published." },
];

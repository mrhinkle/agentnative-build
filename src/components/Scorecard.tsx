import { useEffect, useMemo, useState } from "react";
import { SCORE_CHECKS, SCORE_PRINCIPLES, SCORE_QUESTIONS, SITE } from "@/lib/data";
import { agentPrompt, decodeAnswers, isAnswers, resultUrl, scoreAnswers, type Answer } from "@/lib/score";
import { useScrollReveal } from "@/hooks/useScrollReveal";

type Slot = Answer | undefined; // undefined = not answered yet
type Source = "probe" | "agent" | undefined;
type Tab = "agent" | "probe" | "hand";

const N = SCORE_QUESTIONS.length;
const R = 54, C = 2 * Math.PI * R;
const SHORT: Record<string, string> = { "Parity": "Parity", "Legibility": "Legible", "Idempotent by default": "Safe retries", "Errors that teach": "Errors", "Scoped authority": "Authority", "Verifiable": "Verified", "Context-thrifty": "Thrifty" };
const TABS: { id: Tab; label: string }[] = [
  { id: "agent", label: "Hand it to your agent" },
  { id: "probe", label: "Probe a URL" },
  { id: "hand", label: "Answer by hand" },
];

function useCopy() {
  const [done, setDone] = useState("");
  return [done, async (key: string, text: string) => {
    try { await navigator.clipboard.writeText(text); setDone(key); setTimeout(() => setDone(""), 1600); } catch { /* clipboard blocked */ }
  }] as const;
}

function Radar({ principles }: { principles: { name: string; yes: number; total: number }[] }) {
  const cx = 110, cy = 110, r = 70, n = principles.length;
  const at = (i: number, k: number) => { const a = (Math.PI * 2 * i) / n - Math.PI / 2; return [cx + Math.cos(a) * r * k, cy + Math.sin(a) * r * k] as const; };
  const pts = principles.map((p, i) => at(i, p.total ? p.yes / p.total : 0).join(",")).join(" ");
  return (
    <svg viewBox="0 0 220 220" className="w-full max-w-[240px] mx-auto" role="img" aria-label={"Score by principle: " + principles.map((p) => `${SHORT[p.name]} ${p.yes} of ${p.total}`).join(", ")}>
      {[0.5, 1].map((k) => <polygon key={k} points={principles.map((_, i) => at(i, k).join(",")).join(" ")} fill="none" stroke="rgba(255,255,255,0.12)" />)}
      {principles.map((_, i) => <line key={i} x1={cx} y1={cy} x2={at(i, 1)[0]} y2={at(i, 1)[1]} stroke="rgba(255,255,255,0.08)" />)}
      <polygon points={pts} fill="rgba(37,99,235,0.35)" stroke="#60a5fa" strokeWidth="1.5" strokeLinejoin="round" style={{ transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)" }} />
      {principles.map((p, i) => { const [x, y] = at(i, 1.22); return <text key={p.name} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="9" fontFamily="monospace" fill={p.total ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.3)"}>{SHORT[p.name]}</text>; })}
    </svg>
  );
}

function cardSvg(r: ReturnType<typeof scoreAnswers>, label: string) {
  const bars = r.principles.map((p, i) => {
    const w = p.total ? Math.round((p.yes / p.total) * 360) : 0;
    return `<text x="640" y="${236 + i * 44}" fill="#9ca3af" font-family="monospace" font-size="20">${SHORT[p.name]}</text><rect x="800" y="${218 + i * 44}" width="360" height="12" rx="6" fill="#1f2937"/><rect x="800" y="${218 + i * 44}" width="${w}" height="12" rx="6" fill="#2563EB"/>`;
  }).join("");
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#0A0F1C"/><text x="64" y="96" fill="#fff" font-family="monospace" font-size="28" font-weight="700">agent<tspan fill="#f44800">/</tspan>native</text><text x="64" y="330" fill="#fff" font-family="sans-serif" font-size="180" font-weight="800">${r.score}<tspan font-size="56" fill="#9ca3af"> / ${r.applicable}</tspan></text><text x="64" y="400" fill="#60a5fa" font-family="sans-serif" font-size="48" font-weight="700">${esc(r.tier)}</text><text x="64" y="470" fill="#9ca3af" font-family="sans-serif" font-size="26">${esc(label)}</text><text x="64" y="570" fill="#6b7280" font-family="monospace" font-size="22">${SITE.url.replace("https://", "")}/#score</text>${bars}</svg>`;
}

export default function Scorecard() {
  const reveal = useScrollReveal();
  const [tab, setTab] = useState<Tab>("agent");
  const [answers, setAnswers] = useState<Slot[]>(() => Array(N).fill(undefined));
  const [evidence, setEvidence] = useState<string[]>(() => Array(N).fill(""));
  const [source, setSource] = useState<Source[]>(() => Array(N).fill(undefined));
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [paste, setPaste] = useState("");
  const [copied, copy] = useCopy();

  // A shared result link (/?r=ynx…) loads straight into the scorecard.
  useEffect(() => {
    const loaded = decodeAnswers(new URLSearchParams(window.location.search).get("r"));
    if (loaded) { setAnswers(loaded); setTab("hand"); setNote("Loaded a shared result."); }
  }, []);

  const set = (i: number, v: Slot, src?: Source, ev?: string) => {
    setAnswers((a) => a.map((x, j) => (j === i ? v : x)));
    setSource((s) => s.map((x, j) => (j === i ? src : x)));
    if (ev !== undefined) setEvidence((e) => e.map((x, j) => (j === i ? ev : x)));
  };

  const answered = answers.filter((a) => a !== undefined).length;
  const effective: Answer[] = answers.map((a) => (a === undefined ? false : a));
  const result = useMemo(() => scoreAnswers(effective), [answers]); // eslint-disable-line react-hooks/exhaustive-deps
  const gaps = result.gaps.filter((g) => answers[g.n - 1] === false);
  const ring = result.scaled >= 10 ? "#2563EB" : result.scaled >= 7 ? "#3b82f6" : result.scaled >= 4 ? "#f44800" : "#ef4444";
  const done = answered === N;
  const json = () => JSON.stringify({ answers: effective, evidence, ...result, result_url: resultUrl(effective) }, null, 2);

  async function runProbe() {
    if (!url.trim()) return;
    setBusy(true); setNote("");
    try {
      const res = await fetch("/api/probe?url=" + encodeURIComponent(url.trim()));
      const body = await res.json();
      if (!res.ok) { setNote(body?.error ? `${body.error.message} ${body.error.fix}` : "The probe failed. Try again."); return; }
      let filled = 0;
      for (const f of body.findings as { n: number; verdict: string; evidence: string }[]) {
        if (f.verdict === "unknown") { setEvidence((e) => e.map((x, j) => (j === f.n - 1 && !x ? "Probe: " + f.evidence : x))); continue; }
        set(f.n - 1, f.verdict === "yes", "probe", "Probe: " + f.evidence); filled++;
      }
      setNote(`Probed ${body.host}: ${filled} of ${N} answered from outside. ${body.scope}`);
    } catch { setNote("Could not reach the probe. Try again, or answer by hand."); }
    finally { setBusy(false); }
  }

  function loadPaste() {
    try {
      const j = JSON.parse(paste);
      const a = j.answers ?? j;
      if (!isAnswers(a)) throw new Error();
      setAnswers(a); setSource(a.map(() => "agent"));
      if (Array.isArray(j.evidence)) setEvidence(Array.from({ length: N }, (_, i) => String(j.evidence[i] ?? "")));
      setNote("Loaded your agent's answers. Review any you disagree with."); setPaste("");
    } catch { setNote(`That is not valid. Paste JSON with ${N} answers, each true, false, or null.`); }
  }

  function reset() { setAnswers(Array(N).fill(undefined)); setEvidence(Array(N).fill("")); setSource(Array(N).fill(undefined)); setNote(""); }

  function download() {
    const blob = new Blob([cardSvg(result, `${done ? "" : "Partial: "}${result.score} of ${result.applicable} agent-native checks`)], { type: "image/svg+xml" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "agent-native-score.svg"; a.click(); URL.revokeObjectURL(a.href);
  }

  const seg = (i: number, v: Answer, label: string, on: string) => (
    <button type="button" aria-pressed={answers[i] === v} onClick={() => set(i, answers[i] === v ? undefined : v, undefined)}
      className={`px-3 py-1.5 text-xs font-semibold transition-colors ${answers[i] === v ? on : "text-[#0A0F1C]/50 hover:text-[#0A0F1C]"}`}>{label}</button>
  );

  return (
    <div ref={reveal} className="reveal grid lg:grid-cols-[1fr_340px] gap-8 items-start">
      <div>
        <div role="tablist" aria-label="How to score" className="flex flex-wrap gap-2 mb-4">
          {TABS.map((t) => (
            <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
              className={`rounded px-4 py-2 text-sm font-semibold transition-colors ${tab === t.id ? "bg-[#0A0F1C] text-white" : "bg-white text-[#0A0F1C]/70 border border-[#0A0F1C]/10 hover:border-[#0A0F1C]/30"}`}>{t.label}</button>
          ))}
        </div>

        <div role="tabpanel" className="rounded-md border border-[#0A0F1C]/10 bg-white p-5 mb-6 text-sm text-[#0A0F1C]/75 leading-relaxed">
          {tab === "agent" && (
            <div className="space-y-3">
              <p><strong className="text-[#0A0F1C]">Let your agent score its own product.</strong> Paste this into Claude Code, Codex, or any agent that can read your repo. It returns answers with evidence for each. Paste the JSON it gives back below.</p>
              <pre className="whitespace-pre-wrap rounded bg-[#0A0F1C] p-4 font-mono text-xs leading-relaxed text-emerald-300/90">{agentPrompt()}</pre>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => copy("prompt", agentPrompt())} className="rounded bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-[#2563EB]/90 transition-colors">{copied === "prompt" ? "Copied" : "Copy prompt"}</button>
                <a href="/scorecard.json" className="rounded border border-[#0A0F1C]/15 px-4 py-2 text-xs font-semibold hover:border-[#0A0F1C]/40 transition-colors">scorecard.json</a>
                <a href="/api/mcp" className="rounded border border-[#0A0F1C]/15 px-4 py-2 text-xs font-semibold font-mono hover:border-[#0A0F1C]/40 transition-colors">MCP: get_scorecard, score_product</a>
              </div>
              <label className="block text-xs font-semibold text-[#0A0F1C]" htmlFor="paste">Paste your agent's JSON</label>
              <textarea id="paste" value={paste} onChange={(e) => setPaste(e.target.value)} rows={3} placeholder='{"answers": [true, false, null, …], "evidence": ["src/api.ts:12", …]}' className="w-full rounded border border-[#0A0F1C]/15 bg-white p-3 font-mono text-xs" />
              <button onClick={loadPaste} disabled={!paste.trim()} className="rounded border border-[#0A0F1C]/15 px-4 py-2 text-xs font-semibold hover:border-[#0A0F1C]/40 disabled:opacity-40 transition-colors">Load answers</button>
            </div>
          )}
          {tab === "probe" && (
            <div className="space-y-3">
              <p><strong className="text-[#0A0F1C]">Check a live site from the outside.</strong> We look for llms.txt, Markdown docs, an OpenAPI file or MCP server, and a structured error. That answers up to three of the twelve; the rest need your agent or you.</p>
              <form onSubmit={(e) => { e.preventDefault(); runProbe(); }} className="flex flex-wrap gap-2">
                <label className="sr-only" htmlFor="probe-url">Site to probe</label>
                <input id="probe-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://yourproduct.com" inputMode="url" autoComplete="off" className="min-w-0 flex-1 rounded border border-[#0A0F1C]/15 bg-white px-3 py-2 font-mono text-xs" />
                <button disabled={busy || !url.trim()} className="rounded bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-[#2563EB]/90 disabled:opacity-50 transition-colors">{busy ? "Probing…" : "Run probe"}</button>
              </form>
              <p className="text-xs text-[#0A0F1C]/50">Public https sites only. We send a few GET requests and one MCP initialize call, and keep nothing.</p>
            </div>
          )}
          {tab === "hand" && <p><strong className="text-[#0A0F1C]">Answer by hand.</strong> One point per yes. Mark a question N/A if it does not apply (a read-only site has no writes), and it leaves the denominator. Nothing leaves your browser.</p>}
          {note && <p className="mt-3 rounded bg-[#2563EB]/[0.06] px-3 py-2 text-xs text-[#0A0F1C]/80" role="status">{note}</p>}
        </div>

        <ol className="space-y-2">
          {SCORE_QUESTIONS.map((q, i) => (
            <li key={q} className={`rounded-md border bg-white px-4 py-3 transition-colors ${answers[i] === true ? "border-[#2563EB]/50" : answers[i] === false ? "border-[#f44800]/40" : "border-[#0A0F1C]/10"}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <p className="flex-1 min-w-[16rem] text-sm leading-relaxed text-[#0A0F1C]/85">
                  <span className="font-mono text-[#f44800] text-xs mr-2">{String(i + 1).padStart(2, "0")}</span>{q}
                  <span className="ml-2 label-mono text-[#0A0F1C]/40">{SCORE_CHECKS[i].principle}</span>
                </p>
                <div role="group" aria-label={`Question ${i + 1}`} className="flex shrink-0 overflow-hidden rounded border border-[#0A0F1C]/15">
                  {seg(i, true, "Yes", "bg-[#2563EB] text-white")}
                  {seg(i, false, "No", "bg-[#f44800] text-white")}
                  {seg(i, null, "N/A", "bg-[#0A0F1C]/10 text-[#0A0F1C]")}
                </div>
              </div>
              {(evidence[i] || source[i]) && <p className="mt-2 font-mono text-xs leading-relaxed text-[#0A0F1C]/60">{source[i] === "agent" && <span className="mr-2 rounded bg-emerald-500/15 px-1.5 py-0.5 text-emerald-700">agent</span>}{source[i] === "probe" && <span className="mr-2 rounded bg-[#2563EB]/15 px-1.5 py-0.5 text-[#2563EB]">probe</span>}{evidence[i]}</p>}
              <details className="mt-2"><summary className="cursor-pointer text-xs text-[#0A0F1C]/50 hover:text-[#0A0F1C]">How to check</summary><p className="mt-1 text-xs leading-relaxed text-[#0A0F1C]/70">{SCORE_CHECKS[i].verify}</p></details>
            </li>
          ))}
        </ol>
      </div>

      <aside className="rounded-md bg-[#0A0F1C] text-white p-6 lg:sticky lg:top-24" aria-live="polite">
        <div className="relative w-36 h-36 mx-auto">
          <svg viewBox="0 0 128 128" className="w-full h-full -rotate-90" aria-hidden="true">
            <circle cx="64" cy="64" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
            <circle cx="64" cy="64" r={R} fill="none" stroke={ring} strokeWidth="10" strokeLinecap="round"
              strokeDasharray={C} strokeDashoffset={C * (1 - (result.applicable ? result.score / result.applicable : 0))} style={{ transition: "stroke-dashoffset 0.45s cubic-bezier(0.16,1,0.3,1), stroke 0.3s" }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span key={result.score} className="pop font-heading text-4xl font-bold">{result.score}</span>
            <span className="label-mono text-white/50">of {result.applicable}</span>
          </div>
        </div>
        <h3 className="font-heading text-xl font-bold text-white text-center mt-4">{result.tier}</h3>
        <p className="text-sm text-white/60 text-center mt-2 leading-relaxed">{answered === 0 ? "Pick a way to score on the left. Unanswered questions count as no until you answer." : result.advice}</p>
        {answered > 0 && !done && <p className="label-mono text-white/40 text-center mt-2">{answered} of {N} answered</p>}

        <div className="mt-5"><Radar principles={result.principles} /></div>

        {gaps.length > 0 && (
          <div className="mt-5">
            <p className="label-mono text-white/50 mb-2">Fix first</p>
            <ol className="space-y-2">
              {gaps.slice(0, 3).map((g) => <li key={g.n} className="text-xs leading-relaxed text-white/70"><span className="font-mono text-[#f44800] mr-1.5">{String(g.n).padStart(2, "0")}</span>{g.fix}</li>)}
            </ol>
          </div>
        )}

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button disabled={answered === 0} onClick={() => copy("link", resultUrl(effective))} className="rounded border border-white/10 px-3 py-2 text-xs font-semibold text-white/70 hover:text-white hover:border-white/25 disabled:opacity-30 transition-colors">{copied === "link" ? "Copied" : "Copy link"}</button>
          <button disabled={answered === 0} onClick={() => copy("json", json())} className="rounded border border-white/10 px-3 py-2 text-xs font-semibold text-white/70 hover:text-white hover:border-white/25 disabled:opacity-30 transition-colors">{copied === "json" ? "Copied" : "Copy JSON"}</button>
          <button disabled={answered === 0} onClick={download} className="rounded border border-white/10 px-3 py-2 text-xs font-semibold text-white/70 hover:text-white hover:border-white/25 disabled:opacity-30 transition-colors">Download card</button>
          <button onClick={reset} className="rounded border border-white/10 px-3 py-2 text-xs font-semibold text-white/70 hover:text-white hover:border-white/25 transition-colors">Reset</button>
        </div>
        <p className="text-xs text-white/50 text-center mt-3">Your answers stay in this browser. The link carries only the {N} answers, nothing else.</p>
      </aside>
    </div>
  );
}

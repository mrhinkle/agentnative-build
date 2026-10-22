import { useEffect, useRef, useState } from "react";
import { DEMO } from "@/lib/data";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const TONE: Record<string, string> = { good: "border-l-emerald-400", bad: "border-l-[#f44800]", "": "border-l-[#2563EB]" };
const START = 2; // agent-native tab

/**
 * Every transcript is in the HTML (inactive tabs are `hidden` tabpanels). The first paint shows the
 * finished agent-native transcript with no JS; JS only replays it as an animation.
 */
export default function Demo() {
  const [tab, setTab] = useState(START);
  const [count, setCount] = useState(DEMO.tabs[START].steps.length);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const started = useRef(false);
  const reveal = useScrollReveal();
  const cur = DEMO.tabs[tab];
  const finished = count >= cur.steps.length;

  const play = (t = tab) => {
    clearTimeout(timer.current);
    setTab(t);
    const total = DEMO.tabs[t].steps.length;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setCount(total); return; }
    setCount(0);
    let i = 0;
    const next = () => {
      i += 1; setCount(i);
      if (i < total) timer.current = setTimeout(next, 480);
    };
    timer.current = setTimeout(next, 250);
  };

  useEffect(() => () => clearTimeout(timer.current), []);

  // Replay once, the first time the demo scrolls into view (skipped under reduced motion).
  const sentinel = (node: HTMLDivElement | null) => {
    if (!node || started.current || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) { started.current = true; io.disconnect(); play(START); }
    }, { threshold: 0.35 });
    io.observe(node);
  };

  return (
    <div ref={reveal} className="reveal">
      <div className="flex flex-wrap gap-2 mb-6" role="tablist" aria-label="Choose a reader">
        {DEMO.tabs.map((t, i) => (
          <button key={t.key} role="tab" id={`demo-tab-${t.key}`} aria-controls={`demo-panel-${t.key}`} aria-selected={tab === i} onClick={() => play(i)}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${tab === i ? "bg-[#2563EB] text-white" : "border border-white/10 text-white/70 hover:text-white hover:border-white/25"}`}>
            {t.label}
          </button>
        ))}
      </div>
      <div ref={sentinel} className="grid lg:grid-cols-[1fr_280px] gap-6 items-start">
        <div className="min-h-[130px]" aria-live="polite">
          {DEMO.tabs.map((t, ti) => (
            <ol key={t.key} role="tabpanel" id={`demo-panel-${t.key}`} aria-labelledby={`demo-tab-${t.key}`} hidden={ti !== tab} className="space-y-2">
              {t.steps.slice(0, ti === tab ? count : t.steps.length).map((s, i) => (
                <li key={i} className={`step-in flex gap-3 rounded-md border border-white/5 border-l-4 bg-white/[0.02] px-4 py-3 ${TONE[s.tone ?? ""]}`}>
                  <span className="font-mono text-xs text-white/50 pt-0.5 w-5">{i + 1}</span>
                  <span className="font-mono text-[13px] text-white/85">{s.t}{s.d && <span className="block text-white/50 mt-0.5">{s.d}</span>}</span>
                </li>
              ))}
            </ol>
          ))}
        </div>
        <aside className="rounded-md border border-white/10 bg-white/[0.02] p-6 lg:sticky lg:top-24">
          <div className="flex items-baseline gap-2"><span key={count} className="pop font-heading text-4xl font-bold text-white">{count}</span><span className="label-mono text-white/50">steps</span></div>
          <div className="flex items-baseline gap-2 mt-3"><span className={`font-heading text-2xl font-bold ${finished ? (cur.risk === "High" ? "text-[#f44800]" : "text-emerald-400") : "text-white/50"}`}>{finished ? cur.risk : "–"}</span><span className="label-mono text-white/50">failure risk</span></div>
          <p className="text-sm text-white/60 mt-4 min-h-[3.5rem]">{finished ? cur.verdict : "Task: " + DEMO.task + "."}</p>
          <button onClick={() => play()} className="mt-4 w-full rounded bg-[#2563EB] px-6 py-3 text-sm font-semibold text-white hover:bg-[#2563EB]/90 transition-colors">▶ {finished ? "Replay" : "Playing…"}</button>
        </aside>
      </div>
    </div>
  );
}

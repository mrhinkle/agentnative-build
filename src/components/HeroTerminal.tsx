import { useEffect, useState } from "react";

type Line = { kind: "cmd" | "out" | "ok" | "warn"; text: string };

const SCRIPT: Line[] = [
  { kind: "cmd", text: "agent discover agentnative.build" },
  { kind: "out", text: "GET /llms.txt          200  412 B" },
  { kind: "out", text: "GET /index.md          200  6.1k tokens" },
  { kind: "cmd", text: "agent call refund_order --dry-run" },
  { kind: "ok", text: '{ "preview": "refund 80.00 → ••4242", "retryable": true }' },
  { kind: "cmd", text: "agent call refund_order --key a1f9" },
  { kind: "ok", text: '{ "refund_id": "rf_77", "status": "succeeded" }' },
  { kind: "cmd", text: "agent call get_refund rf_77" },
  { kind: "ok", text: 'verified ✓  actor: agent' },
];

const COLORS: Record<Line["kind"], string> = {
  cmd: "text-white", out: "text-white/50", ok: "text-emerald-400", warn: "text-[#f44800]",
};

/** Looping typewriter terminal: an agent discovers, previews, commits, and verifies. */
export default function HeroTerminal() {
  const [shown, setShown] = useState<{ done: Line[]; typing: string; kind: Line["kind"] }>({ done: [], typing: "", kind: "cmd" });

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setShown({ done: SCRIPT, typing: "", kind: "cmd" }); return; }
    let cancelled = false;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    (async () => {
      while (!cancelled) {
        let done: Line[] = [];
        setShown({ done, typing: "", kind: "cmd" });
        for (const line of SCRIPT) {
          if (cancelled) return;
          if (line.kind === "cmd") {
            for (let i = 1; i <= line.text.length; i++) {
              if (cancelled) return;
              setShown({ done, typing: line.text.slice(0, i), kind: "cmd" });
              await wait(28 + Math.random() * 30);
            }
            await wait(260);
          } else {
            await wait(320);
          }
          done = [...done, line];
          setShown({ done, typing: "", kind: "cmd" });
        }
        await wait(3200);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="rounded-md border border-white/10 bg-[#0A0F1C]/80 backdrop-blur shadow-2xl shadow-black/40 float-slow" role="img" aria-label="Animated terminal: an agent discovers the site, previews a refund, commits it with an idempotency key, and verifies the receipt.">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
        <span className="w-2.5 h-2.5 rounded-full bg-white/15" /><span className="w-2.5 h-2.5 rounded-full bg-white/15" /><span className="w-2.5 h-2.5 rounded-full bg-white/15" />
        <span className="ml-3 label-mono text-white/50 normal-case tracking-normal text-[11px]">agent@fleet ~ tool calls</span>
      </div>
      <div className="p-5 font-mono text-[12.5px] leading-relaxed min-h-[270px]" aria-hidden="true">
        {shown.done.map((l, i) => (
          <div key={i} className={COLORS[l.kind]}>{l.kind === "cmd" ? <><span className="text-[#f44800]">$ </span>{l.text}</> : <span className="pl-3">{l.text}</span>}</div>
        ))}
        <div className="text-white"><span className="text-[#f44800]">$ </span>{shown.typing}<span className="caret" /></div>
      </div>
    </div>
  );
}

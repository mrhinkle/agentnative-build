import { useState } from "react";
import { SCORE_QUESTIONS, SCORE_TIERS } from "@/lib/data";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const R = 54, C = 2 * Math.PI * R;

export default function Scorecard() {
  const [checked, setChecked] = useState<boolean[]>(() => SCORE_QUESTIONS.map(() => false));
  const reveal = useScrollReveal();
  const n = checked.filter(Boolean).length;
  const tier = SCORE_TIERS.find((t) => n <= t.max)!;
  const ring = n >= 10 ? "#2563EB" : n >= 7 ? "#3b82f6" : n >= 4 ? "#f44800" : "#ef4444";

  return (
    <div ref={reveal} className="reveal grid lg:grid-cols-[1fr_320px] gap-8 items-start">
      <ul className="space-y-2">
        {SCORE_QUESTIONS.map((q, i) => (
          <li key={q}>
            <label className={`flex gap-3 rounded-md border bg-white px-4 py-3 text-sm leading-relaxed transition-colors ${checked[i] ? "border-[#2563EB]/50 bg-[#2563EB]/[0.03]" : "border-[#0A0F1C]/10 hover:border-[#0A0F1C]/25"}`}>
              <input type="checkbox" checked={checked[i]} onChange={() => setChecked((c) => c.map((v, j) => (j === i ? !v : v)))} className="mt-1 h-4 w-4 accent-[#2563EB]" />
              <span className="text-[#0A0F1C]/80"><span className="font-mono text-[#f44800] text-xs mr-2">{String(i + 1).padStart(2, "0")}</span>{q}</span>
            </label>
          </li>
        ))}
      </ul>
      <aside className="rounded-md bg-[#0A0F1C] text-white p-6 lg:sticky lg:top-24" aria-live="polite">
        <div className="relative w-36 h-36 mx-auto">
          <svg viewBox="0 0 128 128" className="w-full h-full -rotate-90" aria-hidden="true">
            <circle cx="64" cy="64" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
            <circle cx="64" cy="64" r={R} fill="none" stroke={ring} strokeWidth="10" strokeLinecap="round"
              strokeDasharray={C} strokeDashoffset={C * (1 - n / 12)} style={{ transition: "stroke-dashoffset 0.45s cubic-bezier(0.16,1,0.3,1), stroke 0.3s" }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span key={n} className="pop font-heading text-4xl font-bold">{n}</span>
            <span className="label-mono text-white/50">of 12</span>
          </div>
        </div>
        <h3 className="font-heading text-xl font-bold text-white text-center mt-4">{tier.name}</h3>
        <p className="text-sm text-white/60 text-center mt-2 leading-relaxed">{tier.tip}</p>
        <button onClick={() => setChecked(SCORE_QUESTIONS.map(() => false))} className="mt-5 w-full rounded border border-white/10 px-6 py-2.5 text-sm font-semibold text-white/60 hover:text-white hover:border-white/25 transition-colors">Reset</button>
        <p className="text-xs text-white/50 text-center mt-3">Nothing leaves your browser.</p>
      </aside>
    </div>
  );
}

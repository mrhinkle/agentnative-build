import { useState } from "react";
import { PRINCIPLES } from "@/lib/data";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { glowMove } from "@/hooks/useGlow";

/** All copy is in the HTML; the toggle only expands a region that is `inert` while collapsed. */
export default function Principles() {
  const [open, setOpen] = useState<number | null>(null);
  const ref = useScrollReveal();
  return (
    <div ref={ref} className="stagger grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {PRINCIPLES.map((p, i) => {
        const isOpen = open === i;
        const id = `principle-${i}`;
        return (
          <div
            key={p.title}
            onMouseMove={glowMove}
            className={`glow-card rounded-md border bg-white p-6 transition-all duration-150 ${isOpen ? "sm:col-span-2 lg:col-span-4 border-[#f44800]/60 shadow-lg shadow-[#0A0F1C]/5" : "border-[#0A0F1C]/10 hover:border-[#2563EB]/40"}`}
          >
            <span className="label-mono text-[#f44800]">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="font-heading text-xl font-bold text-[#0A0F1C] mt-2 mb-2">{p.title}</h3>
            <p className="text-sm text-[#0A0F1C]/70 leading-relaxed">{p.summary}</p>
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={id}
              onClick={() => setOpen(isOpen ? null : i)}
              className="mt-3 text-sm font-semibold text-[#2563EB] hover:underline"
            >
              {isOpen ? "Hide detail" : "Bolted-on vs native"}
            </button>
            <div id={id} inert={!isOpen} className={`grid transition-all duration-300 ${isOpen ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"}`}>
              <div className="overflow-hidden">
                <p className="text-sm text-[#0A0F1C]/70 leading-relaxed mb-4">{p.full}</p>
                <div className="grid md:grid-cols-3 gap-3">
                  <div className="rounded-md bg-red-500/[0.06] border border-red-500/15 p-4">
                    <p className="label-mono text-red-700 mb-1">Bolted-on</p>
                    <p className="text-sm text-[#0A0F1C]/70">{p.bolted}</p>
                  </div>
                  <div className="rounded-md bg-[#2563EB]/[0.06] border border-[#2563EB]/20 p-4">
                    <p className="label-mono text-[#2563EB] mb-1">Native</p>
                    <p className="text-sm text-[#0A0F1C]/80">{p.native}</p>
                  </div>
                  <div className="rounded-md bg-[#f44800]/[0.06] border border-[#f44800]/25 p-4">
                    <p className="label-mono text-[#c23a00] mb-1">Ask your team</p>
                    <p className="text-sm text-[#0A0F1C]/80">{p.ask}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

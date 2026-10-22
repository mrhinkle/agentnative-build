import type { Block, Faq, Source } from "@/lib/data";
import Inline from "@/components/Inline";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const slug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <div>
      {blocks.map((b, i) => {
        switch (b.type) {
          case "h2":
            return <h2 key={i} id={b.id ?? slug(b.text)} className="font-heading text-2xl md:text-3xl font-bold text-[#0A0F1C] mt-14 mb-4">{b.text}</h2>;
          case "h3":
            return <h3 key={i} className="font-heading text-xl font-bold text-[#0A0F1C] mt-10 mb-3">{b.text}</h3>;
          case "answer":
            return <p key={i} className="text-lg leading-relaxed text-[#0A0F1C]/85 border-l-4 border-[#f44800] pl-5 my-4"><Inline text={b.text} /></p>;
          case "p":
            return <p key={i} className="text-base leading-relaxed text-[#0A0F1C]/70 my-4"><Inline text={b.text} /></p>;
          case "ol":
            return <ol key={i} className="my-5 space-y-3 list-decimal pl-6 marker:font-mono marker:text-[#f44800] text-[#0A0F1C]/70">{b.items.map((t, j) => <li key={j} className="pl-1 leading-relaxed"><Inline text={t} /></li>)}</ol>;
          case "ul":
            return <ul key={i} className="my-5 space-y-3 list-disc pl-6 marker:text-[#f44800] text-[#0A0F1C]/70">{b.items.map((t, j) => <li key={j} className="pl-1 leading-relaxed"><Inline text={t} /></li>)}</ul>;
          case "callout":
            return (
              <div key={i} className="my-6 rounded-md border border-[#0A0F1C]/10 bg-white p-5 border-l-4 border-l-[#2563EB]">
                <p className="label-mono text-[#2563EB] mb-2">{b.label}</p>
                <p className="text-[#0A0F1C]/75 leading-relaxed"><Inline text={b.text} /></p>
              </div>
            );
          case "code":
            return <CodeBlock key={i} caption={b.caption} text={b.text} />;
          case "table":
            return <DataTable key={i} head={b.head} rows={b.rows} />;
        }
      })}
    </div>
  );
}

export function CodeBlock({ caption, text, dark = true }: { caption?: string; text: string; dark?: boolean }) {
  return (
    <figure className="my-6">
      {caption && <figcaption className="label-mono text-[#0A0F1C]/60 mb-2 normal-case tracking-normal text-xs">{caption}</figcaption>}
      <pre className={`rounded-md p-5 overflow-x-auto text-[13px] leading-relaxed font-mono ${dark ? "bg-[#0A0F1C] text-white/80 border border-white/10" : ""}`}><code>{text}</code></pre>
    </figure>
  );
}

export function DataTable({ head, rows, firstColLabel = true }: { head: string[]; rows: string[][]; firstColLabel?: boolean }) {
  const cell = "max-sm:flex max-sm:gap-3 max-sm:before:content-[attr(data-label)] max-sm:before:w-28 max-sm:before:shrink-0 max-sm:before:font-mono max-sm:before:text-[10px] max-sm:before:font-bold max-sm:before:uppercase max-sm:before:tracking-wider max-sm:before:text-[#0A0F1C]/60";
  return (
    <div className="my-6 overflow-x-auto rounded-md border border-[#0A0F1C]/10 bg-white">
      <table className="w-full text-sm sm:min-w-[560px] max-sm:block">
        <thead className="max-sm:sr-only">
          <tr className="border-b border-[#0A0F1C]/10 bg-[#0A0F1C]/[0.03]">
            {head.map((h, i) => <th key={i} className="label-mono text-[#0A0F1C]/60 text-left px-4 py-3">{h}</th>)}
          </tr>
        </thead>
        <tbody className="max-sm:block">
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-[#0A0F1C]/5 last:border-0 align-top max-sm:block max-sm:px-4 max-sm:py-3">
              {r.map((c, j) => j === 0 && firstColLabel
                ? <th key={j} className="label-mono text-[#0A0F1C]/70 text-left px-4 py-3 whitespace-nowrap max-sm:block max-sm:px-0 max-sm:pb-2 max-sm:text-xs">{c}</th>
                : <td key={j} data-label={head[j]} className={`px-4 py-3 leading-relaxed max-sm:px-0 max-sm:py-1.5 ${cell} ${head[j] === "Agent-native" ? "text-[#0A0F1C] font-medium bg-[#2563EB]/[0.04]" : "text-[#0A0F1C]/70"}`}>{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function FaqList({ faqs, title = "Frequently asked questions" }: { faqs: Faq[]; title?: string }) {
  const ref = useScrollReveal();
  return (
    <div ref={ref} className="reveal mt-14">
      <h2 className="font-heading text-2xl md:text-3xl font-bold text-[#0A0F1C] mb-4">{title}</h2>
      <div className="divide-y divide-[#0A0F1C]/10 border-y border-[#0A0F1C]/10">
        {faqs.map((f) => (
          <details key={f.q} className="group py-4">
            <summary className="flex items-center justify-between gap-4 cursor-pointer list-none font-heading font-bold text-[#0A0F1C]">
              {f.q}
              <span className="text-[#f44800] font-mono text-lg transition-transform duration-200 group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-[#0A0F1C]/70 leading-relaxed max-w-2xl">{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}

export function SourceList({ sources, note }: { sources: Source[]; note?: string }) {
  return (
    <div className="mt-14">
      <h2 className="font-heading text-2xl md:text-3xl font-bold text-[#0A0F1C] mb-4">Sources</h2>
      <ol className="space-y-2 text-sm text-[#0A0F1C]/60 list-decimal pl-6 marker:font-mono marker:text-[#f44800]">
        {sources.map((s, i) => (
          <li key={s.href} id={`src-${i + 1}`} className="pl-1">
            <a href={s.href} target="_blank" rel="noopener noreferrer" className="text-electric hover:underline">{s.title}</a>, {s.publisher}
          </li>
        ))}
      </ol>
      {note && <p className="mt-4 text-sm text-[#0A0F1C]/60">{note}</p>}
    </div>
  );
}

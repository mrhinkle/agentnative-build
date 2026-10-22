import { useEffect, useRef, useState } from "react";
import { markdownFor } from "@/lib/markdown";

/** Agent view: the page as an agent receives it (generated from the same data), typed out line by line. */
export default function ReaderView({ path }: { path: string }) {
  const lines = markdownFor(path).split("\n");
  const [n, setN] = useState(0);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setN(lines.length); return; }
    setN(0);
    const id = setInterval(() => setN((v) => { if (v >= lines.length) { clearInterval(id); return v; } return v + 3; }), 16);
    return () => clearInterval(id);
  }, [path, lines.length]);

  return (
    <div className="min-h-screen bg-[#050A06] pt-20 pb-24">
      <div className="container max-w-4xl">
        <p className="label-mono text-emerald-400/70 mb-4">// agent view · {path === "/" ? "/index.md" : path + ".md"} · text/markdown</p>
        <pre className="font-mono text-[13px] leading-relaxed text-emerald-300/90 whitespace-pre-wrap break-words" tabIndex={0} aria-label="Markdown version of this page">
          {lines.slice(0, n).join("\n")}
          <span className="caret" />
        </pre>
        <div ref={end} />
      </div>
    </div>
  );
}

import { Fragment, type ReactNode } from "react";
import { Link } from "react-router";

const TOKEN = /\[\[(\d+)\]\]\((#[^)]+)\)|\[([^\]]+)\]\(([^)]+)\)|\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+)`/g;

/** Renders the small Markdown subset used in data.ts: **bold**, *em*, `code`, [text](href), [[n]](#src-n). */
export default function Inline({ text, dark = false }: { text: string; dark?: boolean }): ReactNode {
  const out: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  TOKEN.lastIndex = 0;
  while ((m = TOKEN.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const key = k++;
    if (m[1]) {
      out.push(<sup key={key}><a href={m[2]} className="text-electric hover:underline">[{m[1]}]</a></sup>);
    } else if (m[3]) {
      const href = m[4];
      const cls = dark ? "text-white underline decoration-white/30 hover:decoration-white" : "text-electric underline decoration-electric/30 hover:decoration-electric";
      out.push(
        href.startsWith("/")
          ? <Link key={key} to={href} className={cls}>{m[3]}</Link>
          : <a key={key} href={href} className={cls} target="_blank" rel="noopener noreferrer">{m[3]}</a>
      );
    } else if (m[5]) {
      out.push(<strong key={key} className="font-semibold"><Inline text={m[5]} dark={dark} /></strong>);
    } else if (m[6]) {
      out.push(<em key={key}>{m[6]}</em>);
    } else if (m[7]) {
      out.push(<code key={key} className={`font-mono text-[0.85em] px-1.5 py-0.5 rounded ${dark ? "bg-white/10" : "bg-[#0A0F1C]/[0.06]"}`}>{m[7]}</code>);
    }
    last = TOKEN.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return <Fragment>{out}</Fragment>;
}

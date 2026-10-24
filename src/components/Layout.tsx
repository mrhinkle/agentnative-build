import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Menu, X } from "lucide-react";
import { AIOS_COMPANION, NAV_ITEMS, SITE } from "@/lib/data";
import { metaFor } from "@/lib/seo";
import ReaderView from "@/components/ReaderView";
import { registerWebMcp } from "@/lib/webmcp";

function useRouteMeta(path: string) {
  useEffect(() => {
    const m = metaFor(path);
    if (!m) return;
    document.title = m.title;
    const set = (sel: string, attr: string, val: string) => document.head.querySelector(sel)?.setAttribute(attr, val);
    set('meta[name="description"]', "content", m.description);
    set('link[rel="canonical"]', "href", SITE.url + (path === "/" ? "/" : path));
  }, [path]);
}

export default function Layout({ children }: { children: ReactNode }) {
  const { pathname, hash } = useLocation();
  const [agent, setAgent] = useState(false);
  const [sweep, setSweep] = useState(0);
  const [menu, setMenu] = useState(false);
  const navigate = useNavigate();
  useRouteMeta(pathname);

  const toggle = (next: boolean) => {
    if (next === agent) return;
    setAgent(next); setSweep((s) => s + 1); setMenu(false);
    window.scrollTo({ top: 0 });
  };

  // WebMCP: expose this page's tools to in-browser agents (no-op when the API is absent).
  const api = useRef({ toggle, navigate });
  api.current = { toggle, navigate };
  useEffect(() => registerWebMcp({ setReader: (a) => api.current.toggle(a), open: (p) => api.current.navigate(p) }), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key === "Escape") setMenu(false);
      if (e.key === "a" && !e.metaKey && !e.ctrlKey && !e.altKey && !t.closest("button, a, input, textarea, select, summary, label, pre, [contenteditable]")) toggle(!agent);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  useEffect(() => {
    if (hash) setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView(), 50);
    else window.scrollTo({ top: 0 });
  }, [pathname, hash]);

  useEffect(() => setMenu(false), [pathname]);

  return (
    <div className="min-h-screen">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded focus:bg-[#2563EB] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white">Skip to content</a>
      {sweep > 0 && <div key={sweep} className="scanline" aria-hidden="true" />}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-[#0A0F1C]/95 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between gap-6">
          <Link to="/" className="inline-flex shrink-0 items-center whitespace-nowrap font-mono text-sm font-bold tracking-tight text-white" aria-label="Agent Native home">
            <span>agent</span><span className="text-[#f44800]">/</span><span>native</span><span className="caret !h-3.5 !w-1.5 ml-1 shrink-0 !align-baseline" aria-hidden="true" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-md border border-white/10 p-0.5 text-xs font-semibold" role="group" aria-label="Choose reader">
              <button aria-pressed={!agent} onClick={() => toggle(false)} className={`rounded px-3 py-1.5 transition-colors ${!agent ? "bg-white/10 text-white" : "text-white/50 hover:text-white"}`}>Human</button>
              <button aria-pressed={agent} onClick={() => toggle(true)} className={`rounded px-3 py-1.5 transition-colors ${agent ? "bg-emerald-400/20 text-emerald-300" : "text-white/50 hover:text-white"}`}>Agent</button>
            </div>
            <Link to="/#score" className="hidden sm:inline-flex rounded bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2563EB]/90 transition-colors">Take the scorecard</Link>
            <button className="p-2 text-white/70 hover:text-white transition-colors" aria-label={menu ? "Close menu" : "Open menu"} aria-expanded={menu} aria-controls="site-menu" onClick={() => setMenu(!menu)}>{menu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}</button>
          </div>
        </div>
        {menu && (
          <div className="container flex justify-end">
            <nav id="site-menu" className="w-full sm:w-72 rounded-b-md border border-t-0 border-white/10 bg-[#0A0F1C] px-4 py-3 shadow-2xl" aria-label="Main">
              {NAV_ITEMS.map((n) => {
                const here = !n.href.includes("#") && pathname === n.href;
                return <Link key={n.href} to={n.href} aria-current={here ? "page" : undefined} className={`block py-2.5 text-sm font-medium transition-colors ${here ? "text-white" : "text-white/70 hover:text-white"}`}>{n.label}</Link>;
              })}
              <Link to="/#score" className="mt-3 block sm:hidden rounded bg-[#2563EB] px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-[#2563EB]/90 transition-colors">Take the scorecard</Link>
            </nav>
          </div>
        )}
      </header>

      {agent ? <div id="main"><ReaderView path={pathname} /></div> : <main id="main">{children}</main>}

      <footer className="bg-[#0A0F1C] border-t border-white/5 text-white">
        <div className="container py-14 grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <p className="font-mono text-sm font-bold">agent<span className="text-[#f44800]">/</span>native</p>
            <p className="mt-3 text-sm text-white/50 max-w-xs leading-relaxed">A field guide to building software that AI agents can discover, use, and be trusted with.</p>
            <p className="mt-4 text-sm text-white/50">Part of <a href={SITE.network.url} className="text-white/80 underline decoration-white/30 hover:decoration-white transition-colors" target="_blank" rel="noopener noreferrer">{SITE.network.name} ↗</a></p>
            <p className="mt-2 text-sm text-white/50">Product-design companion to <a href={AIOS_COMPANION.operatingModel} className="text-white/80 underline decoration-white/30 hover:decoration-white transition-colors">AIOS ↗</a></p>
          </div>
          <div>
            <p className="label-mono text-white/50 mb-3">Read</p>
            <ul className="space-y-2 text-sm text-white/60">{NAV_ITEMS.map((n) => <li key={n.href}><Link to={n.href} className="hover:text-white transition-colors">{n.label}</Link></li>)}<li><Link to="/#score" className="hover:text-white transition-colors">Scorecard</Link></li></ul>
          </div>
          <div>
            <p className="label-mono text-white/50 mb-3">Machine-readable</p>
            <ul className="space-y-2 text-sm text-white/60 font-mono">
              <li><a href="/index.md" className="hover:text-white transition-colors">/index.md</a></li>
              <li><a href="/future.md" className="hover:text-white transition-colors">/future.md</a></li>
              <li><a href="/examples.md" className="hover:text-white transition-colors">/examples.md</a></li>
              <li><a href="/reference.md" className="hover:text-white transition-colors">/reference.md</a></li>
              <li><a href="/agents.md" className="hover:text-white transition-colors">/agents.md</a></li>
              <li><a href="/llms.txt" className="hover:text-white transition-colors">/llms.txt</a></li>
              <li><a href="/llms-full.txt" className="hover:text-white transition-colors">/llms-full.txt</a></li>
              <li><a href="/api/mcp" className="hover:text-white transition-colors">/api/mcp</a></li>
              <li><a href="/sitemap.xml" className="hover:text-white transition-colors">/sitemap.xml</a></li>
            </ul>
          </div>
          <div>
            <p className="label-mono text-white/50 mb-3">Try it</p>
            <p className="text-sm text-white/50 leading-relaxed">Press <kbd className="rounded border border-white/20 px-1.5 font-mono text-xs text-white/70">a</kbd> to switch between the human page and the agent view.</p>
          </div>
        </div>
        <div className="border-t border-white/5">
          <p className="container py-5 text-xs text-white/50">© 2026 {SITE.author}, {SITE.network.name}. Built for agent readers: every page is generated from one data file into HTML, Markdown, and JSON-LD.</p>
        </div>
      </footer>
    </div>
  );
}

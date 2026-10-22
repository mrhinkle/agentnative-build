import { Link } from "react-router";
import { SITE, type PageMeta, type Block, type Faq, type Source, type Project, PROJECTS, EXAMPLES_COMMON, EXAMPLES_SCORE_BLOCKS } from "@/lib/data";
import Inline from "@/components/Inline";
import HeroNetwork from "@/components/HeroNetwork";
import { Blocks, FaqList, SourceList } from "@/components/Blocks";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { glowMove } from "@/hooks/useGlow";

interface Props {
  meta: PageMeta;
  lede: string;
  blocks?: Block[];
  faq: Faq[];
  sources?: Source[];
  sourcesNote?: string;
  projects?: boolean;
}

function ProjectCard({ p }: { p: Project }) {
  const ref = useScrollReveal();
  return (
    <section ref={ref} className="reveal my-10 rounded-md border border-[#0A0F1C]/10 bg-white p-6 md:p-8" onMouseMove={glowMove}>
      <p className="label-mono text-[#f44800] mb-2">{p.kicker}</p>
      <h2 className="font-heading text-xl md:text-2xl font-bold text-[#0A0F1C] mb-4">{p.name}</h2>
      <p className="text-lg leading-relaxed text-[#0A0F1C]/85 border-l-4 border-[#f44800] pl-5 mb-4">{p.answer}</p>
      <div className="mb-5 rounded-md border border-[#0A0F1C]/10 border-l-4 border-l-[#2563EB] bg-[#2563EB]/[0.04] p-4">
        <p className="label-mono text-[#2563EB] mb-1">In plain English</p>
        <p className="text-[#0A0F1C]/80 leading-relaxed">{p.plain}</p>
      </div>
      <p className="mb-6 flex flex-wrap gap-x-5 gap-y-1 text-sm">
        {p.links.map((l) => <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="text-electric underline decoration-electric/30 hover:decoration-electric">{l.label} ↗</a>)}
      </p>
      <dl className="grid gap-x-8 gap-y-4 md:grid-cols-[170px_1fr]">
        {p.rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="label-mono text-[#2563EB] pt-1">{k}</dt>
            <dd className="text-[#0A0F1C]/70 leading-relaxed">{v}</dd>
          </div>
        ))}
      </dl>
      <h3 className="font-heading text-lg font-bold text-[#0A0F1C] mt-8 mb-3">What a product manager should notice</h3>
      <ul className="space-y-3 list-disc pl-6 marker:text-[#f44800] text-[#0A0F1C]/70">{p.pm.map((t) => <li key={t} className="pl-1 leading-relaxed"><Inline text={t} /></li>)}</ul>
      <h3 className="font-heading text-lg font-bold text-[#0A0F1C] mt-8 mb-3">What is still open</h3>
      <ul className="space-y-3 list-disc pl-6 marker:text-[#0A0F1C]/30 text-[#0A0F1C]/70">{p.open.map((t) => <li key={t} className="pl-1 leading-relaxed">{t}</li>)}</ul>
    </section>
  );
}

export default function ArticlePage({ meta, lede, blocks, faq, sources, sourcesNote, projects }: Props) {
  return (
    <div>
      <section className="hero-dark relative overflow-hidden">
        <HeroNetwork />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050810]/80 to-[#0A0F1C]/60 pointer-events-none" />
        <div className="container relative z-10 pt-32 pb-16 md:pb-20 max-w-4xl">
          <p className="text-xs text-white/50 mb-4"><Link to="/" className="hover:text-white transition-colors">Agent Native</Link> <span className="mx-1">/</span> {meta.crumb}</p>
          <p className="label-mono text-[#f44800] mb-4 text-sm tracking-[0.2em]">{meta.label}</p>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-[3.25rem] font-bold text-white leading-[1.1] mb-6">{meta.h1}</h1>
          <p className="text-lg text-white/70 leading-relaxed max-w-3xl"><Inline text={lede} dark /></p>
          <p className="mt-6 font-mono text-xs text-white/50">By {SITE.author} · Updated {SITE.modified}</p>
        </div>
      </section>
      <section className="content-white pt-6 pb-20">
        <div className="container max-w-3xl">
          {blocks && <Blocks blocks={blocks} />}
          {projects && (
            <>
              {PROJECTS.map((p) => <ProjectCard key={p.name} p={p} />)}
              <Blocks blocks={EXAMPLES_SCORE_BLOCKS} />
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-[#0A0F1C] mt-14 mb-4">What do the two have in common?</h2>
              <ol className="space-y-3 list-decimal pl-6 marker:font-mono marker:text-[#f44800] text-[#0A0F1C]/70">{EXAMPLES_COMMON.map((t) => <li key={t} className="pl-1 leading-relaxed"><Inline text={t} /></li>)}</ol>
              <p className="my-5 text-[#0A0F1C]/70 leading-relaxed">Compare your own product with the <Link to="/#score" className="text-electric underline decoration-electric/30 hover:decoration-electric">12-question scorecard</Link>, or read about <Link to="/future" className="text-electric underline decoration-electric/30 hover:decoration-electric">where interfaces are heading</Link>.</p>
            </>
          )}
          <FaqList faqs={faq} />
          {sources && <SourceList sources={sources} note={sourcesNote} />}
        </div>
      </section>
    </div>
  );
}

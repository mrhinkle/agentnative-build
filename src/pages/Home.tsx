import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import {
  HOME, HOME_DEFINITION, HOME_DEFINITION_MORE, STAGES, ANATOMY, SNIPPETS, AVOID, TIMELINE, HOME_FAQ,
} from "@/lib/data";
import SectionHeader from "@/components/SectionHeader";
import HeroNetwork from "@/components/HeroNetwork";
import HeroTerminal from "@/components/HeroTerminal";
import ToolMarquee from "@/components/ToolMarquee";
import Principles from "@/components/Principles";
import Demo from "@/components/Demo";
import Scorecard from "@/components/Scorecard";
import { CodeBlock, DataTable, FaqList } from "@/components/Blocks";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { glowMove } from "@/hooks/useGlow";

export default function Home() {
  const defRef = useScrollReveal();
  const anatomyRef = useScrollReveal();
  const avoidRef = useScrollReveal<HTMLUListElement>();
  const timeRef = useScrollReveal<HTMLOListElement>();
  const deepRef = useScrollReveal();

  return (
    <div>
      {/* ── HERO (dark) ── */}
      <section className="hero-dark relative min-h-[88vh] flex items-center overflow-hidden">
        <HeroNetwork />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050810]/95 via-[#0A0F1C]/70 to-transparent pointer-events-none" />
        <div className="container relative z-10 pt-28 pb-16 lg:pt-32 lg:pb-20 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
          <div>
            <p className="label-mono text-[#f44800] mb-4 text-sm tracking-[0.2em]">{HOME.label}</p>
            <h1 className="font-heading text-5xl md:text-6xl lg:text-[4.25rem] font-bold text-white leading-[1.05] mb-6">{HOME.h1}</h1>
            <p className="text-lg text-white/70 leading-relaxed mb-8 max-w-xl"><strong className="text-white font-semibold">Agent-native software</strong>{HOME_DEFINITION.replace("Agent-native software", "")}</p>
            <div className="flex flex-wrap gap-3">
              <Link to="/#score" className="inline-flex items-center gap-2 rounded bg-[#2563EB] px-6 py-3 text-sm font-semibold text-white hover:bg-[#2563EB]/90 transition-colors">Score your product <ArrowRight className="w-4 h-4" /></Link>
              <Link to="/future" className="inline-flex items-center gap-2 rounded border border-white/10 px-6 py-3 text-sm font-semibold text-white/60 hover:text-white hover:border-white/25 transition-colors">See what comes next</Link>
            </div>
            <p className="mt-6 text-sm text-white/50">Try the <span className="text-emerald-300 font-semibold">Agent</span> switch up top. It shows this page the way an agent receives it.</p>
          </div>
          <HeroTerminal />
        </div>
      </section>
      <ToolMarquee />

      {/* ── DEFINITION (white) ── */}
      <section id="define" className="content-white py-16 md:py-24">
        <div className="container">
          <SectionHeader label="01" title="What does agent-native mean?" />
          <div ref={defRef} className="reveal grid lg:grid-cols-2 gap-10 items-start">
            <p className="font-heading text-2xl md:text-3xl leading-snug text-[#0A0F1C]">
              A product is <span className="text-[#f44800]">agent-native</span> when an autonomous agent can <em>discover</em> it, <em>understand</em> it, <em>act</em> in it, be <em>limited</em> inside it, and <em>verify</em> what happened.
            </p>
            <div className="space-y-4 text-[#0A0F1C]/70 leading-relaxed">{HOME_DEFINITION_MORE.map((t) => <p key={t}>{t}</p>)}</div>
          </div>
          <h3 className="font-heading text-xl font-bold text-[#0A0F1C] mt-14 mb-2">Three stages</h3>
          <DataTable head={STAGES.head} rows={STAGES.rows} />
        </div>
      </section>

      {/* ── PRINCIPLES (gray) ── */}
      <section id="principles" className="content-gray py-16 md:py-24">
        <div className="container">
          <SectionHeader label="02" title="What are the principles of agent-native design?" description="Eight properties. Select a card to see the bolted-on version next to the native one." />
          <Principles />
        </div>
      </section>

      {/* ── DEMO (dark, cinematic) ── */}
      <section id="demo" className="hero-dark py-16 md:py-24">
        <div className="container">
          <SectionHeader dark label="03" title="Same task, three readers" description="Refund order #1042. An illustrative example, not a benchmark." />
          <Demo />
        </div>
      </section>

      {/* ── ANATOMY (white) ── */}
      <section id="anatomy" className="content-white py-16 md:py-24">
        <div className="container">
          <SectionHeader label="04" title="What does an agent-native product look like?" description="Five layers, from being found to being trusted. The tools named here (llms.txt, AGENTS.md, MCP) are the current building blocks." />
          <div ref={anatomyRef} className="stagger grid gap-3">
            {ANATOMY.map((a) => (
              <div key={a.n} onMouseMove={glowMove} className="glow-card grid sm:grid-cols-[180px_1fr] gap-2 sm:gap-6 rounded-md border border-[#0A0F1C]/10 bg-white px-6 py-5">
                <p className="font-heading font-bold text-[#0A0F1C]"><span className="label-mono text-[#f44800] mr-3">{a.n}</span>{a.name}</p>
                <p className="text-sm text-[#0A0F1C]/60 leading-relaxed">{a.text}</p>
              </div>
            ))}
          </div>
          <div className="grid lg:grid-cols-2 gap-6 mt-8">
            <CodeBlock caption="/llms.txt" text={SNIPPETS.llms} />
            <CodeBlock caption="An error an agent can act on" text={SNIPPETS.error} />
          </div>
        </div>
      </section>

      {/* ── SCORECARD (gray) ── */}
      <section id="score" className="content-gray py-16 md:py-24">
        <div className="container">
          <SectionHeader label="05" title="How agent-native is your product?" description="Twelve yes-or-no questions, one point each. If a question does not apply (a read-only site has no writes, for example), leave it unchecked and score out of the questions that do. Nothing leaves your browser." />
          <Scorecard />
        </div>
      </section>

      {/* ── AVOID + TIMELINE (white) ── */}
      <section className="content-white py-16 md:py-24">
        <div className="container grid lg:grid-cols-2 gap-14">
          <div>
            <SectionHeader label="06" title="Agent-washing: what to avoid" />
            <ul ref={avoidRef} className="stagger space-y-2">
              {AVOID.map((a) => (
                <li key={a[0]} className="rounded-md border border-[#0A0F1C]/10 border-l-4 border-l-[#f44800] bg-white px-5 py-3 text-sm text-[#0A0F1C]/70"><strong className="text-[#0A0F1C]">{a[0]}</strong> {a[1]}</li>
              ))}
            </ul>
          </div>
          <div>
            <SectionHeader label="07" title="How we got here" />
            <ol ref={timeRef} className="stagger relative border-l-2 border-[#0A0F1C]/10 ml-2 space-y-6">
              {TIMELINE.map((t) => (
                <li key={t[0]} className="relative pl-6">
                  <span className="absolute -left-[7px] top-2 w-3 h-3 rounded-full bg-[#f44800]" />
                  <p className="label-mono text-[#2563EB]">{t[0]}</p>
                  <p className="text-[#0A0F1C]/70 mt-1 leading-relaxed">{t[1]}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ── GO DEEPER (dark CTA) ── */}
      <section className="hero-dark py-16 md:py-20">
        <div className="container">
          <SectionHeader dark label="08" title="Go deeper" />
          <div ref={deepRef} className="stagger grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { to: "/future", t: "The future of interfaces", d: "MCP, MCP Apps, WebMCP, and conversational UI that adds to forms instead of replacing them." },
              { to: "/product-managers", t: "For product managers", d: "How to pick agent use cases, what to ask engineering, what to measure, and what to put in the spec. No jargon." },
              { to: "/examples", t: "Real examples", d: "ConferenceOS and Agent Kontrol: what agent-native looks like in two products we build and run, scored honestly." },
              { to: "/agents", t: "For agents", d: "WebMCP tools, a remote MCP server, llms-full.txt, and Markdown negotiation: every way an agent can use this site." },
            ].map((c) => (
              <Link key={c.to} to={c.to} onMouseMove={glowMove} className="glow-card glow-card-dark group rounded-md border border-white/5 bg-white/[0.02] p-8 hover:bg-white/[0.04] hover:border-white/10 transition-colors">
                <h3 className="font-heading text-xl font-bold text-white mb-2">{c.t}</h3>
                <p className="text-sm text-white/50 leading-relaxed mb-4">{c.d}</p>
                <span className="inline-flex items-center gap-2 text-sm text-[#f44800] font-semibold">Read <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ (white) ── */}
      <section className="content-white pb-20">
        <div className="container max-w-3xl"><FaqList faqs={HOME_FAQ} title="Questions" /></div>
      </section>
    </div>
  );
}

const TOOLS = [
  "refund_order", "get_schedule", "add_to_schedule", "check_in_attendee", "assign_room", "approve_change",
  "recall_memory", "queue_task", "get_receipt", "dry_run", "list_sessions", "grant_scope", "revoke_token", "search_docs",
];

/** Scrolling strip of tool-call chips (pauses on hover, static under reduced motion). */
export default function ToolMarquee() {
  const chips = [...TOOLS, ...TOOLS];
  return (
    <div className="marquee overflow-hidden border-y border-white/5 bg-[#080C18] py-4" aria-label="Examples of tools an agent can call" role="group">
      <div className="marquee-track gap-3 pr-3">
        {chips.map((t, i) => (
          <span key={i} aria-hidden={i >= TOOLS.length} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 font-mono text-xs text-white/60 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f44800]" />{t}()
          </span>
        ))}
      </div>
    </div>
  );
}

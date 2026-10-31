import { useEffect, useState } from "react";
import { CONSENT } from "@/lib/data";
import { GA_ID, gpc, loadGa, readConsent, writeConsent, type Consent } from "@/lib/analytics";

/** Analytics-only opt-in. Renders nothing during prerender; decides on the client after hydration. */
export default function ConsentBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!GA_ID || gpc()) return;
    const c = readConsent();
    if (c === "granted") loadGa();
    else if (c === null) setOpen(true);
    const reopen = () => setOpen(true);
    window.addEventListener("an:consent", reopen);
    return () => window.removeEventListener("an:consent", reopen);
  }, []);

  if (!open) return null;
  const choose = (c: Consent) => { writeConsent(c); setOpen(false); };

  return (
    <div role="region" aria-labelledby="an-consent-title" className="fixed inset-x-4 bottom-4 z-[60] mx-auto max-w-2xl rounded-md border border-white/10 bg-[#0A0F1C]/95 p-5 text-white shadow-2xl backdrop-blur md:flex md:items-center md:gap-6">
      <div className="text-sm leading-relaxed">
        <p id="an-consent-title" className="font-semibold">{CONSENT.title}</p>
        <p className="mt-1 text-white/70">{CONSENT.body}</p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 md:mt-0 md:w-56 md:shrink-0">
        <button onClick={() => choose("granted")} className="rounded bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2563EB]/90 transition-colors">{CONSENT.accept}</button>
        <button onClick={() => choose("denied")} className="rounded border border-white/25 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition-colors">{CONSENT.decline}</button>
      </div>
    </div>
  );
}

/** Footer control that reopens the banner so a reader can change their mind. */
export function ConsentLink({ className }: { className?: string }) {
  const [show, setShow] = useState(false);
  useEffect(() => setShow(!!GA_ID && !gpc()), []);
  if (!show) return null;
  return <button type="button" onClick={() => window.dispatchEvent(new Event("an:consent"))} className={className}>{CONSENT.link}</button>;
}

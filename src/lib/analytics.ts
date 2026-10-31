/**
 * Google Analytics 4, loaded only after the reader opts in. Nothing from Google is fetched and no cookie
 * is set until consent is "granted". The Measurement ID comes from VITE_GA_MEASUREMENT_ID at build time;
 * when it is unset (local dev, previews) analytics is off and the consent banner never shows.
 */

export const GA_ID = (import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined)?.trim() || "";
const CONSENT_SLOT = "an-consent"; // localStorage entry name

export type Consent = "granted" | "denied";

declare global {
  interface Window { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void }
  interface Navigator { globalPrivacyControl?: boolean }
}

export function readConsent(): Consent | null {
  try {
    const v = localStorage.getItem(CONSENT_SLOT);
    return v === "granted" || v === "denied" ? v : null;
  } catch { return null; }
}

/** A Global Privacy Control signal counts as a standing "no": we do not ask, and we do not load. */
export const gpc = () => typeof navigator !== "undefined" && navigator.globalPrivacyControl === true;

export function writeConsent(c: Consent) {
  try { localStorage.setItem(CONSENT_SLOT, c); }
  catch {
    // Storage blocked: the choice lasts for this page only. Never leave an older "granted" behind a "denied".
    if (c === "denied") try { localStorage.removeItem(CONSENT_SLOT); } catch { /* nothing stored we can reach */ }
  }
  if (c === "granted") loadGa();
  else revoke();
}

/** Stop all GA hits for the rest of the visit, including the cookieless pings Consent Mode still sends when denied. */
function revoke() {
  if (!GA_ID || typeof window === "undefined") return;
  (window as any)[`ga-disable-${GA_ID}`] = true;
  window.gtag?.("consent", "update", { analytics_storage: "denied" });
}

let loaded = false;
export function loadGa() {
  if (!GA_ID || typeof window === "undefined") return;
  (window as any)[`ga-disable-${GA_ID}`] = false;
  if (loaded) {
    // Allowed again after a "No thanks" on this page: the tag is already here, so just lift the denial.
    window.gtag?.("consent", "update", { analytics_storage: "granted" });
    return;
  }
  loaded = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer!.push(arguments); };
  window.gtag("consent", "default", { analytics_storage: "granted", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
  window.gtag("js", new Date());
  // The config call sends the first page_view; later SPA route changes are counted by GA4 enhanced measurement
  // ("page changes based on browser history events", on by default), so there is no manual page_view here.
  window.gtag("config", GA_ID);
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
  document.head.appendChild(s);
}

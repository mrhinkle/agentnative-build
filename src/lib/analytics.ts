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
  try { localStorage.setItem(CONSENT_SLOT, c); } catch { /* storage blocked: choice lasts for this page only */ }
  if (c === "granted") loadGa();
  else window.gtag?.("consent", "update", { analytics_storage: "denied" });
}

let loaded = false;
export function loadGa() {
  if (loaded || !GA_ID || typeof window === "undefined") return;
  loaded = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer!.push(arguments); };
  window.gtag("consent", "default", { analytics_storage: "granted", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
  window.gtag("js", new Date());
  window.gtag("config", GA_ID, { send_page_view: false });
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
  document.head.appendChild(s);
  trackPageView(location.pathname + location.search);
}

/** SPA page view. A no-op until consent has loaded gtag. */
export function trackPageView(path: string) {
  if (!loaded) return;
  window.gtag?.("event", "page_view", { page_path: path, page_location: location.origin + path, page_title: document.title });
}

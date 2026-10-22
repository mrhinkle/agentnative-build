import type { MouseEvent } from "react";

/** Sets --mx/--my on the hovered element for the cursor-tracking `.glow-card` effect. */
export function glowMove(e: MouseEvent<HTMLElement>) {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
}

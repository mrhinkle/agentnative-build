import { useCallback, useRef } from "react";

/** Adds `.visible` once the element is 10% in view. Pair with `.reveal` / `.stagger`. */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(threshold = 0.1) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  return useCallback(
    (node: T | null) => {
      observerRef.current?.disconnect();
      observerRef.current = null;
      if (!node) return;
      if (typeof IntersectionObserver === "undefined") { node.classList.add("visible"); return; }
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) { node.classList.add("visible"); observer.disconnect(); }
      }, { threshold });
      observer.observe(node);
      observerRef.current = observer;
    },
    [threshold]
  );
}

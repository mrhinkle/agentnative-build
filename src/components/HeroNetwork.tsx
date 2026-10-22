import { useEffect, useRef } from "react";

/** Ambient canvas: a drifting graph with tool-call packets travelling along edges. */
export default function HeroNetwork() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, raf = 0, visible = true;
    const mouse = { x: -999, y: -999 };

    type Node = { x: number; y: number; vx: number; vy: number };
    type Packet = { a: number; b: number; t: number; speed: number; flame: boolean };
    let nodes: Node[] = [];
    let edges: [number, number][] = [];
    let packets: Packet[] = [];

    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.max(26, Math.min(60, Math.round((w * h) / 22000)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.18, vy: (Math.random() - 0.5) * 0.18,
      }));
      edges = [];
      nodes.forEach((n, i) => {
        nodes
          .map((m, j) => ({ j, d: (n.x - m.x) ** 2 + (n.y - m.y) ** 2 }))
          .filter((o) => o.j !== i).sort((p, q) => p.d - q.d).slice(0, 2)
          .forEach((o) => { if (!edges.some(([a, b]) => (a === i && b === o.j) || (a === o.j && b === i))) edges.push([i, o.j]); });
      });
      packets = [];
    };

    const spawn = () => {
      if (!edges.length || packets.length > 14) return;
      const [a, b] = edges[Math.floor(Math.random() * edges.length)];
      const flip = Math.random() > 0.5;
      packets.push({ a: flip ? b : a, b: flip ? a : b, t: 0, speed: 0.006 + Math.random() * 0.01, flame: Math.random() > 0.55 });
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const n of nodes) {
        if (!reduce) {
          n.x += n.vx; n.y += n.vy;
          if (n.x < 0 || n.x > w) n.vx *= -1;
          if (n.y < 0 || n.y > h) n.vy *= -1;
        }
      }
      ctx.lineWidth = 1;
      for (const [a, b] of edges) {
        const A = nodes[a], B = nodes[b];
        const mid = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 };
        const near = Math.hypot(mid.x - mouse.x, mid.y - mouse.y) < 160;
        ctx.strokeStyle = near ? "rgba(37,99,235,0.55)" : "rgba(255,255,255,0.07)";
        ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.stroke();
      }
      for (const n of nodes) {
        const near = Math.hypot(n.x - mouse.x, n.y - mouse.y) < 120;
        ctx.fillStyle = near ? "rgba(244,72,0,0.95)" : "rgba(255,255,255,0.25)";
        ctx.beginPath(); ctx.arc(n.x, n.y, near ? 3 : 1.8, 0, Math.PI * 2); ctx.fill();
      }
      if (!reduce) {
        if (Math.random() < 0.06) spawn();
        packets = packets.filter((p) => p.t < 1);
        for (const p of packets) {
          p.t += p.speed;
          const A = nodes[p.a], B = nodes[p.b];
          const x = A.x + (B.x - A.x) * p.t, y = A.y + (B.y - A.y) * p.t;
          const color = p.flame ? "244,72,0" : "37,99,235";
          const g = ctx.createRadialGradient(x, y, 0, x, y, 12);
          g.addColorStop(0, `rgba(${color},0.9)`); g.addColorStop(1, `rgba(${color},0)`);
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = `rgba(${color},1)`; ctx.beginPath(); ctx.arc(x, y, 2.4, 0, Math.PI * 2); ctx.fill();
        }
      }
    };

    const loop = () => { if (visible) draw(); raf = requestAnimationFrame(loop); };
    build();
    if (reduce) draw(); else raf = requestAnimationFrame(loop);

    const onMove = (e: PointerEvent) => { const r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; };
    const onLeave = () => { mouse.x = mouse.y = -999; };
    const ro = new ResizeObserver(() => { build(); if (reduce) draw(); });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(canvas);
    window.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); window.removeEventListener("pointermove", onMove); };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="absolute inset-0 w-full h-full" />;
}

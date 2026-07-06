import { useEffect, useRef } from "react";

/**
 * A live, drifting field of nodes + proximity links rendered to canvas — the
 * hero's signature element. On-theme (the site IS a network). Cursor-reactive,
 * DPR-capped, pauses when scrolled off-screen, re-reads the accent on theme
 * change, and renders a single static frame under prefers-reduced-motion.
 */
export function NetworkField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const parent = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !parent || !ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const readAccent = () =>
      getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#2dd4a7";

    const rgb = (hex: string): [number, number, number] => {
      const h = hex.replace("#", "");
      const f = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
      const n = parseInt(f, 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    };

    type Node = { x: number; y: number; vx: number; vy: number };
    let w = 0, h = 0, nodes: Node[] = [], color = rgb(readAccent());
    const mouse = { x: -9999, y: -9999 };
    const LINK = 150;

    const resize = () => {
      const r = parent.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(68, Math.max(22, Math.floor((w * h) / 15000)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
      }));
    };

    const frame = () => {
      const [r, g, b] = color;
      ctx.clearRect(0, 0, w, h);
      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
        const dx = mouse.x - n.x, dy = mouse.y - n.y;
        if (dx * dx + dy * dy < 160 * 160) { n.vx += dx * 0.00002; n.vy += dy * 0.00002; }
        n.vx = Math.max(-0.5, Math.min(0.5, n.vx));
        n.vy = Math.max(-0.5, Math.min(0.5, n.vy));
      }
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], c = nodes[j];
          const d = Math.hypot(a.x - c.x, a.y - c.y);
          if (d < LINK) {
            ctx.strokeStyle = `rgba(${r},${g},${b},${(1 - d / LINK) * 0.55})`;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(c.x, c.y); ctx.stroke();
          }
        }
      }
      for (const n of nodes) {
        ctx.fillStyle = `rgba(${r},${g},${b},0.9)`;
        ctx.beginPath(); ctx.arc(n.x, n.y, 1.8, 0, Math.PI * 2); ctx.fill();
      }
    };

    let raf = 0;
    let running = false;
    const loop = () => { frame(); raf = requestAnimationFrame(loop); };
    const start = () => { if (running) return; running = true; raf = requestAnimationFrame(loop); };
    const stop = () => { running = false; cancelAnimationFrame(raf); };

    resize();
    if (reduce) { frame(); } else { start(); }

    const onMove = (e: PointerEvent) => {
      const r = parent.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    };
    const onLeave = () => { mouse.x = -9999; mouse.y = -9999; };
    const onResize = () => resize();
    const io = new IntersectionObserver(
      ([entry]) => {
        if (reduce) return;
        if (entry.isIntersecting) start(); else stop();
      },
      { threshold: 0 },
    );
    io.observe(canvas);
    const themeObs = new MutationObserver(() => { color = rgb(readAccent()); if (reduce) frame(); });
    themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    parent.addEventListener("pointermove", onMove);
    parent.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", onResize);

    return () => {
      stop(); io.disconnect(); themeObs.disconnect();
      parent.removeEventListener("pointermove", onMove);
      parent.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return <canvas ref={ref} className="net-field" aria-hidden="true" />;
}

import { useEffect, useRef } from "react";

/**
 * Canvas starfield with slow twinkle and occasional drifting sparkles.
 * Fills its parent (parent must be position:relative with overflow hidden).
 * DPR-capped, pauses off-screen, renders one static frame under
 * prefers-reduced-motion.
 */
export function Starfield({ density = 1 }: { density?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const parent = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !parent || !ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    type Star = { x: number; y: number; r: number; base: number; phase: number; speed: number };
    type Spark = { x: number; y: number; vx: number; vy: number; life: number; max: number };
    let w = 0, h = 0, stars: Star[] = [];
    let sparks: Spark[] = [];

    const resize = () => {
      const r = parent.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.floor(((w * h) / 4200) * density);
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() < 0.85 ? Math.random() * 0.8 + 0.3 : Math.random() * 1.4 + 0.8,
        base: Math.random() * 0.5 + 0.15,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.9 + 0.25,
      }));
    };

    const frame = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        const tw = reduce ? 1 : 0.65 + 0.35 * Math.sin(s.phase + (t / 1000) * s.speed);
        ctx.fillStyle = `rgba(226, 232, 244, ${s.base * tw})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!reduce) {
        if (sparks.length < 3 && Math.random() < 0.012) {
          sparks.push({
            x: Math.random() * w,
            y: Math.random() * h * 0.8,
            vx: (Math.random() - 0.5) * 0.5,
            vy: Math.random() * 0.35 + 0.1,
            life: 0,
            max: 240 + Math.random() * 200,
          });
        }
        sparks = sparks.filter((p) => p.life < p.max);
        for (const p of sparks) {
          p.life++; p.x += p.vx; p.y += p.vy;
          const a = Math.sin((p.life / p.max) * Math.PI) * 0.9;
          // four-point sparkle
          ctx.strokeStyle = `rgba(240, 244, 252, ${a})`;
          ctx.lineWidth = 1;
          const s = 3.2;
          ctx.beginPath();
          ctx.moveTo(p.x - s, p.y); ctx.lineTo(p.x + s, p.y);
          ctx.moveTo(p.x, p.y - s); ctx.lineTo(p.x, p.y + s);
          ctx.stroke();
        }
      }
    };

    let raf = 0;
    let running = false;
    const loop = (t: number) => { frame(t); raf = requestAnimationFrame(loop); };
    const start = () => { if (running || reduce) return; running = true; raf = requestAnimationFrame(loop); };
    const stop = () => { running = false; cancelAnimationFrame(raf); };

    resize();
    if (reduce) frame(0); else start();

    const onResize = () => { resize(); if (reduce) frame(0); };
    const io = new IntersectionObserver(
      ([entry]) => {
        if (reduce) return;
        if (entry.isIntersecting) start(); else stop();
      },
      { threshold: 0 },
    );
    io.observe(canvas);
    window.addEventListener("resize", onResize);
    return () => {
      stop(); io.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [density]);

  return <canvas ref={ref} className="stars24" aria-hidden="true" />;
}

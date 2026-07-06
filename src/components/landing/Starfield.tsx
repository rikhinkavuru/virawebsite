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
        if (sparks.length < 6 && Math.random() < 0.03) {
          sparks.push({
            x: Math.random() * w,
            y: Math.random() * h * 0.85,
            vx: (Math.random() - 0.5) * 0.4,
            vy: Math.random() * 0.25 + 0.05,
            life: 0,
            max: 200 + Math.random() * 220,
          });
        }
        sparks = sparks.filter((p) => p.life < p.max);
        for (const p of sparks) {
          p.life++; p.x += p.vx; p.y += p.vy;
          const a = Math.sin((p.life / p.max) * Math.PI);
          const s = 5 + a * 5; // flare arms grow with brightness

          // luminous halo behind the flare
          const halo = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, s * 2.6);
          halo.addColorStop(0, `rgba(235, 242, 255, ${a * 0.55})`);
          halo.addColorStop(0.35, `rgba(205, 222, 250, ${a * 0.18})`);
          halo.addColorStop(1, "rgba(205, 222, 250, 0)");
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(p.x, p.y, s * 2.6, 0, Math.PI * 2);
          ctx.fill();

          // four-point flare with tapered arms (thicker core, thin tips)
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.fillStyle = `rgba(248, 251, 255, ${Math.min(1, a * 1.2)})`;
          for (let k = 0; k < 4; k++) {
            ctx.rotate(Math.PI / 2);
            ctx.beginPath();
            ctx.moveTo(0, -1.1);
            ctx.lineTo(s, 0);
            ctx.lineTo(0, 1.1);
            ctx.closePath();
            ctx.fill();
          }
          ctx.restore();

          // hot core
          ctx.fillStyle = `rgba(255, 255, 255, ${a})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.4 + a * 0.8, 0, Math.PI * 2);
          ctx.fill();
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

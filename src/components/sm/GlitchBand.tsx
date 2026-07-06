import { useEffect, useRef } from "react";

/**
 * Full-bleed dark band with a scanline-glitch waveform rendered to canvas —
 * horizontal green ridges that ripple and tear like a corrupted signal.
 * DPR-capped, pauses off-screen, static frame under reduced motion.
 */
export function GlitchBand() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const parent = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !parent || !ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0;

    const resize = () => {
      const r = parent.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    // Deterministic pseudo-noise so the field is stable frame-to-frame.
    const noise = (x: number, y: number) =>
      Math.sin(x * 12.9898 + y * 78.233) * 43758.5453 % 1;

    const frame = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      const time = reduce ? 0 : t / 1000;
      const rows = Math.floor(h / 4);
      for (let i = 0; i < rows; i++) {
        const y = i * 4;
        const ny = y / h;
        // ridge intensity: two moving blobs of energy
        const e1 = Math.exp(-Math.pow((ny - 0.5 - 0.22 * Math.sin(time * 0.5)) * 3.2, 2));
        const e2 = Math.exp(-Math.pow((ny - 0.42 + 0.18 * Math.cos(time * 0.34)) * 4.5, 2));
        const energy = Math.min(1, e1 * 0.9 + e2 * 0.7);
        if (energy < 0.04) continue;

        // glitch tear: occasional horizontal offset per row
        const tear = Math.abs(noise(i, Math.floor(time * 2))) > 0.93
          ? (Math.abs(noise(i * 3.7, Math.floor(time * 2))) - 0.5) * 90
          : 0;

        const xStart = w * (0.08 + 0.1 * Math.abs(noise(i, 1)));
        const xEnd = w * (0.92 - 0.1 * Math.abs(noise(i, 2)));
        const seg = 26 + Math.floor(Math.abs(noise(i, 3)) * 60);

        for (let x = xStart; x < xEnd; x += seg) {
          const gate = Math.abs(noise(i * 1.3, Math.floor(x / seg) + Math.floor(time * 3)));
          if (gate < 0.42) continue;
          const alpha = energy * (0.14 + 0.5 * gate);
          const hueShift = gate > 0.9 ? "195, 250, 215" : "56, 190, 110";
          ctx.fillStyle = `rgba(${hueShift}, ${alpha})`;
          ctx.fillRect(x + tear, y, seg * (0.4 + gate * 0.5), 2.2);
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
  }, []);

  return (
    <div className="smband" aria-hidden="true">
      <canvas ref={ref} />
      <div className="smband-mark">
        <svg width="64" height="64" viewBox="0 0 26 26">
          <path d="M6.5 8 L13 19 L19.5 8 H15.8 L13 13.4 L10.2 8 Z" fill="#fff" />
        </svg>
      </div>
    </div>
  );
}

import { useEffect, useRef } from "react";
import { ViraMark } from "./chrome";

/**
 * Full-bleed dark band: two reaching hands (the Creation-of-Adam gesture,
 * public-domain source, own silhouette) rendered as fine horizontal
 * scanlines whose brightness follows a soft blurred mask. The glitch —
 * horizontal tears and flicker — plays once on load (~1.4s), then the
 * image settles and stays static. Bright green edge fills on both sides,
 * white pixel mark centered. Static frame under reduced motion.
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

    // --- soft silhouette mask (offscreen, blurred, sampled per row) ---
    const MW = 480, MH = 240;
    const mask = document.createElement("canvas");
    mask.width = MW; mask.height = MH;
    const mctx = mask.getContext("2d")!;
    let maskData: Uint8ClampedArray | null = null;

    const blob = (
      cx: number, cy: number, rx: number, ry: number, rot: number, alpha = 1,
    ) => {
      mctx.save();
      mctx.translate(cx, cy);
      mctx.rotate(rot);
      mctx.globalAlpha = alpha;
      mctx.beginPath();
      mctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
      mctx.fill();
      mctx.restore();
    };

    const drawMask = () => {
      mctx.clearRect(0, 0, MW, MH);
      mctx.fillStyle = "#fff";
      mctx.filter = "blur(7px)";

      // Left hand — descends from the top-left, palm at mid-height,
      // fingers reaching toward the center.
      blob(60, 30, 90, 55, 0.5);              // upper arm mass off-canvas
      blob(120, 85, 62, 42, 0.55);            // forearm
      blob(168, 128, 40, 28, 0.35);           // palm
      blob(205, 143, 26, 11, 0.18);           // index finger toward center
      blob(196, 158, 20, 9, 0.35, 0.9);       // middle finger, drooped
      blob(182, 168, 16, 8, 0.5, 0.8);        // ring finger curled
      // Right hand — enters from the right edge at mid-height, reaching left.
      blob(430, 105, 95, 48, -0.12);          // arm mass off-canvas right
      blob(352, 118, 55, 34, -0.18);          // forearm
      blob(303, 128, 34, 24, -0.25);          // palm
      blob(268, 133, 25, 10, -0.12, 1);       // extended index finger
      blob(280, 148, 18, 8, -0.4, 0.85);      // thumb below
      mctx.filter = "none";

      maskData = mctx.getImageData(0, 0, MW, MH).data;
    };

    const sampleMask = (nx: number, ny: number) => {
      if (!maskData) return 0;
      const mx = Math.max(0, Math.min(MW - 1, Math.floor(nx * MW)));
      const my = Math.max(0, Math.min(MH - 1, Math.floor(ny * MH)));
      return maskData[(my * MW + mx) * 4 + 3] / 255;
    };

    const resize = () => {
      const r = parent.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const noise = (x: number, y: number) =>
      Math.abs(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453 % 1);

    const GLITCH_MS = 1400;

    /** @param g 0..1 remaining glitch energy (0 = settled/static) */
    const frame = (g: number, seed: number) => {
      ctx.clearRect(0, 0, w, h);

      // bright edge fills, fading inward
      const edgeW = w * 0.1;
      const lg = ctx.createLinearGradient(0, 0, edgeW, 0);
      lg.addColorStop(0, "rgba(23, 132, 63, 0.85)");
      lg.addColorStop(1, "rgba(23, 132, 63, 0)");
      ctx.fillStyle = lg;
      ctx.fillRect(0, 0, edgeW, h);
      const rg = ctx.createLinearGradient(w, 0, w - edgeW, 0);
      rg.addColorStop(0, "rgba(23, 132, 63, 0.85)");
      rg.addColorStop(1, "rgba(23, 132, 63, 0)");
      ctx.fillStyle = rg;
      ctx.fillRect(w - edgeW, 0, edgeW, h);

      // scanline field
      const pitch = 3;
      const rows = Math.ceil(h / pitch);
      for (let i = 0; i < rows; i++) {
        const y = i * pitch;
        const ny = y / h;

        // one-shot glitch: row tears + flicker, decaying with g
        const tearRoll = noise(i, seed);
        const tear = g > 0 && tearRoll > 0.82 ? (tearRoll - 0.5) * 160 * g : 0;
        const flicker = g > 0 ? 1 - g * 0.5 * noise(i * 2.1, seed + 7) : 1;

        // walk the row in fine steps, drawing runs where the mask has ink
        const step = 5;
        let runStart = -1;
        let runInk = 0;
        for (let x = 0; x <= w; x += step) {
          const ink = sampleMask(x / w, ny);
          const ragged = noise(i * 1.7, x * 0.13) * 0.16; // ragged line ends
          const on = ink > 0.06 + ragged;
          if (on) {
            if (runStart < 0) { runStart = x; runInk = 0; }
            runInk = Math.max(runInk, ink);
          }
          if ((!on || x + step > w) && runStart >= 0) {
            const a = Math.min(0.9, runInk * 0.95) * flicker;
            ctx.fillStyle = runInk > 0.75
              ? `rgba(170, 240, 195, ${a})`
              : `rgba(58, 196, 112, ${a})`;
            ctx.fillRect(runStart + tear, y, x - runStart, 1.6);
            runStart = -1;
          }
        }
      }

      // faint ambient static
      for (let i = 0; i < rows; i += 2) {
        const y = i * pitch;
        const r = noise(i * 3.1, seed + 13);
        if (r > 0.965) {
          const x = noise(i * 5.3, seed + 3) * w;
          ctx.fillStyle = `rgba(58, 196, 112, ${0.05 + 0.08 * r})`;
          ctx.fillRect(x, y, 30 + r * 60, 1.4);
        }
      }
    };

    let raf = 0;
    drawMask();
    resize();

    if (reduce) {
      frame(0, 1);
    } else {
      const t0 = performance.now();
      const loop = (t: number) => {
        const elapsed = t - t0;
        const g = Math.max(0, 1 - elapsed / GLITCH_MS);
        frame(g, Math.floor(t / 90));
        if (g > 0) raf = requestAnimationFrame(loop);
        else frame(0, 1); // settled static frame
      };
      raf = requestAnimationFrame(loop);
    }

    const onResize = () => { resize(); frame(0, 1); };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="smband" aria-label="Two hands reaching toward each other, rendered as scanlines">
      <canvas ref={ref} />
      <div className="smband-mark">
        <ViraMark size={56} />
      </div>
    </div>
  );
}

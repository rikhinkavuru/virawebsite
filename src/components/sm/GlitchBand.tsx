import { useEffect, useRef } from "react";
import { ViraMark } from "./chrome";

/**
 * Full-bleed dark band: the two reaching hands of Michelangelo's Creation
 * of Adam (1512, public domain — /adam-hands.jpg) rendered as fine green
 * scanlines. The photo's luminance drives the field: hands are darker
 * than the plaster, so darker pixels become brighter lines and the
 * figures read exactly. Glitch tears play once on load (~1.2s), then the
 * image is static. White venn mark centered. Static under reduced motion.
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

    // Luminance mask from the fresco. Source is 960×718; the hands live in
    // roughly the middle horizontal strip — crop it for a wide band.
    const MW = 960, MH = 300;
    const CROP = { sx: 0, sy: 120, sw: 960, sh: 300 };
    let lum: Float32Array | null = null;

    const buildMask = (img: HTMLImageElement) => {
      const mc = document.createElement("canvas");
      mc.width = MW; mc.height = MH;
      const mx = mc.getContext("2d")!;
      mx.drawImage(img, CROP.sx, CROP.sy, CROP.sw, CROP.sh, 0, 0, MW, MH);
      const d = mx.getImageData(0, 0, MW, MH).data;
      lum = new Float32Array(MW * MH);
      for (let i = 0; i < MW * MH; i++) {
        lum[i] = (0.2126 * d[i * 4] + 0.7152 * d[i * 4 + 1] + 0.0722 * d[i * 4 + 2]) / 255;
      }
    };

    const rawInk = (mx: number, my: number) => {
      if (!lum) return 0;
      const x = Math.max(0, Math.min(MW - 1, mx));
      const y = Math.max(0, Math.min(MH - 1, my));
      const v = lum[y * MW + x];
      // plaster ≈ 0.72–0.85, skin ≈ 0.25–0.6 → invert around 0.68 with a
      // gentle gamma so interior shading (knuckles, tendons) survives
      const ink = Math.max(0, Math.min(1, (0.68 - v) * 2.2));
      return Math.pow(ink, 0.8);
    };

    /** 0..1 "ink" with soft erosion: thin plaster cracks (a few px wide)
     *  have little neighborhood support and fade out; the broad hand
     *  masses keep their full density and soft edges. */
    const sample = (nx: number, ny: number) => {
      const mx = Math.floor(nx * MW);
      const my = Math.floor(ny * MH);
      const base = rawInk(mx, my);
      if (base <= 0) return 0;
      const R = 3;
      // directional support: a thin horizontal finger keeps strong
      // left/right backing even where up/down is empty — cracks (mostly
      // steep hairlines) fail both directions at once
      const sH = (rawInk(mx - R, my) + rawInk(mx + R, my)) / 2;
      const sV = (rawInk(mx, my - R) + rawInk(mx, my + R)) / 2;
      const support = Math.max(sH, sV * 0.7);
      const keep = Math.max(0, Math.min(1, support * 4.2));
      return base * keep;
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

    /** Feathered elliptical clear zone around the centered mark: wide
     *  horizontally so both hands hold a clear padded distance. */
    const clearance = (nx: number, ny: number, aspect: number) => {
      const dx = (nx - 0.5) * aspect;
      const dy = (ny - 0.5) / 0.55; // ellipse: shorter vertically
      const d = Math.hypot(dx, dy);
      const R0 = 0.34, R1 = 0.46; // padded hole, feather band (height units)
      if (d <= R0) return 0;
      if (d >= R1) return 1;
      const t = (d - R0) / (R1 - R0);
      return t * t * (3 - 2 * t);
    };

    const frame = (g: number, seed: number) => {
      ctx.clearRect(0, 0, w, h);

      // deep-green edge fills fading inward (reference look)
      const edgeW = w * 0.09;
      for (const side of [0, 1]) {
        const grad = side === 0
          ? ctx.createLinearGradient(0, 0, edgeW, 0)
          : ctx.createLinearGradient(w, 0, w - edgeW, 0);
        grad.addColorStop(0, "rgba(23, 132, 63, 0.55)");
        grad.addColorStop(1, "rgba(23, 132, 63, 0)");
        ctx.fillStyle = grad;
        ctx.fillRect(side === 0 ? 0 : w - edgeW, 0, edgeW, h);
      }

      const pitch = 2.5;
      const rows = Math.ceil(h / pitch);
      const step = 3;
      const aspect = w / h;
      for (let i = 0; i < rows; i++) {
        const y = i * pitch;
        const ny = y / h;
        const tearRoll = noise(i, seed);
        const tear = g > 0 && tearRoll > 0.88 ? (tearRoll - 0.5) * 110 * g : 0;
        const flicker = g > 0 ? 1 - g * 0.4 * noise(i * 2.1, seed + 7) : 1;

        // draw short constant-length dashes whose alpha follows local ink —
        // one clean green ramp, no hue jumps
        let x = 0;
        while (x <= w) {
          const nx = x / w;
          const ink = sample(nx, ny) * clearance(nx, ny, aspect);
          if (ink > 0.06) {
            const a = Math.min(0.92, 0.10 + ink * 1.0) * flicker;
            ctx.fillStyle = `rgba(88, 214, 138, ${a})`;
            const dash = step * (1.5 + ink * 2.5);
            ctx.fillRect(x + tear, y, dash, 1.5);
            x += dash;
          } else {
            x += step;
          }
        }
      }
    };

    let raf = 0;
    const img = new Image();
    img.src = "/adam-hands.jpg";
    img.onload = () => {
      buildMask(img);
      resize();
      if (reduce) {
        frame(0, 1);
        return;
      }
      const GLITCH_MS = 1200;
      const t0 = performance.now();
      const loop = (t: number) => {
        const g = Math.max(0, 1 - (t - t0) / GLITCH_MS);
        frame(g, Math.floor(t / 80));
        if (g > 0) raf = requestAnimationFrame(loop);
        else frame(0, 1);
      };
      raf = requestAnimationFrame(loop);
    };

    const onResize = () => { resize(); if (lum) frame(0, 1); };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="smband" aria-label="The hands of the Creation of Adam, rendered as scanlines">
      <canvas ref={ref} />
      <div className="smband-mark">
        <ViraMark size={54} color="#fff" />
      </div>
    </div>
  );
}

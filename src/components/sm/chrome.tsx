import { useEffect, useId, useRef, useState } from "react";
import type { ReactNode, ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";
import { motion } from "framer-motion";

/** Blur-fade reveal: children rise out of a blur when scrolled into view. */
export function Reveal({
  children,
  delay = 0,
  y = 22,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: "blur(9px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Count-up number ticker; fires once in view, static under reduced motion. */
export function Ticker({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(to);
      return;
    }
    let raf = 0;
    let started = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started) return;
        started = true;
        const start = performance.now();
        const dur = 1200;
        const tick = (t: number) => {
          const p = Math.min(1, (t - start) / dur);
          setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to]);
  return <span ref={ref}>{n.toLocaleString()}{suffix}</span>;
}

/**
 * Vira venn mark: two overlapping circle outlines with the intersection
 * lens filled by diagonal hatching — the original Vira brand, in forest
 * green. `color` overrides for dark surfaces (pass "#fff").
 */
export function ViraMark({
  size = 26,
  color = "var(--green, #17843f)",
}: {
  size?: number;
  color?: string;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  // Geometry: circles r=11 centered at (13,14) and (25,14) in a 38×28 box.
  return (
    <svg
      width={(size / 28) * 38}
      height={size}
      viewBox="0 0 38 28"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id={`hatch-${uid}`}
          patternUnits="userSpaceOnUse"
          width="3.4"
          height="3.4"
          patternTransform="rotate(45)"
        >
          <line x1="0" y1="0" x2="0" y2="3.4" stroke={color} strokeWidth="1.1" />
        </pattern>
        <clipPath id={`lens-${uid}`}>
          <circle cx="13" cy="14" r="11" />
        </clipPath>
      </defs>
      <circle cx="13" cy="14" r="11" stroke={color} strokeWidth="1.7" />
      <circle cx="25" cy="14" r="11" stroke={color} strokeWidth="1.7" />
      <circle cx="25" cy="14" r="11" fill={`url(#hatch-${uid})`} clipPath={`url(#lens-${uid})`} />
    </svg>
  );
}

/** Section chrome: top rule + mono rail (❯ LABEL … [N/8]) over a white box. */
export function Section({
  label,
  index,
  total = 8,
  id,
  children,
}: {
  label: string;
  index: number;
  total?: number;
  id?: string;
  children: ReactNode;
}) {
  return (
    <section className="smsection" id={id}>
      <div className="smrail">
        <span>
          <span className="chev">❯</span>
          {label}
        </span>
        <span className="count">
          [<b>{index}</b>/{total}]
        </span>
      </div>
      <div className="smbox">{children}</div>
    </section>
  );
}

/** Primary button with the divided arrow cell. */
export function ArrowButton({
  children,
  className = "",
  ...rest
}: { children: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`smbtn primary ${className}`} {...rest}>
      {children}
      <span className="arr-cell">
        <span className="arr" aria-hidden="true">→</span>
      </span>
    </button>
  );
}

export function GhostButton({
  children,
  className = "",
  ...rest
}: { children: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`smbtn ghost ${className}`} {...rest}>
      {children}
    </button>
  );
}

export function DottedLink({
  children,
  className = "",
  ...rest
}: { children: ReactNode } & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a className={`smbtn dotted ${className}`} {...rest}>
      {children} <span className="arr" aria-hidden="true">→</span>
    </a>
  );
}

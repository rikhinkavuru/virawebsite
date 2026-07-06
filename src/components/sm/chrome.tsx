import { useEffect, useRef, useState } from "react";
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

/* Pixel-art V mark: green V with a white pixel outline, dissolving into
   scattered squares below — drawn on a 16×16 grid. Coordinate lists, not
   paths, so it stays crisp at any size. */
const PX_GREEN: Array<[number, number]> = [
  [3, 3], [4, 3], [11, 3], [12, 3],
  [3, 4], [4, 4], [5, 4], [10, 4], [11, 4], [12, 4],
  [4, 5], [5, 5], [6, 5], [9, 5], [10, 5], [11, 5],
  [5, 6], [6, 6], [9, 6], [10, 6],
  [5, 7], [6, 7], [7, 7], [8, 7], [9, 7], [10, 7],
  [6, 8], [7, 8], [8, 8], [9, 8],
  [7, 9], [8, 9],
  [7, 10], [8, 10],
];
const PX_WHITE: Array<[number, number]> = [
  [2, 2], [3, 2], [12, 2], [13, 2],
  [2, 3], [13, 3], [5, 3], [10, 3],
  [2, 4], [13, 4], [6, 4], [9, 4],
  [3, 5], [12, 5], [7, 5], [8, 5],
  [4, 6], [11, 6], [7, 6], [8, 6],
  [4, 7], [11, 7],
  [5, 8], [10, 8],
  [6, 9], [9, 9],
  [6, 10], [9, 10],
  [7, 11], [8, 11],
];
/** dissolving debris: [x, y, green?] */
const PX_DUST: Array<[number, number, number]> = [
  [1, 1, 1], [14, 1, 1], [0, 4, 1], [15, 4, 1], [1, 6, 0], [14, 6, 0],
  [3, 9, 1], [12, 9, 1], [4, 11, 0], [11, 11, 0],
  [5, 12, 1], [10, 12, 1], [7, 13, 1], [8, 12, 0],
  [6, 14, 0], [9, 14, 1],
];

export function ViraMark({
  size = 26,
  tile = false,
  radius = 7,
}: {
  size?: number;
  /** draw a rounded dark tile behind the mark */
  tile?: boolean;
  radius?: number;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
      {tile && <rect width="16" height="16" rx={(radius / 26) * 16} fill="#06180d" />}
      {PX_GREEN.map(([x, y]) => (
        <rect key={`g${x}-${y}`} x={x} y={y} width="1.02" height="1.02" fill="var(--green, #17843f)" />
      ))}
      {PX_WHITE.map(([x, y]) => (
        <rect key={`w${x}-${y}`} x={x} y={y} width="1.02" height="1.02" fill="#fff" />
      ))}
      {PX_DUST.map(([x, y, g]) => (
        <rect
          key={`d${x}-${y}`}
          x={x + 0.25} y={y + 0.25} width="0.55" height="0.55"
          fill={g ? "var(--green, #17843f)" : "#fff"}
          opacity="0.9"
        />
      ))}
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

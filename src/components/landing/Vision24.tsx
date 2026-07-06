import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { Eyebrow } from "./atoms";
import { Starfield } from "./Starfield";

const LINES = [
  "We build events that matter.",
  "From first commit to demo day, we obsess",
  "over every detail that drives students.",
];

function Line({ progress, index, total, children }: {
  progress: MotionValue<number>;
  index: number;
  total: number;
  children: string;
}) {
  const start = index / (total + 1.5);
  const end = (index + 1.2) / (total + 1.5);
  const opacity = useTransform(progress, [start, end], [0.14, 1]);
  return (
    <motion.span style={{ opacity, display: "block" }}>{children}</motion.span>
  );
}

/**
 * Vision statement whose lines brighten as you scroll through them, above a
 * glowing planet-horizon arc and a circular get-in-touch ring with orbiting
 * crosshair marks.
 */
export function Vision24() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "center 0.45"],
  });

  return (
    <section ref={ref} className="vision24">
      <div className="vision24-arc" aria-hidden="true" />
      <Starfield density={0.55} />
      <div style={{ position: "relative", zIndex: 2 }}>
        <Eyebrow>About us | our vision</Eyebrow>
        <div className="vision24-lines">
          {LINES.map((l, i) => (
            <Line key={l} progress={scrollYProgress} index={i} total={LINES.length}>
              {l}
            </Line>
          ))}
        </div>
        <p className="vision24-sub">
          A student-run network focused on building, launching and scaling
          healthcare hackathons.
        </p>

        <motion.a
          href="mailto:rikhin@virahacks.com"
          className="ring24"
          initial={{ opacity: 0, scale: 0.92 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.span
            className="ring24-orbit"
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            aria-hidden="true"
          >
            <span className="regmark x o1" />
            <span className="regmark x o2" />
            <span className="regmark x o3" />
            <span className="regmark x o4" />
          </motion.span>
          <span className="ring24-kicker">GET IN TOUCH</span>
          <span className="ring24-mail">RIKHIN@VIRAHACKS.COM</span>
        </motion.a>
      </div>
    </section>
  );
}

import { motion } from "framer-motion";
import { DEPLOYMENT_STATS } from "@/data/chapters";
import { Starfield } from "./Starfield";
import { Eyebrow, BracketButton } from "./atoms";

const rise = {
  hidden: { opacity: 0, y: 26, filter: "blur(10px)" },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.85, delay: 0.12 * i, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

/** Inline sparkline chip embedded in the headline — participants trend. */
function ChartChip() {
  // Simple rising-curve polyline; the number is live-derived from chapter data.
  const pts = [0, 4, 3, 9, 8, 14, 12, 20, 19, 27, 25, 34]
    .map((v, i) => `${(i / 11) * 100},${40 - v}`)
    .join(" ");
  return (
    <span className="hero24-chip" aria-hidden="true">
      <span className="chip-label">
        <b>{DEPLOYMENT_STATS.total_users}</b> /hackers
      </span>
      <svg viewBox="0 0 100 44" preserveAspectRatio="none">
        <defs>
          <linearGradient id="chipfill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(184,205,240,0.35)" />
            <stop offset="100%" stopColor="rgba(184,205,240,0)" />
          </linearGradient>
        </defs>
        <motion.polygon
          points={`0,44 ${pts} 100,44`}
          fill="url(#chipfill)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 2.1 }}
        />
        <motion.polyline
          points={pts}
          fill="none"
          stroke="rgba(214,228,250,0.9)"
          strokeWidth="1.4"
          pathLength={1}
          strokeDasharray={1}
          initial={{ strokeDashoffset: 1 }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 1.6, delay: 0.9, ease: "easeInOut" }}
        />
      </svg>
    </span>
  );
}

export function Hero24({ onNavigate }: { onNavigate: (id: string) => void }) {
  return (
    <section id="hero" className="hero24">
      <Starfield density={0.9} />
      <div className="hero24-planet" aria-hidden="true" />
      <div className="hero24-inner">
        <motion.div variants={rise} custom={0} initial="hidden" animate="show">
          <Eyebrow>Built by student founders</Eyebrow>
        </motion.div>
        <h1>
          <motion.span style={{ display: "block" }} variants={rise} custom={1} initial="hidden" animate="show">
            We launch, run
          </motion.span>
          <motion.span style={{ display: "block" }} variants={rise} custom={2} initial="hidden" animate="show">
            &amp; scale <ChartChip /> <span className="serif blue">student</span>
          </motion.span>
          <motion.span style={{ display: "block" }} variants={rise} custom={3} initial="hidden" animate="show">
            <span className="serif peach">hackathons.</span>
          </motion.span>
        </h1>
        <motion.p className="hero24-sub" variants={rise} custom={4} initial="hidden" animate="show">
          The infrastructure layer for high-school healthcare innovation —
          localized hackathons that solve real clinical challenges.
        </motion.p>
        <motion.div className="hero24-ctas" variants={rise} custom={5} initial="hidden" animate="show">
          <BracketButton solid onClick={() => onNavigate("network")}>
            Join the Network
          </BracketButton>
          <BracketButton onClick={() => onNavigate("apply")}>
            Start a Chapter
          </BracketButton>
        </motion.div>
      </div>
    </section>
  );
}

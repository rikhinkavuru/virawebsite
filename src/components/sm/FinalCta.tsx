import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowButton, GhostButton } from "./chrome";
import { CHAPTERS, DEPLOYMENT_STATS } from "@/data/chapters";

const SLOT_WORDS = ["school", "club", "team", "class", "city", "crew"];

/** Slot-machine word: fixed-width box, words roll through vertically. */
function SlotWord() {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => setI((n) => (n + 1) % SLOT_WORDS.length), 2200);
    return () => window.clearInterval(t);
  }, []);
  return (
    <span className="boxed slot">
      <span className="slot-window">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={SLOT_WORDS[i]}
            className="slot-word"
            initial={{ y: "105%" }}
            animate={{ y: "0%" }}
            exit={{ y: "-105%" }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            {SLOT_WORDS[i]}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  );
}

/** rAF count-up that fires once in view; static under reduced motion. */
function CountUp({ to }: { to: number }) {
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
        const dur = 1400;
        const tick = (t: number) => {
          const p = Math.min(1, (t - start) / dur);
          setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to]);
  return <span ref={ref}>{n.toLocaleString()}</span>;
}

/** Join headline + build-hours band. Renders inside the shared Join section. */
export function FinalCta({ onNavigate }: { onNavigate: (id: string) => void }) {
  // Rough but honest: total build-hours logged across active events (12h days).
  const buildHours = DEPLOYMENT_STATS.total_users * 12;
  const pending = CHAPTERS.filter((c) => c.status === "pending").length;

  return (
    <div className="smfinal">
      <h2>
        Your <SlotWord /> needs its{" "}
        <span className="g">Vira chapter.</span>
      </h2>
      <div className="smfinal-row">
        <div className="smcount">
          <div className="lbl">Total build-hours logged</div>
          <div className="num"><CountUp to={buildHours} /></div>
        </div>
        <div className="smfinal-ctas">
          <ArrowButton onClick={() => onNavigate("apply")}>Start a Chapter</ArrowButton>
          <GhostButton onClick={() => onNavigate("network")}>
            {pending} schools already in queue
          </GhostButton>
        </div>
      </div>
    </div>
  );
}

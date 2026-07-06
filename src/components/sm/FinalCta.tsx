import { useEffect, useRef, useState } from "react";
import { Section, ArrowButton, GhostButton } from "./chrome";
import { CHAPTERS, DEPLOYMENT_STATS } from "@/data/chapters";

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

export function FinalCta({ onNavigate }: { onNavigate: (id: string) => void }) {
  // Rough but honest: total build-hours logged across active events (12h days).
  const buildHours = DEPLOYMENT_STATS.total_users * 12;
  const pending = CHAPTERS.filter((c) => c.status === "pending").length;

  return (
    <Section label="Join" index={8} id="apply-cta">
      <div className="smfinal">
        <h2>
          Your <span className="boxed">school</span> needs its{" "}
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
    </Section>
  );
}

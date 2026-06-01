import { useEffect, useRef, useState } from "react";
import { DEPLOYMENT_STATS } from "@/data/chapters";

/** rAF count-up that fires once when scrolled into view; static under reduced-motion. */
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
        const dur = 1100;
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
  return <span ref={ref}>{n}</span>;
}

/** Full-bleed emerald finale — the single saturated moment, held for the close. */
export function FinaleSlab() {
  const scrollToApply = () =>
    document.getElementById("apply")?.scrollIntoView({ behavior: "smooth", block: "start" });
  return (
    <section className="finale-slab" aria-label="Join the network">
      <div className="finale-inner">
        <div className="finale-eyebrow">/// the network is live</div>
        <div className="finale-bignum">
          <CountUp to={DEPLOYMENT_STATS.total_users} />
        </div>
        <div className="finale-substat">
          participants across {DEPLOYMENT_STATS.total_nodes} chapter nodes ·{" "}
          {DEPLOYMENT_STATS.total_deployments} live
        </div>
        <p className="finale-line">
          Bring Vira to your school. Apply to host a chapter and watch your node go live on the map.
        </p>
        <button className="finale-cta" onClick={scrollToApply}>
          request a node <span className="mono" style={{ opacity: 0.6 }}>[↵]</span>
        </button>
      </div>
    </section>
  );
}

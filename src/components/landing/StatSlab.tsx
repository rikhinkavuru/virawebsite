import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { CHAPTERS, DEPLOYMENT_STATS } from "@/data/chapters";
import { Eyebrow, RegMarks } from "./atoms";
import { Starfield } from "./Starfield";

/**
 * Giant silver-gradient stat that scales in as it scrolls into view,
 * followed by a registration-marked claim frame. All figures derived
 * from live chapter data.
 */
export function StatSlab() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [0.86, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [80, 0]);

  const states = new Set(
    CHAPTERS.map((c) => c.loc.split(",").pop()?.trim()).filter(Boolean),
  ).size;

  return (
    <section ref={ref} className="slab24">
      <Starfield density={0.5} />
      <Eyebrow>Reaching every school</Eyebrow>
      <motion.div className="slab24-big" style={{ scale, opacity, y }}>
        {DEPLOYMENT_STATS.total_users}{" "}Hackers
      </motion.div>
      <motion.div
        className="slab24-claim frame24"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <RegMarks variant="x" />
        <span className="dim">Most high-school hackathons never leave</span>{" "}
        <b>their own building,</b>{" "}
        <span className="dim">but, our network went live in</span>{" "}
        <b>{DEPLOYMENT_STATS.total_deployments} schools</b>{" "}
        <span className="dim">across {states} state{states === 1 ? "" : "s"}</span>
        <span className="slab24-claim-sub">
          A student-run network focused on building, launching
          and scaling healthcare hackathons.
        </span>
      </motion.div>
    </section>
  );
}

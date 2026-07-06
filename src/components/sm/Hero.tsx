import { useState } from "react";
import { motion } from "framer-motion";
import { CHAPTERS, DEPLOYMENT_STATS } from "@/data/chapters";
import { ArrowButton, GhostButton, ViraMark } from "./chrome";

const rise = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: 0.08 * i, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const MARQ_HUES = ["#17843f", "#0f6330", "#2ba55b", "#0d1310", "#4b6f93"];

function SchoolMarquee() {
  const schools = CHAPTERS.map((c) => c.name.replace(/ High School$/i, ""));
  const track = (key: string) => (
    <div className="smmarq-track" key={key} aria-hidden={key === "b"}>
      {schools.map((s, i) => (
        <span className="smmarq-item" key={`${key}-${s}`}>
          <span className="mark" style={{ background: MARQ_HUES[i % MARQ_HUES.length] }}>
            {s.slice(0, 1)}
          </span>
          {s}
        </span>
      ))}
    </div>
  );
  return (
    <div className="smmarq">
      <div className="smmarq-label">Run by students at these schools</div>
      <div className="smmarq-viewport">
        {track("a")}
        {track("b")}
      </div>
    </div>
  );
}

export function Hero({ onNavigate }: { onNavigate: (id: string) => void }) {
  const [copied, setCopied] = useState(false);
  const CMD = "apply.virahacks.com — 3 minutes, any school";
  const newest = [...CHAPTERS].filter((c) => c.status === "active").pop();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText("https://virahacks.com/#apply");
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable — no-op */
    }
  };

  return (
    <div className="smhero" id="top">
      <motion.div variants={rise} custom={0} initial="hidden" animate="show">
        <div className="smhero-pill">
          <span className="tag">New</span>
          <span className="msg">
            {newest ? `${newest.name} is live on the network` : "The network is live"}
            <span className="arr" aria-hidden="true">→</span>
          </span>
        </div>
      </motion.div>

      <motion.h1 variants={rise} custom={1} initial="hidden" animate="show">
        The hackathon network for{" "}
        <span className="h1-icon"><ViraMark size={40} radius={9} /></span>{" "}
        student builders<span className="enddot">.</span>
      </motion.h1>

      <motion.p className="smhero-sub" variants={rise} custom={2} initial="hidden" animate="show">
        Vira gives high schoolers real hackathons — venues, mentors, judges, and
        healthcare problems worth solving — all run by students. Low lift for
        schools. Works with any club.
      </motion.p>

      <motion.div className="smhero-ctas" variants={rise} custom={3} initial="hidden" animate="show">
        <ArrowButton onClick={() => onNavigate("apply")}>Start a Chapter</ArrowButton>
        <GhostButton onClick={() => onNavigate("network")}>Explore the network</GhostButton>
      </motion.div>

      <motion.div variants={rise} custom={4} initial="hidden" animate="show">
        <button className="smhero-cmd" onClick={copy} aria-label="Copy apply link">
          <span className="dollar">$</span>
          <span>{CMD}</span>
          <span className="copy" aria-hidden="true">{copied ? "✓ copied" : "⧉"}</span>
        </button>
      </motion.div>

      <motion.div variants={rise} custom={5} initial="hidden" animate="show">
        <button className="smhero-link" onClick={() => onNavigate("people")}>
          Meet the {DEPLOYMENT_STATS.total_users}+ students already building ↗
        </button>
      </motion.div>

      <motion.div variants={rise} custom={6} initial="hidden" animate="show">
        <SchoolMarquee />
      </motion.div>
    </div>
  );
}

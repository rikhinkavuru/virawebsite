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

const S2 = (domain: string) => `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
const DDG = (domain: string) => `https://icons.duckduckgo.com/ip3/${domain}.ico`;

/** Verified logo per chapter id — each school's own published favicon/logo,
 *  found by probing the schools' (district) sites. zch has none → letter tile. */
const SCHOOL_LOGOS: Record<string, string> = {
  hhs: DDG("sacs.k12.in.us"),
  phs: S2("plainfield.k12.in.us"),
  chs: S2("bcscschools.org"),
  lhs: S2("tricreek.k12.in.us"),
  lex: S2("lexingtonma.org"),
  rhs: S2("leanderisd.org"),
  ohs: "https://oaktonhs.fcps.edu/sites/default/files/favicons/apple-touch-icon.png",
  whs: "https://resources.finalsite.net/images/v1737354498/unioncountyps/daosxfdn4nkxcmjfnzoe/LOGO-Weddington-High.png",
  fhs: "https://resources.finalsite.net/images/v1709033400/wcsedu/urjzkovlxjm9jktinssh/FranklinHighPrimaryThumbnailImage.png",
  aai: "https://resources.finalsite.net/images/v1711375980/forsythk12gaus/qvgywcups44on8z3i3vg/favicon2.png",
  hse: S2("hseschools.org"),
  bhs: S2("brownsburg.k12.in.us"),
  chr: S2("cherokeek12.net"),
  mun: S2("munster.us"),
  lam: S2("forsyth.k12.ga.us"),
  cmh: DDG("cabarrus.k12.nc.us"),
  map: S2("dallasisd.org"),
  ach: S2("duvalschools.org"),
  ahs: S2("fremontunified.org"),
  wak: S2("friscoisd.org"),
};

/** School logo from the verified map; letter tile fallback. */
function SchoolIcon({ id, name, hue }: { id: string; name: string; hue: string }) {
  const [failed, setFailed] = useState(false);
  const src = SCHOOL_LOGOS[id];
  if (src && !failed) {
    return (
      <img
        className="mark-img"
        src={src}
        alt=""
        width={26}
        height={26}
        loading="lazy"
        onError={() => setFailed(true)}
        onLoad={(e) => {
          // The favicon service serves a 16px generic globe when a site has
          // no real icon — treat that as missing and use the letter tile.
          if (src.includes("google.com/s2") && e.currentTarget.naturalWidth < 32) {
            setFailed(true);
          }
        }}
      />
    );
  }
  return <span className="mark" style={{ background: hue }}>{name.slice(0, 1)}</span>;
}

function SchoolMarquee() {
  const schools = CHAPTERS.map((c) => ({
    id: c.id,
    label: c.name.replace(/ High School$/i, ""),
  }));
  const track = (key: string) => (
    <div className="smmarq-track" key={key} aria-hidden={key === "b"}>
      {schools.map((s, i) => (
        <span className="smmarq-item" key={`${key}-${s.id}`}>
          <SchoolIcon id={s.id} name={s.label} hue={MARQ_HUES[i % MARQ_HUES.length]} />
          {s.label}
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
        <span className="h1-icon"><ViraMark size={44} tile radius={10} /></span>{" "}
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

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Section, Reveal } from "./chrome";
import { IsoScene, type IsoKind } from "./IsoArt";

type Item = {
  key: string;
  title: string;
  desc: string;
  /** isometric scene shown in the panel */
  art: IsoKind;
};

const ITEMS: Item[] = [
  {
    key: "hackathons",
    title: "Localized Hackathons",
    desc: "One-day builds hosted inside your school — venue, food, judges and problem statements handled by the chapter playbook, not by you.",
    art: "launch",
  },
  {
    key: "chapters",
    title: "Chapter Network",
    desc: "Every school is a node. Chapters share sponsors, mentor benches and event templates, so the tenth event is easier than the first.",
    art: "network",
  },
  {
    key: "mentors",
    title: "Clinical Mentorship",
    desc: "Nurses, med students and clinicians review projects mid-build, so student teams ship things that survive contact with a real hospital.",
    art: "clinic",
  },
  {
    key: "demo",
    title: "Demo Days & Judging",
    desc: "Structured judging rubrics and community demo days give every team a real audience — and winners a path to the state showcase.",
    art: "podium",
  },
  {
    key: "handoff",
    title: "Operator Handoff",
    desc: "Seniors graduate; chapters don't. The operator playbook and provisioning queue keep every node running across school years.",
    art: "relay",
  },
];

const AUTO_MS = 4200;
const RESUME_MS = 12000;

export function Catalog() {
  const [active, setActive] = useState(0);
  const item = ITEMS[active];
  const rootRef = useRef<HTMLDivElement>(null);
  const pausedUntil = useRef(0);
  const [inView, setInView] = useState(false);

  // Auto-flow through the catalog while it's on screen; a manual click
  // pauses the rotation for a while, hovering the list pauses it live.
  const hovering = useRef(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => {
      if (hovering.current || Date.now() < pausedUntil.current) return;
      setActive((a) => (a + 1) % ITEMS.length);
    }, AUTO_MS);
    return () => window.clearInterval(t);
  }, [inView]);

  const select = (i: number) => {
    pausedUntil.current = Date.now() + RESUME_MS;
    setActive(i);
  };

  return (
    <Section label="What we run" index={1} id="chapters">
      <div
        className="smcat"
        ref={rootRef}
        onMouseEnter={() => { hovering.current = true; }}
        onMouseLeave={() => { hovering.current = false; }}
      >
        <div className="smcat-head">
          <Reveal>
            <h2>
              Everything a school needs to run <span className="g">a real hackathon.</span>
            </h2>
            <p style={{ marginTop: 18 }}>
              Focused building blocks for launching, running, and scaling student-led events.
            </p>
          </Reveal>
          <div className="smcat-list" role="tablist" aria-label="Program catalog">
            {ITEMS.map((it, i) => (
              <button
                key={it.key}
                role="tab"
                aria-selected={i === active}
                className={`smcat-item ${i === active ? "active" : ""}`}
                onClick={() => select(i)}
              >
                <span className="idx">0{i + 1}</span>
                {it.title}
              </button>
            ))}
          </div>
        </div>
        <div className="smcat-panel">
          <div className="smcat-art">
            <div className="smsel" style={{ padding: "clamp(24px, 4vw, 60px)" }}>
              <span className="hnd tl" /><span className="hnd tr" /><span className="hnd bl" /><span className="hnd br" />
              <AnimatePresence mode="wait">
                <motion.div
                  key={item.key}
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.03 }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                >
                  <IsoScene kind={item.art} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              className="smcat-detail"
              key={item.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.24, ease: "easeOut" }}
            >
              <div className="idx-label">0{active + 1} · {item.key}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Section>
  );
}

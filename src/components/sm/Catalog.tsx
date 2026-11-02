import { Component, lazy, Suspense, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Section, Reveal } from "./chrome";
import { IsoScene, type IsoKind } from "./IsoArt";

// The WebGL dioramas (three.js) load as their own chunk, off the critical path.
const Diorama = lazy(() => import("./diorama/Diorama"));

/** If the 3D chunk or WebGL fails, fall back to the flat SVG scenes. */
class ArtBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

type Item = {
  key: string;
  title: string;
  desc: string;
  /** diorama shown in the panel */
  art: IsoKind;
  /** plate caption under the model */
  fig: string;
};

export const ITEMS: Item[] = [
  {
    key: "hackathons",
    title: "Localized Hackathons",
    desc: "One-day builds hosted inside your school — venue, food, judges and problem statements handled by the chapter playbook, not by you.",
    art: "launch",
    fig: "Build room",
  },
  {
    key: "chapters",
    title: "Chapter Network",
    desc: "Every school is a node. Chapters share sponsors, mentor benches and event templates, so the tenth event is easier than the first.",
    art: "network",
    fig: "Hub & chapters",
  },
  {
    key: "mentors",
    title: "Clinical Mentorship",
    desc: "Nurses, med students and clinicians review projects mid-build, so student teams ship things that survive contact with a real hospital.",
    art: "clinic",
    fig: "Mentor review",
  },
  {
    key: "demo",
    title: "Demo Days & Judging",
    desc: "Structured judging rubrics and community demo days give every team a real audience — and winners a path to the state showcase.",
    art: "podium",
    fig: "Finals stage",
  },
  {
    key: "handoff",
    title: "Operator Handoff",
    desc: "Seniors graduate; chapters don't. The operator playbook and provisioning queue keep every node running across school years.",
    art: "relay",
    fig: "Playbook relay",
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
  const [flat, setFlat] = useState(false);
  // Hold the 3D chunk until the section is a screen or so away.
  const [near, setNear] = useState(false);

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
    const pre = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        setNear(true);
        pre.disconnect();
      },
      { rootMargin: "900px 0px" },
    );
    pre.observe(el);
    return () => {
      io.disconnect();
      pre.disconnect();
    };
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
            <div className="smsel smcat-frame" aria-hidden="true">
              <span className="hnd tl" /><span className="hnd tr" /><span className="hnd bl" /><span className="hnd br" />
            </div>
            {flat ? (
              <div className="smcat-flat"><IsoScene kind={item.art} /></div>
            ) : (
              <ArtBoundary fallback={<div className="smcat-flat"><IsoScene kind={item.art} /></div>}>
                <Suspense fallback={null}>
                  {near && <Diorama kind={item.art} onFail={() => setFlat(true)} />}
                </Suspense>
              </ArtBoundary>
            )}
            <div className="smcat-plate" aria-hidden="true">
              <span>Fig. 0{active + 1}</span>
              <b>{item.fig}</b>
            </div>
            {!flat && <div className="smcat-hint" aria-hidden="true">Drag to rotate</div>}
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

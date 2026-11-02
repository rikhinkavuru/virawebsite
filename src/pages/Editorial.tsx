import { Component, lazy, Suspense, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { motion, MotionConfig } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CHAPTERS, DEPLOYMENT_STATS } from "@/data/chapters";
import { ITEMS } from "@/components/sm/Catalog";
import { FAQS } from "@/components/sm/Faq";
import { SchoolIcon } from "@/components/sm/Hero";
import { IsoScene } from "@/components/sm/IsoArt";
import { ViraMark } from "@/components/sm/chrome";
import { ContinuousTabs } from "@/components/wm/ContinuousTabs";
import "@/styles/editorial.css";

/**
 * Landing variant (/v2). Plain, official and easy to read: a standard
 * sticky header, sentence-case headlines, large body type, ruled tables
 * and square corners. Forest green, ink and paper — no accent colour.
 */

const Diorama = lazy(() => import("@/components/sm/diorama/Diorama"));
const NetworkSection = lazy(() => import("@/components/network/NetworkSection"));
const ApplyForm = lazy(() =>
  import("@/components/network/ApplyForm").then((m) => ({ default: m.ApplyForm })),
);

class Boundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

const EASE = [0.22, 1, 0.36, 1] as const;
const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

function Fade({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.6, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

const NAV = [
  { id: "program", label: "Programs" },
  { id: "chapters", label: "Chapters" },
  { id: "network", label: "Map" },
  { id: "faq", label: "Questions" },
];

/** WebGL model with the flat illustration as its fallback. */
function Model({ kind }: { kind: (typeof ITEMS)[number]["art"] }) {
  const [flat, setFlat] = useState(false);
  const fallback = <div className="v2-flat"><IsoScene kind={kind} /></div>;
  if (flat) return fallback;
  return (
    <Boundary fallback={fallback}>
      <Suspense fallback={null}>
        <Diorama kind={kind} onFail={() => setFlat(true)} />
      </Suspense>
    </Boundary>
  );
}

function Header() {
  return (
    <header className="v2-header">
      <button className="brand" onClick={() => go("top")}>
        <ViraMark size={22} /> Vira Hacks
      </button>
      <nav aria-label="Primary">
        {NAV.map((n) => (
          <button key={n.id} onClick={() => go(n.id)}>{n.label}</button>
        ))}
      </nav>
      <button className="v2-btn" onClick={() => go("apply")}>Start a chapter</button>
    </header>
  );
}

function Hero() {
  const live = CHAPTERS.filter((c) => c.status === "active");
  const states = new Set(CHAPTERS.map((c) => c.loc.split(",").pop()?.trim()).filter(Boolean)).size;
  const students = Math.floor(DEPLOYMENT_STATS.total_users / 10) * 10;

  return (
    <section className="v2-hero" id="top">
      <div className="v2-hero-main">
        <div className="copy">
          <h1 className="v2-h">Real hackathons for high school students.</h1>
          <p>
            Vira Hacks helps schools host student-run healthcare hackathons, with the venue,
            mentors and judges arranged.
          </p>
          <div className="actions">
            <button className="v2-btn light" onClick={() => go("apply")}>
              Start a chapter <ArrowRight size={18} />
            </button>
            <button className="v2-btn outline-light" onClick={() => go("chapters")}>Find a chapter</button>
          </div>
        </div>
        <div className="v2-hero-model"><Model kind="network" /></div>
      </div>
      <dl className="v2-stats">
        <div><dd>{live.length}</dd><dt>Chapters</dt></div>
        <div><dd>{states}</dd><dt>States</dt></div>
        <div><dd>{students.toLocaleString()}+</dd><dt>Students</dt></div>
      </dl>
    </section>
  );
}

const FACTS = [
  { k: "Format", v: "One-day events, held at your school" },
  { k: "Mentors", v: "Nurses, medical students and clinicians" },
  { k: "Run by", v: "Two to four students per chapter" },
  { k: "Cost to the school", v: "Nothing" },
];

function Glance() {
  return (
    <section className="v2-section" id="glance">
      <h2 className="v2-h">At a glance</h2>
      <dl className="v2-facts">
        {FACTS.map((f, i) => (
          <Fade key={f.k} delay={i * 0.06}>
            <dt>{f.k}</dt>
            <dd>{f.v}</dd>
          </Fade>
        ))}
      </dl>
    </section>
  );
}

function Story() {
  return (
    <section className="v2-section v2-story" id="story">
      <h2 className="v2-h green">From club room to demo day</h2>
      <div className="v2-story-grid">
        <Fade className="v2-photo big">
          <img src="/adam-hands.jpg" alt="Two hands reaching toward each other" loading="lazy" />
        </Fade>
        <Fade delay={0.08} className="v2-photo small">
          <img src="/adam-hands.jpg" alt="" loading="lazy" />
        </Fade>
        <Fade delay={0.14} className="v2-story-copy">
          <p>
            Students apply. We send the playbook, sponsors and mentors. Clinicians review
            projects during the event, and every team presents its work.
          </p>
        </Fade>
      </div>
      <blockquote className="v2-quote">
        <p className="v2-h green">“The mentor bench is the unlock.”</p>
        <cite>Marcus, Plainfield High School</cite>
      </blockquote>
    </section>
  );
}

/** One plain sentence per program — the catalog copy is longer. */
const SHORT: Record<string, string> = {
  hackathons: "One-day events hosted inside your school.",
  chapters: "Schools share sponsors, mentors and templates.",
  mentors: "Clinicians review student projects during the event.",
  demo: "Every team presents to judges and an audience.",
  handoff: "A playbook keeps each chapter running after seniors graduate.",
};

function Program() {
  const [index, setIndex] = useState(0);
  const item = ITEMS[index];

  return (
    <section className="v2-program" id="program">
      <h2 className="v2-h">What we run</h2>
      <div className="v2-program-grid">
        <div className="v2-program-list">
          <div role="tablist" aria-label="Programs">
            {ITEMS.map((it, i) => (
              <button
                key={it.key}
                role="tab"
                aria-selected={i === index}
                className={i === index ? "row active" : "row"}
                onClick={() => setIndex(i)}
              >
                <span className="n">{i + 1}</span>
                <span className="t">{it.title}</span>
              </button>
            ))}
          </div>
          <p className="desc" aria-live="polite">{SHORT[item.key] ?? item.desc}</p>
        </div>
        <div className="v2-program-art"><Model kind={item.art} /></div>
      </div>
    </section>
  );
}

function Chapters() {
  const [filter, setFilter] = useState("all");
  const [all, setAll] = useState(false);
  const live = CHAPTERS.filter((c) => c.status === "active");
  const pending = CHAPTERS.filter((c) => c.status !== "active");
  const list = useMemo(() => {
    const src = filter === "live" ? live : filter === "pending" ? pending : CHAPTERS;
    return [...src].sort((a, b) => (b.attendees ?? 0) - (a.attendees ?? 0));
    // CHAPTERS is static module data
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);
  const shown = all ? list : list.slice(0, 8);

  return (
    <section className="v2-section" id="chapters">
      <div className="v2-head">
        <h2 className="v2-h">Find a chapter</h2>
        <ContinuousTabs
          label="Filter chapters"
          tabs={[
            { id: "all", label: "All", count: CHAPTERS.length },
            { id: "live", label: "Active", count: live.length },
            { id: "pending", label: "Pending", count: pending.length },
          ]}
          onChange={(id) => {
            setFilter(id);
            setAll(false);
          }}
        />
      </div>

      <div className="v2-table-wrap">
        <table className="v2-table">
          <thead>
            <tr>
              <th scope="col">School</th>
              <th scope="col">Location</th>
              <th scope="col" className="num">Students</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((c) => {
              const isLive = c.status === "active";
              const short = c.name.replace(/ High School$/i, "");
              return (
                <tr key={c.id}>
                  <th scope="row">
                    <span className="school">
                      <span className="logo"><SchoolIcon id={c.id} name={short} hue="#0b3d20" /></span>
                      {c.name}
                    </span>
                  </th>
                  <td>{c.loc}</td>
                  <td className="num">{isLive ? c.attendees ?? "—" : "—"}</td>
                  <td><span className={isLive ? "status" : "status pending"}>{isLive ? "Active" : "Pending"}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="v2-table-foot">
        {list.length > 8 && (
          <button className="v2-btn outline" onClick={() => setAll((v) => !v)}>
            {all ? "Show fewer" : `Show all ${list.length}`}
          </button>
        )}
        <button className="v2-btn" onClick={() => go("apply")}>
          Add your school <ArrowRight size={18} />
        </button>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section className="v2-section v2-faq" id="faq">
      <div className="side">
        <h2 className="v2-h">Questions</h2>
        <p>
          Something else? <a href="mailto:rikhin@virahacks.com">Email us</a>.
        </p>
      </div>
      <Accordion type="single" collapsible defaultValue="q-0" className="list">
        {FAQS.map((f, i) => (
          <AccordionItem key={f.q} value={`q-${i}`} className="item">
            <AccordionTrigger className="q">{f.q}</AccordionTrigger>
            <AccordionContent className="a">{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

function Footer() {
  return (
    <footer className="v2-footer">
      <div className="top">
        <div className="about">
          <span className="brand"><ViraMark size={22} color="#f1efe7" /> Vira Hacks</span>
          <p>Student-run healthcare hackathons for high schools.</p>
        </div>
        <nav aria-label="Footer">
          {NAV.map((n) => (
            <button key={n.id} onClick={() => go(n.id)}>{n.label}</button>
          ))}
          <button onClick={() => go("apply")}>Start a chapter</button>
        </nav>
        <div className="contact">
          <a href="mailto:rikhin@virahacks.com">rikhin@virahacks.com</a>
          <a href="https://x.com/ViraHacks" target="_blank" rel="noopener noreferrer">X: @ViraHacks</a>
        </div>
      </div>
      <div className="bar">© 2026 Vira Hacks</div>
    </footer>
  );
}

export default function Editorial() {
  useEffect(() => {
    const prev = document.title;
    document.title = "Vira Hacks — Hackathons for high school students";
    return () => {
      document.title = prev;
    };
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <div className="v2">
        <Header />
        <main>
          <Hero />
          <Glance />
          <Story />
          <Program />
          <Chapters />
          <section className="v2-section v2-network" id="network">
            <Suspense fallback={<div className="v2-loading">Loading map…</div>}>
              <NetworkSection title="Where we are" note="Select a school to see its details." plain />
            </Suspense>
          </section>
          <Faq />
          <section className="v2-apply" id="apply">
            <h2 className="v2-h">Start a chapter at your school</h2>
            <div className="v2-apply-box">
              <Suspense fallback={<div className="v2-loading">Loading form…</div>}>
                <ApplyForm />
              </Suspense>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </MotionConfig>
  );
}

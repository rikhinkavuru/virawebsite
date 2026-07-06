import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { CHAPTERS, OPERATORS as NODE_OPERATORS } from "@/data/chapters";
import { US_STATES } from "@/data/usGeo";
import { useStats } from "@/hooks/useStats";
import { FLAGS } from "@/lib/flags";
import { NetworkField } from "@/components/network/NetworkField";
import { SectionHeader } from "@/components/SectionHeader";
import { StatsBand } from "@/components/landing/StatsBand";
import { FinaleSlab } from "@/components/landing/FinaleSlab";

// Code-split the heavy/below-the-fold pieces out of the initial bundle.
const NetworkSection = lazy(() => import("@/components/network/NetworkSection"));
const MentorPanel = lazy(() =>
  import("@/components/network/MentorPanel").then((m) => ({ default: m.MentorPanel })),
);
const ApplyForm = lazy(() =>
  import("@/components/network/ApplyForm").then((m) => ({ default: m.ApplyForm })),
);

function SectionFallback({ label }: { label: string }) {
  return (
    <div
      className="mono"
      style={{
        minHeight: 240,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--text-tertiary)",
        fontSize: "0.75rem",
      }}
    >
      {label}
    </div>
  );
}

export default function Index() {
  // Dark mode via next-themes, bound to the [data-theme] attribute the hand-CSS
  // already keys off of. `mounted` guards the first client render.
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDarkMode = mounted ? resolvedTheme === "dark" : false;

  const { stats } = useStats();

  const scrollToSection = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(isDarkMode ? "light" : "dark");
  }, [isDarkMode, setTheme]);

  return (
    <>
      {/* Fixed header — completely outside the page flow */}
      <header className="header">
        <div className="header-inner">
          <div className="logo" onClick={() => scrollToSection("hero")} style={{ cursor: "pointer" }}>
            <svg width="140" height="40" viewBox="0 0 140 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="vira-logo-svg">
              <defs>
                <pattern id="hatch" patternUnits="userSpaceOnUse" width="4" height="4" patternTransform="rotate(45)">
                  <line x1="0" y1="0" x2="0" y2="4" stroke="#7c3aed" strokeWidth="1" />
                </pattern>
                <clipPath id="overlap">
                  <circle cx="16" cy="20" r="12" />
                </clipPath>
              </defs>
              <circle cx="16" cy="20" r="12" stroke="#7c3aed" strokeWidth="1.5" />
              <circle cx="28" cy="20" r="12" stroke="#7c3aed" strokeWidth="1.5" />
              <circle cx="28" cy="20" r="12" fill="url(#hatch)" clipPath="url(#overlap)" />
              <text x="50" y="27" fill="var(--text-primary)" style={{ font: "bold 22px Inter, sans-serif", letterSpacing: "-0.02em" }}>vira</text>
            </svg>
          </div>

          <nav className="nav">
            {["network", "people", "mentor", "apply"].map((tab) => (
              <button key={tab} onClick={() => scrollToSection(tab)}>
                [{tab}]
              </button>
            ))}
            <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle dark mode">
              {isDarkMode ? "Light" : "Dark"}
            </button>
          </nav>
        </div>
      </header>

      {/* Metrics Bar — below header */}
      <div className="metrics-bar">
        <div className="metrics-inner">
          <div className="system-label-new">
            <span className="mono">system // virahacks.com</span>
            <span className="mono" style={{ color: "var(--text-primary)" }}>network v1.0.3</span>
          </div>
          <div className="system-metrics-new">
            <span>total_nodes: <span className="metric-val">{stats.total_nodes}</span></span>
            <span>deployments: <span className="metric-val">{stats.total_deployments}</span></span>
            <span>processed_users: <span className="metric-val flicker-data">{stats.total_users}</span></span>
          </div>
        </div>
      </div>

      {/* Page content — pushed down to clear the fixed header and metrics bar */}
      <div id="main-content" className="page-wrapper">
        <Hero />

        <StatsBand />

        <main className="main-content">
          <section id="network" className="content-section">
            <Suspense fallback={<SectionFallback label="// loading network architecture" />}>
              <NetworkSection />
            </Suspense>
          </section>
          <section id="people" className="content-section">
            <PeopleTab />
          </section>
          {FLAGS.mentor && (
            <section id="mentor" className="content-section">
              <Suspense fallback={<SectionFallback label="// loading mentor uplink" />}>
                <MentorPanel />
              </Suspense>
            </section>
          )}
          {FLAGS.apply && (
            <section id="apply" className="content-section">
              <Suspense fallback={<SectionFallback label="// loading request node" />}>
                <ApplyForm />
              </Suspense>
            </section>
          )}
        </main>

        <FinaleSlab />
      </div>

      <footer className="footer">
        <div>founder_id: rikhin kavuru</div>
        <div className="text-center">
          <a href="mailto:rikhinkavuru@gmail.com">req_contact: rikhinkavuru@gmail.com</a>
        </div>
        <div className="text-right">
          status: <span style={{ color: "var(--accent)" }}>operational</span>
        </div>
      </footer>
    </>
  );
}

// --- HERO ---
function Hero() {
  const scrollDown = () => {
    document.getElementById("network")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div id="hero" className="hero-section">
      <div className="hero-bg"><div className="hero-radar"></div></div>
      <NetworkField />

      <div className="hero-center">
        <h1 className="hero-title"><span className="vira-glitch">VIRA</span><br />HACKS</h1>
        <p className="hero-sub">
          The infrastructure layer for high-school healthcare innovation — localized hackathons
          that solve real clinical challenges.
        </p>
        <button
          className="hero-btn"
          onClick={scrollDown}
          aria-label="Get Started - Scroll to network section"
        >
          Get Started <span className="mono" style={{ opacity: 0.5 }}>[↵]</span>
        </button>
      </div>

      <div className="hero-product">
        <SearchDemo />
      </div>
    </div>
  );
}

// --- HERO SEARCH DEMO ---
// A real, working search over the live chapter data: type a school or state and
// the node list filters in place; clicking a result scrolls down to the map.
// Map a state abbreviation -> full name so "indiana" matches a "…, IN" location.
const STATE_NAME_BY_CODE: Record<string, string> = Object.fromEntries(
  US_STATES.map((s) => [s.code.toLowerCase(), s.name.toLowerCase()]),
);

function SearchDemo() {
  const [q, setQ] = useState("indiana");
  const inputRef = useRef<HTMLInputElement>(null);
  const PLACEHOLDER = "search the network — a school or state";
  const jumpToMap = () =>
    document.getElementById("network")?.scrollIntoView({ behavior: "smooth", block: "start" });

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return CHAPTERS;
    return CHAPTERS.filter((c) => {
      const code = c.loc.split(",").pop()?.trim().toLowerCase() ?? "";
      const stateName = STATE_NAME_BY_CODE[code] ?? "";
      return (
        c.name.toLowerCase().includes(needle) ||
        c.loc.toLowerCase().includes(needle) ||
        stateName.includes(needle)
      );
    });
  }, [q]);

  return (
    <div className="search-demo">
      <div className="search-bar" onClick={() => inputRef.current?.focus()}>
        <svg className="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <span className="search-field">
          {/* Auto-grows to its value so the blinking caret sits right after the text. */}
          <span className="search-typer" data-value={q.length ? q : PLACEHOLDER}>
            <input
              ref={inputRef}
              className="search-input"
              size={1}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={PLACEHOLDER}
              aria-label="Search chapter nodes"
              spellCheck={false}
              autoComplete="off"
            />
          </span>
          <span className="search-caret" aria-hidden="true" />
        </span>
        <span className="search-kbd">⌘K</span>
      </div>
      <div className="search-results">
        <div className="search-label">
          chapter nodes · {results.length} of {CHAPTERS.length} matched
        </div>
        {results.length === 0 ? (
          <div className="search-empty">
            no nodes match “{q}” —{" "}
            <button type="button" className="search-empty-cta" onClick={jumpToMap}>
              see the full map
            </button>
          </div>
        ) : (
          results.slice(0, 6).map((hit) => (
            <button type="button" className="search-row" key={hit.id} onClick={jumpToMap}>
              <span className={`dot ${hit.status}`} />
              <span className="sr-name">{hit.name}</span>
              <span className="sr-loc">{hit.loc}</span>
              <span className="sr-meta">
                {hit.status === "active" ? `live · ${hit.attendees ?? 0}` : "queued"}
              </span>
            </button>
          ))
        )}
      </div>
      <div className="search-foot">
        <span>{results.length} node{results.length === 1 ? "" : "s"}</span>
        <span>↵ open on map</span>
      </div>
    </div>
  );
}

// --- PEOPLE TAB ---
function PeopleTab() {
  const active = NODE_OPERATORS.filter((o) => o.status === "active");
  const pending = NODE_OPERATORS.filter((o) => o.status === "pending");
  return (
    <div>
      <SectionHeader eyebrow="02 // people" title="The students running the network." />
      <div className="op-active-grid">
        {active.map((op, i) => (
          <article key={op.name} className={`op-card${i === 0 ? " op-founder" : ""}`}>
            <span className="op-status">
              <span className="dot active"></span> {i === 0 ? "founding node" : "live"}
            </span>
            <div>
              <div className="op-name">{op.name.toLowerCase()}</div>
              <div className="op-school">{op.school.toLowerCase()}</div>
              <div className="op-uptime">{op.uptime}</div>
            </div>
          </article>
        ))}
      </div>
      <div className="op-queue">
        <div className="op-queue-head">
          <span className="dot pending"></span> provisioning queue · {pending.length} nodes
        </div>
        <div className="op-queue-grid">
          {pending.map((op) => (
            <div key={op.name} className="op-chip">
              <span className="c-name">{op.name.toLowerCase()}</span>
              <span className="c-school">{op.school.toLowerCase()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

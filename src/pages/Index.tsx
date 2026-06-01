import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { DEPLOYMENT_STATS, OPERATORS as NODE_OPERATORS } from "@/data/chapters";
import { useStats } from "@/hooks/useStats";
import { FLAGS } from "@/lib/flags";
import { NetworkField } from "@/components/network/NetworkField";
import { SectionHeader } from "@/components/SectionHeader";
import { StatsBand } from "@/components/landing/StatsBand";
import { FeatureBento } from "@/components/landing/FeatureBento";
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
          <section id="about" className="content-section">
            <FeatureBento />
          </section>
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
      <div className="hero-bg">
        <div className="hero-radar"></div>
      </div>
      <NetworkField />

      <div className="hero-inner">
        <div className="hero-content">
          <div className="hero-status mono"><span className="dot active"></span> /// UPLINK ESTABLISHED {">>>"}</div>
          <div className="hero-main-group">
            <h1 className="hero-title glitch">VIRA<br />HACKS</h1>
            <p className="hero-sub">
              The infrastructure layer for high school healthcare innovation. <br />
              We deploy localized hackathons to solve clinical challenges.
            </p>
          </div>
          <button
            className="hero-btn"
            onClick={scrollDown}
            aria-label="Get Started - Scroll to network section"
          >
            Get Started <span className="mono" style={{ opacity: 0.5 }}>[↵]</span>
          </button>
        </div>

        <div className="hero-visual">
          <DemoSnippet />
        </div>
      </div>
    </div>
  );
}

// --- ABOUT SNIPPET ---
function DemoSnippet() {
  return (
    <div className="demo-container">
      <div className="demo-header">
        <div className="demo-dot red"></div>
        <div className="demo-dot yellow"></div>
        <div className="demo-dot green"></div>
        <span style={{ color: "#999", fontSize: "0.7rem", marginLeft: "auto", fontFamily: "monospace" }}>about@vira:~</span>
      </div>
      <div className="demo-content">
        <div style={{ display: "flex" }}>
          <div style={{ color: "#999", paddingRight: "1rem", fontSize: "0.8rem", textAlign: "right", minWidth: "2rem" }}>
            <div>1</div>
            <div>2</div>
            <div>3</div>
            <div>4</div>
            <div>5</div>
            <div>6</div>
            <div>7</div>
            <div>8</div>
            <div>9</div>
            <div>10</div>
            <div>11</div>
            <div>12</div>
            <div>13</div>
            <div>14</div>
            <div>15</div>
            <div>16</div>
            <div>17</div>
            <div>18</div>
            <div>19</div>
            <div>20</div>
          </div>
          <div>
            <div><span className="code-comment">/**</span></div>
            <div><span className="code-comment"> * Vira Hacks - Student-Run Hackathon Network</span></div>
            <div><span className="code-comment"> * Built by students, for students</span></div>
            <div><span className="code-comment"> */</span></div>
            <br />
            <div><span className="code-keyword">class</span> <span className="code-const">ViraNetwork</span> {"{"}</div>
            <div style={{ paddingLeft: "1rem" }}><span className="code-comment">// A student-run network of hackathons across the United States</span></div>
            <div style={{ paddingLeft: "1rem" }}><span className="code-comment">// Founded by a high school student at Homestead High School</span></div>
            <div style={{ paddingLeft: "1rem" }}><span className="code-keyword">constructor</span>() {"{"}</div>
            <div style={{ paddingLeft: "2rem" }}><span className="code-keyword">this</span>.<span className="code-const">mission</span> = <span className="code-accent">"Make hackathons accessible to every student in America"</span>;</div>
            <div style={{ paddingLeft: "2rem" }}><span className="code-keyword">this</span>.<span className="code-const">philosophy</span> = <span className="code-str">"Students living the experience inspire best"</span>;</div>
            <div style={{ paddingLeft: "2rem" }}><span className="code-keyword">this</span>.<span className="code-const">model</span> = <span className="code-str">"Empower students to run their own events under Vira name"</span>;</div>
            <div style={{ paddingLeft: "2rem" }}><span className="code-keyword">this</span>.<span className="code-const">activeChapters</span> = <span className="code-number">{DEPLOYMENT_STATS.total_deployments}</span>;</div>
            <div style={{ paddingLeft: "2rem" }}><span className="code-keyword">this</span>.<span className="code-const">hackathonParticipants</span> = <span className="code-number">{DEPLOYMENT_STATS.total_users}</span>;</div>
            <div style={{ paddingLeft: "1rem" }}>{"}"}</div>
            <br />
            <div style={{ paddingLeft: "1rem" }}><span className="code-keyword">expandChapter</span>(school: <span className="code-keyword">string</span>) {"{"}</div>
            <div style={{ paddingLeft: "2rem" }}><span className="code-comment">// Instead of one big centralized program...</span></div>
            <div style={{ paddingLeft: "2rem" }}><span className="code-keyword">const</span> chapter = <span className="code-keyword">new</span> <span className="code-const">StudentChapter</span>(school);</div>
            <div style={{ paddingLeft: "2rem" }}><span className="code-keyword">return</span> chapter.<span className="code-func">buildCommunity</span>();</div>
            <div style={{ paddingLeft: "1rem" }}>{"}"}</div>
            <br />
            <div style={{ paddingLeft: "1rem" }}><span className="code-comment">// The best people to inspire the next generation</span></div>
            <div style={{ paddingLeft: "1rem" }}><span className="code-comment">// are the students living that experience right now.</span></div>
            <div>{"}"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- PEOPLE TAB ---
function PeopleTab() {
  return (
    <div>
      <SectionHeader eyebrow="02 // people" title="The students running the network." />
      <div className="nodes-grid">
        {NODE_OPERATORS.map((op, i) => (
          <div key={i} className={`node-card ${op.status}`}>
            <div className="card-name">{op.name.toLowerCase()}</div>
            <div className="card-school">{op.school.toLowerCase()}</div>
            <div className="card-meta">
              <span>{op.role}</span>
              <span className="flicker-data">{op.uptime}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

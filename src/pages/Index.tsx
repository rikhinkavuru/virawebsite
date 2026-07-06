import { lazy, Suspense, useCallback } from "react";
import { OPERATORS as NODE_OPERATORS, CHAPTERS } from "@/data/chapters";
import { FLAGS } from "@/lib/flags";
import { SectionHeader } from "@/components/SectionHeader";
import { PillNav } from "@/components/landing/PillNav";
import { Hero24 } from "@/components/landing/Hero24";
import { StatSlab } from "@/components/landing/StatSlab";
import { Vision24 } from "@/components/landing/Vision24";
import { Band24 } from "@/components/landing/Band24";
import { ChapterCarousel } from "@/components/landing/ChapterCarousel";
import { FooterFinale } from "@/components/landing/FooterFinale";
import { Eyebrow, BracketButton } from "@/components/landing/atoms";

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
  const scrollToSection = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const pendingCount = CHAPTERS.filter((c) => c.status === "pending").length;

  return (
    <>
      <PillNav onNavigate={scrollToSection} />

      <div id="main-content">
        <Hero24 onNavigate={scrollToSection} />

        <StatSlab />

        <Vision24 />

        {/* CHAPTER 000 — live chapter nodes */}
        <section id="chapters" className="section24">
          <Band24 title="Chapter" index="000" label="Live chapter nodes" progress={0.82} />
          <ChapterCarousel />
        </section>

        {/* Network map */}
        <section id="network" className="section24">
          <div className="section24-inner">
            <Suspense fallback={<SectionFallback label="// loading network architecture" />}>
              <NetworkSection />
            </Suspense>
          </div>
        </section>

        {/* CHAPTER 001 — provisioning queue + CTA */}
        <section id="cohort" className="section24">
          <Band24 title="Chapter" index="001" label="Provisioning queue" progress={0.28} />
          <div className="stealth24">
            <Eyebrow>Next wave</Eyebrow>
            <p style={{ marginTop: "1.4rem" }}>
              {pendingCount} chapters are currently in provisioning — several more
              have yet to be announced to the public. Want to build with us?
            </p>
            <BracketButton onClick={() => scrollToSection("apply")}>
              Start a Chapter
            </BracketButton>
          </div>
        </section>

        <section id="people" className="section24">
          <div className="section24-inner">
            <PeopleTab />
          </div>
        </section>

        {FLAGS.mentor && (
          <section id="mentor" className="section24">
            <div className="section24-inner">
              <Suspense fallback={<SectionFallback label="// loading mentor uplink" />}>
                <MentorPanel />
              </Suspense>
            </div>
          </section>
        )}

        {FLAGS.apply && (
          <section id="apply" className="section24">
            <div className="section24-inner">
              <Suspense fallback={<SectionFallback label="// loading request node" />}>
                <ApplyForm />
              </Suspense>
            </div>
          </section>
        )}
      </div>

      <FooterFinale onNavigate={scrollToSection} />
    </>
  );
}

// --- PEOPLE ---
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

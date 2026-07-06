import { lazy, Suspense, useCallback } from "react";
import { FLAGS } from "@/lib/flags";
import { Nav } from "@/components/sm/Nav";
import { Hero } from "@/components/sm/Hero";
import { GlitchBand } from "@/components/sm/GlitchBand";
import { Catalog } from "@/components/sm/Catalog";
import { SplitCards } from "@/components/sm/SplitCards";
import { HowItWorks } from "@/components/sm/HowItWorks";
import { Compare } from "@/components/sm/Compare";
import { Quotes } from "@/components/sm/Quotes";
import { Faq } from "@/components/sm/Faq";
import { FinalCta } from "@/components/sm/FinalCta";
import { Footer } from "@/components/sm/Footer";
import { Section } from "@/components/sm/chrome";

// Code-split the heavy/below-the-fold pieces out of the initial bundle.
const NetworkSection = lazy(() => import("@/components/network/NetworkSection"));
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

  return (
    <>
      <Nav onNavigate={scrollToSection} />

      <div id="main-content">
        <Hero onNavigate={scrollToSection} />

        <GlitchBand />

        <Catalog />

        <SplitCards onNavigate={scrollToSection} />

        <HowItWorks />

        {/* The live network map, framed like a selected canvas layer */}
        <Section label="The network" index={4} id="network">
          <div className="smmap">
            <div className="smmap-frame">
              <span className="hnd tl" /><span className="hnd tr" />
              <span className="hnd bl" /><span className="hnd br" />
              <Suspense fallback={<SectionFallback label="// loading network map" />}>
                <NetworkSection />
              </Suspense>
            </div>
          </div>
        </Section>

        <Compare />

        <Quotes />

        <Faq />

        <FinalCta onNavigate={scrollToSection} />

        {FLAGS.apply && (
          <Section label="Apply" index={8} id="apply">
            <div style={{ padding: "clamp(26px, 3.6vw, 50px)" }}>
              <Suspense fallback={<SectionFallback label="// loading application" />}>
                <ApplyForm />
              </Suspense>
            </div>
          </Section>
        )}
      </div>

      <Footer onNavigate={scrollToSection} />
    </>
  );
}

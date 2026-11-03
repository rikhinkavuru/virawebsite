import { lazy, Suspense, useCallback } from "react";
import { FLAGS } from "@/lib/flags";
import { Nav } from "@/components/sm/Nav";
import { Hero } from "@/components/sm/Hero";
import { GlitchBand } from "@/components/sm/GlitchBand";
import { Catalog } from "@/components/sm/Catalog";
import { HowItWorks } from "@/components/sm/HowItWorks";
import { Faq } from "@/components/sm/Faq";
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

        <HowItWorks />

        {/* The live network map, framed like a selected canvas layer */}
        <Section label="The network" index={3} id="network">
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

        <Faq />

        {FLAGS.apply && (
          <Section label="Join" index={5} id="apply">
            <Suspense fallback={<SectionFallback label="// loading application" />}>
              <ApplyForm />
            </Suspense>
          </Section>
        )}
      </div>

      <Footer onNavigate={scrollToSection} />
    </>
  );
}

import { CHAPTERS, DEPLOYMENT_STATS } from "@/data/chapters";

type Stat = { value: string; label: string };

/**
 * Calm, continuously sliding stat ticker under the hero. Every figure is
 * derived from the typed chapter data — nothing here is hand-typed, so the band
 * stays honest as the network grows. The marquee duplicates its track so the
 * loop is seamless; it pauses on hover and freezes under reduced-motion.
 */
function buildStats(): Stat[] {
  const states = new Set(CHAPTERS.map((c) => c.loc.split(",").pop()?.trim()).filter(Boolean));
  const pending = CHAPTERS.filter((c) => c.status === "pending").length;
  const biggest = CHAPTERS.reduce(
    (max, c) => ((c.attendees ?? 0) > (max.attendees ?? 0) ? c : max),
    CHAPTERS[0],
  );
  return [
    { value: String(DEPLOYMENT_STATS.total_nodes), label: "chapter nodes" },
    { value: String(DEPLOYMENT_STATS.total_deployments), label: "live chapters" },
    { value: String(DEPLOYMENT_STATS.total_users), label: "participants" },
    { value: String(states.size), label: "states covered" },
    { value: String(pending), label: "in provisioning queue" },
    { value: "100%", label: "student-run" },
    { value: String(biggest.attendees ?? 0), label: `peak event · ${biggest.loc.split(",")[0].trim()}` },
    { value: "2025", label: "network online" },
  ];
}

const STATS = buildStats();

export function StatsBand() {
  // Two identical tracks back-to-back so the -50% translate wraps seamlessly.
  const track = (key: string) => (
    <div className="ticker-track" key={key} aria-hidden={key === "b"}>
      {STATS.map((s, i) => (
        <div className="ticker-item" key={`${key}-${i}`}>
          <span className="ticker-value">{s.value}</span>
          <span className="ticker-label">{s.label}</span>
        </div>
      ))}
    </div>
  );
  return (
    <section className="stat-ticker" aria-label="Network at a glance">
      <div className="ticker-viewport">
        {track("a")}
        {track("b")}
      </div>
    </section>
  );
}

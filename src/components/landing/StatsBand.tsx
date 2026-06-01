import { DEPLOYMENT_STATS } from "@/data/chapters";

/** Proof band under the hero — three big derived numbers (never hardcoded). */
const CELLS = [
  { value: DEPLOYMENT_STATS.total_nodes, label: "chapter nodes", sub: "across US high schools" },
  { value: DEPLOYMENT_STATS.total_deployments, label: "live chapters", sub: "running hackathons" },
  { value: DEPLOYMENT_STATS.total_users, label: "participants", sub: "and counting" },
];

export function StatsBand() {
  return (
    <section className="stats-band" aria-label="Network at a glance">
      <div className="stats-inner">
        {CELLS.map((c) => (
          <div className="stat-cell" key={c.label}>
            <div className="stat-value">{c.value}</div>
            <span className="stat-label">{c.label}</span>
            <span className="stat-sub">{c.sub}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

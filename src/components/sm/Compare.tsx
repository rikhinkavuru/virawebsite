import { Section } from "./chrome";

const ROWS: Array<{ feature: string; club: "no" | "partial" | "yes"; solo: "no" | "partial" | "yes" }> = [
  { feature: "Real venue & event insurance", club: "partial", solo: "no" },
  { feature: "Clinical mentors on-site", club: "no", solo: "no" },
  { feature: "Sponsor & prize pipeline", club: "partial", solo: "no" },
  { feature: "Judging rubric & demo day", club: "partial", solo: "partial" },
  { feature: "Cross-school network effects", club: "no", solo: "no" },
  { feature: "Survives graduation handoff", club: "no", solo: "no" },
];

function Cell({ v }: { v: "no" | "partial" | "yes" }) {
  if (v === "yes") return <span className="chk" aria-label="yes">✓</span>;
  if (v === "partial")
    return (
      <span
        style={{
          fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.1em",
          padding: "3px 8px", background: "#fdf3dc", color: "#8a6a17",
          border: "1px solid #ecd9a8",
        }}
      >
        PARTIAL
      </span>
    );
  return <span className="dash">—</span>;
}

export function Compare() {
  return (
    <Section label="Why a chapter" index={5}>
      <div className="smtable-wrap">
        <table className="smtable">
          <thead>
            <tr>
              <th>Feature</th>
              <th className="hl">Vira Chapter</th>
              <th>School club alone</th>
              <th>Going solo</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.feature}>
                <td>{r.feature}</td>
                <td className="hl"><span className="chk" aria-label="yes">✓</span></td>
                <td><Cell v={r.club} /></td>
                <td><Cell v={r.solo} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

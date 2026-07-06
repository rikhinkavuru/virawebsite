import { Fragment } from "react";

const LINKS: Array<{ label: string; id: string }> = [
  { label: "Home", id: "hero" },
  { label: "Network", id: "network" },
  { label: "Chapters", id: "chapters" },
  { label: "People", id: "people" },
  { label: "Mentor", id: "mentor" },
];

/** Fixed centered pill navigation with × separators and a solid CTA. */
export function PillNav({ onNavigate }: { onNavigate: (id: string) => void }) {
  return (
    <nav className="nav24" aria-label="Primary">
      <button className="nav24-logo" onClick={() => onNavigate("hero")}>
        vira<span className="serif">hacks</span>
      </button>
      <div className="nav24-pill">
        {LINKS.map((l, i) => (
          <Fragment key={l.id}>
            {i > 0 && <span className="nav24-sep" aria-hidden="true">×</span>}
            <button className="nav24-link" onClick={() => onNavigate(l.id)}>
              {l.label}
            </button>
          </Fragment>
        ))}
        <button className="nav24-cta" onClick={() => onNavigate("apply")}>
          Start a Chapter
        </button>
      </div>
      <button className="nav24-cta nav24-mobilecta" onClick={() => onNavigate("apply")}>
        Apply
      </button>
    </nav>
  );
}

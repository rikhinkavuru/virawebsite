import { Fragment } from "react";

const LINKS: Array<{ label: string; id: string }> = [
  { label: "Home", id: "hero" },
  { label: "Network", id: "network" },
  { label: "Chapters", id: "chapters" },
  { label: "People", id: "people" },
];

/** Fixed centered pill navigation with the logo inside the glass, × separators
 *  and a solid CTA. */
export function PillNav({ onNavigate }: { onNavigate: (id: string) => void }) {
  return (
    <nav className="nav24" aria-label="Primary">
      <div className="nav24-pill">
        <button className="nav24-logo" onClick={() => onNavigate("hero")}>
          vira<span className="serif">hacks</span>
        </button>
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
    </nav>
  );
}

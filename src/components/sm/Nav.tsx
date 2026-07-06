import { ViraMark, ArrowButton } from "./chrome";

const LINKS: Array<{ label: string; id: string }> = [
  { label: "Network", id: "network" },
  { label: "Chapters", id: "chapters" },
  { label: "People", id: "people" },
  { label: "FAQ", id: "faq" },
];

export function Nav({ onNavigate }: { onNavigate: (id: string) => void }) {
  return (
    <header className="smnav">
      <div className="smnav-inner">
        <button className="smnav-logo" onClick={() => onNavigate("top")}>
          <ViraMark size={30} tile />
          virahacks<sup>™</sup>
        </button>
        <nav className="smnav-links" aria-label="Primary">
          {LINKS.map((l) => (
            <button key={l.id} onClick={() => onNavigate(l.id)}>
              {l.label}
            </button>
          ))}
        </nav>
        <div className="smnav-cta">
          <ArrowButton onClick={() => onNavigate("apply")}>Start a Chapter</ArrowButton>
        </div>
      </div>
    </header>
  );
}

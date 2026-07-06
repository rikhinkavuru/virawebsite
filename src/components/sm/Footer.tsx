import { ViraMark } from "./chrome";

const PRODUCT: Array<{ label: string; id: string }> = [
  { label: "Network map", id: "network" },
  { label: "Chapters", id: "chapters" },
  { label: "Operators", id: "people" },
  { label: "FAQ", id: "faq" },
  { label: "Apply", id: "apply" },
];

export function Footer({ onNavigate }: { onNavigate: (id: string) => void }) {
  return (
    <footer className="smfooter">
      <div className="smfooter-inner">
        <div>
          <h4>Hackathon infrastructure for student builders.</h4>
          <p className="tag">
            One playbook, every school. Made by students who care about the craft.
          </p>
        </div>
        <div className="smfooter-col">
          <div className="h">Network</div>
          {PRODUCT.map((l) => (
            <button key={l.id} onClick={() => onNavigate(l.id)}>{l.label}</button>
          ))}
        </div>
        <div className="smfooter-col">
          <div className="h">Connect</div>
          <a href="mailto:rikhin@virahacks.com">rikhin@virahacks.com</a>
          <a href="https://x.com/ViraHacks" target="_blank" rel="noopener noreferrer">X / @ViraHacks</a>
          <div className="h" style={{ marginTop: 22 }}>Founder</div>
          <a href="mailto:rikhinkavuru@gmail.com">rikhin kavuru</a>
        </div>
      </div>
      <div className="smfooter-bar">© 2026 · Vira Hacks · All rights reserved</div>
      <div className="smfooter-ghost" aria-hidden="true">virahacks.</div>
      <div className="smfooter-tile" aria-hidden="true">
        <ViraMark size={58} />
      </div>
    </footer>
  );
}

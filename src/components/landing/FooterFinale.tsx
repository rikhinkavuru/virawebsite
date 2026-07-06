import { motion } from "framer-motion";
import { Eyebrow } from "./atoms";
import { Starfield } from "./Starfield";

const NAV: Array<{ label: string; id: string }> = [
  { label: "Home", id: "hero" },
  { label: "Network", id: "network" },
  { label: "Chapters", id: "chapters" },
  { label: "People", id: "people" },
  { label: "Mentor", id: "mentor" },
  { label: "Apply", id: "apply" },
];

const rise = {
  hidden: { opacity: 0, y: 34 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const } },
};

/** Footer finale: giant mixed-serif wordmark over a galaxy glow band. */
export function FooterFinale({ onNavigate }: { onNavigate: (id: string) => void }) {
  return (
    <footer className="footer24">
      <Starfield density={0.7} />
      <div className="footer24-inner">
        <div>
          <Eyebrow>Built by student founders</Eyebrow>
          <motion.div
            className="footer24-word"
            variants={rise}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
          >
            <span className="serif p">ri</span>
            <span className="serif m">k</span>
            <span className="serif b">hin</span>
            <span aria-hidden="true">@</span>
            <br />
            virahacks.com
          </motion.div>
          <p className="footer24-tag">
            The infrastructure layer for high-school healthcare innovation —
            localized hackathons that solve real clinical challenges.
          </p>
          <div className="footer24-social">
            <a href="https://x.com/ViraHacks" target="_blank" rel="noopener noreferrer" aria-label="Vira Hacks on X">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a href="mailto:rikhin@virahacks.com" aria-label="Email the Vira Hacks team">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                <rect x="2.5" y="5" width="19" height="14" rx="1.5" />
                <path d="M3 6.5 12 13l9-6.5" />
              </svg>
            </a>
          </div>
        </div>
        <div className="footer24-navcol">
          <Eyebrow>Navigation</Eyebrow>
          <div style={{ height: 8 }} />
          {NAV.map((n) => (
            <button key={n.id} onClick={() => onNavigate(n.id)}>{n.label}</button>
          ))}
        </div>
      </div>
      <div className="footer24-galaxy" aria-hidden="true" />
      <div className="footer24-bar">
        <span>© Vira Hacks. All rights reserved.</span>
        <span>
          founder — <a href="mailto:rikhinkavuru@gmail.com">rikhin kavuru</a>
        </span>
      </div>
    </footer>
  );
}

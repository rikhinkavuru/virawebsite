import { useRef } from "react";
import { motion } from "framer-motion";
import { CHAPTERS } from "@/data/chapters";
import { RegMarks } from "./atoms";

/** Per-card generative art hue — deterministic from the chapter id. */
const HUES = [212, 268, 158, 22, 330, 190, 42, 288];
const hueFor = (id: string) =>
  HUES[[...id].reduce((a, c) => a + c.charCodeAt(0), 0) % HUES.length];

const yearOf = (date?: string) => {
  const yy = date?.split(".").pop();
  return yy ? `20${yy}` : "2025";
};

function Card({ c, i }: { c: (typeof CHAPTERS)[number]; i: number }) {
  const hue = hueFor(c.id);
  const art = {
    background: `
      radial-gradient(120% 160% at 82% 118%, hsla(${hue}, 60%, 62%, 0.55), transparent 60%),
      radial-gradient(80% 120% at 12% -30%, hsla(${(hue + 40) % 360}, 45%, 45%, 0.35), transparent 55%),
      #0b0b0d`,
  };
  return (
    <motion.article
      className="card24 frame24"
      initial={{ opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, delay: (i % 4) * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <RegMarks variant="x" />
      <div className="card24-art" style={art}>
        <span className="card24-year">{yearOf(c.date)}</span>
        <span className="art-glyph">
          <span className="art-icon" aria-hidden="true">
            {c.status === "active" ? "✦" : "◌"}
          </span>
          {c.loc.split(",")[0].trim()}
        </span>
      </div>
      <div className="card24-body">
        <h3 className="card24-title">{c.name}</h3>
        <p className="card24-desc">{c.info}</p>
      </div>
      <div className="card24-foot">
        <span>
          {c.status === "active" ? `${c.attendees ?? 0} attendees` : "provisioning"}
        </span>
        {c.website ? (
          <a href={c.website} target="_blank" rel="noopener noreferrer">
            VISIT&nbsp;&gt;&gt;&gt;
          </a>
        ) : (
          <span className="visit" style={{ opacity: 0.4 }}>SOON&nbsp;&gt;&gt;&gt;</span>
        )}
      </div>
    </motion.article>
  );
}

/** Horizontal scroll-snap carousel of chapter cards with prev/next controls. */
export function ChapterCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const nudge = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: "smooth" });
  };

  return (
    <div className="carousel24">
      <div className="carousel24-track" ref={trackRef}>
        {CHAPTERS.map((c, i) => (
          <Card key={c.id} c={c} i={i} />
        ))}
      </div>
      <div className="carousel24-nav">
        <button className="carousel24-btn" onClick={() => nudge(-1)} aria-label="Previous chapters">
          &lt;&lt;
        </button>
        <button className="carousel24-btn" onClick={() => nudge(1)} aria-label="Next chapters">
          &gt;&gt;
        </button>
      </div>
    </div>
  );
}

import { motion } from "framer-motion";
import { Section } from "./chrome";

function TermMock() {
  return (
    <div className="smterm">
      <div className="smterm-bar">
        <i style={{ background: "#e0604f" }} /><i style={{ background: "#e5b954" }} /><i style={{ background: "#57bd68" }} />
        <span className="t">chapter-setup</span>
      </div>
      <div className="smterm-body">
        <div><span className="c"># 1. Tell us about your school</span></div>
        <div><span className="g">$</span> <span className="w">apply</span> --school "your high school"</div>
        <div><span className="c"># 2. We provision your node</span></div>
        <div><span className="g">✓</span> playbook · mentors · sponsors</div>
        <div><span className="g">✓</span> node live on the map</div>
      </div>
    </div>
  );
}

function StepArt({ kind }: { kind: "ingest" | "mentor" | "demo" }) {
  const stroke = { stroke: "var(--green)", strokeWidth: 2.2, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (kind === "ingest") {
    return (
      <svg width="190" height="150" viewBox="0 0 120 90">
        <rect {...stroke} x="10" y="14" width="30" height="20" rx="3" />
        <rect {...stroke} x="10" y="56" width="30" height="20" rx="3" />
        <rect {...stroke} x="80" y="35" width="30" height="20" rx="3" />
        <path {...stroke} strokeDasharray="3 5" d="M40 24 C60 24 62 42 80 43 M40 66 C60 66 62 48 80 47" />
      </svg>
    );
  }
  if (kind === "mentor") {
    return (
      <svg width="190" height="150" viewBox="0 0 120 90">
        <circle {...stroke} cx="34" cy="30" r="9" />
        <path {...stroke} d="M20 74 c0-12 6-19 14-19 s14 7 14 19" />
        <path {...stroke} d="M70 26 h34 M70 40 h26 M70 54 h30" strokeDasharray="2 6" />
        <path {...stroke} d="M88 66 l6 6 12-14" />
      </svg>
    );
  }
  return (
    <svg width="190" height="150" viewBox="0 0 120 90">
      <path {...stroke} d="M18 74 h84 M28 74 V50 M48 74 V34 M68 74 V44 M88 74 V24" />
      <circle {...stroke} cx="88" cy="16" r="5" />
    </svg>
  );
}

const STEPS = [
  {
    idx: "01 / apply",
    title: "Plug your school in, in minutes.",
    desc: "One short application. Any high school, any state — an existing club helps but isn't required.",
    art: <TermMock />,
  },
  {
    idx: "02 / provision",
    title: "We provision the whole event.",
    desc: "Playbook, sponsor kit, judging rubric and a mentor bench land in your inbox. Your node appears on the network map.",
    art: <StepArt kind="ingest" />,
  },
  {
    idx: "03 / mentor",
    title: "Clinical mentors join mid-build.",
    desc: "Nurses, med students and clinicians review projects during the event, keeping teams honest about real care settings.",
    art: <StepArt kind="mentor" />,
  },
  {
    idx: "04 / demo",
    title: "Demo day makes it real.",
    desc: "Every team ships to a real audience. Winning projects carry to the state showcase and the network portfolio.",
    art: <StepArt kind="demo" />,
  },
];

export function HowItWorks() {
  return (
    <Section label="How it works" index={3}>
      <div className="smhow-head">
        <h2>How it <span className="g">works.</span></h2>
        <p className="note">
          Four steps, one network. Apply, provision, build, demo — then the
          fifth step that makes the other four compound.
        </p>
      </div>
      <div className="smhow">
        {STEPS.map((s, i) => (
          <motion.div
            className="smstep"
            key={s.idx}
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.55, delay: (i % 2) * 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="smstep-art">{s.art}</div>
            <div className="smstep-body">
              <div className="idx-label">{s.idx}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          </motion.div>
        ))}
        <motion.div
          className="smstep wide"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="smstep-body">
            <div className="idx-label">05 / compound</div>
            <h3>Every event makes the next one easier.</h3>
            <p>
              Steps 01–04 are the build. This is the payoff: sponsors, mentors and
              templates carry across the network, so chapter ten launches faster
              than chapter one ever could.
            </p>
          </div>
          <div className="smstep-art">
            <svg width="240" height="190" viewBox="0 0 140 110">
              <g stroke="rgba(255,255,255,0.9)" strokeWidth="2" fill="none" strokeLinecap="round">
                <path d="M14 96 C40 96 34 26 66 26 C98 26 92 66 126 30" strokeDasharray="0" />
                <circle cx="14" cy="96" r="4" fill="#fff" />
                <circle cx="66" cy="26" r="4" fill="#fff" />
                <circle cx="126" cy="30" r="4" fill="#fff" />
                <path d="M120 24 l6 6 -8 2" fill="none" />
              </g>
            </svg>
          </div>
        </motion.div>
      </div>
    </Section>
  );
}

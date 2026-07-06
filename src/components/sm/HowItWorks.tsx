import { motion } from "framer-motion";
import { Section, Reveal } from "./chrome";

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

/** Shared stroke system for the step illustrations: thin structural
 *  lines, dashed flows, mint fills, venn accents — intricate but quiet. */
const ST = { stroke: "var(--green)", strokeWidth: 1.8, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const ST_FAINT = { ...ST, strokeWidth: 1.2, strokeOpacity: 0.4 };
const ST_DASH = { ...ST, strokeWidth: 1.4, strokeDasharray: "2 6" };
const MINT_FILL = "#dff2e6";

function VennMini({ cx, cy, r = 6, color = "var(--green)" }: { cx: number; cy: number; r?: number; color?: string }) {
  return (
    <g stroke={color} strokeWidth="1.6" fill="none">
      <circle cx={cx - r * 0.4} cy={cy} r={r} />
      <circle cx={cx + r * 0.4} cy={cy} r={r} />
    </g>
  );
}

function StepArt({ kind }: { kind: "ingest" | "mentor" | "demo" }) {
  if (kind === "ingest") {
    // three source chips flow into the venn hub; packets ride the lines
    return (
      <svg width="250" height="180" viewBox="0 0 200 144">
        {/* source chips */}
        <g>
          <rect {...ST} x="14" y="14" width="44" height="30" rx="5" fill="#fff" />
          <path {...ST_FAINT} d="M22 24 h20 M22 30 h28 M22 36 h14" />
          <rect {...ST} x="14" y="57" width="44" height="30" rx="5" fill={MINT_FILL} />
          <path {...ST_FAINT} d="M22 67 h26 M22 73 h18 M22 79 h24" />
          <rect {...ST} x="14" y="100" width="44" height="30" rx="5" fill="#fff" />
          <path {...ST_FAINT} d="M22 110 h16 M22 116 h28 M22 122 h20" />
        </g>
        {/* flows */}
        <path {...ST_DASH} d="M58 29 C 96 29 100 62 128 68 M58 72 C 88 72 96 70 128 71 M58 115 C 96 115 100 80 128 74" />
        <circle cx="92" cy="34" r="2.4" fill="var(--green)" />
        <circle cx="96" cy="71.5" r="2.4" fill="var(--green)" />
        <circle cx="90" cy="108" r="2.4" fill="var(--green)" />
        {/* hub */}
        <rect {...ST} x="128" y="46" width="58" height="52" rx="9" fill="#fff" />
        <VennMini cx={157} cy={66} r={8} />
        <path {...ST_FAINT} d="M141 84 h32" />
        <circle cx="139" cy="91" r="1.6" fill="var(--green)" />
        <circle cx="145" cy="91" r="1.6" fill="var(--green)" opacity="0.55" />
        <circle cx="151" cy="91" r="1.6" fill="var(--green)" opacity="0.3" />
      </svg>
    );
  }
  if (kind === "mentor") {
    // clinical review: chart card with vitals trace, check rows, stethoscope arc
    return (
      <svg width="250" height="180" viewBox="0 0 200 144">
        {/* chart card */}
        <rect {...ST} x="52" y="16" width="96" height="112" rx="8" fill="#fff" />
        <rect {...ST} x="82" y="9" width="36" height="14" rx="5" fill={MINT_FILL} />
        {/* vitals trace */}
        <rect x="62" y="30" width="76" height="26" rx="4" fill="#0d1310" opacity="0.9" />
        <path d="M66 43 h14 l6 -8 8 14 6 -6 h12 l4 -5 6 5 h12"
          fill="none" stroke="#bff0cf" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        {/* review rows */}
        <g>
          <circle {...ST} cx="70" cy="70" r="5" fill={MINT_FILL} />
          <path {...ST} d="M67.8 70 l1.6 1.8 3 -3.6" />
          <path {...ST_FAINT} d="M82 70 h52" />
          <circle {...ST} cx="70" cy="86" r="5" fill={MINT_FILL} />
          <path {...ST} d="M67.8 86 l1.6 1.8 3 -3.6" />
          <path {...ST_FAINT} d="M82 86 h44" />
          <circle {...ST} cx="70" cy="102" r="5" fill="#fff" />
          <path {...ST_FAINT} d="M82 102 h48" />
        </g>
        {/* stethoscope arc listening to the card */}
        <path {...ST} d="M26 40 c0 22 10 34 26 36" />
        <path {...ST} d="M26 40 v-8 m0 8 c-6 0 -6 -10 0 -10 s6 10 0 10" />
        <circle {...ST} cx="56" cy="78" r="6" fill={MINT_FILL} />
        {/* small pulse dot */}
        <circle cx="160" cy="120" r="3" fill="var(--green)" opacity="0.5" />
      </svg>
    );
  }
  // demo: stage screen with rising results, audience arcs, confetti ticks
  return (
    <svg width="250" height="180" viewBox="0 0 200 144">
      {/* screen */}
      <rect {...ST} x="40" y="14" width="120" height="72" rx="7" fill="#fff" />
      <path {...ST_FAINT} d="M40 30 h120" />
      <circle cx="48" cy="22" r="1.8" fill="var(--green)" />
      <circle cx="55" cy="22" r="1.8" fill="var(--green)" opacity="0.5" />
      {/* rising bars + trend */}
      <g>
        <rect x="56" y="64" width="10" height="14" rx="2" fill={MINT_FILL} stroke="var(--green)" strokeWidth="1.4" />
        <rect x="74" y="54" width="10" height="24" rx="2" fill="#fff" stroke="var(--green)" strokeWidth="1.4" />
        <rect x="92" y="46" width="10" height="32" rx="2" fill={MINT_FILL} stroke="var(--green)" strokeWidth="1.4" />
        <rect x="110" y="38" width="10" height="40" rx="2" fill="#fff" stroke="var(--green)" strokeWidth="1.4" />
        <path {...ST_DASH} d="M61 58 L 79 48 L 97 40 L 115 32 L 132 36" />
        <VennMini cx={139} cy={40} r={5} />
      </g>
      {/* stand */}
      <path {...ST} d="M100 86 v10 M84 104 h32" />
      {/* audience arcs */}
      <g>
        <circle {...ST} cx="52" cy="118" r="6" fill="#fff" />
        <circle {...ST} cx="80" cy="124" r="6" fill={MINT_FILL} />
        <circle {...ST} cx="112" cy="126" r="6" fill="#fff" />
        <circle {...ST} cx="144" cy="120" r="6" fill={MINT_FILL} />
      </g>
      {/* confetti ticks */}
      <g stroke="var(--green)" strokeWidth="1.6" strokeLinecap="round" opacity="0.65">
        <path d="M30 26 l5 -3 M172 40 l5 3 M166 18 l4 -4 M24 58 l5 2" />
      </g>
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
        <Reveal>
          <h2>How it <span className="g">works.</span></h2>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="note">
            Four steps, one network. Apply, provision, build, demo — then the
            fifth step that makes the other four compound.
          </p>
        </Reveal>
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
            <svg width="330" height="230" viewBox="0 0 220 150" style={{ maxWidth: "88%" }}>
              {/* faint grid */}
              <g stroke="rgba(255,255,255,0.16)" strokeWidth="1">
                <path d="M20 122 h184 M20 92 h184 M20 62 h184 M20 32 h184" />
                <path d="M56 18 v110 M112 18 v110 M168 18 v110" />
              </g>
              {/* soft area under the curve */}
              <path
                d="M20 118 C 58 116 76 108 104 92 C 132 76 152 58 200 30 L 200 128 L 20 128 Z"
                fill="rgba(255,255,255,0.10)"
              />
              {/* compounding curve */}
              <path
                d="M20 118 C 58 116 76 108 104 92 C 132 76 152 58 200 30"
                fill="none" stroke="rgba(255,255,255,0.95)" strokeWidth="2.2" strokeLinecap="round"
              />
              {/* arrowhead */}
              <path d="M192 28 l9 1.4 -5.4 7.4" fill="none" stroke="rgba(255,255,255,0.95)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              {/* milestone nodes: each event, venn-ringed */}
              <g stroke="#bff0cf" strokeWidth="1.5" fill="none">
                <circle cx="56" cy="112" r="4.5" fill="rgba(6,40,20,0.55)" />
                <circle cx="112" cy="88" r="4.5" fill="rgba(6,40,20,0.55)" />
                <circle cx="168" cy="52" r="4.5" fill="rgba(6,40,20,0.55)" />
              </g>
              {/* venn ring pair at the last milestone */}
              <g stroke="#ffffff" strokeWidth="1.4" fill="none" opacity="0.9">
                <circle cx="165" cy="52" r="7.5" />
                <circle cx="171" cy="52" r="7.5" />
              </g>
              {/* dashed baseline of chapter-one effort, for contrast */}
              <path d="M20 118 L 200 106" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.4" strokeDasharray="3 7" strokeLinecap="round" />
              {/* axis ticks */}
              <g stroke="rgba(255,255,255,0.5)" strokeWidth="1.4" strokeLinecap="round">
                <path d="M56 126 v4 M112 126 v4 M168 126 v4" />
              </g>
            </svg>
          </div>
        </motion.div>
      </div>
    </Section>
  );
}

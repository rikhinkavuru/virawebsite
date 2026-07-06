import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Section, Reveal } from "./chrome";

const FAQS: Array<{ q: string; a: string }> = [
  {
    q: "Does my school need an existing CS club?",
    a: "No. A club helps with recruiting, but chapters have launched from robotics teams, HOSA chapters and completely from scratch. The playbook covers recruiting your first ten builders.",
  },
  {
    q: "What does it cost the school?",
    a: "Nothing. Chapters run on the network sponsor pipeline and donated venues. Schools contribute space and a supervising adult — no budget line required.",
  },
  {
    q: "Who actually runs the event?",
    a: "Students. Each chapter has 2–4 student operators who own the event end to end, with the network playbook and a named Vira contact behind them.",
  },
  {
    q: "Why healthcare?",
    a: "Real constraints make better builders. Clinical problems come with regulations, workflows and users you can actually interview — and clinics love meeting future colleagues.",
  },
  {
    q: "What happens when operators graduate?",
    a: "The operator handoff protocol recruits and trains successors a semester ahead. Chapters are designed to outlive their founders.",
  },
  {
    q: "How long from application to first event?",
    a: "Typically 6–10 weeks: two weeks of provisioning, a month of recruiting and logistics off the checklist, then the build day.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <Section label="FAQ" index={7} id="faq">
      <div className="smfaq-head">
        <Reveal>
          <h2>The fine print, <span className="g">in plain English.</span></h2>
        </Reveal>
      </div>
      {FAQS.map((f, i) => (
        <div className={`smfaq-item ${open === i ? "open" : ""}`} key={f.q}>
          <button
            className="smfaq-q"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
          >
            <span className="n">0{i + 1}</span>
            {f.q}
            <span className="pm" aria-hidden="true">{open === i ? "−" : "+"}</span>
          </button>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div
                className="smfaq-a"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                <p>{f.a}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
      <div className="smfaq-foot">
        <span>Still something on your mind?</span>
        <a href="mailto:rikhin@virahacks.com">Ask the founder →</a>
      </div>
    </Section>
  );
}

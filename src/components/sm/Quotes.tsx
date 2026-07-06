import { Section } from "./chrome";
import { OPERATORS } from "@/data/chapters";

/**
 * Operator voices — testimonial rows in the quote/attribution pattern.
 * Quotes are our own copy summarizing what each operator runs.
 */
const QUOTES = [
  {
    q: "We went from “can we even book the cafeteria?” to a 58-person hackathon with clinical judges in one semester.",
    detail:
      "Founding node. The first Vira playbook was written here — venue checklist, sponsor kit and all.",
    who: "rikhin kavuru",
    org: "Homestead High School",
    initial: "H",
  },
  {
    q: "The mentor bench is the unlock. Our teams stopped building toy apps and started fixing real intake workflows.",
    detail:
      "Primary Indiana expansion hub, running quarterly builds with a standing clinical mentor roster.",
    who: "marcus",
    org: "Plainfield High School",
    initial: "P",
  },
  {
    q: "Record attendance, zero new budget lines. The school just said yes because the playbook answered every question first.",
    detail:
      "Ran the network's largest event to date — 88 builders — on the standard chapter template.",
    who: "sofia",
    org: "Lowell High School",
    initial: "L",
  },
];

export function Quotes() {
  const pending = OPERATORS.filter((o) => o.status === "pending").length;
  return (
    <Section label="Operators" index={6} id="people">
      {QUOTES.map((t) => (
        <div className="smquote" key={t.org}>
          <div className="smquote-art" aria-hidden="true">{t.initial}</div>
          <div className="smquote-body">
            <blockquote>“{t.q}”</blockquote>
            <p className="detail">{t.detail}</p>
            <div className="who">
              <b>{t.who}</b> / {t.org}
            </div>
          </div>
        </div>
      ))}
      <div className="smfaq-foot">
        <span>{pending} more operators in the provisioning queue.</span>
        <a href="#apply">Join them →</a>
      </div>
    </Section>
  );
}

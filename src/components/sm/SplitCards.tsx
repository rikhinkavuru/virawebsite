import { Section, ArrowButton, ViraMark, Reveal, Ticker } from "./chrome";
import { CHAPTERS, DEPLOYMENT_STATS } from "@/data/chapters";

export function SplitCards({ onNavigate }: { onNavigate: (id: string) => void }) {
  const states = new Set(
    CHAPTERS.map((c) => c.loc.split(",").pop()?.trim()).filter(Boolean),
  ).size;
  const pending = CHAPTERS.filter((c) => c.status === "pending").length;
  const active = CHAPTERS.filter((c) => c.status === "active");
  const biggest = active.reduce(
    (max, c) => ((c.attendees ?? 0) > (max.attendees ?? 0) ? c : max),
    active[0],
  );

  return (
    <Section label="What we do" index={2}>
      <div className="smsplit-head">
        <Reveal>
          <h2>
            Bring your school <span className="h1-icon"><ViraMark size={34} /></span>{" "}
            <span className="g">We bring the hackathon.</span> Your students just build.
          </h2>
          <p className="sub">Event infrastructure for student builders. One playbook, every school.</p>
        </Reveal>
      </div>
      <div className="smsplit">
        <div className="smcard green">
          <span className="kicker"><span className="kbox">{"{}"}</span> For students & organizers</span>
          <h3>The Vira Playbook</h3>
          <p>
            Venue checklists, sponsor templates, judging rubrics and a mentor bench.
            Run your first hackathon in weeks, not semesters.
          </p>
          <div className="smstats four">
            <div>
              <div className="v"><Ticker to={DEPLOYMENT_STATS.total_users} suffix="+" /></div>
              <div className="l">participants</div>
            </div>
            <div>
              <div className="v"><Ticker to={DEPLOYMENT_STATS.total_deployments} /></div>
              <div className="l">live chapters</div>
            </div>
            <div>
              <div className="v"><Ticker to={pending} /></div>
              <div className="l">pending</div>
            </div>
            <div>
              <div className="v"><Ticker to={states} /></div>
              <div className="l">states</div>
            </div>
          </div>
          <button className="smbtn onGreen" onClick={() => onNavigate("apply")}>
            Start a chapter in weeks <span className="arr" aria-hidden="true">→</span>
          </button>
        </div>
        <div className="smcard white">
          <span className="kicker"><span className="kbox">✚</span> For schools & clinics</span>
          <h3>A Partner Node</h3>
          <p>
            Host a chapter without new staff or budget lines. Students run it;
            you get a pipeline of health-tech projects and community visibility.
          </p>
          <div className="smrows">
            <div className="row">
              <span className="who"><ViraMark size={18} /> Chapter operators</span>
              <span className="what">student-run</span>
            </div>
            <div className="row">
              <span className="who"><span className="rowglyph">✚</span> Clinical mentors</span>
              <span className="what">recruited for you</span>
            </div>
            <div className="row">
              <span className="who"><span className="rowglyph">▲</span> {biggest?.event ?? "Demo day"}</span>
              <span className="what">{biggest?.attendees ?? 0} attendees</span>
            </div>
          </div>
          <ArrowButton onClick={() => onNavigate("network")}>See the network</ArrowButton>
        </div>
      </div>
    </Section>
  );
}

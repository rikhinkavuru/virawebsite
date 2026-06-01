import { SectionHeader } from "@/components/SectionHeader";
import { DEPLOYMENT_STATS } from "@/data/chapters";

/** Asymmetric bento explaining the model — one inverted emerald focal tile. */
export function FeatureBento() {
  const provisioning = DEPLOYMENT_STATS.total_nodes - DEPLOYMENT_STATS.total_deployments;
  return (
    <div>
      <SectionHeader
        eyebrow="// what is vira"
        title="Infrastructure for student-led healthcare hackathons."
      />
      <div className="bento-grid">
        <article className="bento-tile bento-a">
          <span className="bento-eyebrow">the model</span>
          <div>
            <div className="bento-title">A real network, not one program.</div>
            <p className="bento-copy">
              {DEPLOYMENT_STATS.total_deployments} live chapters and {provisioning} provisioning —
              each a student-run node on a shared map, instead of a single centralized event.
            </p>
          </div>
        </article>
        <article className="bento-tile bento-b">
          <span className="bento-eyebrow">who</span>
          <div>
            <div className="bento-title">Student-run chapters</div>
            <p className="bento-copy">Students run their own hackathons under the Vira name.</p>
          </div>
        </article>
        <article className="bento-tile bento-c">
          <span className="bento-eyebrow">why</span>
          <div>
            <div className="bento-title">Healthcare focus</div>
            <p className="bento-copy">Every event tackles a real clinical or public-health problem.</p>
          </div>
        </article>
        <article className="bento-tile bento-d">
          <span className="bento-eyebrow">build</span>
          <div>
            <div className="bento-title">AI mentor</div>
            <p className="bento-copy">Generate a buildable, healthcare-focused hackathon idea in seconds.</p>
          </div>
        </article>
        <article className="bento-tile bento-e">
          <span className="bento-eyebrow">grow</span>
          <div>
            <div className="bento-title">Apply to host</div>
            <p className="bento-copy">Bring a chapter to your school — your node goes live on the map.</p>
          </div>
        </article>
      </div>
    </div>
  );
}

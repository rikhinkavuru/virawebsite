/** Editorial section header used above each section: a mono "01 // label" eyebrow
 *  over a Fraunces serif sub-head. The mono/serif pairing is the single biggest
 *  "human-designed" signal (the exa/24labs editorial tell). */
export function SectionHeader({
  eyebrow,
  title,
  note,
}: {
  eyebrow: string;
  title: string;
  /** Optional subtle line under the title (e.g. an interaction hint). */
  note?: string;
}) {
  return (
    <header className="section-header">
      <span className="section-eyebrow">{eyebrow}</span>
      <h2 className="section-subhead">{title}</h2>
      {note && <p className="section-note">{note}</p>}
    </header>
  );
}

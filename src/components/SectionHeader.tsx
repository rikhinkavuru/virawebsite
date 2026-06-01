/** Editorial section header used above each section: a mono "01 // label" eyebrow
 *  over a Fraunces serif sub-head. The mono/serif pairing is the single biggest
 *  "human-designed" signal (the exa/24labs editorial tell). */
export function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <header className="section-header">
      <span className="section-eyebrow">{eyebrow}</span>
      <h2 className="section-subhead">{title}</h2>
    </header>
  );
}

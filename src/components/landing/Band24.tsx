import { motion } from "framer-motion";
import { Eyebrow, RegMarks } from "./atoms";

/**
 * Shimmer band header — big mono display title ("CHAPTER 000"), a progress
 * bar that fills when scrolled into view, and a mono label on the right.
 */
export function Band24({
  title,
  index,
  label,
  progress = 0.85,
}: {
  title: string;
  index: string;
  label: string;
  /** 0..1 fill of the progress bar */
  progress?: number;
}) {
  return (
    <div className="band24 frame24">
      <RegMarks variant="x" />
      <div className="band24-title">
        {title.toUpperCase()} <b>{index}</b>
      </div>
      <div className="band24-right">
        <div className="band24-progress" aria-hidden="true">
          <motion.i
            initial={{ width: "0%" }}
            whileInView={{ width: `${Math.round(progress * 100)}%` }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.span
            className="cursor"
            initial={{ left: "0%" }}
            whileInView={{ left: `calc(${Math.round(progress * 100)}% + 6px)` }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
        <Eyebrow>{label}</Eyebrow>
      </div>
    </div>
  );
}

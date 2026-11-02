import { useId, useState } from "react";
import { motion, LayoutGroup } from "framer-motion";

/**
 * Adapted from Watermelon UI — "continuous-tabs"
 * (github.com/WatermelonCorp/watermelon-platform). Button-like tabs with a
 * spring-driven sliding indicator. Ported to Tailwind 3 / framer-motion,
 * squared off for the editorial page; adds an optional count per tab.
 */
export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

export function ContinuousTabs({
  tabs,
  defaultActiveId,
  onChange,
  label,
}: {
  tabs: TabItem[];
  defaultActiveId?: string;
  onChange?: (id: string) => void;
  label: string;
}) {
  const [active, setActive] = useState(defaultActiveId ?? tabs[0]?.id);
  const pill = useId();

  return (
    <LayoutGroup id={pill}>
      <div
        role="tablist"
        aria-label={label}
        className="relative inline-flex items-stretch"
        style={{ border: "2px solid #111410" }}
      >
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => {
                setActive(tab.id);
                onChange?.(tab.id);
              }}
              className="relative !rounded-none border-0 bg-transparent px-4 py-3 outline-none focus-visible:ring-2 focus-visible:ring-[#17843f] sm:px-6"
            >
              {isActive && (
                <motion.div
                  layoutId="active-pill"
                  transition={{ type: "spring", stiffness: 380, damping: 30, mass: 0.9 }}
                  className="absolute inset-0 bg-[#111410]"
                />
              )}
              <span
                className={`relative z-10 flex items-center gap-2 text-[0.95rem] font-semibold transition-colors duration-200 ${
                  isActive ? "text-[#f1efe7]" : "text-[#111410]"
                }`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`text-[0.8rem] font-normal tabular-nums ${isActive ? "text-[#f1efe7]/70" : "text-[#6b7268]"}`}>
                    {tab.count}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}

import type { ReactNode, ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";

/** Vira mark: rounded green tile with a converging-paths glyph. */
export function ViraMark({ size = 26, radius = 7 }: { size?: number; radius?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" aria-hidden="true">
      <rect width="26" height="26" rx={radius} fill="var(--green)" />
      <path d="M6.5 8 L13 19 L19.5 8 H15.8 L13 13.4 L10.2 8 Z" fill="#fff" />
    </svg>
  );
}

/** Section chrome: top rule + mono rail (❯ LABEL … [N/8]) over a white box. */
export function Section({
  label,
  index,
  total = 8,
  id,
  children,
}: {
  label: string;
  index: number;
  total?: number;
  id?: string;
  children: ReactNode;
}) {
  return (
    <section className="smsection" id={id}>
      <div className="smrail">
        <span>
          <span className="chev">❯</span>
          {label}
        </span>
        <span className="count">
          [<b>{index}</b>/{total}]
        </span>
      </div>
      <div className="smbox">{children}</div>
    </section>
  );
}

/** Primary button with the divided arrow cell. */
export function ArrowButton({
  children,
  className = "",
  ...rest
}: { children: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`smbtn primary ${className}`} {...rest}>
      {children}
      <span className="arr-cell">
        <span className="arr" aria-hidden="true">→</span>
      </span>
    </button>
  );
}

export function GhostButton({
  children,
  className = "",
  ...rest
}: { children: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`smbtn ghost ${className}`} {...rest}>
      {children}
    </button>
  );
}

export function DottedLink({
  children,
  className = "",
  ...rest
}: { children: ReactNode } & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a className={`smbtn dotted ${className}`} {...rest}>
      {children} <span className="arr" aria-hidden="true">→</span>
    </a>
  );
}

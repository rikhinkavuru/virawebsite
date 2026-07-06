import type { ReactNode, ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";

/** Mono eyebrow label: /// LABEL >>> */
export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`eyebrow24 ${className}`}>
      <span className="e-slash" aria-hidden="true" />
      <span>{children}</span>
      <span className="e-arrows" aria-hidden="true" />
    </div>
  );
}

/** Four registration crosshairs pinned to the corners of a .frame24 parent. */
export function RegMarks({ variant = "x" }: { variant?: "x" | "plus" }) {
  return (
    <>
      <span className={`regmark ${variant} tl`} aria-hidden="true" />
      <span className={`regmark ${variant} tr`} aria-hidden="true" />
      <span className={`regmark ${variant} bl`} aria-hidden="true" />
      <span className={`regmark ${variant} br`} aria-hidden="true" />
    </>
  );
}

const Ticks = () => (
  <>
    <span className="tick tl" aria-hidden="true" />
    <span className="tick tr" aria-hidden="true" />
    <span className="tick bl" aria-hidden="true" />
    <span className="tick br" aria-hidden="true" />
  </>
);

/** Bracket-corner button. */
export function BracketButton({
  children,
  solid,
  className = "",
  ...rest
}: { children: ReactNode; solid?: boolean } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`btn24 ${solid ? "solid" : ""} ${className}`} {...rest}>
      <Ticks />
      {children}
    </button>
  );
}

/** Bracket-corner link (same look, anchor semantics). */
export function BracketLink({
  children,
  solid,
  className = "",
  ...rest
}: { children: ReactNode; solid?: boolean } & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a className={`btn24 ${solid ? "solid" : ""} ${className}`} {...rest}>
      <Ticks />
      {children}
    </a>
  );
}

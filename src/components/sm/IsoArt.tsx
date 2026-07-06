import type { ReactNode } from "react";

/**
 * Isometric scene renderer for the catalog panel — intricate machined
 * structures in the supermemory style: chunky tiered bases with accent
 * inlays, pillars with branded caps, screens, vents, LED rows and sagging
 * cables. Pure SVG, no deps. Painter's order is hand-managed back→front.
 */

const S = 30; // world unit → px
const COS = Math.cos(Math.PI / 6);
const SIN = Math.sin(Math.PI / 6);

const px = (x: number, y: number, z: number): [number, number] => [
  (x - y) * COS * S,
  (x + y) * SIN * S - z * S,
];

const poly = (pts: Array<[number, number]>) => pts.map((p) => p.join(",")).join(" ");

// palette: white tops, tinted sides, deep-green accents, mint highlights
const TOP = "#ffffff";
const RIGHT = "#d3e8da";
const LEFT = "#aed2bb";
const EDGE = { stroke: "#0f6330", strokeWidth: 0.5, strokeOpacity: 0.28, strokeLinejoin: "round" as const };
const ACCENT = "#0c5a2c";
const MINT = "#bff0cf";
const DARK = "#083d1e";

/* ---------- primitives ---------- */

function Box({
  x, y, z, w, d, h,
  top = TOP, right = RIGHT, left = LEFT,
}: {
  x: number; y: number; z: number; w: number; d: number; h: number;
  top?: string; right?: string; left?: string;
}) {
  const t = [px(x, y, z + h), px(x + w, y, z + h), px(x + w, y + d, z + h), px(x, y + d, z + h)];
  const r = [px(x + w, y, z), px(x + w, y + d, z), px(x + w, y + d, z + h), px(x + w, y, z + h)];
  const l = [px(x, y + d, z), px(x + w, y + d, z), px(x + w, y + d, z + h), px(x, y + d, z + h)];
  return (
    <g {...EDGE}>
      <polygon points={poly(l)} fill={left} />
      <polygon points={poly(r)} fill={right} />
      <polygon points={poly(t)} fill={top} />
    </g>
  );
}

/** Detail rectangle on a +x face (constant X plane). */
function RightRect({ X, y0, z0, y1, z1, fill, rx = 0 }: {
  X: number; y0: number; z0: number; y1: number; z1: number; fill: string; rx?: number;
}) {
  const pts = [px(X, y0, z0), px(X, y1, z0), px(X, y1, z1), px(X, y0, z1)];
  void rx;
  return <polygon points={poly(pts)} fill={fill} />;
}

/** Detail rectangle on a +y face (constant Y plane). */
function LeftRect({ Y, x0, z0, x1, z1, fill }: {
  Y: number; x0: number; z0: number; x1: number; z1: number; fill: string;
}) {
  const pts = [px(x0, Y, z0), px(x1, Y, z0), px(x1, Y, z1), px(x0, Y, z1)];
  return <polygon points={poly(pts)} fill={fill} />;
}

/** Detail rectangle on a top plane (constant Z). */
function TopRect({ Z, x0, y0, x1, y1, fill }: {
  Z: number; x0: number; y0: number; x1: number; y1: number; fill: string;
}) {
  const pts = [px(x0, y0, Z), px(x1, y0, Z), px(x1, y1, Z), px(x0, y1, Z)];
  return <polygon points={poly(pts)} fill={fill} />;
}

/** Circle lying on a top plane → iso ellipse. */
function TopCircle({ x, y, z, r, fill, stroke, strokeWidth = 1.4 }: {
  x: number; y: number; z: number; r: number; fill?: string; stroke?: string; strokeWidth?: number;
}) {
  const [cx, cy] = px(x, y, z);
  return (
    <ellipse
      cx={cx} cy={cy} rx={r * 1.22 * S / 26} ry={r * 0.7 * S / 26}
      fill={fill ?? "none"} stroke={stroke} strokeWidth={stroke ? strokeWidth : 0}
    />
  );
}

/** The venn brand printed on a top face. */
function VennTop({ x, y, z, r = 0.55, color = ACCENT }: {
  x: number; y: number; z: number; r?: number; color?: string;
}) {
  const off = r * 0.42;
  return (
    <g>
      <TopCircle x={x - off} y={y + off} z={z} r={r} stroke={color} />
      <TopCircle x={x + off} y={y - off} z={z} r={r} stroke={color} />
    </g>
  );
}

/** Row of LED dots along a +x face. */
function LedRow({ X, y, z, n, gap = 0.34, r = 2.2, fill = ACCENT }: {
  X: number; y: number; z: number; n: number; gap?: number; r?: number; fill?: string;
}) {
  return (
    <g fill={fill}>
      {Array.from({ length: n }, (_, i) => {
        const [cx, cy] = px(X, y + i * gap, z);
        return <circle key={i} cx={cx} cy={cy} r={r} />;
      })}
    </g>
  );
}

/** Thin vent slits on a +y face. */
function Vents({ Y, x0, x1, z, n, dz = 0.16, fill = "rgba(15,99,48,0.5)" }: {
  Y: number; x0: number; x1: number; z: number; n: number; dz?: number; fill?: string;
}) {
  return (
    <g>
      {Array.from({ length: n }, (_, i) => (
        <LeftRect key={i} Y={Y} x0={x0} z0={z + i * dz} x1={x1} z1={z + i * dz + dz * 0.45} fill={fill} />
      ))}
    </g>
  );
}

/** Sagging cable between two world points. */
function Cable({ a, b, sag = 26, color = MINT, width = 2 }: {
  a: [number, number, number]; b: [number, number, number]; sag?: number; color?: string; width?: number;
}) {
  const [x1, y1] = px(...a);
  const [x2, y2] = px(...b);
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2 + sag;
  return (
    <path
      d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`}
      fill="none" stroke={color} strokeWidth={width} strokeLinecap="round"
    />
  );
}

function Lamp({ x, y, z, delay = 0, r = 2.4 }: { x: number; y: number; z: number; delay?: number; r?: number }) {
  const [cx, cy] = px(x, y, z);
  return (
    <circle className="iso-blink" style={{ animationDelay: `${delay}s` }} cx={cx} cy={cy} r={r} fill={MINT} />
  );
}

function Shadow({ x = 0, y = 0, rx, ry }: { x?: number; y?: number; rx: number; ry: number }) {
  const [cx, cy] = px(x, y, 0);
  return <ellipse cx={cx} cy={cy + 8} rx={rx} ry={ry} fill="rgba(6,40,20,0.30)" />;
}

function Scene({ children, w = 400, h = 330, shift = 0 }: {
  children: ReactNode; w?: number; h?: number; shift?: number;
}) {
  return (
    <svg
      viewBox={`${-w / 2} ${-h / 2 - shift} ${w} ${h}`}
      style={{ width: "100%", maxWidth: w * 1.5, height: "auto", display: "block" }}
      aria-hidden="true"
    >
      <g className="iso-float">{children}</g>
    </svg>
  );
}

/* ================= scenes ================= */

/** 01 · Hackathons — mission gantry: four capped pillars bridged over a
 *  floating core, on a two-tier machined base. */
function Launch() {
  const P = 1.5; // pillar center offset
  const PH = 2.5; // pillar height
  const pillar = (cx: number, cy: number, k: number) => (
    <g key={k}>
      <Box x={cx - 0.42} y={cy - 0.42} z={1.02} w={0.84} d={0.84} h={PH} />
      <Box x={cx - 0.55} y={cy - 0.55} z={1.02 + PH} w={1.1} d={1.1} h={0.34} />
      <VennTop x={cx} y={cy} z={1.36 + PH} r={0.34} />
    </g>
  );
  return (
    <Scene shift={36}>
      <Shadow rx={150} ry={36} />
      {/* two-tier base with accent trim */}
      <Box x={-3.3} y={-3.3} z={0} w={6.6} d={6.6} h={0.55} />
      <RightRect X={3.3} y0={-2.9} z0={0.14} y1={2.9} z1={0.3} fill={ACCENT} />
      <LeftRect Y={3.3} x0={-2.9} z0={0.14} x1={2.9} z1={0.3} fill="rgba(12,90,44,0.55)" />
      <Box x={-2.55} y={-2.55} z={0.55} w={5.1} d={5.1} h={0.47} />
      <TopRect Z={1.021} x0={-2.3} y0={-2.3} x1={2.3} y1={-2.05} fill={MINT} />
      <TopRect Z={1.021} x0={-2.3} y0={2.05} x1={2.3} y1={2.3} fill={MINT} />
      <LedRow X={2.55} y={-1.6} z={0.8} n={5} />
      {/* back pillars first */}
      {pillar(-P, -P, 1)}
      {pillar(P, -P, 2)}
      {/* crossbeams */}
      <Box x={-P - 0.28} y={-P - 0.28} z={3.1} w={2 * P + 0.56} d={0.4} h={0.26} right={MINT} />
      <Box x={-P - 0.28} y={-P - 0.28} z={3.1} w={0.4} d={2 * P + 0.56} h={0.26} left={LEFT} />
      <Box x={P - 0.12} y={-P - 0.28} z={3.1} w={0.4} d={2 * P + 0.56} h={0.26} />
      {/* floating core on pedestal */}
      <Box x={-0.62} y={-0.62} z={1.02} w={1.24} d={1.24} h={0.28} top={ACCENT} />
      <Box x={-0.55} y={-0.55} z={1.85} w={1.1} d={1.1} h={1.1} right={MINT} />
      <VennTop x={0} y={0} z={2.95} r={0.4} />
      {/* front pillars + front beam */}
      {pillar(-P, P, 3)}
      {pillar(P, P, 4)}
      <Box x={-P - 0.28} y={P - 0.12} z={3.1} w={2 * P + 0.56} d={0.4} h={0.26} right={MINT} />
      {/* flag mast */}
      <Box x={2.75} y={-2.75} z={1.02} w={0.14} d={0.14} h={2.2} left={ACCENT} right={ACCENT} top={ACCENT} />
      <polygon
        points={poly([px(2.89, -2.68, 3.2), px(3.85, -2.68, 2.98), px(2.89, -2.68, 2.74)])}
        fill={MINT}
      />
      <Lamp x={-P} y={-P} z={1.42 + PH} />
      <Lamp x={P} y={P} z={1.42 + PH} delay={0.7} />
      <Lamp x={0} y={0} z={3.05} delay={1.3} r={2.8} />
    </Scene>
  );
}

/** 02 · Chapter network — two data towers on risers, joined by sagging
 *  cables, with a relay dish node. */
function Network() {
  return (
    <Scene shift={34}>
      <Shadow rx={155} ry={36} />
      {/* joined base plates */}
      <Box x={-3.6} y={-2.4} z={0} w={4} d={4.8} h={0.5} />
      <Box x={0.4} y={-1.9} z={0} w={3.2} d={3.8} h={0.5} />
      <RightRect X={3.6} y0={-1.5} z0={0.12} y1={1.5} z1={0.28} fill={ACCENT} />
      <TopRect Z={0.501} x0={-3.3} y0={-2.1} x1={-3.05} y1={2.1} fill={MINT} />
      {/* tall tower on riser */}
      <Box x={-2.9} y={-1.5} z={0.5} w={2.2} d={2.6} h={0.4} />
      <Box x={-2.45} y={-1.05} z={0.9} w={1.35} d={1.7} h={3.2} />
      {/* tower face details: line rows + screen + dots */}
      {Array.from({ length: 5 }, (_, i) => (
        <RightRect key={i} X={-1.1} y0={-0.8} z0={1.4 + i * 0.5} y1={0.4} z1={1.58 + i * 0.5} fill={i === 1 ? MINT : "rgba(15,99,48,0.35)"} />
      ))}
      <LedRow X={-1.1} y={-0.85} z={4.0} n={3} gap={0.3} r={2} />
      <Vents Y={0.65} x0={-2.25} x1={-1.4} z={1.3} n={4} />
      <TopRect Z={4.101} x0={-2.25} y0={-0.85} x1={-1.3} y1={0.45} fill={ACCENT} />
      <VennTop x={-1.78} y={-0.2} z={4.102} r={0.34} color={MINT} />
      {/* short tower on riser */}
      <Box x={0.9} y={-1.2} z={0.5} w={2.1} d={2.4} h={0.36} />
      <Box x={1.3} y={-0.8} z={0.86} w={1.3} d={1.6} h={2.3} />
      {Array.from({ length: 4 }, (_, i) => (
        <RightRect key={i} X={2.6} y0={-0.55} z0={1.2 + i * 0.42} y1={0.55} z1={1.36 + i * 0.42} fill={i === 2 ? MINT : "rgba(15,99,48,0.35)"} />
      ))}
      <Vents Y={0.8} x0={1.45} x1={2.3} z={1.1} n={4} />
      <TopRect Z={3.161} x0={1.45} y0={-0.65} x1={2.45} y1={0.65} fill={ACCENT} />
      <Lamp x={1.95} y={0} z={3.2} delay={0.5} />
      {/* cables between tower tops */}
      <Cable a={[-1.45, -0.5, 4.05]} b={[1.5, -0.35, 3.12]} sag={30} />
      <Cable a={[-1.45, -0.1, 4.0]} b={[1.5, 0.05, 3.08]} sag={40} color="rgba(255,255,255,0.85)" />
      <Cable a={[-1.45, 0.3, 3.95]} b={[1.5, 0.4, 3.05]} sag={52} width={1.6} />
      {/* relay dish node */}
      <Box x={-0.5} y={1.3} z={0.5} w={0.7} d={0.7} h={0.9} />
      <TopCircle x={-0.15} y={1.65} z={1.42} r={0.5} fill={MINT} stroke={ACCENT} strokeWidth={1} />
      <Lamp x={-0.15} y={1.65} z={1.5} delay={1.1} r={2} />
      <Lamp x={-1.78} y={-0.5} z={4.15} />
    </Scene>
  );
}

/** 03 · Clinical mentorship — med mainframe with monitor face, open file
 *  drawer with record cards, cross emblem and a vitals pillar. */
function Clinic() {
  const [crossX, crossY] = px(2.05, 0.15, 1.75);
  return (
    <Scene shift={32}>
      <Shadow rx={150} ry={36} />
      {/* base */}
      <Box x={-3.2} y={-2.7} z={0} w={6.4} d={5.4} h={0.5} />
      <RightRect X={3.2} y0={-2.3} z0={0.12} y1={2.3} z1={0.28} fill={ACCENT} />
      <TopRect Z={0.501} x0={-2.9} y0={2.05} x1={2.9} y1={2.3} fill={MINT} />
      <LedRow X={3.2} y={-2.0} z={0.38} n={4} gap={0.3} r={1.8} fill={DARK} />
      {/* main cabinet */}
      <Box x={-2.3} y={-1.7} z={0.5} w={3.3} d={2.6} h={2.6} />
      {/* right face: screen inset with pulse + status rows */}
      <RightRect X={1.0} y0={-1.45} z0={1.7} y1={0.65} z1={2.85} fill={DARK} />
      <polyline
        points={poly([
          px(1.0, -1.3, 2.2), px(1.0, -0.95, 2.2), px(1.0, -0.78, 2.62),
          px(1.0, -0.55, 1.9), px(1.0, -0.38, 2.2), px(1.0, 0.5, 2.2),
        ])}
        fill="none" stroke={MINT} strokeWidth={1.8} strokeLinejoin="round" strokeLinecap="round"
      />
      <RightRect X={1.0} y0={-1.45} z0={1.28} y1={-0.2} z1={1.44} fill="rgba(15,99,48,0.4)" />
      <RightRect X={1.0} y0={-0.05} z0={1.28} y1={0.65} z1={1.44} fill={MINT} />
      <LedRow X={1.0} y={-1.4} z={0.95} n={5} gap={0.32} r={2} />
      {/* left face: cross emblem plate + vents */}
      <LeftRect Y={0.9} x0={-2.05} z0={1.5} x1={-0.85} z1={2.75} fill="#f4faf6" />
      <g fill={ACCENT}>
        <rect x={crossX - 3} y={crossY - 12} width={6} height={24} rx={1.4} transform={`translate(${px(-1.45, 0.9, 2.1)[0] - crossX}, ${px(-1.45, 0.9, 2.1)[1] - crossY})`} />
        <rect x={crossX - 12} y={crossY - 3} width={24} height={6} rx={1.4} transform={`translate(${px(-1.45, 0.9, 2.1)[0] - crossX}, ${px(-1.45, 0.9, 2.1)[1] - crossY})`} />
      </g>
      <Vents Y={0.9} x0={-2.1} x1={-1.5} z={0.75} n={3} />
      {/* top: inset + venn */}
      <TopRect Z={3.101} x0={-2.05} y0={-1.45} x1={0.75} y1={0.65} fill={MINT} />
      <VennTop x={-0.65} y={-0.4} z={3.102} r={0.42} />
      {/* open drawer with record cards */}
      <Box x={-1.9} y={1.0} z={0.62} w={1.9} d={1.6} h={0.75} right={MINT} />
      <LeftRect Y={2.6} x0={-1.75} z0={0.78} x1={-0.15} z1={1.0} fill={ACCENT} />
      <Box x={-1.65} y={1.15} z={1.37} w={0.34} d={1.2} h={0.62} top={"#f4faf6"} />
      <Box x={-1.15} y={1.15} z={1.37} w={0.34} d={1.2} h={0.78} top={MINT} />
      <Box x={-0.65} y={1.15} z={1.37} w={0.34} d={1.2} h={0.5} top={"#f4faf6"} />
      {/* vitals pillar */}
      <Box x={1.6} y={-1.9} z={0.5} w={0.2} d={0.2} h={2.9} left={ACCENT} right={ACCENT} top={ACCENT} />
      <Box x={1.1} y={-2.14} z={3.4} w={1.5} d={0.14} h={0.95} right={DARK} />
      <polyline
        points={poly([
          px(1.22, -2.14, 3.85), px(1.5, -2.14, 3.85), px(1.63, -2.14, 4.12),
          px(1.83, -2.14, 3.62), px(1.97, -2.14, 3.85), px(2.45, -2.14, 3.85),
        ])}
        fill="none" stroke={MINT} strokeWidth={1.6} strokeLinejoin="round" strokeLinecap="round"
      />
      <Lamp x={-0.65} y={-0.4} z={3.2} />
      <Lamp x={2.6} y={-2.14} z={4.2} delay={0.8} r={2} />
    </Scene>
  );
}

/** 04 · Demo days — awards stage: tiered podium with number plates,
 *  beacon spotlight and floating confetti. */
function Podium() {
  return (
    <Scene shift={34}>
      <Shadow rx={150} ry={36} />
      {/* stage base */}
      <Box x={-3.3} y={-2.6} z={0} w={6.6} d={5.2} h={0.5} />
      <RightRect X={3.3} y0={-2.2} z0={0.12} y1={2.2} z1={0.28} fill={ACCENT} />
      <Box x={-2.7} y={-2.0} z={0.5} w={5.4} d={4} h={0.4} />
      <TopRect Z={0.901} x0={-2.45} y0={-1.75} x1={2.45} y1={-1.5} fill={MINT} />
      <LedRow X={2.7} y={-1.4} z={0.72} n={6} gap={0.42} />
      {/* podium tiers: 2nd, 1st, 3rd */}
      <Box x={-2.2} y={-0.9} z={0.9} w={1.35} d={1.9} h={1.25} />
      <RightRect X={-0.85} y0={-0.55} z0={1.35} y1={0.65} z1={1.95} fill="rgba(15,99,48,0.2)" />
      <TopRect Z={2.151} x0={-2.0} y0={-0.7} x1={-1.05} y1={0.8} fill={MINT} />
      <Box x={-0.7} y={-0.9} z={0.9} w={1.4} d={1.9} h={2.05} right={MINT} />
      <RightRect X={0.7} y0={-0.5} z0={1.7} y1={0.6} z1={2.6} fill="#ffffff" />
      <TopRect Z={2.951} x0={-0.5} y0={-0.7} x1={0.5} y1={0.8} fill={ACCENT} />
      <Box x={0.85} y={-0.9} z={0.9} w={1.35} d={1.9} h={0.85} />
      <TopRect Z={1.751} x0={1.05} y0={-0.7} x1={2.0} y1={0.8} fill={MINT} />
      {/* beacon on the winner tier */}
      <Box x={-0.26} y={-0.26} z={2.95} w={0.52} d={0.52} h={1.15} top={MINT} />
      <TopCircle x={0} y={0} z={4.35} r={0.5} stroke={MINT} strokeWidth={1.4} />
      <TopCircle x={0} y={0} z={4.6} r={0.8} stroke="rgba(255,255,255,0.5)" strokeWidth={1} />
      {/* place dots: 2 / 1 / 3 */}
      <LedRow X={-0.85} y={-0.25} z={1.62} n={2} gap={0.4} />
      <LedRow X={0.7} y={-0.05} z={2.15} n={1} />
      <LedRow X={2.2} y={-0.45} z={1.32} n={3} gap={0.4} />
      {/* floating confetti chips */}
      <TopRect Z={2.9} x0={-2.6} y0={-2.3} x1={-2.2} y1={-1.9} fill={MINT} />
      <TopRect Z={3.6} x0={1.9} y0={-2.0} x1={2.25} y1={-1.65} fill="rgba(255,255,255,0.6)" />
      <TopRect Z={2.4} x0={2.5} y0={0.9} x1={2.85} y1={1.25} fill={MINT} />
      <TopRect Z={3.2} x0={-3.0} y0={0.8} x1={-2.7} y1={1.1} fill="rgba(255,255,255,0.5)" />
      <Lamp x={0} y={0} z={4.35} r={3} />
      <Lamp x={-1.55} y={0} z={2.35} delay={0.7} />
      <Lamp x={1.5} y={0} z={1.95} delay={1.3} />
    </Scene>
  );
}

/** 05 · Operator handoff — relay line: two gantry stations, a detailed
 *  carrier sliding the rail, control kiosk and an arcing link. */
function Relay() {
  const station = (cx: number, k: number) => (
    <g key={k}>
      <Box x={cx - 0.55} y={-1.25} z={0.5} w={1.1} d={2.5} h={0.3} />
      <Box x={cx - 0.38} y={-1.05} z={0.8} w={0.76} d={0.5} h={1.7} />
      <Box x={cx - 0.38} y={0.55} z={0.8} w={0.76} d={0.5} h={1.7} />
      <Box x={cx - 0.5} y={-1.15} z={2.5} w={1.0} d={2.3} h={0.3} right={MINT} />
      <VennTop x={cx} y={0} z={2.801} r={0.36} />
      <Vents Y={-0.55} x0={cx - 0.3} x1={cx + 0.3} z={1.1} n={3} />
    </g>
  );
  return (
    <Scene shift={30}>
      <Shadow rx={165} ry={34} />
      {/* long deck */}
      <Box x={-3.9} y={-1.55} z={0} w={7.8} d={3.1} h={0.5} />
      <RightRect X={3.9} y0={-1.2} z0={0.12} y1={1.2} z1={0.28} fill={ACCENT} />
      {/* rail with sleepers */}
      <Box x={-3.4} y={-0.42} z={0.5} w={6.8} d={0.84} h={0.18} top={MINT} />
      {Array.from({ length: 9 }, (_, i) => (
        <TopRect key={i} Z={0.682} x0={-3.2 + i * 0.75} y0={-0.34} x1={-3.05 + i * 0.75} y1={0.34} fill="rgba(12,90,44,0.5)" />
      ))}
      {/* far station */}
      {station(-3.0, 1)}
      {/* carrier sliding the rail */}
      <g className="iso-slide">
        <Box x={-0.75} y={-0.36} z={0.68} w={1.5} d={0.72} h={0.5} right={MINT} />
        <Box x={-0.55} y={-0.26} z={1.18} w={0.6} d={0.52} h={0.5} />
        <Box x={0.15} y={-0.22} z={1.18} w={0.5} d={0.44} h={0.34} top={ACCENT} />
        <LedRow X={0.75} y={-0.28} z={0.95} n={2} gap={0.3} r={1.8} />
      </g>
      {/* near station */}
      {station(3.0, 2)}
      {/* arcing link between station tops */}
      <Cable a={[-3.0, -0.9, 2.8]} b={[3.0, -0.9, 2.8]} sag={-46} color="rgba(255,255,255,0.85)" width={1.6} />
      <Cable a={[-3.0, 0.9, 2.8]} b={[3.0, 0.9, 2.8]} sag={-30} width={1.4} />
      {/* control kiosk */}
      <Box x={-1.2} y={1.05} z={0.5} w={0.85} d={0.6} h={1.0} />
      <RightRect X={-0.35} y0={1.15} z0={1.05} y1={1.55} z1={1.38} fill={DARK} />
      <Lamp x={-3.0} y={0} z={2.95} />
      <Lamp x={3.0} y={0} z={2.95} delay={0.9} />
    </Scene>
  );
}

export type IsoKind = "launch" | "network" | "clinic" | "podium" | "relay";

export function IsoScene({ kind }: { kind: IsoKind }) {
  switch (kind) {
    case "launch": return <Launch />;
    case "network": return <Network />;
    case "clinic": return <Clinic />;
    case "podium": return <Podium />;
    case "relay": return <Relay />;
  }
}

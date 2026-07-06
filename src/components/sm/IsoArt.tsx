import type { ReactNode } from "react";

/**
 * Isometric scene renderer for the catalog panel — supermemory-style
 * "beautiful objects": white machined structures with green accents,
 * floating on the green panel. Pure SVG, no deps. Each scene is built
 * from boxes projected at 30°, hand-ordered back-to-front.
 */

const S = 26; // world unit → px
const COS = Math.cos(Math.PI / 6);
const SIN = Math.sin(Math.PI / 6);

const px = (x: number, y: number, z: number): [number, number] => [
  (x - y) * COS * S,
  (x + y) * SIN * S - z * S,
];

const poly = (pts: Array<[number, number]>) => pts.map((p) => p.join(",")).join(" ");

// face palette: white top, tinted sides, deep-green accents
const TOP = "#ffffff";
const RIGHT = "#d3e8da";
const LEFT = "#aed2bb";
const EDGE = { stroke: "#0f6330", strokeWidth: 0.5, strokeOpacity: 0.28, strokeLinejoin: "round" as const };
const ACCENT = "#0c5a2c";
const MINT = "#bff0cf";

/** Solid box at (x,y,z) with size (w,d,h). Optional per-face overrides. */
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

/** Flat diamond tile on the ground plane (top face only). */
function Tile({ x, y, w, d, fill = "rgba(255,255,255,0.28)" }: {
  x: number; y: number; w: number; d: number; fill?: string;
}) {
  const t = [px(x, y, 0), px(x + w, y, 0), px(x + w, y + d, 0), px(x, y + d, 0)];
  return <polygon points={poly(t)} fill={fill} />;
}

/** Small glowing status light. */
function Lamp({ x, y, z, delay = 0 }: { x: number; y: number; z: number; delay?: number }) {
  const [cx, cy] = px(x, y, z);
  return (
    <circle
      className="iso-blink"
      style={{ animationDelay: `${delay}s` }}
      cx={cx} cy={cy} r={2.6} fill={MINT}
    />
  );
}

/** Soft ground shadow under a structure. */
function Shadow({ x, y, rx, ry }: { x: number; y: number; rx: number; ry: number }) {
  const [cx, cy] = px(x, y, 0);
  return <ellipse cx={cx} cy={cy + 6} rx={rx} ry={ry} fill="rgba(6,40,20,0.28)" />;
}

function Scene({ children, w = 380, h = 320, shift = 0 }: {
  children: ReactNode; w?: number; h?: number; shift?: number;
}) {
  return (
    <svg
      viewBox={`${-w / 2} ${-h / 2 - shift} ${w} ${h}`}
      style={{ width: "100%", maxWidth: w, height: "auto", display: "block" }}
      aria-hidden="true"
    >
      <g className="iso-float">{children}</g>
    </svg>
  );
}

/* ---------------- scenes ---------------- */

/** 01 · Hackathons — launch rig: platform, control tower, flag mast. */
function Launch() {
  return (
    <Scene shift={30}>
      <Shadow x={0} y={0} rx={120} ry={30} />
      <Tile x={-3.4} y={-0.2} w={1.4} d={1.4} />
      <Tile x={1.6} y={-2.8} w={1.1} d={1.1} fill="rgba(255,255,255,0.18)" />
      {/* platform slabs */}
      <Box x={-2.6} y={-2.6} z={0} w={5.2} d={5.2} h={0.5} />
      <Box x={-1.9} y={-1.9} z={0.5} w={3.8} d={3.8} h={0.42} right={MINT} />
      {/* accent inlay */}
      <Box x={-0.55} y={-0.55} z={0.92} w={1.1} d={1.1} h={0.1} top={ACCENT} />
      {/* control tower */}
      <Box x={-1.6} y={0.15} z={0.92} w={1.15} d={1.15} h={1.7} />
      <Box x={-1.45} y={0.3} z={2.62} w={0.85} d={0.85} h={0.5} top={ACCENT} />
      {/* stack of crates */}
      <Box x={0.8} y={0.7} z={0.92} w={0.9} d={0.9} h={0.9} />
      <Box x={0.95} y={0.85} z={1.82} w={0.6} d={0.6} h={0.6} right={MINT} />
      {/* flag mast */}
      <Box x={0.45} y={-1.35} z={0.92} w={0.18} d={0.18} h={2.6} left={ACCENT} right={ACCENT} top={ACCENT} />
      <polygon
        points={poly([px(0.63, -1.26, 3.42), px(1.75, -1.26, 3.16), px(0.63, -1.26, 2.9)])}
        fill={MINT}
      />
      <Lamp x={-1.05} y={0.72} z={3.2} />
      <Lamp x={1.25} y={1.15} z={2.5} delay={0.8} />
    </Scene>
  );
}

/** 02 · Chapter network — three pillars bridged together. */
function Network() {
  return (
    <Scene shift={26}>
      <Shadow x={0} y={0} rx={130} ry={30} />
      <Tile x={-3.6} y={0.6} w={1.2} d={1.2} />
      <Tile x={2.4} y={-3} w={1.2} d={1.2} fill="rgba(255,255,255,0.18)" />
      <Box x={-3} y={-3} z={0} w={6} d={6} h={0.4} />
      {/* pillars */}
      <Box x={-2.3} y={-1.9} z={0.4} w={1.1} d={1.1} h={2.4} />
      <Box x={1.2} y={-2.2} z={0.4} w={1.1} d={1.1} h={1.6} />
      <Box x={-0.4} y={1.1} z={0.4} w={1.1} d={1.1} h={3.1} />
      {/* caps */}
      <Box x={-2.15} y={-1.75} z={2.8} w={0.8} d={0.8} h={0.18} top={ACCENT} />
      <Box x={1.35} y={-2.05} z={2.0} w={0.8} d={0.8} h={0.18} top={ACCENT} />
      <Box x={-0.25} y={1.25} z={3.5} w={0.8} d={0.8} h={0.18} top={ACCENT} />
      {/* bridges */}
      <Box x={-1.2} y={-1.55} z={2.05} w={2.4} d={0.34} h={0.16} right={MINT} />
      <Box x={0.28} y={-1.4} z={2.2} w={0.34} d={2.6} h={0.16} left={MINT} />
      <Lamp x={-1.75} y={-1.35} z={3.15} />
      <Lamp x={0.15} y={1.65} z={3.85} delay={0.6} />
      <Lamp x={1.75} y={-1.65} z={2.35} delay={1.2} />
    </Scene>
  );
}

/** 03 · Clinical mentorship — med console with cross + monitor. */
function Clinic() {
  const [c1x, c1y] = px(1.62, 0.4, 1.55);
  return (
    <Scene shift={26}>
      <Shadow x={0} y={0} rx={120} ry={28} />
      <Tile x={-3.2} y={-0.4} w={1.2} d={1.2} />
      <Box x={-2.6} y={-2.6} z={0} w={5.2} d={5.2} h={0.4} />
      {/* main console */}
      <Box x={-1.9} y={-1.5} z={0.4} w={2.4} d={2.2} h={1.5} />
      <Box x={-1.75} y={-1.35} z={1.9} w={2.1} d={1.9} h={0.16} top={MINT} />
      {/* cross emblem on the right face */}
      <g fill={ACCENT}>
        <rect x={c1x - 2.2} y={c1y - 7} width={4.4} height={14} rx={1} />
        <rect x={c1x - 7} y={c1y - 2.2} width={14} height={4.4} rx={1} />
      </g>
      {/* monitor pillar */}
      <Box x={1.0} y={-1.7} z={0.4} w={0.22} d={0.22} h={2.5} left={ACCENT} right={ACCENT} top={ACCENT} />
      <Box x={0.55} y={-1.95} z={2.6} w={1.5} d={0.14} h={1.0} right={ACCENT} />
      {/* pulse line on the monitor */}
      <polyline
        points={poly([
          px(0.68, -1.95, 3.05), px(0.95, -1.95, 3.05), px(1.08, -1.95, 3.38),
          px(1.28, -1.95, 2.82), px(1.42, -1.95, 3.05), px(1.9, -1.95, 3.05),
        ])}
        fill="none" stroke={MINT} strokeWidth={1.6} strokeLinejoin="round" strokeLinecap="round"
      />
      {/* supply crates */}
      <Box x={-2.2} y={1.2} z={0.4} w={0.8} d={0.8} h={0.8} />
      <Box x={-1.3} y={1.45} z={0.4} w={0.55} d={0.55} h={0.55} right={MINT} />
      <Lamp x={-0.7} y={-0.4} z={2.2} />
    </Scene>
  );
}

/** 04 · Demo days — podium with beacon and confetti chips. */
function Podium() {
  return (
    <Scene shift={28}>
      <Shadow x={0} y={0} rx={125} ry={28} />
      <Box x={-2.8} y={-2.8} z={0} w={5.6} d={5.6} h={0.4} />
      {/* podium tiers */}
      <Box x={-2.1} y={-0.9} z={0.4} w={1.3} d={1.8} h={1.1} />
      <Box x={-0.7} y={-0.9} z={0.4} w={1.4} d={1.8} h={1.9} right={MINT} />
      <Box x={0.8} y={-0.9} z={0.4} w={1.3} d={1.8} h={0.7} />
      {/* number plates */}
      <Box x={-0.55} y={-0.75} z={2.3} w={1.1} d={1.5} h={0.14} top={ACCENT} />
      {/* beacon on the winner tier */}
      <Box x={-0.28} y={-0.28} z={2.44} w={0.5} d={0.5} h={0.9} left={ACCENT} right={ACCENT} top={MINT} />
      {/* floating confetti chips */}
      <g>
        <Tile x={-1.7} y={-2.4} w={0.5} d={0.5} fill={MINT} />
        <Tile x={1.5} y={-2.2} w={0.4} d={0.4} fill="rgba(255,255,255,0.5)" />
        <Tile x={2.1} y={0.9} w={0.5} d={0.5} fill={MINT} />
        <Tile x={-2.5} y={1.6} w={0.4} d={0.4} fill="rgba(255,255,255,0.4)" />
      </g>
      <Lamp x={-0.03} y={-0.03} z={3.6} />
      <Lamp x={-1.45} y={0} z={1.85} delay={0.7} />
      <Lamp x={1.45} y={0} z={1.45} delay={1.3} />
    </Scene>
  );
}

/** 05 · Operator handoff — relay line: two stations, a moving carrier. */
function Relay() {
  return (
    <Scene shift={24}>
      <Shadow x={0} y={0} rx={135} ry={28} />
      <Box x={-3.2} y={-1.4} z={0} w={6.4} d={2.8} h={0.4} />
      {/* rail */}
      <Box x={-2.7} y={-0.35} z={0.4} w={5.4} d={0.7} h={0.22} top={MINT} />
      {/* stations */}
      <Box x={-2.9} y={-1.05} z={0.4} w={1.2} d={2.1} h={1.5} />
      <Box x={1.7} y={-1.05} z={0.4} w={1.2} d={2.1} h={1.5} />
      <Box x={-2.75} y={-0.9} z={1.9} w={0.9} d={1.8} h={0.16} top={ACCENT} />
      <Box x={1.85} y={-0.9} z={1.9} w={0.9} d={1.8} h={0.16} top={ACCENT} />
      {/* carrier sliding along the rail */}
      <g className="iso-slide">
        <Box x={-0.5} y={-0.3} z={0.62} w={0.9} d={0.6} h={0.55} right={MINT} />
        <Box x={-0.32} y={-0.18} z={1.17} w={0.5} d={0.36} h={0.22} top={ACCENT} />
      </g>
      {/* arc arrow between stations */}
      <path
        d={`M ${px(-1.9, -1.3, 2.1).join(" ")} C ${px(-0.8, -1.3, 3.3).join(" ")}, ${px(0.8, -1.3, 3.3).join(" ")}, ${px(1.9, -1.3, 2.1).join(" ")}`}
        fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth={1.6} strokeDasharray="5 6" strokeLinecap="round"
      />
      <Lamp x={-2.3} y={0} z={2.25} />
      <Lamp x={2.3} y={0} z={2.25} delay={0.9} />
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

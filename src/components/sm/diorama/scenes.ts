import * as THREE from "three";
import {
  C, DISPLAY_FONT, MONO_FONT, FLOOR,
  type Mats, type Built,
  add, arc, at, ball, box, canvasTex, clamp01, cyl, decal, display, ease, halo, led, plinth, rr, tube, venn,
} from "./kit";
import type { IsoKind } from "../IsoArt";

/**
 * The five catalog dioramas. Each is a small physical model of the thing
 * the tab describes, built from bevelled primitives so real lighting,
 * reflections and shadows do the rendering work.
 *
 * Camera sits at +x/+z, so the faces that read are: top, +x (right, shaded)
 * and +z (left, lit). Anything meant to be seen faces one of those.
 */

const F = FLOOR;
const SCREEN_BG = "#06180d";
const QUARTER = Math.PI / 2;

/** Little clay figure: capsule torso + head. */
function person(body: THREE.Material, head: THREE.Material, tall = 0.2) {
  const g = new THREE.Group();
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.135, tall, 6, 18), body);
  torso.position.y = 0.135 + tall / 2;
  torso.castShadow = true;
  g.add(torso, at(ball(0.112, head), 0, 0.27 + tall + 0.13, 0));
  return g;
}

function drawCode(seed: number) {
  return (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.fillStyle = SCREEN_BG;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#12331f";
    ctx.fillRect(0, 0, w, 12);
    const tones = [C.glow, "#eafff2", "#4fce7c", "#eafff2", "#2f8f55"];
    for (let i = 0; i < 7; i++) {
      const indent = 10 + ((i * 7 + seed * 3) % 3) * 12;
      const len = 30 + ((i * 37 + seed * 53) % 70);
      ctx.fillStyle = tones[(i + seed) % tones.length];
      rr(ctx, indent, 22 + i * 11, len, 5, 2.5);
      ctx.fill();
    }
  };
}

/* ------------------------------------------------------------------ */
/* 01 · Localized Hackathons — a school room mid-build                 */
/* ------------------------------------------------------------------ */
function venue(m: Mats): Built {
  const g = new THREE.Group();
  g.add(plinth(m, 7, 7));
  g.add(at(box(4.9, 0.03, 4.7, m.mint, 0.02), 0.4, F, 0.4));
  const R = F + 0.03; // rug level

  // Two walls meeting in the back corner, capped in green.
  add(g,
    at(box(0.28, 3.0, 6.56, m.white, 0.05), -3.22, F, -0.08),
    at(box(6.56, 3.0, 0.28, m.white, 0.05), -0.08, F, -3.22),
    at(box(0.36, 0.1, 6.64, m.deep, 0.03), -3.22, F + 3.0, -0.08),
    at(box(6.64, 0.1, 0.36, m.deep, 0.03), -0.08, F + 3.0, -3.22),
  );

  // Wall display: live countdown for the build.
  const timer = canvasTex(640, 360, (ctx, w, h, t) => {
    ctx.fillStyle = SCREEN_BG;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = C.glow;
    ctx.beginPath();
    ctx.arc(44, 48, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = `500 22px ${MONO_FONT}`;
    ctx.textBaseline = "middle";
    ctx.fillText("LIVE", 62, 49);
    ctx.fillStyle = "#7fae90";
    ctx.textAlign = "right";
    ctx.fillText("VIRA HACK DAY", w - 36, 49);
    ctx.textAlign = "left";
    const left = Math.max(0, 7 * 3600 + 42 * 60 + 15 - Math.floor(t));
    const pad = (n: number) => String(n).padStart(2, "0");
    ctx.fillStyle = "#f2fff6";
    ctx.font = `600 122px ${DISPLAY_FONT}`;
    ctx.textAlign = "center";
    ctx.fillText(`${pad(Math.floor(left / 3600))}:${pad(Math.floor(left / 60) % 60)}:${pad(left % 60)}`, w / 2, 176);
    ctx.textAlign = "left";
    ctx.fillStyle = "#12331f";
    rr(ctx, 36, 268, w - 72, 14, 7);
    ctx.fill();
    ctx.fillStyle = C.glow;
    rr(ctx, 36, 268, (w - 72) * 0.62, 14, 7);
    ctx.fill();
    ctx.fillStyle = "#7fae90";
    ctx.font = `500 19px ${MONO_FONT}`;
    ctx.fillText("BUILD", 36, 312);
    ctx.textAlign = "right";
    ctx.fillText("JUDGING 17:00", w - 36, 312);
    ctx.textAlign = "left";
  });
  g.add(at(box(0.1, 1.62, 2.82, m.ink, 0.04), -3.04, F + 1.02, 0.5));
  const wallScreen = display(2.62, 1.44, timer.tex);
  wallScreen.rotation.y = QUARTER;
  g.add(at(wallScreen, -2.985, F + 1.83, 0.5));

  // Windows along the other wall.
  for (const x of [-1.8, -0.05, 1.7]) {
    const pane = box(1.13, 1.38, 0.04, m.glass, 0.02);
    pane.castShadow = false;
    add(g,
      at(box(1.27, 1.52, 0.05, m.deep, 0.02), x, F + 0.95, -3.07),
      at(pane, x, F + 1.02, -3.035),
      at(box(0.045, 1.38, 0.05, m.white, 0.01), x, F + 1.02, -3.03),
      at(box(1.13, 0.045, 0.05, m.white, 0.01), x, F + 1.7, -3.03),
    );
  }

  // Bunting strung under the wall cap.
  const stringPts: Array<[number, number, number]> = [];
  for (let i = 0; i <= 8; i++) {
    const u = i / 8;
    stringPts.push([-2.95 + u * 5.9, F + 2.86 - Math.sin(u * Math.PI) * 0.2, -3.0]);
  }
  const string = tube(stringPts, 0.012, m.dark);
  string.mesh.castShadow = false;
  g.add(string.mesh);
  const flagMats = [m.green, m.mint, m.gloss];
  for (let i = 0; i < 11; i++) {
    const p = string.curve.getPoint((i + 0.5) / 11);
    const flag = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.26, 3), flagMats[i % 3]);
    flag.scale.z = 0.12;
    flag.rotation.x = Math.PI;
    g.add(at(flag, p.x, p.y - 0.14, p.z));
  }

  // Tables: laptops, stools, builders.
  const screens = [0, 1, 2].map((s) => canvasTex(160, 100, drawCode(s)).tex);
  const laptop = (tex: THREE.Texture) => {
    const l = new THREE.Group();
    l.add(box(0.38, 0.025, 0.27, m.metal, 0.01));
    const lid = new THREE.Group();
    lid.add(box(0.38, 0.26, 0.018, m.metal, 0.008), at(display(0.34, 0.215, tex), 0, 0.132, 0.0105));
    lid.position.set(0, 0.02, -0.125);
    lid.rotation.x = -0.3;
    l.add(lid);
    return l;
  };
  const bodies = [m.green, m.mint, m.deep, m.gloss];
  let seat = 0;
  const table = (x: number, z: number, empty = -1) => {
    const t = new THREE.Group();
    add(t,
      at(box(1.8, 0.07, 0.86, m.gloss, 0.03), 0, 0.6, 0),
      at(box(0.07, 0.6, 0.7, m.deep, 0.02), -0.76, 0, 0),
      at(box(0.07, 0.6, 0.7, m.deep, 0.02), 0.76, 0, 0),
    );
    [-0.43, 0.43].forEach((dx, i) => {
      add(t,
        at(laptop(screens[(seat + i) % 3]), dx, 0.67, -0.06),
        at(cyl(0.2, 0.22, 0.03, m.metal), dx, 0, 0.8),
        at(cyl(0.03, 0.03, 0.4, m.metal), dx, 0, 0.8),
        at(cyl(0.18, 0.18, 0.07, m.mint), dx, 0.38, 0.8),
      );
      if (i !== empty) {
        const p = person(bodies[seat % bodies.length], m.gloss);
        p.rotation.x = -0.1;
        t.add(at(p, dx, 0.45, 0.8));
      }
      seat++;
    });
    return at(t, x, R, z);
  };
  add(g, table(-0.85, -1.35), table(1.5, -1.35, 1), table(-0.85, 1.05, 0), table(1.5, 1.05));

  // Organizer by the wall display, roll-up banner, plant, floor mark.
  g.add(at(person(m.deep, m.gloss, 0.42), -2.35, R, -1.55));
  const bannerTex = canvasTex(200, 520, (ctx, w, h) => {
    ctx.fillStyle = C.deep;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 7;
    for (const cx of [78, 122]) {
      ctx.beginPath();
      ctx.arc(cx, 150, 44, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = "#ffffff";
    ctx.font = `600 54px ${DISPLAY_FONT}`;
    ctx.textAlign = "center";
    ctx.fillText("vira", w / 2, 290);
    ctx.fillStyle = C.mint;
    ctx.font = `500 17px ${MONO_FONT}`;
    ctx.fillText("HACK DAY", w / 2, 334);
    ctx.fillStyle = "rgba(255,255,255,0.22)";
    for (let i = 0; i < 3; i++) ctx.fillRect(40, 400 + i * 26, 120 - i * 26, 8);
  }).tex;
  add(g,
    at(box(0.86, 0.07, 0.3, m.metal, 0.02), 2.75, F, -2.6),
    at(box(0.74, 1.95, 0.035, m.deep, 0.01), 2.75, F + 0.07, -2.6),
    at(decal(0.72, 1.9, bannerTex), 2.75, F + 1.04, -2.58),
  );
  add(g,
    at(cyl(0.24, 0.18, 0.34, m.gloss), -2.6, F, 2.85),
    at(ball(0.3, m.leaf), -2.6, F + 0.62, 2.85),
    at(ball(0.22, m.leaf), -2.42, F + 0.86, 2.75),
    at(ball(0.2, m.leaf), -2.74, F + 0.9, 2.98),
  );
  g.add(at(venn(m.metal, 0.3), 2.3, R + 0.02, 2.35));

  let lastSecond = -1;
  return {
    group: g,
    update(t) {
      const s = Math.floor(t);
      if (s !== lastSecond) {
        lastSecond = s;
        timer.redraw(t);
      }
    },
  };
}

/* ------------------------------------------------------------------ */
/* 02 · Chapter Network — schools wired to a shared hub                */
/* ------------------------------------------------------------------ */
function network(m: Mats): Built {
  const g = new THREE.Group();
  g.add(plinth(m, 7.4, 6.2));
  g.add(at(box(6.6, 0.04, 5.4, m.mint, 0.02), 0, F, 0));
  const P = F + 0.04;

  /** Lit window bands on the two visible faces of a tower. */
  const windows = (x: number, z: number, half: number, y0: number, rows: number, gap: number, span: number) => {
    for (let i = 0; i < rows; i++) {
      const mat = i % 3 === 1 ? m.deep : m.glow;
      add(g,
        at(box(0.014, 0.085, span, mat, 0.004), x + half + 0.003, y0 + i * gap, z),
        at(box(span, 0.085, 0.014, mat, 0.004), x, y0 + i * gap, z + half + 0.003),
      );
    }
  };

  // Hub tower.
  add(g,
    at(box(1.6, 0.22, 1.6, m.deep, 0.05), 0, P, 0),
    at(box(1.14, 2.5, 1.14, m.white, 0.07), 0, P + 0.22, 0),
    at(box(1.28, 0.14, 1.28, m.green, 0.04), 0, P + 2.72, 0),
    at(venn(m.metal, 0.24, 0.022), 0, P + 2.88, 0),
    at(cyl(0.022, 0.03, 0.85, m.metal, 12), 0.36, P + 2.86, -0.36),
  );
  windows(0, 0, 0.57, P + 0.62, 6, 0.33, 0.74);
  const beacon = led(m.glow, C.glow, 0.06, 0.9);
  g.add(at(beacon, 0.36, P + 3.75, -0.36));
  const orbit = new THREE.Mesh(new THREE.TorusGeometry(1.02, 0.016, 8, 96), m.metal);
  orbit.rotation.x = QUARTER;
  g.add(at(orbit, 0, P + 2.25, 0));

  // Chapter nodes, kept off the hub's sight-line so none hide behind it.
  const nodes = [
    { x: -2.75, z: -0.55, h: 1.5 },
    { x: -0.35, z: -2.2, h: 1.2 },
    { x: 2.75, z: -1.45, h: 1.0 },
    { x: 2.35, z: 1.85, h: 0.9 },
    { x: -2.0, z: 2.05, h: 1.2 },
  ];
  const hubTop = new THREE.Vector3(0, P + 2.3, 0);
  const links: Array<{ curve: THREE.Curve<THREE.Vector3>; dot: THREE.Group; phase: number; dir: number }> = [];
  nodes.forEach((n, i) => {
    add(g,
      at(box(1.14, 0.12, 1.14, m.deep, 0.04), n.x, P, n.z),
      at(box(0.94, n.h, 0.94, m.white, 0.06), n.x, P + 0.12, n.z),
      at(box(1.04, 0.11, 1.04, m.green, 0.03), n.x, P + 0.12 + n.h, n.z),
      at(box(0.2, 0.34, 0.014, m.deep, 0.004), n.x + 0.2, P + 0.12, n.z + 0.473),
      at(cyl(0.016, 0.016, 0.4, m.metal, 10), n.x - 0.3, P + 0.23 + n.h, n.z - 0.3),
      at(led(m.glow, C.glow, 0.04, 0.4), n.x - 0.3, P + 0.66 + n.h, n.z - 0.3),
    );
    windows(n.x, n.z, 0.47, P + 0.62, Math.max(1, Math.round((n.h - 0.5) / 0.3)), 0.3, 0.56);

    // Inlaid floor trace hub → node (L-shaped, like a PCB route).
    const tx = Math.abs(n.x), tz = Math.abs(n.z);
    add(g,
      at(box(tx, 0.012, 0.07, m.green, 0.004), n.x / 2, P, 0),
      at(box(0.07, 0.012, tz, m.green, 0.004), n.x, P, n.z / 2),
    );

    // Aerial link carrying data packets.
    const link = arc(hubTop, new THREE.Vector3(n.x, P + 0.3 + n.h, n.z), 1.1, 0.014, m.metal);
    g.add(link.mesh);
    const dot = led(m.glowWhite, C.glow, 0.05, 0.5);
    g.add(dot);
    links.push({ curve: link.curve, dot, phase: i * 0.37, dir: i % 2 ? -1 : 1 });
  });

  // A pending chapter: a ghosted building waiting to be provisioned.
  const ghostGeo = new THREE.BoxGeometry(0.94, 0.95, 0.94);
  const ghost = new THREE.Mesh(
    ghostGeo,
    new THREE.MeshStandardMaterial({ color: "#ffffff", transparent: true, opacity: 0.34, roughness: 0.3, depthWrite: false }),
  );
  const wire = new THREE.LineSegments(
    new THREE.EdgesGeometry(ghostGeo),
    new THREE.LineDashedMaterial({ color: "#ffffff", dashSize: 0.09, gapSize: 0.07 }),
  );
  wire.computeLineDistances();
  const pending = new THREE.Group();
  const amber = led(m.glowAmber, C.amber, 0.055, 0.7);
  add(pending, at(ghost, 0, 0.475, 0), at(wire, 0, 0.475, 0), at(amber, 0, 1.2, 0));
  add(g, at(box(1.14, 0.06, 1.14, m.white, 0.03), 0.55, P, 2.25), at(pending, 0.55, P + 0.06, 2.25));

  return {
    group: g,
    update(t) {
      orbit.rotation.z = t * 0.5;
      orbit.rotation.x = QUARTER + Math.sin(t * 0.6) * 0.14;
      for (const l of links) {
        const u = (t * 0.22 + l.phase) % 1;
        l.dot.position.copy(l.curve.getPoint(l.dir > 0 ? u : 1 - u));
        l.dot.scale.setScalar(0.6 + Math.sin(u * Math.PI) * 0.6);
      }
      const blink = 0.55 + Math.sin(t * 3.2) * 0.45;
      amber.scale.setScalar(0.7 + blink * 0.5);
      beacon.scale.setScalar(0.85 + Math.sin(t * 2.2) * 0.25);
      pending.position.y = P + 0.06 + Math.sin(t * 1.3) * 0.03;
    },
  };
}

/* ------------------------------------------------------------------ */
/* 03 · Clinical Mentorship — bedside monitor, chart, stethoscope      */
/* ------------------------------------------------------------------ */
function clinic(m: Mats): Built {
  const g = new THREE.Group();
  g.add(plinth(m, 7, 6));
  g.add(at(box(6.2, 0.03, 5.2, m.mint, 0.02), 0, F, 0));
  const P = F + 0.03;

  // Patient monitor on a rolling stand.
  const MX = -1.15, MZ = -1.0;
  const beat = (x: number) => {
    const p = ((x % 1) + 1) % 1;
    if (p < 0.1) return Math.sin((p / 0.1) * Math.PI) * 0.12;
    if (p < 0.16) return 0;
    if (p < 0.19) return -((p - 0.16) / 0.03) * 0.16;
    if (p < 0.225) return -0.16 + ((p - 0.19) / 0.035) * 1.16;
    if (p < 0.26) return 1 - ((p - 0.225) / 0.035) * 1.3;
    if (p < 0.29) return -0.3 + ((p - 0.26) / 0.03) * 0.3;
    if (p < 0.5) return Math.sin(((p - 0.29) / 0.21) * Math.PI) * 0.22;
    return 0;
  };
  const ecg = canvasTex(640, 380, (ctx, w, h, t) => {
    ctx.fillStyle = SCREEN_BG;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(141,255,188,0.08)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= w; x += 32) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = 0; y <= h; y += 32) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

    const plotW = 430;
    const head = (t * 0.28) % 1; // sweep position 0..1
    const trace = (base: number, amp: number, fn: (u: number) => number, color: string, width: number) => {
      ctx.lineWidth = width;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      for (let i = 1; i < plotW; i++) {
        const u0 = (i - 1) / plotW, u1 = i / plotW;
        // fade the trail behind the sweep head; blank just ahead of it
        const age = ((head - u1) % 1 + 1) % 1;
        if (age > 0.94) continue;
        ctx.globalAlpha = 1 - age * 0.85;
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(24 + i - 1, base - fn(u0) * amp);
        ctx.lineTo(24 + i, base - fn(u1) * amp);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(24 + head * plotW, base - fn(head) * amp, width * 1.2, 0, Math.PI * 2);
      ctx.fill();
    };
    trace(150, 78, (u) => beat(u * 3.2), C.glow, 4.5);
    trace(300, 24, (u) => Math.sin(u * Math.PI * 5), "#eafff2", 3.5);

    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#7fae90";
    ctx.font = `500 20px ${MONO_FONT}`;
    ctx.fillText("HR", 492, 62);
    ctx.fillText("SpO2", 492, 220);
    ctx.fillStyle = C.glow;
    ctx.font = `600 96px ${DISPLAY_FONT}`;
    ctx.fillText(String(72 + Math.round(Math.sin(t * 0.7) * 2)), 488, 152);
    ctx.fillStyle = "#f2fff6";
    ctx.font = `600 64px ${DISPLAY_FONT}`;
    ctx.fillText("98", 488, 284);
    ctx.fillStyle = "#7fae90";
    ctx.font = `500 18px ${MONO_FONT}`;
    ctx.fillText("MENTOR REVIEW · BED 04", 24, 356);
  });
  add(g,
    at(cyl(0.72, 0.8, 0.14, m.deep, 48), MX, P, MZ),
    at(cyl(0.09, 0.09, 0.95, m.metal, 24), MX, P + 0.14, MZ),
    at(box(3.0, 2.05, 0.62, m.white, 0.16), MX, P + 1.0, MZ),
    at(box(2.66, 1.62, 0.05, m.ink, 0.07), MX, P + 1.3, MZ + 0.29),
    at(display(2.5, 1.48, ecg.tex), MX, P + 2.11, MZ + 0.318),
  );
  for (let i = 0; i < 4; i++) {
    g.add(at(new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 8), i === 3 ? m.glowAmber : m.glow), MX - 1.05 + i * 0.2, P + 1.15, MZ + 0.312));
  }
  // side knobs + carry handle
  for (const y of [1.55, 2.05]) {
    const knob = cyl(0.12, 0.12, 0.1, m.metal, 28);
    knob.rotation.z = -QUARTER;
    g.add(at(knob, MX + 1.5, P + y, MZ));
  }
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.045, 10, 28, Math.PI), m.metal);
  handle.castShadow = true;
  g.add(at(handle, MX, P + 3.04, MZ));
  // sensor lead draped to a finger clip on the floor
  const lead = tube(
    [[MX + 1.5, P + 1.25, MZ], [MX + 1.95, P + 0.75, MZ + 0.2], [MX + 2.0, P + 0.12, MZ + 0.75], [MX + 2.35, P + 0.05, MZ + 1.35]],
    0.022, m.dark,
  );
  add(g, lead.mesh, at(box(0.2, 0.1, 0.3, m.gloss, 0.04), MX + 2.38, P, MZ + 1.5));

  // Floating medical cross on a pedestal.
  add(g,
    at(cyl(0.62, 0.7, 0.42, m.white, 48), 2.25, P, -1.6),
    at(cyl(0.5, 0.5, 0.05, m.green, 48), 2.25, P + 0.42, -1.6),
  );
  const badge = new THREE.Group();
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.66, 0.66, 0.18, 56), m.green);
  disc.rotation.x = QUARTER;
  disc.castShadow = true;
  add(badge,
    disc,
    at(box(0.24, 0.8, 0.27, m.gloss, 0.045), 0, -0.4, 0),
    at(box(0.8, 0.24, 0.27, m.gloss, 0.045), 0, -0.12, 0),
    halo(C.glow, 2.6, 0.28),
  );
  g.add(at(badge, 2.25, P + 1.6, -1.6));

  // Clipboard with a signed-off review checklist.
  const paper = canvasTex(300, 400, (ctx, w, h) => {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#0d1310";
    ctx.font = `600 24px ${DISPLAY_FONT}`;
    ctx.fillText("Project review", 30, 66);
    ctx.fillStyle = "#c8d2ca";
    ctx.fillRect(30, 84, w - 60, 2);
    for (let i = 0; i < 4; i++) {
      const y = 126 + i * 56;
      const done = i < 3;
      ctx.fillStyle = done ? C.green : "#ffffff";
      ctx.strokeStyle = done ? C.green : "#aab5ad";
      ctx.lineWidth = 3;
      rr(ctx, 30, y - 16, 30, 30, 7);
      ctx.fill();
      ctx.stroke();
      if (done) {
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(37, y - 1);
        ctx.lineTo(43, y + 6);
        ctx.lineTo(54, y - 8);
        ctx.stroke();
      }
      ctx.fillStyle = "#dfe6e1";
      rr(ctx, 78, y - 11, [150, 176, 124, 160][i], 9, 4);
      ctx.fill();
      rr(ctx, 78, y + 5, [96, 70, 110, 84][i], 7, 3.5);
      ctx.fill();
    }
    ctx.strokeStyle = C.deep;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(150, 366);
    ctx.bezierCurveTo(170, 330, 186, 384, 206, 352);
    ctx.bezierCurveTo(220, 332, 236, 372, 262, 346);
    ctx.stroke();
  }).tex;
  const board = new THREE.Group();
  add(board,
    box(1.3, 1.75, 0.07, m.deep, 0.05),
    at(decal(1.08, 1.44, paper), 0, 0.84, 0.037),
    at(box(0.5, 0.17, 0.1, m.metal, 0.03), 0, 1.6, 0.03),
  );
  board.rotation.x = -0.32;
  const strut = box(0.08, 1.45, 0.08, m.deep, 0.02);
  strut.rotation.x = 0.45;
  add(g, at(board, 1.9, P, 1.2), at(strut, 1.9, P, 0.15));

  // Stethoscope laid across the front of the deck.
  const sy = P + 0.05;
  const main = tube([[-2.45, sy, 1.75], [-1.85, sy, 2.2], [-1.1, sy, 1.85], [-0.45, sy, 2.2], [0.1, sy, 2.0]], 0.045, m.dark);
  const earA = tube([[0.1, sy, 2.0], [0.42, sy, 1.76], [0.9, sy, 1.72]], 0.028, m.metal);
  const earB = tube([[0.1, sy, 2.0], [0.42, sy, 2.26], [0.9, sy, 2.34]], 0.028, m.metal);
  add(g,
    main.mesh, earA.mesh, earB.mesh,
    at(ball(0.06, m.dark), 0.94, sy, 1.72),
    at(ball(0.06, m.dark), 0.94, sy, 2.34),
    at(cyl(0.27, 0.27, 0.1, m.metal, 40), -2.55, P, 1.68),
    at(cyl(0.2, 0.2, 0.025, m.gloss, 40), -2.55, P + 0.1, 1.68),
  );

  // Two capsules.
  const pill = (x: number, z: number, rot: number) => {
    const p = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.26, 6, 18), m.gloss);
    const half = new THREE.Mesh(new THREE.CapsuleGeometry(0.113, 0.13, 6, 18), m.green);
    half.position.y = 0.068;
    body.castShadow = half.castShadow = true;
    add(p, body, half);
    p.rotation.set(0, rot, QUARTER);
    return at(p, x, P + 0.115, z);
  };
  add(g, pill(2.75, 2.3, 0.5), pill(2.35, 2.42, -0.9));

  let frame = 0;
  return {
    group: g,
    update(t) {
      if (frame++ % 2 === 0) ecg.redraw(t);
      badge.rotation.y = t * 0.6;
      badge.position.y = P + 1.6 + Math.sin(t * 1.4) * 0.07;
    },
  };
}

/* ------------------------------------------------------------------ */
/* 04 · Demo Days & Judging — podium under the lights                  */
/* ------------------------------------------------------------------ */
function trophy(mat: THREE.Material, base: THREE.Material) {
  const t = new THREE.Group();
  const profile = [
    [0.0, 0.0], [0.17, 0.0], [0.17, 0.035], [0.06, 0.07], [0.04, 0.22], [0.07, 0.28],
    [0.2, 0.38], [0.27, 0.56], [0.29, 0.78], [0.27, 0.78], [0.24, 0.58], [0.0, 0.42],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const cup = new THREE.Mesh(new THREE.LatheGeometry(profile, 48), mat);
  cup.castShadow = true;
  add(t, at(box(0.42, 0.14, 0.42, base, 0.03), 0, 0, 0), at(cup, 0, 0.14, 0));
  for (const s of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.022, 8, 24, Math.PI), mat);
    ear.rotation.z = s * -QUARTER;
    ear.castShadow = true;
    t.add(at(ear, s * 0.27, 0.74, 0));
  }
  t.rotation.y = Math.PI / 4;
  return t;
}

function demo(m: Mats): Built {
  const g = new THREE.Group();
  g.add(plinth(m, 7.2, 6.4));
  g.add(at(box(6.1, 0.28, 4.9, m.white, 0.08), 0, F, 0.1));
  const S = F + 0.28;
  add(g,
    at(box(4.7, 0.04, 0.02, m.glow, 0.008), 0, F + 0.12, 2.554),
    at(box(5.1, 0.025, 2.0, m.green, 0.02), 0, S, 0.85),
  );

  // Podium tiers: 2nd · 1st · 3rd, numbered on the lit face.
  const plate = (n: string, fg: string, bg: string) =>
    canvasTex(160, 160, (ctx, w, h) => {
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = fg;
      ctx.font = `600 118px ${DISPLAY_FONT}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(n, w / 2, h / 2 + 8);
    }).tex;
  const PZ = 0.85;
  const tiers = [
    { x: -1.55, h: 0.95, n: "2", cap: m.mint, prize: m.silver, scale: 0.72 },
    { x: 0, h: 1.55, n: "1", cap: m.green, prize: m.gold, scale: 1 },
    { x: 1.55, h: 0.62, n: "3", cap: m.mint, prize: m.bronze, scale: 0.6 },
  ];
  const top = S + 0.025;
  for (const t of tiers) {
    const first = t.n === "1";
    const num = decal(0.5, 0.5, plate(t.n, first ? "#ffffff" : C.deep, first ? C.green : "#e7f3ea"));
    const prize = trophy(t.prize, m.dark);
    prize.scale.setScalar(t.scale);
    add(g,
      at(box(1.42, t.h, 1.36, m.white, 0.06), t.x, top, PZ),
      at(box(1.48, 0.08, 1.42, t.cap, 0.03), t.x, top + t.h, PZ),
      at(num, t.x, top + t.h * 0.5, PZ + 0.684),
      at(prize, t.x, top + t.h + 0.08, PZ),
    );
  }

  // Scoreboard behind the podium.
  const scores = [0.62, 0.94, 0.48, 0.78, 0.55];
  const board = canvasTex(640, 340, (ctx, w, h, t) => {
    ctx.fillStyle = SCREEN_BG;
    ctx.fillRect(0, 0, w, h);
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.fillStyle = "#f2fff6";
    ctx.font = `600 34px ${DISPLAY_FONT}`;
    ctx.fillText("Demo Day", 36, 50);
    ctx.fillStyle = "#7fae90";
    ctx.font = `500 18px ${MONO_FONT}`;
    ctx.textAlign = "right";
    ctx.fillText("JUDGING · LIVE", w - 36, 50);
    ctx.textAlign = "left";
    const cycle = (t % 9) / 9;
    scores.forEach((s, i) => {
      const grow = ease(clamp01(cycle * 4 - i * 0.22));
      const x = 46 + i * 116, bw = 78, maxH = 196;
      ctx.fillStyle = "#12331f";
      rr(ctx, x, 290 - maxH, bw, maxH, 8);
      ctx.fill();
      ctx.fillStyle = i === 1 ? C.glow : "#2f8f55";
      const bh = Math.max(8, maxH * s * grow);
      rr(ctx, x, 290 - bh, bw, bh, 8);
      ctx.fill();
      ctx.fillStyle = "#7fae90";
      ctx.font = `500 16px ${MONO_FONT}`;
      ctx.fillText(`T${i + 1}`, x + 26, 314);
    });
  });
  const BZ = -1.85;
  add(g,
    at(box(0.14, 3.0, 0.14, m.deep, 0.03), -2.05, S, BZ),
    at(box(0.14, 3.0, 0.14, m.deep, 0.03), 2.05, S, BZ),
    at(box(4.3, 2.3, 0.14, m.ink, 0.06), 0, S + 0.82, BZ + 0.02),
    at(display(4.06, 2.06, board.tex), 0, S + 1.97, BZ + 0.095),
  );

  // Spotlights: additive light cones aimed at the winner.
  const coneTex = canvasTex(8, 128, (ctx, w, h) => {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "rgba(255,255,255,0.9)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }).tex;
  const aim = new THREE.Vector3(0, top + 2.0, PZ);
  const beams: THREE.Group[] = [];
  for (const x of [-2.05, 2.05]) {
    const from = new THREE.Vector3(x, S + 3.2, BZ + 0.1);
    const len = from.distanceTo(aim) + 0.6;
    const geo = new THREE.ConeGeometry(0.95, len, 40, 1, true);
    geo.translate(0, -len / 2, 0);
    const cone = new THREE.Mesh(
      geo,
      new THREE.MeshBasicMaterial({
        map: coneTex, color: "#eafff2", transparent: true, opacity: 0.2,
        blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false, toneMapped: false,
      }),
    );
    const head = cyl(0.2, 0.15, 0.3, m.dark, 24);
    head.geometry.translate(0, -0.3, 0);
    const lamp = new THREE.Group();
    add(lamp, cone, head, at(new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 12), m.glowWhite), 0, -0.3, 0), halo("#eafff2", 1.1, 0.8));
    lamp.position.copy(from);
    lamp.userData.dir = aim.clone().sub(from).normalize();
    g.add(lamp);
    beams.push(lamp);
  }

  // Confetti.
  const confettiGeo = new THREE.BoxGeometry(0.1, 0.012, 0.065);
  const confettiMats = [m.gloss, m.mint, m.gold, m.glow];
  const rand = (i: number, k: number) => {
    const v = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
    return v - Math.floor(v);
  };
  const confetti = Array.from({ length: 46 }, (_, i) => {
    const piece = new THREE.Mesh(confettiGeo, confettiMats[i % confettiMats.length]);
    g.add(piece);
    return {
      piece,
      x: -2.8 + rand(i, 1) * 5.6,
      z: -0.9 + rand(i, 2) * 3.4,
      phase: rand(i, 3),
      speed: 0.07 + rand(i, 4) * 0.06,
      spin: 1 + rand(i, 5) * 2.4,
    };
  });

  const down = new THREE.Vector3(0, -1, 0);
  const dir = new THREE.Vector3();
  return {
    group: g,
    update(t) {
      board.redraw(t);
      beams.forEach((lamp, i) => {
        dir.copy(lamp.userData.dir as THREE.Vector3);
        dir.x += Math.sin(t * 0.7 + i * 2.1) * 0.07;
        dir.z += Math.cos(t * 0.55 + i) * 0.05;
        lamp.quaternion.setFromUnitVectors(down, dir.normalize());
      });
      for (const c of confetti) {
        const u = (t * c.speed + c.phase) % 1;
        c.piece.position.set(
          c.x + Math.sin(t * 0.9 + c.phase * 20) * 0.18,
          S + 4.3 - u * 4.0,
          c.z + Math.cos(t * 0.7 + c.phase * 14) * 0.14,
        );
        c.piece.rotation.set(t * c.spin, t * c.spin * 0.6 + c.phase * 6, t * c.spin * 0.8);
        c.piece.scale.setScalar(Math.min(1, u * 8, (1 - u) * 6));
      }
    },
  };
}

/* ------------------------------------------------------------------ */
/* 05 · Operator Handoff — the playbook rides to next year's team      */
/* ------------------------------------------------------------------ */
function playbook(m: Mats) {
  const b = new THREE.Group();
  const rings = venn(m.metal, 0.11, 0.012);
  add(b,
    box(0.74, 0.17, 0.54, m.green, 0.03),
    at(box(0.7, 0.115, 0.5, m.gloss, 0.012), 0.032, 0.028, 0.032),
    at(rings, 0, 0.175, 0),
    at(box(0.07, 0.008, 0.2, m.gold, 0.003), 0.2, 0.171, 0.2),
  );
  return b;
}

function relay(m: Mats): Built {
  const g = new THREE.Group();
  g.add(plinth(m, 8.4, 4.2));
  g.add(at(box(7.7, 0.03, 3.5, m.mint, 0.02), 0, F, 0));
  const P = F + 0.03;
  const RZ = -0.35;

  // Rail line.
  add(g,
    at(box(7.0, 0.08, 0.78, m.white, 0.03), 0, P, RZ),
    at(box(7.0, 0.05, 0.05, m.metal, 0.015), 0, P + 0.1, RZ - 0.24),
    at(box(7.0, 0.05, 0.05, m.metal, 0.015), 0, P + 0.1, RZ + 0.24),
  );
  for (let i = 0; i < 15; i++) g.add(at(box(0.1, 0.03, 0.66, m.deep, 0.01), -3.22 + i * 0.46, P + 0.08, RZ));

  // Two class-year stations.
  const plateTex = (label: string) =>
    canvasTex(360, 120, (ctx, w, h) => {
      ctx.fillStyle = C.deep;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#ffffff";
      ctx.font = `600 62px ${DISPLAY_FONT}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, w / 2, h / 2 + 4);
    }).tex;
  const SX = 3.1;
  const station = (x: number, label: string) => {
    const plateFace = decal(1.5, 0.5, plateTex(label));
    plateFace.rotation.y = QUARTER;
    add(g,
      at(box(0.46, 1.95, 0.46, m.white, 0.06), x, P, RZ - 0.92),
      at(box(0.46, 1.95, 0.46, m.white, 0.06), x, P, RZ + 0.92),
      at(box(0.66, 0.62, 2.4, m.white, 0.08), x, P + 1.95, RZ),
      at(box(0.74, 0.08, 2.48, m.green, 0.03), x, P + 2.57, RZ),
      at(plateFace, x + 0.334, P + 2.26, RZ),
      at(box(0.3, 0.03, 1.2, m.glow, 0.01), x, P + 1.925, RZ),
    );
  };
  station(-SX, "Class of ’26");
  station(SX, "Class of ’27");
  const roofY = P + 2.65;

  // Graduation cap on the outgoing station.
  const cap = new THREE.Group();
  const mortar = box(0.86, 0.045, 0.86, m.dark, 0.012);
  const tassel = tube([[0, 0.25, 0], [0.24, 0.26, 0.1], [0.43, 0.22, 0.2], [0.45, 0.02, 0.21]], 0.014, m.gold);
  add(cap, cyl(0.27, 0.31, 0.2, m.dark, 32), at(mortar, 0, 0.2, 0), at(cyl(0.045, 0.045, 0.03, m.gold, 16), 0, 0.245, 0), tassel.mesh, at(cyl(0.035, 0.02, 0.14, m.gold, 12), 0.45, -0.1, 0.21));
  cap.rotation.y = 0.5;
  g.add(at(cap, -SX, roofY, RZ));

  // Beacon on the incoming station.
  const beacon = new THREE.Group();
  const beaconGlow = halo(C.glow, 1.6, 0.8);
  add(beacon, cyl(0.16, 0.19, 0.1, m.metal, 24), at(new THREE.Mesh(new THREE.SphereGeometry(0.13, 20, 14), m.glow), 0, 0.17, 0), at(beaconGlow, 0, 0.17, 0));
  g.add(at(beacon, SX, roofY, RZ));

  // Carrier pod with the playbook on board.
  const pod = new THREE.Group();
  add(pod,
    at(box(1.2, 0.2, 0.68, m.gloss, 0.06), 0, 0.1, 0),
    at(box(0.96, 0.04, 0.56, m.deep, 0.015), 0, 0.3, 0),
    at(led(m.glow, C.glow, 0.035, 0.3), 0.6, 0.2, 0.2),
    at(led(m.glow, C.glow, 0.035, 0.3), 0.6, 0.2, -0.2),
  );
  for (const wx of [-0.38, 0.38]) for (const wz of [-0.24, 0.24]) {
    const wheel = cyl(0.085, 0.085, 0.06, m.dark, 20);
    wheel.geometry.translate(0, -0.03, 0);
    wheel.rotation.x = QUARTER;
    pod.add(at(wheel, wx, 0.085, wz));
  }
  const cargo = playbook(m);
  pod.add(at(cargo, 0, 0.34, 0));
  g.add(at(pod, -2.2, P + 0.1, RZ));

  // Archive: earlier playbooks stacked by the first station.
  [0, 1, 2].forEach((i) => {
    const b = playbook(m);
    b.rotation.y = 0.25 - i * 0.3;
    g.add(at(b, -2.35, P + i * 0.172, 1.05));
  });

  // Control kiosk tracking the transfer.
  let progress = 0;
  const kiosk = canvasTex(256, 160, (ctx, w, h) => {
    ctx.fillStyle = SCREEN_BG;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#7fae90";
    ctx.font = `500 20px ${MONO_FONT}`;
    ctx.textBaseline = "middle";
    ctx.fillText("HANDOFF", 20, 34);
    ctx.fillStyle = "#f2fff6";
    ctx.font = `600 52px ${DISPLAY_FONT}`;
    ctx.fillText(`${Math.round(progress * 100)}%`, 18, 86);
    ctx.fillStyle = "#12331f";
    rr(ctx, 20, 126, w - 40, 12, 6);
    ctx.fill();
    ctx.fillStyle = C.glow;
    rr(ctx, 20, 126, Math.max(12, (w - 40) * progress), 12, 6);
    ctx.fill();
  });
  const kioskScreen = new THREE.Group();
  add(kioskScreen, box(0.84, 0.56, 0.05, m.ink, 0.03), at(display(0.74, 0.46, kiosk.tex), 0, 0.28, 0.027));
  kioskScreen.rotation.x = -0.5;
  add(g,
    at(box(0.5, 0.7, 0.34, m.white, 0.05), 0.75, P, 1.1),
    at(kioskScreen, 0.75, P + 0.66, 1.2),
  );

  // Overhead link between the two classes.
  const link = arc(new THREE.Vector3(-SX, roofY, RZ + 0.75), new THREE.Vector3(SX, roofY, RZ + 0.75), 1.5, 0.014, m.metal);
  g.add(link.mesh);
  const packets = [0, 1, 2].map(() => {
    const dot = led(m.glowWhite, C.glow, 0.05, 0.5);
    g.add(dot);
    return dot;
  });

  const CYCLE = 7;
  let lastPct = -1;
  return {
    group: g,
    update(t) {
      const p = (t % CYCLE) / CYCLE;
      let x = -2.2, book = 1, lift = 0;
      if (p < 0.12) {
        book = ease(p / 0.12);
      } else if (p < 0.55) {
        x = -2.2 + 4.4 * ease((p - 0.12) / 0.43);
      } else if (p < 0.72) {
        const u = (p - 0.55) / 0.17;
        x = 2.2;
        book = 1 - ease(u);
        lift = ease(u) * 0.9;
      } else {
        x = 2.2 - 4.4 * ease((p - 0.72) / 0.28);
        book = 0;
      }
      pod.position.x = x;
      cargo.scale.setScalar(Math.max(0.001, book));
      cargo.position.y = 0.34 + lift;
      cargo.visible = book > 0.01;

      progress = clamp01((p - 0.12) / 0.43);
      const pct = Math.round(progress * 100);
      if (pct !== lastPct) {
        lastPct = pct;
        kiosk.redraw();
      }
      const arrived = p > 0.55 && p < 0.8 ? 1 : 0.35;
      beaconGlow.material.opacity = arrived * (0.7 + Math.sin(t * 6) * 0.2);
      beaconGlow.scale.setScalar(arrived > 0.5 ? 2.2 : 1.3);
      packets.forEach((dot, i) => {
        const u = (t * 0.2 + i / 3) % 1;
        dot.position.copy(link.curve.getPoint(u));
        dot.scale.setScalar(0.6 + Math.sin(u * Math.PI) * 0.6);
      });
    },
  };
}

export const BUILDERS: Record<IsoKind, (m: Mats) => Built> = {
  launch: venue,
  network,
  clinic,
  podium: demo,
  relay,
};

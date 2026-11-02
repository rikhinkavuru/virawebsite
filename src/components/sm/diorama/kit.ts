import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

/**
 * Building blocks for the catalog dioramas: a shared material palette and
 * small mesh helpers. Every helper returns a mesh whose origin sits at the
 * bottom-center, so `position.y` is always "the height it stands on".
 */

export const C = {
  white: "#f3f7f4",
  paper: "#ffffff",
  mint: "#bdeccb",
  green: "#1e9a4c",
  deep: "#0f6330",
  dark: "#0b2a19",
  ink: "#07170e",
  glow: "#8dffbc",
  amber: "#ffc857",
  gold: "#f0bd4a",
};

export const DISPLAY_FONT = '"DM Sans", system-ui, sans-serif';
export const MONO_FONT = '"DM Mono", ui-monospace, monospace';

export function makeMats() {
  const std = (color: string, roughness: number, metalness = 0) =>
    new THREE.MeshStandardMaterial({ color, roughness, metalness });
  return {
    white: std(C.white, 0.62),
    gloss: new THREE.MeshPhysicalMaterial({ color: C.paper, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.18 }),
    mint: std(C.mint, 0.58),
    green: std(C.green, 0.5),
    deep: std(C.deep, 0.48),
    dark: std(C.dark, 0.42),
    ink: new THREE.MeshPhysicalMaterial({ color: C.ink, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.1 }),
    metal: std("#e4ece7", 0.2, 1),
    gold: std(C.gold, 0.18, 1),
    silver: std("#dde4e8", 0.2, 1),
    bronze: std("#c98a52", 0.28, 1),
    leaf: std("#2fae5f", 0.7),
    glass: new THREE.MeshPhysicalMaterial({
      color: "#d6f6e2", roughness: 0.05, transparent: true, opacity: 0.34, depthWrite: false,
    }),
    glow: new THREE.MeshBasicMaterial({ color: C.glow, toneMapped: false }),
    glowWhite: new THREE.MeshBasicMaterial({ color: "#ffffff", toneMapped: false }),
    glowAmber: new THREE.MeshBasicMaterial({ color: C.amber, toneMapped: false }),
  };
}
export type Mats = ReturnType<typeof makeMats>;

/** What a scene builder hands back to the stage. */
export type Built = { group: THREE.Group; update: (t: number) => void };

const shadowed = <T extends THREE.Mesh>(m: T): T => {
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
};

/** Bevelled box standing on its origin. */
export function box(w: number, h: number, d: number, mat: THREE.Material, r = 0.05) {
  const radius = Math.max(0.004, Math.min(r, Math.min(w, h, d) / 2 - 0.002));
  const geo = new RoundedBoxGeometry(w, h, d, 3, radius);
  geo.translate(0, h / 2, 0);
  return shadowed(new THREE.Mesh(geo, mat));
}

/** Cylinder (or cone frustum) standing on its origin. */
export function cyl(rTop: number, rBottom: number, h: number, mat: THREE.Material, seg = 40) {
  const geo = new THREE.CylinderGeometry(rTop, rBottom, h, seg);
  geo.translate(0, h / 2, 0);
  return shadowed(new THREE.Mesh(geo, mat));
}

export function ball(r: number, mat: THREE.Material) {
  return shadowed(new THREE.Mesh(new THREE.SphereGeometry(r, 32, 20), mat));
}

/** Position helper that reads left-to-right in scene code. */
export function at<T extends THREE.Object3D>(o: T, x: number, y: number, z: number): T {
  o.position.set(x, y, z);
  return o;
}

export function add(parent: THREE.Object3D, ...children: THREE.Object3D[]) {
  parent.add(...children);
  return parent;
}

/** Tube swept along a smooth curve through the given points. */
export function tube(points: Array<[number, number, number]>, radius: number, mat: THREE.Material) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
  const mesh = shadowed(new THREE.Mesh(new THREE.TubeGeometry(curve, 72, radius, 10), mat));
  return { mesh, curve };
}

/** Arc between two points, lifted at the midpoint. */
export function arc(a: THREE.Vector3, b: THREE.Vector3, lift: number, radius: number, mat: THREE.Material) {
  const mid = a.clone().add(b).multiplyScalar(0.5);
  mid.y += lift;
  const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
  const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 56, radius, 8), mat);
  mesh.castShadow = true;
  return { mesh, curve };
}

let glowTex: THREE.Texture | null = null;
function glowTexture() {
  if (glowTex) return glowTex;
  const c = document.createElement("canvas");
  c.width = c.height = 96;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(48, 48, 0, 48, 48, 48);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.25, "rgba(255,255,255,0.45)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 96, 96);
  glowTex = new THREE.CanvasTexture(c);
  return glowTex;
}

/** Soft additive bloom sprite — fakes light scatter without a post pass. */
export function halo(color: string, size: number, opacity = 0.9) {
  const s = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowTexture(), color, transparent: true, opacity,
      blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false,
    }),
  );
  s.scale.setScalar(size);
  return s;
}

/** Lit indicator: emissive bead wrapped in a halo. */
export function led(mat: THREE.Material, color: string, r = 0.05, bloom = 0.55) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), mat), halo(color, bloom, 0.75));
  return g;
}

/** Canvas-backed texture with a redraw hook for animated displays. */
export function canvasTex(
  w: number,
  h: number,
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => void,
) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  const redraw = (t = 0) => {
    draw(ctx, w, h, t);
    tex.needsUpdate = true;
  };
  redraw(0);
  return { tex, redraw };
}

/** Self-lit display surface (faces +z; rotate to taste). */
export function display(w: number, h: number, tex: THREE.Texture) {
  return new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }),
  );
}

/** Printed (lit, non-emissive) surface such as paper or a number plate. */
export function decal(w: number, h: number, tex: THREE.Texture) {
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7 }),
  );
  m.receiveShadow = true;
  return m;
}

/** The Vira venn mark as two inlaid rings lying on a surface. */
export function venn(mat: THREE.Material, r = 0.3, thickness = 0.026) {
  const g = new THREE.Group();
  for (const s of [-1, 1]) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r, thickness, 10, 56), mat);
    ring.rotation.x = Math.PI / 2;
    ring.position.x = s * r * 0.55;
    ring.castShadow = true;
    g.add(ring);
  }
  // Read horizontally from the isometric camera.
  g.rotation.y = Math.PI / 4;
  return g;
}

/** Two-tier machined plinth every diorama stands on. Floor sits at FLOOR. */
export const FLOOR = 0.6;
export function plinth(m: Mats, w: number, d: number) {
  const g = new THREE.Group();
  g.add(at(box(w + 0.34, 0.18, d + 0.34, m.deep, 0.06), 0, 0, 0));
  g.add(at(box(w, 0.42, d, m.white, 0.09), 0, 0.18, 0));
  // status LEDs along the right face, light strip along the left face
  for (let i = 0; i < 5; i++) {
    g.add(at(new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 8), m.glow), w / 2 + 0.005, 0.4, -d * 0.32 + i * 0.2));
  }
  g.add(at(box(w * 0.5, 0.045, 0.02, m.glow, 0.01), -w * 0.12, 0.37, d / 2 + 0.004));
  return g;
}

export const ease = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Rounded-rect path helper for the 2D display canvases. */
export function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

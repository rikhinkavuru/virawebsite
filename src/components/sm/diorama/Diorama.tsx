import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { makeMats, type Built, type Mats } from "./kit";
import { BUILDERS } from "./scenes";
import type { IsoKind } from "../IsoArt";

/**
 * Real-time renderer for the catalog dioramas. One WebGL context, one
 * orthographic isometric camera, image-based lighting + a shadowed key
 * light. Scenes are built on first use and cached; switching tabs fades
 * the canvas, swaps the model and spins the new one in.
 *
 * Drag to rotate; the model drifts back to rest. Renders only while on
 * screen, and holds a still frame under prefers-reduced-motion.
 */

const ELEVATION = THREE.MathUtils.degToRad(31);
const AZIMUTH = Math.PI / 4;
const HOVER_LIFT = 0.32;
const ENTER_SECONDS = 0.95;

type Entry = { built: Built; radius: number; centerY: number };

class Stage {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
  private pivot = new THREE.Group();
  private mats: Mats;
  private cache = new Map<IsoKind, Entry>();
  private current: Entry | null = null;
  private currentKind: IsoKind | null = null;
  private want: IsoKind | null = null;
  private ready = false;
  private disposed = false;

  private raf = 0;
  private last = 0;
  private time = 0;
  private enterAt = 0;
  private visible = true;
  private dirtyUntil = 0;
  private swapTimer = 0;

  private hover = 0;
  private hoverTarget = 0;
  private pitch = 0;
  private pitchTarget = 0;
  private userYaw = 0;
  private dragging = false;
  private dragX = 0;
  private releasedAt = -10;

  private reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  private ro: ResizeObserver;
  private io: IntersectionObserver;

  constructor(private host: HTMLElement, private onFail: () => void) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    const r = this.renderer;
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    r.setClearColor(0x000000, 0);
    r.toneMapping = THREE.NeutralToneMapping;
    r.toneMappingExposure = 1.05;
    r.shadowMap.enabled = true;
    r.shadowMap.type = THREE.PCFShadowMap;
    r.domElement.className = "smdio-canvas";
    host.appendChild(r.domElement);

    // Image-based lighting gives the clay and metal something to reflect.
    const pmrem = new THREE.PMREMGenerator(r);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environmentIntensity = 0.72;
    pmrem.dispose();

    const key = new THREE.DirectionalLight("#fff8ec", 2.5);
    key.position.set(-7, 13, 6);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.left = key.shadow.camera.bottom = -8;
    key.shadow.camera.right = key.shadow.camera.top = 8;
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 40;
    key.shadow.bias = -0.0004;
    key.shadow.normalBias = 0.025;
    key.shadow.radius = 5;
    const fill = new THREE.DirectionalLight("#d6f7e2", 1.15);
    fill.position.set(9, 4, 3);
    this.scene.add(key, fill);

    // Invisible floor that only shows the model's shadow on the panel.
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 60),
      new THREE.ShadowMaterial({ color: "#03170a", opacity: 0.3 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground, this.pivot);

    this.mats = makeMats();

    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(host);
    this.io = new IntersectionObserver((entries) => {
      // Batched records arrive oldest-first; only the latest state matters.
      this.visible = entries[entries.length - 1].isIntersecting;
      if (this.visible) this.kick();
    });
    this.io.observe(host);

    host.addEventListener("pointermove", this.onMove);
    host.addEventListener("pointerdown", this.onDown);
    host.addEventListener("pointerup", this.onUp);
    host.addEventListener("pointercancel", this.onUp);
    host.addEventListener("pointerleave", this.onLeave);
    r.domElement.addEventListener("webglcontextlost", this.onLost);

    // Display canvases draw text — wait (briefly) for the site fonts.
    const fonts = Promise.all(
      ['600 40px "DM Sans"', '500 20px "DM Mono"'].map((f) => document.fonts.load(f)),
    );
    const timeout = new Promise((res) => window.setTimeout(res, 1200));
    Promise.race([fonts, timeout]).catch(() => undefined).then(() => {
      if (this.disposed) return;
      this.ready = true;
      if (this.want) this.swap();
    });

    this.resize();
    this.raf = requestAnimationFrame(this.frame);
  }

  show(kind: IsoKind) {
    this.want = kind;
    if (!this.ready) return;
    if (!this.current) return this.swap();
    if (kind === this.currentKind) return;
    this.renderer.domElement.style.opacity = "0";
    window.clearTimeout(this.swapTimer);
    this.swapTimer = window.setTimeout(() => this.swap(), 170);
  }

  private swap() {
    if (this.disposed || !this.want) return;
    const kind = this.want;
    let entry = this.cache.get(kind);
    if (!entry) {
      const built = BUILDERS[kind](this.mats);
      const sphere = new THREE.Box3().setFromObject(built.group).getBoundingSphere(new THREE.Sphere());
      entry = { built, radius: sphere.radius, centerY: sphere.center.y };
      this.cache.set(kind, entry);
    }
    if (this.current) this.pivot.remove(this.current.built.group);
    this.pivot.add(entry.built.group);
    this.current = entry;
    this.currentKind = kind;
    this.enterAt = this.time;
    this.userYaw = 0;
    this.fit();
    this.renderer.domElement.style.opacity = "1";
    this.kick();
  }

  /** Keep rendering for a moment (used when motion is otherwise frozen). */
  private kick() {
    this.dirtyUntil = performance.now() + 1400;
  }

  private resize() {
    const w = this.host.clientWidth, h = this.host.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.fit();
    this.kick();
  }

  private fit() {
    const w = this.host.clientWidth, h = this.host.clientHeight;
    if (!w || !h || !this.current) return;
    const aspect = w / h;
    const r = this.current.radius;
    const half = Math.max(r * 0.76, (r * 0.94) / aspect);
    this.camera.left = -half * aspect;
    this.camera.right = half * aspect;
    this.camera.top = half;
    this.camera.bottom = -half;
    this.camera.updateProjectionMatrix();
  }

  private frame = (now: number) => {
    this.raf = requestAnimationFrame(this.frame);
    const dt = Math.min(0.05, (now - this.last) / 1000 || 0);
    this.last = now;
    if (!this.visible || document.hidden || !this.current) return;
    if (this.reduce && now > this.dirtyUntil && !this.dragging) return;

    if (!this.reduce) this.time += dt;
    const t = this.reduce ? 2.4 : this.time;
    const k = Math.min(1, dt * 6);
    this.hover += (this.hoverTarget - this.hover) * k;
    this.pitch += (this.pitchTarget - this.pitch) * k;
    if (!this.dragging && this.time - this.releasedAt > 1.4) this.userYaw *= Math.exp(-dt * 2.4);

    const p = this.reduce ? 1 : Math.min(1, (this.time - this.enterAt) / ENTER_SECONDS);
    const e = 1 - Math.pow(1 - p, 3);
    const sway = this.reduce ? 0 : Math.sin(t * 0.42) * 0.13;
    this.pivot.rotation.y = sway + this.hover * 0.3 + this.userYaw - (1 - e) * 0.8;
    this.pivot.position.y = HOVER_LIFT - (1 - e) * 0.8 + (this.reduce ? 0 : Math.sin(t * 0.85) * 0.05);
    this.pivot.scale.setScalar(0.9 + 0.1 * e);

    const el = ELEVATION - this.pitch * 0.07;
    const cy = this.current.centerY + HOVER_LIFT;
    this.camera.position.set(
      Math.sin(AZIMUTH) * Math.cos(el) * 30,
      cy + Math.sin(el) * 30,
      Math.cos(AZIMUTH) * Math.cos(el) * 30,
    );
    this.camera.lookAt(0, cy, 0);

    this.current.built.update(t);
    this.renderer.render(this.scene, this.camera);
  };

  private onMove = (ev: PointerEvent) => {
    const rect = this.host.getBoundingClientRect();
    if (this.dragging) {
      this.userYaw += (ev.clientX - this.dragX) * 0.009;
      this.dragX = ev.clientX;
    } else if (ev.pointerType === "mouse") {
      this.hoverTarget = ((ev.clientX - rect.left) / rect.width - 0.5) * 2;
      this.pitchTarget = ((ev.clientY - rect.top) / rect.height - 0.5) * 2;
    }
    this.kick();
  };
  private onDown = (ev: PointerEvent) => {
    if (ev.button !== 0) return;
    this.dragging = true;
    this.dragX = ev.clientX;
    this.host.setPointerCapture(ev.pointerId);
    this.host.classList.add("dragging");
  };
  private onUp = (ev: PointerEvent) => {
    if (!this.dragging) return;
    this.dragging = false;
    this.releasedAt = this.time;
    if (this.host.hasPointerCapture(ev.pointerId)) this.host.releasePointerCapture(ev.pointerId);
    this.host.classList.remove("dragging");
    this.kick();
  };
  private onLeave = () => {
    this.hoverTarget = 0;
    this.pitchTarget = 0;
  };
  private onLost = (ev: Event) => {
    ev.preventDefault();
    this.onFail();
  };

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    window.clearTimeout(this.swapTimer);
    this.ro.disconnect();
    this.io.disconnect();
    this.host.removeEventListener("pointermove", this.onMove);
    this.host.removeEventListener("pointerdown", this.onDown);
    this.host.removeEventListener("pointerup", this.onUp);
    this.host.removeEventListener("pointercancel", this.onUp);
    this.host.removeEventListener("pointerleave", this.onLeave);
    this.renderer.domElement.removeEventListener("webglcontextlost", this.onLost);
    this.scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      mesh.geometry?.dispose();
    });
    this.scene.environment?.dispose();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    this.renderer.domElement.remove();
  }
}

export default function Diorama({ kind, onFail }: { kind: IsoKind; onFail: () => void }) {
  const host = useRef<HTMLDivElement>(null);
  const stage = useRef<Stage | null>(null);
  const fail = useRef(onFail);
  fail.current = onFail;

  useEffect(() => {
    if (!host.current) return;
    let s: Stage;
    try {
      s = new Stage(host.current, () => fail.current());
    } catch {
      fail.current();
      return;
    }
    stage.current = s;
    return () => {
      s.dispose();
      stage.current = null;
    };
  }, []);

  useEffect(() => {
    stage.current?.show(kind);
  }, [kind]);

  return <div ref={host} className="smdio" />;
}

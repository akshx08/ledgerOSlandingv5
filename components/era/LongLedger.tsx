"use client";

/**
 * The Long Ledger — the hero, and the emotional centre of the site.
 *
 * One continuous camera move through six forms of the same record. Nothing is
 * created and nothing is destroyed: the sheets in the filing drawer are the
 * sheets that were handwritten in the book, and the structure at the end is
 * built from what survived the flood. The camera never cuts.
 *
 * Six baked configurations per instance, interpolated on the GPU by a single
 * era uniform. Scroll writes that uniform and nothing else, which is what
 * allows this many individually oriented sheets inside a frame budget.
 */

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { LEAF_FRAG, LEAF_VERT } from "./leaf.glsl";
import { paletteAt, type Oklch } from "@/lib/era";

type Props = {
  /** 0 → 1 journey position, written by the page */
  progressRef: React.RefObject<number>;
};

/** OKLCH → linear sRGB, so the scene lights with the same colours as the DOM */
function oklchToColor(c: Oklch, out: THREE.Color) {
  const [L, C, H] = c;
  const a = C * Math.cos((H * Math.PI) / 180);
  const b = C * Math.sin((H * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return out.setRGB(
    Math.max(0, 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    Math.max(0, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    Math.max(0, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
    THREE.LinearSRGBColorSpace
  );
}

function rng(seed: number) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

export default function LongLedger({ progressRef }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
    const small = window.innerWidth < 900;
    // the single biggest performance lever, chosen from what the device is
    const COUNT = reduced ? 1200 : small || mem <= 4 ? 3000 : 7200;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    host.appendChild(renderer.domElement);
    renderer.domElement.style.cssText = "width:100%;height:100%;display:block";

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 400);

    /* ── the leaves ─────────────────────────────────────────────────── */
    const geo = new THREE.InstancedBufferGeometry();
    const quad = new THREE.PlaneGeometry(1, 1);
    geo.index = quad.index;
    geo.attributes.position = quad.attributes.position;
    geo.attributes.uv = quad.attributes.uv;

    const P = [0, 1, 2, 3, 4, 5].map(() => new Float32Array(COUNT * 3));
    const R0 = new Float32Array(COUNT * 3);
    const R4 = new Float32Array(COUNT * 3);
    // size.xy, seed, row — packed into one vec4 to stay under the 16-attribute
    // guarantee, which this shader would otherwise blow straight past
    const meta = new Float32Array(COUNT * 4);

    const rand = rng(20260721);
    const set = (arr: Float32Array, i: number, x: number, y: number, z: number) => {
      arr[i * 3] = x;
      arr[i * 3 + 1] = y;
      arr[i * 3 + 2] = z;
    };

    // structural constants for each era's arrangement
    const BOOK_ROWS = 26;
    const SHELF_COLS = 22;
    const CAB_COLS = 30;
    const CAB_ROWS = 12;
    const GRID_COLS = 46;

    for (let i = 0; i < COUNT; i++) {
      const r = rand();
      meta[i * 4 + 2] = r;               // seed
      meta[i * 4 + 3] = i % BOOK_ROWS;   // row within its own stack

      // ── 0. the bahi-khata: a bound stack, slightly splayed ──
      const bIdx = i % BOOK_ROWS;
      const bStack = Math.floor(i / BOOK_ROWS);
      set(
        P[0],
        i,
        (rand() - 0.5) * 0.05 + Math.min(bStack, 3) * 0.02,
        -0.9 + bIdx * 0.012 + Math.min(bStack, 3) * 0.05,
        -bStack * 0.006
      );
      set(R0, i, -1.42 + (rand() - 0.5) * 0.02, (rand() - 0.5) * 0.03, (rand() - 0.5) * 0.02);

      // ── 1. the press: many volumes, ranked on a shelf ──
      const sCol = i % SHELF_COLS;
      const sShelf = Math.floor(i / SHELF_COLS) % 5;
      set(
        P[1],
        i,
        (sCol - (SHELF_COLS - 1) / 2) * 0.62 + (rand() - 0.5) * 0.04,
        -1.6 + sShelf * 1.5,
        -Math.floor(i / (SHELF_COLS * 5)) * 0.09
      );

      // ── 2. the cabinet: filed, edge-on, in drawers ──
      const cCol = i % CAB_COLS;
      const cRow = Math.floor(i / CAB_COLS) % CAB_ROWS;
      set(
        P[2],
        i,
        (cCol - (CAB_COLS - 1) / 2) * 0.5,
        -2.4 + cRow * 0.46,
        -Math.floor(i / (CAB_COLS * CAB_ROWS)) * 0.045
      );

      // ── 3. the sheet: a rigid tabulated lattice ──
      const gCol = i % GRID_COLS;
      const gRow = Math.floor(i / GRID_COLS);
      set(
        P[3],
        i,
        (gCol - (GRID_COLS - 1) / 2) * 0.44,
        -((gRow % 30) - 15) * 0.3,
        -Math.floor(gRow / 30) * 1.3
      );

      // ── 4. the flood: everywhere, unreadable ──
      const a = rand() * Math.PI * 2;
      const rad = 5 + Math.pow(rand(), 0.5) * 26;
      set(P[4], i, Math.cos(a) * rad, (rand() - 0.5) * 30, Math.sin(a) * rad - 6);
      set(R4, i, rand() * 6.28, rand() * 6.28, rand() * 6.28);

      // ── 5. understood: a quiet, ordered spine ──
      const uRing = Math.floor(i / 60);
      const uPos = i % 60;
      const uAng = (uPos / 60) * Math.PI * 2;
      const uRad = 3.1 + (uRing % 3) * 0.85;
      set(
        P[5],
        i,
        Math.cos(uAng) * uRad,
        -6 + uRing * 0.26,
        Math.sin(uAng) * uRad
      );
      // no R5 attribute: the shader derives the facing from aP5 itself

      const w = 0.42 + rand() * 0.1;
      meta[i * 4] = w;
      meta[i * 4 + 1] = w * 1.42;
    }

    const inst = (a: Float32Array, n: number) => new THREE.InstancedBufferAttribute(a, n);
    geo.setAttribute("aP0", inst(P[0], 3));
    geo.setAttribute("aP1", inst(P[1], 3));
    geo.setAttribute("aP2", inst(P[2], 3));
    geo.setAttribute("aP3", inst(P[3], 3));
    geo.setAttribute("aP4", inst(P[4], 3));
    geo.setAttribute("aP5", inst(P[5], 3));
    geo.setAttribute("aR0", inst(R0, 3));
    geo.setAttribute("aR4", inst(R4, 3));
    geo.setAttribute("aMeta", inst(meta, 4));
    geo.instanceCount = COUNT;
    // instances are placed entirely in the vertex shader, so three's culling
    // would discard the whole record on the origin
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 90);

    const cPaper = new THREE.Color();
    const cInk = new THREE.Color();
    const cAccent = new THREE.Color();
    const cGround = new THREE.Color();

    const mat = new THREE.ShaderMaterial({
      vertexShader: LEAF_VERT,
      fragmentShader: LEAF_FRAG,
      uniforms: {
        uEra: { value: 0 },
        uTime: { value: 0 },
        uReduced: { value: reduced ? 1 : 0 },
        uDissolve: { value: 0 },
        uPaper: { value: cPaper },
        uInk: { value: cInk },
        uAccent: { value: cAccent },
      },
      side: THREE.DoubleSide,
    });

    const leaves = new THREE.Mesh(geo, mat);
    leaves.frustumCulled = false;
    scene.add(leaves);

    /* ── dust ───────────────────────────────────────────────────────── */
    // Only present while there is daylight to catch it. It is the single
    // clearest signal that the opening is a real room rather than a render.
    const DUST = reduced ? 0 : 900;
    const dustGeo = new THREE.BufferGeometry();
    const dp = new Float32Array(DUST * 3);
    for (let i = 0; i < DUST; i++) {
      dp[i * 3] = (rand() - 0.5) * 14;
      dp[i * 3 + 1] = (rand() - 0.5) * 9;
      dp[i * 3 + 2] = (rand() - 0.5) * 9;
    }
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dp, 3));
    const dustMat = new THREE.PointsMaterial({
      // dust catches light, it does not block it — additive, tiny, and
      // attenuated by distance so the far motes sit behind the near ones
      size: 0.03,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const dust = new THREE.Points(dustGeo, dustMat);
    scene.add(dust);

    /* ── resize ─────────────────────────────────────────────────────── */
    let portrait = false;
    const resize = () => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      portrait = w / h < 1;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    const ptr = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMove = (e: PointerEvent) => {
      ptr.tx = (e.clientX / window.innerWidth) * 2 - 1;
      ptr.ty = (e.clientY / window.innerHeight) * 2 - 1;
    };
    if (!reduced) window.addEventListener("pointermove", onMove, { passive: true });
    const onLost = (e: Event) => e.preventDefault();
    renderer.domElement.addEventListener("webglcontextlost", onLost);

    /* ── the shot ───────────────────────────────────────────────────── */
    // Seven camera stations, one per era plus the arrival. Catmull-Rom so no
    // station is a corner, and the whole thing reads as a single move.
    const PATH = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(0.5, 0.55, 2.3), // over the open book
        new THREE.Vector3(2.2, 1.1, 9.5), // pulling back into the room
        new THREE.Vector3(-1.5, 0.6, 13.5), // the shelves
        new THREE.Vector3(0.5, 0.2, 15.0), // the cabinets
        new THREE.Vector3(1.0, 0.0, 17.5), // the grid
        new THREE.Vector3(0.0, 0.5, 9.0), // inside the flood
        new THREE.Vector3(0.0, 1.6, 15.5), // the quiet structure
      ],
      false,
      "catmullrom",
      0.4
    );
    const LOOK = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(0, -0.55, 0),
        new THREE.Vector3(0, -0.2, 0),
        new THREE.Vector3(0, 0.4, 0),
        new THREE.Vector3(0, -0.4, 0),
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, -2.4, 0),
      ],
      false,
      "catmullrom",
      0.4
    );

    const camPos = new THREE.Vector3();
    const camLook = new THREE.Vector3();
    let raf = 0;
    let eased = 0;
    let last = performance.now();
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), {
      rootMargin: "150px",
    });
    io.observe(host);

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      const rawDt = (now - last) / 1000;
      last = now;
      const dt = Math.min(rawDt, 1 / 30);
      const t = now / 1000;

      const target = progressRef.current ?? 0;
      // a stalled tab must snap; reduced motion snaps too, since the trailing
      // smoothing is decoration while the journey itself is content
      if (rawDt > 0.25 || reduced) eased = target;
      else eased += (target - eased) * Math.min(1, dt * 2.6);
      const p = THREE.MathUtils.clamp(eased, 0, 1);

      ptr.x += (ptr.tx - ptr.x) * 0.045;
      ptr.y += (ptr.ty - ptr.y) * 0.045;

      // the palette of this exact moment, shared with the DOM
      const pal = paletteAt(p);
      oklchToColor(pal.surface, cPaper);
      oklchToColor(pal.fg, cInk);
      oklchToColor(pal.accent, cAccent);
      oklchToColor(pal.ground, cGround);
      renderer.setClearColor(cGround, 1);
      scene.fog = new THREE.FogExp2(cGround.getHex(), 0.012 + p * 0.02);

      // the record's form. The flood is held slightly longer than an even
      // split, because the point of that beat is that it goes on too long.
      mat.uniforms.uEra.value = p * 5;
      mat.uniforms.uTime.value = t;
      mat.uniforms.uDissolve.value = THREE.MathUtils.clamp((p - 0.93) / 0.07, 0, 1);

      // dust lives only while there is daylight
      dustMat.opacity = Math.max(0, 1 - p * 3.4) * 0.5;
      dustMat.color.copy(cPaper);
      if (!reduced) dust.rotation.y = t * 0.012;

      PATH.getPoint(p, camPos);
      LOOK.getPoint(p, camLook);
      camera.position.set(
        camPos.x + ptr.x * (0.35 + p * 1.6),
        camPos.y - ptr.y * (0.25 + p * 1.1),
        camPos.z + (portrait ? 4.5 + p * 6 : 0)
      );
      camera.lookAt(camLook);

      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      renderer.domElement.removeEventListener("webglcontextlost", onLost);
      quad.dispose();
      geo.dispose();
      mat.dispose();
      dustGeo.dispose();
      dustMat.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [progressRef]);

  return <div ref={hostRef} className="pointer-events-none fixed inset-0 z-0" aria-hidden />;
}

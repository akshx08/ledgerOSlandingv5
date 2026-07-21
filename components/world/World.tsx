"use client";

/**
 * World — the five vaults, as five actual places.
 *
 * Each room gets its own geometry, its own light, its own camera behaviour and
 * its own motion. They share only the scaffolding — renderer, resize, pointer,
 * frame loop, disposal — because five rooms that share a *look* are five
 * sections, and the brief asked for five worlds.
 *
 * All five draw their colour from the same era palette the hero uses, sampled
 * at the moment in the record's history that room belongs to. That is what
 * keeps the site one continuous world rather than a set of pages: walking into
 * the Document vault is walking back to the age of paper, and it looks it.
 *
 * Nothing here is decorative. Each world is the shape of the thing the room
 * describes:
 *   archive  — sheets standing as architecture, receding without end
 *   rings    — knowledge accumulating outward, never overwritten
 *   city     — records as towers, relationships as the spans between them
 *   kinetic  — work moving itself along tracks, calmly, without machinery
 *   branch   — futures diverging, weighted, and narrowing as evidence lands
 */

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { paletteAt, type Oklch } from "@/lib/era";

export type WorldKind = "archive" | "rings" | "city" | "kinetic" | "branch";

function toColor(c: Oklch, out: THREE.Color) {
  const [L, C, H] = c;
  const a = C * Math.cos((H * Math.PI) / 180);
  const b = C * Math.sin((H * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const enc = (v: number) =>
    v <= 0.0031308 ? 12.92 * Math.max(v, 0) : 1.055 * Math.pow(Math.max(v, 0), 1 / 2.4) - 0.055;
  return out.setRGB(
    enc(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    enc(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    enc(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
    THREE.SRGBColorSpace
  );
}

function rng(seed: number) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

export default function World({
  kind,
  when,
  className = "",
}: {
  kind: WorldKind;
  /** where in the record's history this room stands */
  when: number;
  className?: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.innerWidth < 900;
    const rand = rng(20260721);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);
    renderer.domElement.style.cssText = "width:100%;height:100%;display:block";

    const pal = paletteAt(when);
    const cFg = toColor(pal.fg, new THREE.Color());
    const cSoft = toColor(pal.fgSoft, new THREE.Color());
    const cAccent = toColor(pal.accent, new THREE.Color());
    const cLine = toColor(pal.line, new THREE.Color());

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 300);

    const disposables: { dispose(): void }[] = [];
    const track = <T extends { dispose(): void }>(x: T) => {
      disposables.push(x);
      return x;
    };

    /** per-frame behaviour, set by whichever world is built */
    let step: (t: number, px: number, py: number) => void = () => {};

    /* ═══ ARCHIVE ═══════════════════════════════════════════════════════
       Sheets standing as architecture. Ranks of them recede past the far
       plane, so the archive has no visible end — you are inside it, and it
       continues behind you. Panels slot into their rank as you watch. */
    if (kind === "archive") {
      const N = small ? 900 : 2400;
      const g = track(new THREE.InstancedBufferGeometry());
      const q = track(new THREE.PlaneGeometry(1, 1));
      g.index = q.index;
      g.attributes.position = q.attributes.position;
      g.attributes.uv = q.attributes.uv;

      const off = new Float32Array(N * 3);
      const sz = new Float32Array(N * 2);
      const ph = new Float32Array(N);
      const COLS = 9;
      for (let i = 0; i < N; i++) {
        const col = i % COLS;
        const rank = Math.floor(i / COLS);
        const side = col < COLS / 2 ? -1 : 1;
        const lane = col % Math.ceil(COLS / 2);
        off[i * 3] = side * (2.6 + lane * 1.15);
        off[i * 3 + 1] = -2.2 + ((rank * 7) % 11) * 0.42;
        off[i * 3 + 2] = -rank * 0.9;
        const w = 0.85 + rand() * 0.2;
        sz[i * 2] = w;
        sz[i * 2 + 1] = w * 1.35;
        ph[i] = rand();
      }
      g.setAttribute("aOff", new THREE.InstancedBufferAttribute(off, 3));
      g.setAttribute("aSize", new THREE.InstancedBufferAttribute(sz, 2));
      g.setAttribute("aPhase", new THREE.InstancedBufferAttribute(ph, 1));
      g.instanceCount = N;
      g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 200);

      const m = track(
        new THREE.ShaderMaterial({
          transparent: true,
          side: THREE.DoubleSide,
          uniforms: { uTime: { value: 0 }, uFg: { value: cSoft }, uAccent: { value: cAccent } },
          vertexShader: `
            attribute vec3 aOff; attribute vec2 aSize; attribute float aPhase;
            uniform float uTime; varying vec2 vUv; varying float vD; varying float vP;
            void main(){
              vUv = uv; vP = aPhase;
              vec3 p = vec3(position.xy * aSize, 0.0);
              // each panel slides into its rank, on its own beat
              float slot = smoothstep(0.0, 1.0, fract(uTime * 0.05 + aPhase));
              p.x += (aOff.x > 0.0 ? 1.0 : -1.0) * (1.0 - slot) * 1.4;
              vec3 w = p + aOff;
              vec4 mv = modelViewMatrix * vec4(w, 1.0);
              vD = 1.0 - smoothstep(6.0, 62.0, -mv.z);
              gl_Position = projectionMatrix * mv;
            }`,
          fragmentShader: `
            uniform vec3 uFg; uniform vec3 uAccent;
            varying vec2 vUv; varying float vD; varying float vP;
            void main(){
              vec2 d = abs(vUv - 0.5) * 2.0;
              if (max(d.x, d.y) > 0.97) discard;
              float rule = smoothstep(0.05, 0.0, abs(fract(vUv.y * 9.0) - 0.5) - 0.42);
              vec3 c = mix(uFg, uAccent, step(0.94, vP) * 0.7);
              gl_FragColor = vec4(c, (0.1 + rule * 0.5) * vD);
            }`,
        })
      );
      const mesh = new THREE.Mesh(g, m);
      mesh.frustumCulled = false;
      scene.add(mesh);

      step = (t, px, py) => {
        m.uniforms.uTime.value = t;
        // a slow, endless glide down the aisle
        camera.position.set(px * 0.7, 0.3 - py * 0.4, 6 - ((t * 0.55) % 40));
        camera.lookAt(0, 0.1, camera.position.z - 12);
      };
    }

    /* ═══ RINGS ═════════════════════════════════════════════════════════
       Knowledge accumulating outward. One ring per period held, each carrying
       the marks laid down in it, none of them ever overwritten. Seen from
       almost directly above, because a section through a trunk is the only
       honest way to look at accumulated time. */
    if (kind === "rings") {
      const RINGS = 26;
      const grp = new THREE.Group();
      scene.add(grp);
      for (let r = 0; r < RINGS; r++) {
        const rad = 0.7 + r * 0.32;
        const geo = track(new THREE.RingGeometry(rad, rad + 0.012 + (r % 4 === 0 ? 0.02 : 0), 128));
        const mat = track(
          new THREE.MeshBasicMaterial({
            color: r % 4 === 0 ? cAccent : cLine,
            transparent: true,
            opacity: 0.22 + (1 - r / RINGS) * 0.5,
            side: THREE.DoubleSide,
          })
        );
        const ring = new THREE.Mesh(geo, mat);
        ring.rotation.x = -Math.PI / 2;
        grp.add(ring);
      }
      // the marks — every interaction the system kept, at the radius of its year
      const MARKS = small ? 500 : 1500;
      const mg = track(new THREE.BufferGeometry());
      const mp = new Float32Array(MARKS * 3);
      for (let i = 0; i < MARKS; i++) {
        const r = Math.floor(rand() * RINGS);
        const rad = 0.7 + r * 0.32;
        const a = rand() * Math.PI * 2;
        mp[i * 3] = Math.cos(a) * rad;
        mp[i * 3 + 1] = 0.01 + rand() * 0.03;
        mp[i * 3 + 2] = Math.sin(a) * rad;
      }
      mg.setAttribute("position", new THREE.BufferAttribute(mp, 3));
      const mm = track(
        new THREE.PointsMaterial({
          color: cFg,
          size: 0.035,
          sizeAttenuation: true,
          transparent: true,
          opacity: 0.75,
        })
      );
      grp.add(new THREE.Points(mg, mm));

      step = (t, px, py) => {
        if (!reduced) grp.rotation.y = t * 0.035;
        camera.position.set(px * 1.2, 9.5 - py * 0.8, 4.2);
        camera.lookAt(0, 0, 0);
      };
    }

    /* ═══ CITY ══════════════════════════════════════════════════════════
       Records as towers, height set by how much is held on each; the spans
       between them are the relationships. Seen from street level, because a
       city read from above is a diagram and a city read from inside is a
       place. */
    if (kind === "city") {
      const COLS = 14;
      const ROWS = 14;
      const box = track(new THREE.BoxGeometry(1, 1, 1));
      const mat = track(
        new THREE.MeshBasicMaterial({ color: cSoft, transparent: true, opacity: 0.32 })
      );
      const inst = new THREE.InstancedMesh(box, mat, COLS * ROWS);
      const dummy = new THREE.Object3D();
      const tops: THREE.Vector3[] = [];
      let n = 0;
      for (let x = 0; x < COLS; x++) {
        for (let z = 0; z < ROWS; z++) {
          const h = 0.4 + Math.pow(rand(), 2.2) * 7;
          const px = (x - COLS / 2) * 1.5 + (rand() - 0.5) * 0.2;
          const pz = (z - ROWS / 2) * 1.5 + (rand() - 0.5) * 0.2;
          dummy.position.set(px, h / 2, pz);
          dummy.scale.set(0.55 + rand() * 0.3, h, 0.55 + rand() * 0.3);
          dummy.updateMatrix();
          inst.setMatrixAt(n++, dummy.matrix);
          if (h > 3.4) tops.push(new THREE.Vector3(px, h, pz));
        }
      }
      inst.instanceMatrix.needsUpdate = true;
      scene.add(inst);
      disposables.push(inst);

      // the spans — reasoning crossing between the tall records
      const pts: number[] = [];
      for (let i = 0; i < tops.length; i++) {
        const a = tops[i];
        const b = tops[(i + 3 + Math.floor(rand() * 5)) % tops.length];
        if (a.distanceTo(b) > 12) continue;
        pts.push(a.x, a.y, a.z, b.x, b.y, b.z);
      }
      const lg = track(new THREE.BufferGeometry());
      lg.setAttribute("position", new THREE.BufferAttribute(new Float32Array(pts), 3));
      const lm = track(
        new THREE.LineBasicMaterial({ color: cAccent, transparent: true, opacity: 0.42 })
      );
      scene.add(new THREE.LineSegments(lg, lm));

      step = (t, px, py) => {
        const a = reduced ? 0.6 : t * 0.045;
        camera.position.set(Math.cos(a) * 15 + px, 2.4 - py * 1.2, Math.sin(a) * 15);
        camera.lookAt(0, 2.6, 0);
      };
    }

    /* ═══ KINETIC ═══════════════════════════════════════════════════════
       Work moving itself. No machinery and no robots — just parcels
       travelling tracks, splitting at junctions and merging again, and one
       track that stops short because that is the one a person still owns. */
    if (kind === "kinetic") {
      const LANES = 5;
      const laneY = (i: number) => 2.2 - i * 1.1;
      for (let i = 0; i < LANES; i++) {
        const stop = i === LANES - 1 ? 2.2 : 6.5; // the last track hands back
        const lg = track(new THREE.BufferGeometry());
        lg.setAttribute(
          "position",
          new THREE.BufferAttribute(new Float32Array([-6.5, laneY(i), 0, stop, laneY(i), 0]), 3)
        );
        const lm = track(
          new THREE.LineBasicMaterial({
            color: i === LANES - 1 ? cAccent : cLine,
            transparent: true,
            opacity: 0.5,
          })
        );
        scene.add(new THREE.Line(lg, lm));
      }
      const PARCELS = 34;
      const pg = track(new THREE.PlaneGeometry(0.34, 0.24));
      const pm = track(new THREE.MeshBasicMaterial({ color: cFg, transparent: true, opacity: 0.8 }));
      const parcels = new THREE.InstancedMesh(pg, pm, PARCELS);
      scene.add(parcels);
      disposables.push(parcels);
      const lanes: number[] = [];
      const offs: number[] = [];
      for (let i = 0; i < PARCELS; i++) {
        lanes.push(Math.floor(rand() * LANES));
        offs.push(rand());
      }
      const dummy2 = new THREE.Object3D();

      step = (t, px, py) => {
        for (let i = 0; i < PARCELS; i++) {
          const lane = lanes[i];
          const stop = lane === LANES - 1 ? 2.2 : 6.5;
          const span = stop - -6.5;
          const k = (offs[i] + (reduced ? 0.35 : t * 0.055)) % 1;
          dummy2.position.set(-6.5 + k * span, laneY(lane), 0.02);
          // a parcel folds as it completes rather than vanishing
          const s = 1 - Math.pow(Math.max(0, k - 0.85) / 0.15, 2);
          dummy2.scale.set(s, s, 1);
          dummy2.updateMatrix();
          parcels.setMatrixAt(i, dummy2.matrix);
        }
        parcels.instanceMatrix.needsUpdate = true;
        camera.position.set(px * 0.8, -py * 0.5, 9.2);
        camera.lookAt(0, 0, 0);
      };
    }

    /* ═══ BRANCH ════════════════════════════════════════════════════════
       Futures diverging. One trunk of settled fact splits into outcomes that
       spread as they run forward — and the spread is the honest part, so the
       branches are drawn faint and wide rather than as a single confident
       line. */
    if (kind === "branch") {
      const pts: number[] = [];
      const walk = (x: number, y: number, depth: number) => {
        if (depth > 4) return;
        const kids = depth < 2 ? 2 : rand() > 0.45 ? 2 : 1;
        for (let k = 0; k < kids; k++) {
          const dy = (k - (kids - 1) / 2) * (2.7 / (depth + 1)) + (rand() - 0.5) * 0.25;
          const nx = x + 2.1;
          const ny = y + dy;
          pts.push(x, y, 0, nx, ny, 0);
          walk(nx, ny, depth + 1);
        }
      };
      walk(-7, 0, 0);
      const bg = track(new THREE.BufferGeometry());
      bg.setAttribute("position", new THREE.BufferAttribute(new Float32Array(pts), 3));
      const bm = track(
        new THREE.LineBasicMaterial({ color: cAccent, transparent: true, opacity: 0.42 })
      );
      scene.add(new THREE.LineSegments(bg, bm));

      // the settled trunk — thicker, certain, and short
      const tg = track(new THREE.BufferGeometry());
      tg.setAttribute(
        "position",
        new THREE.BufferAttribute(new Float32Array([-9.5, 0, 0, -7, 0, 0]), 3)
      );
      scene.add(new THREE.Line(tg, track(new THREE.LineBasicMaterial({ color: cFg }))));

      step = (t, px, py) => {
        // framed on the tree's own centre (x ≈ -3), not on the origin — the
        // trunk starts at -9.5 and the spread ends near 3.5, so looking at 0
        // pushes the whole figure into the left of the frame
        camera.position.set(-3 + px * 1.4, -py * 0.9, 8.6 - (reduced ? 0 : Math.sin(t * 0.16) * 0.6));
        camera.lookAt(-3, 0, 0);
      };
    }

    /* ── scaffolding ─────────────────────────────────────────────────── */
    const resize = () => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    const ptr = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      ptr.tx = ((e.clientX - r.left) / r.width) * 2 - 1;
      ptr.ty = ((e.clientY - r.top) / r.height) * 2 - 1;
    };
    if (!reduced) window.addEventListener("pointermove", onMove, { passive: true });
    const onLost = (e: Event) => e.preventDefault();
    renderer.domElement.addEventListener("webglcontextlost", onLost);

    let raf = 0;
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), {
      rootMargin: "100px",
    });
    io.observe(host);

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      ptr.x += (ptr.tx - ptr.x) * 0.05;
      ptr.y += (ptr.ty - ptr.y) * 0.05;
      step(now / 1000, ptr.x, ptr.y);
      renderer.render(scene, camera);
    };
    // reduced motion still gets one composed frame — a still of the place,
    // not an empty box
    if (reduced) {
      step(0, 0, 0);
      renderer.render(scene, camera);
    } else {
      raf = requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      renderer.domElement.removeEventListener("webglcontextlost", onLost);
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [kind, when]);

  return <div ref={hostRef} className={className} aria-hidden />;
}

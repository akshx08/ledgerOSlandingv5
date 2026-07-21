"use client";

/**
 * KOLAM — the hero.
 *
 * Before the household wakes, the threshold is swept, the ground is wetted,
 * and a kolam is drawn on it: first the pulli, a grid of dots laid from
 * memory, then a single line threaded around them. A sikku kolam has rules.
 * The line may loop, cross and double back, but it may not lift, it may not
 * leave a dot unaccounted for, and it must return to the point it started
 * from. It is drawn in rice flour, it is walked over by noon, and the next
 * morning it is drawn again.
 *
 * That is not decoration, and it is not a metaphor we reached for. It is the
 * oldest picture anyone has of what closing a set of books actually is: a
 * field of separate marks, and the claim that one continuous line can pass
 * around all of them and come back to where it began. Mathematicians study
 * kolam as formal grammars for precisely that reason.
 *
 * So the hero draws one, once, and stops. Nothing here is driven by scroll —
 * the line is drawn because it is morning, and it finishes whether anyone is
 * watching or not. The geometry is a 45° billiard on a lattice whose sides
 * are coprime, which is the condition for the path to close into exactly one
 * loop rather than several: the same reason a real kolam grid is chosen with
 * care before a single dot is laid.
 */

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { ERAS, type Oklch } from "@/lib/era";

/* ── colour ──────────────────────────────────────────────────────────────
   Raw ShaderMaterial bypasses three's output colour management, so these
   land in LINEAR sRGB and the fragment shaders encode on the way out. */
const cube = (x: number) => x * x * x;
function oklchToLinear([L, C, H]: Oklch): [number, number, number] {
  const h = (H * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l = cube(L + 0.3963377774 * a + 0.2158037573 * b);
  const m = cube(L - 0.1055613458 * a - 0.0638541728 * b);
  const s = cube(L - 0.0894841775 * a - 1.291485548 * b);
  return [
    Math.max(0, 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    Math.max(0, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    Math.max(0, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ];
}

/* ── the grid ────────────────────────────────────────────────────────────
   9 by 7. Coprime, so the line closes once and only once. */
const W = 9;
const H = 7;

/**
 * A ray at 45° reflecting off the walls of a W×H rectangle, recorded as the
 * points where it turns. This is the skeleton of a sikku kolam: the weave is
 * not invented, it falls out of the grid you chose.
 *
 * It must never reach a corner. At a corner both components of the direction
 * flip at once, which is not a reflection but a reversal — the ray turns round
 * and retraces its own route, drawing every segment twice and closing a loop
 * that is really just a line walked there and back. A ray launched from a
 * corner always terminates at one, so this runs on a doubled lattice starting
 * at (0, 1): reflections preserve the parity of x − y, corners have x − y
 * even, and an odd ray can never land on one.
 */
function billiard(): [number, number][] {
  const GW = 2 * W;
  const GH = 2 * H;
  const pts: [number, number][] = [];
  let x = 0;
  let y = 1;
  let dx = 1;
  let dy = 1;
  const state = () => `${x},${y},${dx},${dy}`;
  const start = state();
  for (let guard = 0; guard < 4096; guard++) {
    pts.push([x / 2, y / 2]);
    const steps = Math.min(dx > 0 ? GW - x : x, dy > 0 ? GH - y : y);
    x += dx * steps;
    y += dy * steps;
    if (x === 0 || x === GW) dx = -dx;
    if (y === 0 || y === GH) dy = -dy;
    if (state() === start) break;
  }
  return pts;
}

/** the turns at the edge don't corner, they curl — that curl is the kolam */
const CURL = 0.52;

type Props = { className?: string };

export default function Kolam({ className }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    // `?draw=0.4` freezes the hand mid-stroke. The tuning surface, and the
    // only way to photograph a finished kolam in an environment that throttles
    // requestAnimationFrame — there, the drawing simply never advances.
    const pin = new URLSearchParams(window.location.search).get("draw");
    const pinned = pin === null ? null : Math.max(0, Math.min(1, parseFloat(pin) || 0));

    const reduced =
      pinned !== null || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let alive = true;
    let raf = 0;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    // setSize(w, h, false) deliberately leaves the CSS box alone, so the canvas
    // would otherwise lay out at its device-pixel buffer — twice the host on a
    // retina screen — and the section's overflow-hidden would crop the kolam
    // down to its top-left quarter.
    renderer.domElement.style.cssText = "width:100%;height:100%;display:block";
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
    camera.position.z = 10;
    const stage = new THREE.Group();
    scene.add(stage);

    const dispose: { dispose(): void }[] = [];
    const track = <T extends { dispose(): void }>(o: T) => (dispose.push(o), o);

    /* ── the line ────────────────────────────────────────────────────── */
    const turns = billiard();
    const curled = turns.map(([x, y]) => {
      // push each wall-turn outside the grid so the reflection reads as a
      // loop thrown around the outer dots rather than a bounce
      const ox = x === 0 ? -CURL : x === W ? CURL : 0;
      const oy = y === 0 ? -CURL : y === H ? CURL : 0;
      return new THREE.Vector3(x + ox, y + oy, 0);
    });
    // centripetal, not uniform: uniform Catmull-Rom overshoots and self-loops
    // on the tight wall turns, and a kolam line never crosses itself by
    // accident — every crossing in a real one is deliberate
    const curve = new THREE.CatmullRomCurve3(curled, true, "centripetal", 0.5);

    const SEG = 2600;
    // getSpacedPoints repeats the first point at the end on a closed curve.
    // Keeping it leaves the ribbon with two blunt ends meeting at a seam — a
    // kolam with a visible join is a kolam that failed, so drop it and wrap.
    const raw = curve.getSpacedPoints(SEG).slice(0, SEG);

    // a drawn line is not a computed one: the hand wavers, and presses harder
    // in some places than others. Both wobbles are periodic in arc length so
    // the loop has no seam where it closes.
    const TAU = Math.PI * 2;
    const wobble = (s: number) =>
      0.6 * Math.sin(s * TAU * 23) + 0.4 * Math.sin(s * TAU * 11 + 1.7);
    const weight = (s: number) => 0.8 + 0.3 * (0.5 + 0.5 * Math.sin(s * TAU * 7 + 0.4));

    const HALF = 0.085;
    const n = raw.length;
    // n+1 ribs: the last one sits exactly on the first but carries arc = 1, so
    // the closing quad runs from just-under-1 up to 1 instead of collapsing
    // back to 0 and painting a sliver at the start for the whole drawing.
    const pos = new Float32Array((n + 1) * 2 * 3);
    const arc = new Float32Array((n + 1) * 2);
    const side = new Float32Array((n + 1) * 2);

    // arc length first, so the reveal advances at a constant hand-speed. The
    // total includes the closing step back to the start, so s reaches 1
    // exactly as the line returns to where it began.
    const cum = new Float32Array(n);
    for (let i = 1; i < n; i++) cum[i] = cum[i - 1] + raw[i].distanceTo(raw[i - 1]);
    const total = cum[n - 1] + raw[0].distanceTo(raw[n - 1]) || 1;

    for (let i = 0; i < n; i++) {
      const s = cum[i] / total;
      const a = raw[(i - 1 + n) % n];
      const b = raw[(i + 1) % n];
      let tx = b.x - a.x;
      let ty = b.y - a.y;
      const len = Math.hypot(tx, ty) || 1;
      tx /= len;
      ty /= len;
      const nx = -ty;
      const ny = tx;
      const off = wobble(s) * 0.016;
      const cx = raw[i].x + nx * off;
      const cy = raw[i].y + ny * off;
      const w = HALF * weight(s);
      pos[i * 6] = cx + nx * w;
      pos[i * 6 + 1] = cy + ny * w;
      pos[i * 6 + 3] = cx - nx * w;
      pos[i * 6 + 4] = cy - ny * w;
      arc[i * 2] = s;
      arc[i * 2 + 1] = s;
      side[i * 2] = 1;
      side[i * 2 + 1] = -1;
    }

    // the closing rib: same place as the first, one full turn later
    for (let k = 0; k < 6; k++) pos[n * 6 + k] = pos[k];
    arc[n * 2] = 1;
    arc[n * 2 + 1] = 1;
    side[n * 2] = 1;
    side[n * 2 + 1] = -1;

    const index: number[] = [];
    for (let i = 0; i < n; i++) {
      const o = i * 2;
      const q = o + 2;
      index.push(o, o + 1, q, o + 1, q + 1, q);
    }

    const ribbon = track(new THREE.BufferGeometry());
    ribbon.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    ribbon.setAttribute("aArc", new THREE.BufferAttribute(arc, 1));
    ribbon.setAttribute("aSide", new THREE.BufferAttribute(side, 1));
    ribbon.setIndex(index);

    const flour = oklchToLinear([0.93, 0.012, 84]);
    const lineMat = track(
      new THREE.RawShaderMaterial({
        glslVersion: THREE.GLSL3,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uHead: { value: pinned ?? (reduced ? 1 : 0) },
          uSettle: { value: pinned !== null ? (pinned >= 1 ? 1 : 0) : reduced ? 1 : 0 },
          uFlour: { value: new THREE.Vector3(...flour) },
        },
        vertexShader: /* glsl */ `
          precision highp float;
          uniform mat4 projectionMatrix, modelViewMatrix;
          in vec3 position;
          in float aArc;
          in float aSide;
          out float vArc;
          out float vSide;
          out vec2 vWorld;
          void main() {
            vArc = aArc;
            vSide = aSide;
            vWorld = position.xy;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          precision highp float;
          uniform float uHead;
          uniform float uSettle;
          uniform vec3 uFlour;
          in float vArc;
          in float vSide;
          in vec2 vWorld;
          out vec4 frag;

          float hash(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
          }

          void main() {
            // the line does not exist ahead of the hand
            if (vArc > uHead) discard;

            // rice flour has no clean edge — it thins out and stops
            float edge = 1.0 - smoothstep(0.34, 1.0, abs(vSide));

            // and it is a powder, not a paint: grain, and gaps in the grain
            float g = hash(floor(vWorld * 210.0));
            float grain = smoothstep(0.13, 0.72, g);

            // at the head, the flour has just left the fingers and has not
            // settled: brighter, and scattered wider
            float head = smoothstep(0.05, 0.0, uHead - vArc);

            float a = edge * mix(0.55, 1.0, grain) * (0.9 + head * 0.5);
            a *= 0.55 + 0.45 * uSettle;
            if (a < 0.015) discard;

            vec3 col = uFlour * (1.0 + head * 0.5);
            frag = vec4(pow(max(col, vec3(0.0)), vec3(1.0 / 2.2)), a);
          }
        `,
      })
    );
    stage.add(new THREE.Mesh(ribbon, lineMat));

    /* ── the pulli ───────────────────────────────────────────────────── */
    // Laid before the line, from the centre outward, the way a hand works
    // across a threshold. Staggered, so the line has somewhere to weave.
    const dots: number[] = [];
    const delays: number[] = [];
    const cx0 = W / 2;
    const cy0 = H / 2;
    const far = Math.hypot(cx0, cy0);
    for (let i = 0; i <= W; i++) {
      for (let j = 0; j <= H; j++) {
        if ((i + j) % 2 !== 0) continue;
        dots.push(i, j, 0);
        delays.push((Math.hypot(i - cx0, j - cy0) / far) * 0.72);
      }
    }
    const dotGeo = track(new THREE.BufferGeometry());
    dotGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(dots), 3));
    dotGeo.setAttribute("aDelay", new THREE.BufferAttribute(new Float32Array(delays), 1));

    const brass = oklchToLinear(ERAS[ERAS.length - 1].p.accent);
    const dotMat = track(
      new THREE.RawShaderMaterial({
        glslVersion: THREE.GLSL3,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uT: { value: reduced ? 2 : 0 },
          uPx: { value: 8 },
          uCovered: { value: pinned !== null ? (pinned >= 1 ? 1 : 0) : reduced ? 1 : 0 },
          uBrass: { value: new THREE.Vector3(...brass) },
        },
        vertexShader: /* glsl */ `
          precision highp float;
          uniform mat4 projectionMatrix, modelViewMatrix;
          uniform float uT, uPx;
          in vec3 position;
          in float aDelay;
          out float vIn;
          void main() {
            vIn = smoothstep(aDelay, aDelay + 0.3, uT);
            gl_PointSize = uPx * mix(2.2, 1.0, vIn);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          precision highp float;
          uniform float uCovered;
          uniform vec3 uBrass;
          in float vIn;
          out vec4 frag;
          void main() {
            vec2 d = gl_PointCoord - 0.5;
            float r = length(d) * 2.0;
            float disc = 1.0 - smoothstep(0.55, 1.0, r);
            // once the line is down the dots are under flour, not gone
            float a = disc * vIn * mix(1.0, 0.62, uCovered);
            if (a < 0.01) discard;
            frag = vec4(pow(max(uBrass, vec3(0.0)), vec3(1.0 / 2.2)), a);
          }
        `,
      })
    );
    const pulli = new THREE.Points(dotGeo, dotMat);
    stage.add(pulli);

    /* ── framing ─────────────────────────────────────────────────────── */
    // Measure what was actually drawn rather than what the lattice implies —
    // the spline runs wide of its control points on the wall turns, and a
    // frustum sized from the grid crops the very loops that make it a kolam.
    ribbon.computeBoundingBox();
    const bb = ribbon.boundingBox!;
    const FIG_W = bb.max.x - bb.min.x;
    const FIG_H = bb.max.y - bb.min.y;
    stage.position.set(-(bb.min.x + FIG_W / 2), -(bb.min.y + FIG_H / 2), 0);

    const wrap = new THREE.Group();
    wrap.add(stage);
    scene.add(wrap);

    const resize = () => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      const aspect = w / h;
      const wide = aspect > 1.05;
      // Beside the words on a wide screen. On a narrow one the words run to
      // the bottom, so the kolam takes the empty band above them — a threshold
      // drawing sits in front of the door, never underneath the writing.
      const share = wide ? 0.74 : 0.26;
      const room = wide ? 0.43 : 0.82; // fraction of the width it may occupy
      const fh = Math.max(FIG_H / share, FIG_W / (room * aspect));
      const fw = fh * aspect;
      camera.left = -fw / 2;
      camera.right = fw / 2;
      camera.top = fh / 2;
      camera.bottom = -fh / 2;
      camera.updateProjectionMatrix();
      wrap.position.x = wide ? fw * 0.26 : 0;
      wrap.position.y = wide ? 0 : fh * 0.27;
      dotMat.uniforms.uPx.value = ((0.16 * h) / fh) * Math.min(window.devicePixelRatio, 2);
      // A still kolam has no frame loop to pick this up. Layout lands after
      // the effect runs, so without rendering here the still one never
      // appears at all — it sits correctly sized on a canvas nobody drew.
      if (reduced) renderer.render(scene, camera);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();

    /* ── the drawing ─────────────────────────────────────────────────── */
    const DOT_IN = 1.15; // laying the pulli
    const DRAW = 6.4; // threading the line
    const t0 = performance.now();

    const frame = (now: number) => {
      if (!alive) return;
      raf = requestAnimationFrame(frame);
      const t = (now - t0) / 1000;

      dotMat.uniforms.uT.value = t / DOT_IN;

      const p = Math.max(0, Math.min(1, (t - DOT_IN) / DRAW));
      // a hand starts carefully and finishes surely
      lineMat.uniforms.uHead.value = p * p * (3 - 2 * p);

      // the loop closes, and for a moment the whole figure is one thing
      const after = Math.max(0, Math.min(1, (t - DOT_IN - DRAW) / 0.9));
      lineMat.uniforms.uSettle.value = after;
      dotMat.uniforms.uCovered.value = after;

      renderer.render(scene, camera);
    };

    if (reduced) {
      resize();
      renderer.render(scene, camera);
    } else {
      raf = requestAnimationFrame(frame);
    }

    const onLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(raf);
    };
    renderer.domElement.addEventListener("webglcontextlost", onLost);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.domElement.removeEventListener("webglcontextlost", onLost);
      dispose.forEach((d) => d.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={hostRef} className={className} aria-hidden />;
}

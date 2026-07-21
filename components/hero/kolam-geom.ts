/**
 * The kolam, as geometry.
 *
 * Split out of the hero component because the line is now the floor of a room
 * rather than a picture on its own: the Atrium lays it flat and looks across
 * it, so the path and the ribbon have to be buildable independently of how
 * they are framed.
 *
 * See components/hero/Atrium.tsx for what a kolam is and why it is the right
 * first image for this company.
 */

import * as THREE from "three";

/**
 * A ray at 45° reflecting off the walls of a W×H rectangle, recorded where it
 * turns. This is the skeleton of a sikku kolam: the weave is not invented, it
 * falls out of the grid you chose.
 *
 * Two conditions make it a kolam rather than a scribble:
 *
 * - W and H coprime, so the path closes into exactly one loop instead of
 *   several — the same reason a real kolam grid is chosen with care before a
 *   single dot is laid;
 * - the ray must never reach a corner. At a corner both components of the
 *   direction flip at once, which is a reversal rather than a reflection: the
 *   ray turns round and retraces its own route, drawing every segment twice
 *   and closing a loop that is really a line walked there and back. A ray
 *   launched from a corner always terminates at one, so this runs on a doubled
 *   lattice starting at (0, 1). Reflections preserve the parity of x − y,
 *   corners have x − y even, and an odd ray can never land on one.
 */
export function kolamTurns(W: number, H: number): [number, number][] {
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
export const CURL = 0.52;

export function kolamCurve(W: number, H: number) {
  const curled = kolamTurns(W, H).map(([x, y]) => {
    const ox = x === 0 ? -CURL : x === W ? CURL : 0;
    const oy = y === 0 ? -CURL : y === H ? CURL : 0;
    return new THREE.Vector3(x + ox, 0, y + oy);
  });
  // centripetal, not uniform: uniform Catmull-Rom overshoots and self-loops on
  // the tight wall turns, and every crossing in a real kolam is deliberate
  return new THREE.CatmullRomCurve3(curled, true, "centripetal", 0.5);
}

/**
 * The line as a flat ribbon on the XZ plane, carrying arc length so a shader
 * can reveal it a stroke at a time.
 *
 * `aArc` runs 0 → 1 once around. The final rib sits exactly on the first but
 * carries arc = 1, so the closing quad runs from just under 1 up to 1 rather
 * than collapsing back to 0 and painting a sliver at the start for the whole
 * drawing. Dropping the duplicate point three returns for a closed curve is
 * what keeps the ribbon from having two blunt ends meeting at a seam.
 */
export function kolamRibbon(W: number, H: number, half: number, segments = 2600) {
  const curve = kolamCurve(W, H);
  const raw = curve.getSpacedPoints(segments).slice(0, segments);
  const n = raw.length;

  const TAU = Math.PI * 2;
  // a drawn line is not a computed one: the hand wavers and presses unevenly.
  // Both are periodic in arc length so the loop has no seam where it closes.
  const wobble = (s: number) => 0.6 * Math.sin(s * TAU * 23) + 0.4 * Math.sin(s * TAU * 11 + 1.7);
  const weight = (s: number) => 0.8 + 0.3 * (0.5 + 0.5 * Math.sin(s * TAU * 7 + 0.4));

  const pos = new Float32Array((n + 1) * 2 * 3);
  const arc = new Float32Array((n + 1) * 2);
  const side = new Float32Array((n + 1) * 2);

  const cum = new Float32Array(n);
  for (let i = 1; i < n; i++) cum[i] = cum[i - 1] + raw[i].distanceTo(raw[i - 1]);
  const total = cum[n - 1] + raw[0].distanceTo(raw[n - 1]) || 1;

  for (let i = 0; i < n; i++) {
    const s = cum[i] / total;
    const a = raw[(i - 1 + n) % n];
    const b = raw[(i + 1) % n];
    let tx = b.x - a.x;
    let tz = b.z - a.z;
    const len = Math.hypot(tx, tz) || 1;
    tx /= len;
    tz /= len;
    const nx = -tz;
    const nz = tx;
    const off = wobble(s) * 0.016;
    const cx = raw[i].x + nx * off;
    const cz = raw[i].z + nz * off;
    const w = half * weight(s);
    pos[i * 6] = cx + nx * w;
    pos[i * 6 + 2] = cz + nz * w;
    pos[i * 6 + 3] = cx - nx * w;
    pos[i * 6 + 5] = cz - nz * w;
    arc[i * 2] = s;
    arc[i * 2 + 1] = s;
    side[i * 2] = 1;
    side[i * 2 + 1] = -1;
  }
  for (let k = 0; k < 6; k++) pos[n * 6 + k] = pos[k];
  arc[n * 2] = 1;
  arc[n * 2 + 1] = 1;
  side[n * 2] = 1;
  side[n * 2 + 1] = -1;

  const index: number[] = [];
  for (let i = 0; i < n; i++) {
    const o = i * 2;
    index.push(o, o + 1, o + 2, o + 1, o + 3, o + 2);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aArc", new THREE.BufferAttribute(arc, 1));
  geo.setAttribute("aSide", new THREE.BufferAttribute(side, 1));
  geo.setIndex(index);
  geo.computeBoundingBox();
  return geo;
}

/** the pulli — staggered, so the line has somewhere to weave */
export function kolamDots(W: number, H: number) {
  const out: number[] = [];
  for (let i = 0; i <= W; i++) {
    for (let j = 0; j <= H; j++) {
      if ((i + j) % 2 !== 0) continue;
      out.push(i, 0, j);
    }
  }
  return new Float32Array(out);
}

/* ── colour ──────────────────────────────────────────────────────────────
   Raw ShaderMaterial bypasses three's output colour management, so these land
   in LINEAR sRGB and the fragment shaders encode on the way out. */
const cube = (x: number) => x * x * x;
export function oklchToLinear([L, C, H]: [number, number, number]): [number, number, number] {
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

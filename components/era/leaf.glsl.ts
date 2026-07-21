/**
 * The leaf — one sheet of the record, in every form it has ever taken.
 *
 * A single instanced quad carries the whole story. Six configurations are
 * baked per instance at build time (bound folio, shelved volume, filed
 * drawer, tabulated cell, scattered flood, resolved) and the vertex shader
 * interpolates between whichever pair the current moment falls between. No
 * instance is ever created or destroyed: the sheet you see filed in a cabinet
 * is the same sheet that was handwritten in the book, and the same one that
 * ends up understood.
 *
 * That is the entire argument of the site, enforced in the geometry rather
 * than asserted in the copy. Accounting did not get replaced; it got a new
 * medium, six times over.
 *
 * The paper is procedural. Its decomposition — long fibres, large-scale
 * crumple, linear folds, stains — follows the taxonomy used by dedicated
 * paper-shader work; the implementation here is written from that breakdown
 * rather than pulled in as a dependency, so it can be driven by era.
 */

export const LEAF_VERT = /* glsl */ `
precision highp float;

// six baked states, packed as three pairs so the attribute count stays sane
// ATTRIBUTE BUDGET. WebGL guarantees only 16 vertex attributes and this
// shader wants far more, so everything derivable is derived rather than
// uploaded: the shelf and cabinet rotations are scalings of the book's, the
// grid's is zero, and the final spine's is computed from its own position.
// Size, seed and row ride together in one vec4.
attribute vec3 aP0; // bound folio — the bahi-khata
attribute vec3 aP1; // shelved volumes
attribute vec3 aP2; // filed drawers
attribute vec3 aP3; // tabulated grid
attribute vec3 aP4; // the flood
attribute vec3 aP5; // understood
attribute vec3 aR0; // the book's own splay
attribute vec3 aR4; // the tumble of the flood
attribute vec4 aMeta; // xy = size, z = seed, w = row

uniform float uEra;     // 0..5, continuous
uniform float uTime;
uniform float uReduced;
uniform float uDissolve; // final beat — most of the record goes quiet

varying vec2 vUv;
varying float vSeed;
varying float vEra;
varying float vLit;
varying float vAlive;

mat3 rot(vec3 r){
  vec3 s = sin(r), c = cos(r);
  return mat3(c.y*c.z, -c.y*s.z, s.y,
              c.x*s.z + s.x*s.y*c.z, c.x*c.z - s.x*s.y*s.z, -s.x*c.y,
              s.x*s.z - c.x*s.y*c.z, s.x*c.z + c.x*s.y*s.z, c.x*c.y);
}

vec3 pickPos(int i){
  if (i <= 0) return aP0;
  if (i == 1) return aP1;
  if (i == 2) return aP2;
  if (i == 3) return aP3;
  if (i == 4) return aP4;
  return aP5;
}

vec3 pickRot(int i){
  if (i <= 0) return aR0;
  if (i == 1) return aR0 * 0.35;      // shelved: the same splay, straightened
  if (i == 2) return vec3(0.0);       // filed: squared to the drawer
  if (i == 3) return vec3(0.0);       // tabulated: squared to the grid
  if (i == 4) return aR4;             // the flood: tumbling
  // understood: each leaf faces the axis it stands on, derived from where it
  // stands rather than shipped as another attribute
  return vec3(0.0, -atan(aP5.z, aP5.x) + 1.5707963, 0.0);
}

void main(){
  vUv = uv;
  float aSeed = aMeta.z;
  float aRow = aMeta.w;
  vec2 aSize = aMeta.xy;
  vSeed = aSeed;
  vEra = uEra;

  // Which pair of states are we between, and how far. Each leaf lags its
  // neighbours slightly so the record re-forms as a wave rather than a cut.
  float lag = aSeed * 0.55;
  float e = clamp(uEra - lag * 0.34, 0.0, 5.0);
  int i0 = int(floor(e));
  int i1 = int(min(floor(e) + 1.0, 5.0));
  float k = fract(e);
  // ease-out so mass settles instead of arriving linearly
  k = 1.0 - pow(1.0 - k, 2.6);

  vec3 pos = mix(pickPos(i0), pickPos(i1), k);
  vec3 rr  = mix(pickRot(i0), pickRot(i1), k);

  // The page turn. Only leaves in the bound book do this, and only near the
  // start — a sheet in a filing cabinet does not turn like a folio.
  float bookish = 1.0 - smoothstep(0.0, 1.2, uEra);
  float turn = sin(uTime * 0.42 + aRow * 0.9) * 0.5 + 0.5;
  turn = smoothstep(0.72, 1.0, turn) * bookish * step(aRow, 5.0) * (1.0 - uReduced);
  rr.y += turn * 2.5;

  // drift — the flood is agitated, everything else is still
  float agitation = smoothstep(3.2, 4.4, uEra) * (1.0 - smoothstep(4.5, 5.0, uEra));
  vec3 drift = vec3(
    sin(uTime * 0.6 + aSeed * 40.0),
    cos(uTime * 0.5 + aSeed * 27.0),
    sin(uTime * 0.7 + aSeed * 61.0)
  ) * agitation * 0.9 * (1.0 - uReduced);

  // THE ENDING. Most of the record goes quiet — not deleted, just no longer
  // something a person has to hold. A minority stays lit as the structure.
  float keep = step(0.86, fract(aSeed * 7.31));
  vAlive = 1.0 - uDissolve * (1.0 - keep);
  pos = mix(pos, pos * vec3(0.34, 0.34, 0.2), uDissolve * (1.0 - keep));

  vec3 local = vec3(position.xy * aSize, 0.0);
  vec3 world = rot(rr) * local + pos + drift;

  // one warm key from upper left through the whole journey — the light is
  // the only thing that never changes direction
  vec3 n = rot(rr) * vec3(0.0, 0.0, 1.0);
  vLit = 0.42 + 0.58 * max(dot(n, normalize(vec3(-0.45, 0.8, 0.55))), 0.0);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(world, 1.0);
}
`;

export const LEAF_FRAG = /* glsl */ `
precision highp float;

uniform vec3 uPaper;   // the sheet, this era
uniform vec3 uInk;     // what is written on it
uniform vec3 uAccent;
uniform float uEra;
uniform float uDissolve;

varying vec2 vUv;
varying float vSeed;
varying float vEra;
varying float vLit;
varying float vAlive;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1,0)), f.x),
             mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x), f.y);
}

void main(){
  if (vAlive < 0.02) discard;

  vec2 uvp = vUv;
  vec2 d = abs(uvp - 0.5) * 2.0;

  // ── the sheet itself ──────────────────────────────────────────────────
  // Handmade paper is fibre, crumple, fold and stain. Each is a separate
  // noise at its own scale; together they read as material rather than as a
  // flat card. All of it flattens out as the era modernises, because a laser
  // print has no fibre and a screen has no tooth at all.
  float material = 1.0 - smoothstep(1.2, 3.4, uEra);

  float fibre   = vnoise(uvp * vec2(180.0, 9.0) + vSeed * 30.0) * 0.055;
  float crumple = vnoise(uvp * 6.0 + vSeed * 12.0) * 0.075;
  float fold    = smoothstep(0.42, 0.5, abs(fract(uvp.y * 2.0 + vSeed) - 0.5)) * 0.05;
  float stain   = smoothstep(0.55, 0.0, length(uvp - vec2(0.72, 0.26))) * 0.06
                * step(0.72, hash(vec2(vSeed, 3.1)));

  float tooth = (fibre + crumple - fold - stain) * material;

  // ── what is written on it ─────────────────────────────────────────────
  // Ruled lines, and marks that sit on them. In the early eras the marks are
  // irregular — a hand. Later they lock to a grid — a machine.
  float ruleY = fract(uvp.y * 11.0);
  float ruled = smoothstep(0.035, 0.0, abs(ruleY - 0.5)) * 0.22;

  float handish = 1.0 - smoothstep(1.6, 3.0, uEra);
  float jitter = (hash(vec2(floor(uvp.y * 11.0), vSeed)) - 0.5) * 0.14 * handish;
  float lineStart = 0.1;
  float lineEnd = 0.28 + hash(vec2(floor(uvp.y * 11.0) + 3.0, vSeed)) * 0.58;
  float mark = step(lineStart, uvp.x + jitter) * step(uvp.x, lineEnd)
             * smoothstep(0.16, 0.06, abs(ruleY - 0.55));
  // rows fill in over time — the book is being written as you watch
  mark *= step(fract(uvp.y * 11.0 + 0.5), 1.0)
        * step(uvp.y, clamp(uEra * 0.55 + 0.25, 0.0, 1.0) + hash(vec2(vSeed, 9.0)) * 0.4);

  vec3 col = uPaper * (1.0 + tooth) * vLit;
  col = mix(col, uInk, (ruled + mark * 0.72));

  // a red rule down the credit column — the one flash of the binding cloth
  float credit = smoothstep(0.008, 0.0, abs(uvp.x - 0.74)) * (1.0 - smoothstep(2.4, 3.6, uEra));
  col = mix(col, uAccent, credit * 0.6);

  // ── the edge ──────────────────────────────────────────────────────────
  // A deckle edge early on, cut clean once the sheet is machine-made.
  float deckle = (vnoise(uvp * vec2(60.0, 60.0) + vSeed * 5.0) - 0.5) * 0.045 * material;
  float edge = max(d.x, d.y) + deckle;
  if (edge > 0.99) discard;

  // the surviving structure at the end carries its own light
  float lit = mix(1.0, 1.5, uDissolve * step(0.86, fract(vSeed * 7.31)));

  // A raw ShaderMaterial bypasses three's output colour management, so the
  // linear values built above have to be display-encoded here or the whole
  // scene renders several stops too dark.
  gl_FragColor = vec4(pow(max(col * lit, vec3(0.0)), vec3(1.0 / 2.2)), 1.0);
}
`;

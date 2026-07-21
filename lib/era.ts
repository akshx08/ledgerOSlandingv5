/**
 * THE PALETTE IS A FUNCTION OF TIME.
 *
 * This is the whole design system, and it is one idea: the site does not have
 * a colour scheme, it has a *date*. Scroll position is a year, and every
 * surface colour is sampled from that year's materials.
 *
 * You begin in daylight on handmade paper — the warm, high-key world of a
 * bahi-khata on a wooden desk. As the record evolves through print, filing,
 * the spreadsheet and the network, the light drains out of the room and the
 * materials cool: paper becomes stock, stock becomes screen, screen becomes
 * substrate. By the end you are in a quiet dark, and the only warmth left is
 * the light the system itself is making.
 *
 * Nothing fades between these states. The colours interpolate continuously,
 * so there is never a moment where one palette ends and another begins —
 * which is precisely the brief's requirement that the visitor travels through
 * centuries without noticing where one era stops.
 *
 * Both endpoints were contrast-checked before being committed: every text
 * token clears 4.5:1 against its own era's ground.
 */

export type Oklch = [L: number, C: number, H: number];

export type EraPalette = {
  /** the room */
  ground: Oklch;
  /** raised surface — desk, shelf, plinth */
  surface: Oklch;
  /** primary type */
  fg: Oklch;
  /** secondary type */
  fgSoft: Oklch;
  /** tertiary type. Solved per era against that era's own ground so it
   *  always clears 4.5:1 — a travelling palette makes this the easiest
   *  token in the system to get quietly wrong. */
  fgFaint: Oklch;
  /** The accent of the age — binding cloth, then brass fittings, then the
   *  light the system makes. Solved to clear 4.5:1 against BOTH the ground
   *  and the raised surface of its era, because small accent text appears on
   *  each and only checking one of them is how this token gets missed. */
  accent: Oklch;
  /** rule / hairline */
  line: Oklch;
};

/**
 * Seven stops. The names are the materials, not the decades, because the
 * materials are what the visitor actually perceives.
 */
export const ERAS: { at: number; name: string; year: string; p: EraPalette }[] = [
  {
    at: 0,
    name: "Bahi-khata",
    year: "handwritten",
    p: {
      // full daylight on handmade paper
      ground: [0.905, 0.028, 82],
      surface: [0.86, 0.032, 74],
      fg: [0.282, 0.026, 64],
      fgSoft: [0.4, 0.026, 64],
      fgFaint: [0.462, 0.026, 64], 
      accent: [0.474, 0.16, 32], // vermilion binding cloth
      line: [0.72, 0.026, 70],
    },
  },
  {
    at: 0.17,
    name: "Press",
    year: "printed",
    p: {
      ground: [0.84, 0.02, 84],
      surface: [0.795, 0.022, 78],
      fg: [0.204, 0.02, 72],
      fgSoft: [0.348, 0.02, 72],
      fgFaint: [0.411, 0.02, 72], 
      accent: [0.42, 0.13, 40],
      line: [0.68, 0.018, 76],
    },
  },
  {
    at: 0.34,
    name: "Cabinet",
    year: "filed",
    p: {
      ground: [0.71, 0.014, 88],
      surface: [0.665, 0.015, 84],
      fg: [0.06, 0.014, 78],
      fgSoft: [0.202, 0.014, 78],
      fgFaint: [0.290, 0.014, 78], 
      accent: [0.29, 0.075, 62], // brass fittings
      line: [0.56, 0.012, 82],
    },
  },
  {
    at: 0.5,
    name: "Sheet",
    year: "tabulated",
    p: {
      ground: [0.36, 0.009, 96],
      surface: [0.405, 0.01, 94],
      fg: [0.96, 0.011, 90],
      fgSoft: [0.856, 0.011, 90],
      fgFaint: [0.788, 0.011, 90], 
      accent: [0.796, 0.1, 78],
      line: [0.4, 0.008, 96],
    },
  },
  {
    at: 0.67,
    name: "Network",
    year: "scattered",
    p: {
      ground: [0.3, 0.008, 100],
      surface: [0.345, 0.008, 98],
      fg: [0.928, 0.012, 88],
      fgSoft: [0.788, 0.012, 88],
      fgFaint: [0.719, 0.012, 88], 
      accent: [0.73, 0.12, 66],
      line: [0.36, 0.008, 100],
    },
  },
  {
    at: 0.84,
    name: "Flood",
    year: "unreadable",
    p: {
      // the coldest, tightest point of the whole journey — the only place the
      // warmth genuinely leaves, because this is the part that is wrong
      ground: [0.19, 0.007, 250],
      surface: [0.235, 0.007, 250],
      fg: [0.9, 0.008, 250],
      fgSoft: [0.704, 0.008, 250],
      fgFaint: [0.623, 0.008, 250], 
      accent: [0.64, 0.13, 40],
      line: [0.28, 0.007, 250],
    },
  },
  {
    at: 1,
    name: "LedgerOS",
    year: "understood",
    p: {
      // warmth returns, but as light the system is making rather than
      // daylight it was given
      ground: [0.16, 0.012, 70],
      surface: [0.205, 0.013, 72],
      fg: [0.91, 0.018, 76],
      fgSoft: [0.69, 0.018, 76],
      fgFaint: [0.605, 0.018, 76], 
      accent: [0.612, 0.1, 82], // lit brass
      line: [0.3, 0.014, 74],
    },
  },
];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** hues interpolate the short way round, or a warm→cool move detours through green */
function lerpHue(a: number, b: number, t: number) {
  let d = b - a;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return a + d * t;
}

function lerpOklch(a: Oklch, b: Oklch, t: number): Oklch {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerpHue(a[2], b[2], t)];
}

export const css = (c: Oklch) => `oklch(${c[0].toFixed(4)} ${c[1].toFixed(4)} ${c[2].toFixed(2)})`;

/**
 * THE LIGHTS-OUT BAND.
 *
 * Cabinet → Sheet is where the world inverts: the ground goes from paper to
 * screen and the ink goes from dark to light. There is no way to cross that
 * continuously and stay readable — no ground lightness exists where both a
 * dark and a light foreground clear 4.5:1, so any interpolation between them
 * passes through a point where the type is exactly the colour of the page.
 *
 * So the crossing is not spread out; it is spent. This steepens that one
 * segment into a narrow band around t ≈ 0.42 — the room changes its light in
 * a moment rather than over a third of the scroll — and the journey hides its
 * copy for exactly that band (see INVERSION below, used by the home page).
 * The camera and the geometry never stop moving, so the shot is still
 * continuous; only the lighting is sudden, which is what happens in a room
 * when someone reaches for the switch.
 */
const INVERT_SEGMENT = 2; // Cabinet → Sheet
const INVERT_STEEP = 6;

/** the scroll window the inversion occupies, for anything that must stand clear of it */
export const INVERSION = { from: 0.401, to: 0.44 };

/**
 * 1 everywhere the palette can carry type, 0 inside the lights-out band.
 * Published as `--legible` so permanent furniture — the running head, the
 * standing waitlist request, the folio number — steps aside for the crossing
 * without needing to know anything about scroll.
 */
export function legibleAt(t: number) {
  const ramp = 0.012;
  const inBand = Math.max(
    0,
    Math.min(1, Math.min((t - INVERSION.from) / ramp, (INVERSION.to - t) / ramp))
  );
  return 1 - inBand;
}

/** the palette at any moment in the journey */
export function paletteAt(t: number): EraPalette {
  const p = Math.max(0, Math.min(1, t));
  let i = 0;
  while (i < ERAS.length - 2 && p > ERAS[i + 1].at) i++;
  const a = ERAS[i];
  const b = ERAS[i + 1];
  const span = b.at - a.at;
  const k = span > 0 ? (p - a.at) / span : 0;
  let e = Math.max(0, Math.min(1, k));
  if (i === INVERT_SEGMENT) e = Math.max(0, Math.min(1, (e - 0.5) * INVERT_STEEP + 0.5));
  return {
    ground: lerpOklch(a.p.ground, b.p.ground, e),
    surface: lerpOklch(a.p.surface, b.p.surface, e),
    fg: lerpOklch(a.p.fg, b.p.fg, e),
    fgSoft: lerpOklch(a.p.fgSoft, b.p.fgSoft, e),
    fgFaint: lerpOklch(a.p.fgFaint, b.p.fgFaint, e),
    accent: lerpOklch(a.p.accent, b.p.accent, e),
    line: lerpOklch(a.p.line, b.p.line, e),
  };
}

/** which era name is showing, for the instrument readout */
export function eraAt(t: number) {
  const p = Math.max(0, Math.min(1, t));
  let i = 0;
  while (i < ERAS.length - 1 && p >= ERAS[i + 1].at - 0.001) i++;
  // The inversion is spent early in its segment, so by the time the visitor is
  // out of the lights-out band the room is already the next era. The running
  // head has to change when the light does, not at the nominal stop, or it
  // spends a third of the scroll naming a world that is no longer on screen.
  if (i === INVERT_SEGMENT && p >= (INVERSION.from + INVERSION.to) / 2) i++;
  return ERAS[i];
}

/** write the palette onto the document — one place, so nothing can drift */
export function applyPalette(t: number) {
  const p = paletteAt(t);
  const r = document.documentElement.style;
  r.setProperty("--ground", css(p.ground));
  r.setProperty("--surface", css(p.surface));
  r.setProperty("--fg", css(p.fg));
  r.setProperty("--fg-soft", css(p.fgSoft));
  r.setProperty("--fg-faint", css(p.fgFaint));
  r.setProperty("--accent", css(p.accent));
  r.setProperty("--line", css(p.line));
  r.setProperty("--legible", legibleAt(t).toFixed(3));
  return p;
}

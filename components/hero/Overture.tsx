"use client";

/**
 * OVERTURE — six centuries in a second and a half.
 *
 * The record has been kept in six materials, and each one solved the last
 * one's problem while creating a worse one. Rather than argue that, the site
 * shows it: six hard cuts, ~200ms each, no morphing and no easing between
 * them. Bahi-khata, press, cabinet, sheet, network, flood.
 *
 * Every cut slams the WHOLE document to that era's palette — not just this
 * overlay. The nav marks, the ground, the type: the entire page flashes
 * through the centuries and lands in the present. lib/era.ts already knows
 * what each moment looked like; this uses it as a cut list rather than as a
 * continuous journey.
 *
 * Driven by setTimeout, not requestAnimationFrame. These are discrete states,
 * not an animation — there is nothing to interpolate between frames, and a
 * timer keeps the cadence honest in a tab whose animation clock is throttled.
 */

import { useEffect, useState } from "react";
import { ERAS, applyPalette, css } from "@/lib/era";

/** ms each era is held. The last is held longer — it is the one that hurts. */
const HOLD = [200, 200, 200, 200, 200, 340];

export type OvertureProps = {
  /** fires once the last cut has been held and the page belongs to LedgerOS */
  onDone: () => void;
};

/* ── the marks ──────────────────────────────────────────────────────────
   One graphic per era, built from the plainest primitives that could stand
   for it. They are not illustrations of documents; they are the shape each
   material forced the record into. */

function Mark({ era, fg, accent }: { era: number; fg: string; accent: string }) {
  const common = {
    viewBox: "0 0 200 120",
    preserveAspectRatio: "xMidYMid slice",
    className: "absolute inset-0 h-full w-full",
  } as const;

  if (era === 0) {
    // bahi-khata — hand-ruled, bound, one margin, a red thread
    return (
      <svg {...common} aria-hidden>
        {Array.from({ length: 11 }, (_, i) => (
          <path
            key={i}
            d={`M34 ${18 + i * 8.4} Q 118 ${17.4 + i * 8.4} 178 ${18.5 + i * 8.4}`}
            stroke={fg}
            strokeWidth="0.7"
            fill="none"
            opacity="0.5"
          />
        ))}
        <line x1="46" y1="10" x2="46" y2="112" stroke={fg} strokeWidth="0.7" opacity="0.75" />
        <line x1="26" y1="6" x2="26" y2="116" stroke={accent} strokeWidth="2.6" />
      </svg>
    );
  }
  if (era === 1) {
    // press — set type, justified, identical every copy
    return (
      <svg {...common} aria-hidden>
        {Array.from({ length: 22 }, (_, i) => {
          const col = i % 2;
          const row = Math.floor(i / 2);
          return (
            <rect
              key={i}
              x={20 + col * 88}
              y={14 + row * 8.6}
              width={row === 10 ? 52 : 74}
              height="3.4"
              fill={fg}
              opacity="0.62"
            />
          );
        })}
      </svg>
    );
  }
  if (era === 2) {
    // cabinet — drawers. findable, in principle, by someone who knows where
    return (
      <svg {...common} aria-hidden>
        {Array.from({ length: 5 }, (_, r) =>
          Array.from({ length: 4 }, (_, c) => (
            <g key={`${r}-${c}`}>
              <rect
                x={12 + c * 46}
                y={10 + r * 21}
                width="42"
                height="17"
                fill="none"
                stroke={fg}
                strokeWidth="0.8"
                opacity="0.55"
              />
              <rect x={27 + c * 46} y={17 + r * 21} width="12" height="2" fill={accent} />
            </g>
          ))
        )}
      </svg>
    );
  }
  if (era === 3) {
    // sheet — the grid arrives and never leaves
    return (
      <svg {...common} aria-hidden>
        {Array.from({ length: 15 }, (_, i) => (
          <line
            key={`v${i}`}
            x1={i * 14.5}
            y1="0"
            x2={i * 14.5}
            y2="120"
            stroke={fg}
            strokeWidth="0.5"
            opacity="0.4"
          />
        ))}
        {Array.from({ length: 13 }, (_, i) => (
          <line
            key={`h${i}`}
            x1="0"
            y1={i * 10}
            x2="200"
            y2={i * 10}
            stroke={fg}
            strokeWidth="0.5"
            opacity="0.4"
          />
        ))}
        <rect x="43.5" y="40" width="14.5" height="10" fill={accent} opacity="0.85" />
      </svg>
    );
  }
  if (era === 4) {
    // network — everywhere at once, and nothing knows about anything else
    const nodes = [
      [30, 24], [92, 16], [158, 30], [22, 66], [74, 58], [128, 72],
      [178, 62], [46, 100], [110, 104], [166, 96],
    ];
    return (
      <svg {...common} aria-hidden>
        {nodes.map(([x1, y1], i) =>
          nodes.slice(i + 1).map(([x2, y2], j) =>
            Math.hypot(x2 - x1, y2 - y1) < 62 ? (
              <line
                key={`${i}-${j}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={fg}
                strokeWidth="0.5"
                opacity="0.34"
              />
            ) : null
          )
        )}
        {nodes.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="3" fill={i === 4 ? accent : fg} opacity="0.9" />
        ))}
      </svg>
    );
  }
  // flood — too much of it, at every angle, none of it readable
  return (
    <svg {...common} aria-hidden>
      {Array.from({ length: 46 }, (_, i) => {
        const a = (i * 2.399) % 6.283;
        const x = 100 + Math.cos(a) * (14 + ((i * 37) % 78));
        const y = 60 + Math.sin(a * 1.7) * (10 + ((i * 23) % 48));
        return (
          <rect
            key={i}
            x={x - 15}
            y={y - 10}
            width="30"
            height="20"
            fill="none"
            stroke={i % 9 === 0 ? accent : fg}
            strokeWidth="0.6"
            opacity="0.42"
            transform={`rotate(${((i * 47) % 90) - 45} ${x} ${y})`}
          />
        );
      })}
    </svg>
  );
}

export default function Overture({ onDone }: OvertureProps) {
  // `?flash=3` freezes the montage on one cut. The tuning surface, and the way
  // to photograph a 200ms frame.
  const [step, setStep] = useState(() => {
    if (typeof window === "undefined") return 0;
    const pin = new URLSearchParams(window.location.search).get("flash");
    return pin === null ? 0 : Math.max(0, Math.min(HOLD.length - 1, parseInt(pin, 10) || 0));
  });
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const pinned = q.get("flash") !== null;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // A montage of hard cuts is the one thing reduced-motion genuinely must
    // not see — six full-screen flashes in a second is exactly the pattern the
    // preference exists to suppress. Skip straight to the present.
    if (reduced && !pinned) {
      applyPalette(1);
      setGone(true);
      onDone();
      return;
    }

    applyPalette(ERAS[step].at);
    if (pinned) return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    let at = 0;
    HOLD.forEach((ms, i) => {
      at += ms;
      if (i === HOLD.length - 1) return;
      timers.push(
        setTimeout(() => {
          setStep(i + 1);
          applyPalette(ERAS[i + 1].at);
        }, at)
      );
    });
    timers.push(
      setTimeout(() => {
        applyPalette(1);
        setGone(true);
        onDone();
      }, at)
    );
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (gone) return null;

  const era = ERAS[step];
  const fg = css(era.p.fg);
  const accent = css(era.p.accent);

  return (
    <div
      className="fixed inset-0 z-[70] overflow-hidden"
      style={{ background: css(era.p.ground) }}
      aria-hidden
    >
      <div className="absolute inset-0 opacity-[0.9]">
        <Mark era={step} fg={fg} accent={accent} />
      </div>
      {/* the ground bleeds back in under the caption so it never sits on the mark */}
      <div
        className="absolute inset-x-0 bottom-0 h-40"
        style={{
          background: `linear-gradient(to top, ${css(era.p.ground)} 32%, transparent 100%)`,
        }}
      />
      <div className="absolute bottom-8 left-5 md:bottom-12 md:left-10">
        <span
          className="folio block text-[clamp(1.7rem,4vw,3rem)]"
          style={{ color: fg }}
        >
          {era.name}
        </span>
        <span className="margin mt-2 block" style={{ color: accent }}>
          {era.year}
        </span>
      </div>
    </div>
  );
}

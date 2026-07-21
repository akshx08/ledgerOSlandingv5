"use client";

/**
 * The Long Ledger.
 *
 * One continuous move through six forms of the record. Scroll is time: it
 * drives the camera, the arrangement of every sheet, and the palette of the
 * entire document simultaneously, so there is never a moment where the page
 * changes and the world does not.
 *
 * No claim is made during the journey. The beats are a clerk's marginal
 * notes, not marketing, and the headline is withheld until the visitor has
 * already watched the whole history happen.
 */

import Link from "next/link";
import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { applyPalette, eraAt, INVERSION } from "@/lib/era";
import { ARRIVAL, CTA, ENDING, JOURNEY, PROBLEM, TURN, VAULTS } from "@/lib/site";

const LongLedger = dynamic(() => import("@/components/era/LongLedger"), { ssr: false });

const clamp = (v: number, a = 0, b = 1) => (v < a ? a : v > b ? b : v);

export default function Home() {
  const progressRef = useRef(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const beatRefs = useRef<(HTMLDivElement | null)[]>([]);
  const arriveRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const eraRef = useRef<HTMLSpanElement>(null);
  const yearRef = useRef<HTMLSpanElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const readoutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // `?t=0.62` pins the journey and skips the scroll listener — the tuning
    // surface, and the way to capture a beat where scrolled screenshots come
    // back black.
    const pinned = new URLSearchParams(window.location.search).get("t");

    const paint = () => {
      const p = progressRef.current;
      document.documentElement.dataset.t = p.toFixed(3);

      // THE PALETTE IS THE PAGE. One call moves every surface colour in the
      // document to the materials of this exact moment in the record's
      // history, so DOM and canvas are never in different centuries.
      applyPalette(p);

      const era = eraAt(p);
      if (eraRef.current) eraRef.current.textContent = era.name;
      if (yearRef.current) yearRef.current.textContent = era.year;

      // THE LIGHTS-OUT BAND. Crossing from a paper world to a screen world
      // means the ground and the ink swap ends, and for a moment in the middle
      // they are the same colour — that is arithmetic, not a bug that can be
      // tuned away. lib/era.ts spends that crossing as fast as it can; this
      // takes every word off the page for exactly as long as it lasts, so
      // there is never type sitting at 1:1. The camera and the sheets keep
      // moving throughout, so the shot itself never breaks.
      const ramp = 0.012;
      const dark = clamp(Math.min((p - INVERSION.from) / ramp, (INVERSION.to - p) / ramp));
      const legible = 1 - dark;

      // one marginal note at a time, handed off as the camera passes
      JOURNEY.forEach((b, i) => {
        const el = beatRefs.current[i];
        if (!el) return;
        el.style.opacity = String(clamp(1 - Math.abs(p - b.at) / 0.1) * legible);
      });

      const a = clamp((p - 0.9) / 0.1);
      // the running head hands over to the headline rather than sitting
      // underneath it — one voice at a time
      if (readoutRef.current) readoutRef.current.style.opacity = String((1 - a) * legible);
      if (arriveRef.current) {
        arriveRef.current.style.opacity = String(a);
        arriveRef.current.style.transform = `translate3d(0, ${(1 - a) * 22}px, 0)`;
        arriveRef.current.style.pointerEvents = a > 0.6 ? "auto" : "none";
      }
      // the marginal notes step aside for the arrival too
      if (a > 0) {
        JOURNEY.forEach((_, i) => {
          const el = beatRefs.current[i];
          if (el) el.style.opacity = String(Number(el.style.opacity) * (1 - a));
        });
      }
      if (cueRef.current) cueRef.current.style.opacity = String(clamp(1 - p / 0.06) * legible);
      if (scrimRef.current) {
        // rises with the clutter of the middle eras, eases off once the
        // record resolves and the world is calm enough to read against
        const busy = clamp((p - 0.42) / 0.3) * clamp((1.06 - p) / 0.14);
        scrimRef.current.style.opacity = String(busy * 0.88);
      }
    };

    if (pinned !== null) {
      progressRef.current = clamp(parseFloat(pinned) || 0);
      paint();
      return;
    }

    let raf = 0;
    const read = () => {
      raf = 0;
      const track = trackRef.current;
      if (!track) return;
      const h = track.offsetHeight - window.innerHeight;
      progressRef.current = h > 0 ? clamp(window.scrollY / h) : 0;
      paint();
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <>
      <LongLedger progressRef={progressRef} />

      <main className="relative z-10">
        {/* ── the journey ── */}
        <div ref={trackRef} className="relative h-[620vh]">
          <div className="sticky top-0 h-screen">
            {/* The copy has to survive the flood. This lifts the ground under
                the text columns only, and only as far as the era is busy —
                zero in the calm daylight of the opening, strongest at the
                moment the record becomes unreadable. */}
            <div
              ref={scrimRef}
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                opacity: 0,
                background:
                  "radial-gradient(60% 42% at 6% 30%, var(--ground) 0%, transparent 72%)," +
                  "radial-gradient(52% 30% at 6% 88%, var(--ground) 0%, transparent 74%)",
              }}
            />
            {/* the era readout — a running head that changes with the century */}
            <div ref={readoutRef} className="absolute left-5 top-[26vh] md:left-10 md:top-[24vh]">
              <span ref={eraRef} className="folio block text-[clamp(1.6rem,3.4vw,2.6rem)]">
                Bahi-khata
              </span>
              <span ref={yearRef} className="margin mt-2 block text-fg-faint">
                handwritten
              </span>
            </div>

            {/* the marginal notes */}
            <div className="absolute bottom-28 left-5 h-28 w-[min(24rem,calc(100vw-2.5rem))] md:bottom-20 md:left-10">
              {JOURNEY.map((b, i) => (
                <div
                  key={b.era}
                  ref={(el) => {
                    beatRefs.current[i] = el;
                  }}
                  className="absolute bottom-0 left-0 w-full"
                  style={{ opacity: i === 0 ? 1 : 0 }}
                >
                  <p className="text-[14.5px] leading-relaxed text-fg-soft">{b.note}</p>
                </div>
              ))}
            </div>

            <div
              ref={cueRef}
              className="margin absolute bottom-8 left-1/2 -translate-x-1/2 text-fg-faint md:bottom-10"
            >
              {ARRIVAL.cue}
            </div>

            {/* ── arrival ── */}
            <div
              ref={arriveRef}
              className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-5 md:px-10"
              style={{ opacity: 0 }}
            >
              <h1 className="folio max-w-[17ch] text-[clamp(2.3rem,6.4vw,5rem)]">
                {ARRIVAL.head.map((l) => (
                  <span key={l} className="block">
                    {l}
                  </span>
                ))}
              </h1>
              <p className="mt-8 max-w-lg text-[15px] leading-relaxed text-fg-soft md:text-base">
                {ARRIVAL.sub}
              </p>
              <Link
                href={CTA.href}
                className="margin group mt-10 inline-flex min-h-11 items-center gap-3 border-b-2 border-accent pb-2 text-accent"
              >
                {CTA.label}
                <span className="transition-transform duration-500 ease-[var(--ease-settle)] group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* ── the problem ── */}
        <section className="relative border-t rule bg-ground px-5 py-[14vh] md:px-10">
          <h2 className="folio max-w-[12ch] text-[clamp(2rem,5vw,3.6rem)]">{PROBLEM.head}</h2>
          <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-fg-soft">{PROBLEM.body}</p>
          <ul className="mt-14 flex flex-wrap gap-x-8 gap-y-4">
            {PROBLEM.places.map((s, i) => (
              <li
                key={s}
                className="folio-sm text-[clamp(1.1rem,2.6vw,1.9rem)] text-fg-faint"
                style={{ transform: `translateY(${(i % 4) * 6}px)` }}
              >
                {s}
              </li>
            ))}
          </ul>
          <p className="mt-14 max-w-lg border-l-2 border-accent pl-5 text-[14.5px] leading-relaxed text-fg-soft">
            {PROBLEM.note}
          </p>
        </section>

        {/* ── the turn ── */}
        <section className="relative border-t rule bg-ground px-5 py-[14vh] md:px-10">
          <h2 className="folio max-w-[14ch] text-[clamp(2rem,5vw,3.6rem)]">
            {TURN.head.map((l) => (
              <span key={l} className="block">
                {l}
              </span>
            ))}
          </h2>
          <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-fg-soft">{TURN.body}</p>
          <dl className="mt-16 border-t rule">
            {TURN.steps.map((s) => (
              <div
                key={s.k}
                className="grid gap-2 border-b rule py-7 md:grid-cols-12 md:gap-8 md:py-9"
              >
                <dt className="folio-sm text-[clamp(1.2rem,2.6vw,1.8rem)] text-accent md:col-span-3">
                  {s.k}
                </dt>
                <dd className="max-w-xl text-[14.5px] leading-relaxed text-fg-soft md:col-span-8">
                  {s.v}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ── the rooms ── */}
        <section className="relative bg-ground px-5 py-[12vh] md:px-10">
          <h2 className="folio max-w-[12ch] text-[clamp(2rem,5vw,3.6rem)]">{VAULTS.head}</h2>
          <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-fg-soft">{VAULTS.body}</p>

          <ul className="mt-16 border-t rule">
            {VAULTS.items.map((v, i) => (
              <li key={v.href}>
                <Link
                  href={v.href}
                  className="group grid items-baseline gap-2 border-b rule py-7 md:grid-cols-12 md:gap-8 md:py-9"
                >
                  <span className="margin text-fg-faint md:col-span-1">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="folio text-[clamp(1.8rem,4.4vw,3.2rem)] transition-transform duration-700 ease-[var(--ease-settle)] group-hover:translate-x-2 md:col-span-4">
                    {v.label}
                  </h3>
                  <div className="md:col-span-6">
                    <span className="margin text-accent">{v.tag}</span>
                    <p className="mt-2 max-w-md text-[14.5px] leading-relaxed text-fg-soft">
                      {v.body}
                    </p>
                  </div>
                  <span className="margin text-fg-faint group-hover:text-accent md:col-span-1 md:text-right">
                    Enter
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* ── the ending ── */}
        <section className="relative border-t rule bg-ground px-5 py-[20vh] md:px-10">
          <h2 className="folio max-w-[14ch] text-[clamp(2.2rem,6vw,4.4rem)]">
            {ENDING.head.map((l) => (
              <span key={l} className="block">
                {l}
              </span>
            ))}
          </h2>
          <p className="mt-8 max-w-lg text-[15px] leading-relaxed text-fg-soft md:text-base">
            {ENDING.body}
          </p>
          <p className="margin mt-16 text-fg-faint">{ENDING.quiet}</p>
          <Link
            href={CTA.href}
            className="margin group mt-8 inline-flex min-h-11 items-center gap-3 border-b-2 border-accent pb-2 text-accent"
          >
            {CTA.label}
            <span className="transition-transform duration-500 ease-[var(--ease-settle)] group-hover:translate-x-1">
              →
            </span>
          </Link>
        </section>
      </main>
    </>
  );
}

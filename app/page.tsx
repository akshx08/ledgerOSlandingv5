"use client";

/**
 * Home.
 *
 * Two acts, about two seconds apart.
 *
 * First the overture: six hard cuts through the materials the record has been
 * kept in, each one slamming the whole document to that century's palette.
 * Then it lands in the present and the room it lands in is the Atrium — a
 * kolam on the floor with the surfaces LedgerOS actually produces hanging
 * above it, each tethered down to the one unbroken line.
 *
 * Neither act is attached to scroll. You are not operating this. Everything
 * below the fold is argument, and argument sits still.
 */

import Link from "next/link";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { CTA, ENDING, HERO, PROBLEM, TURN, VAULTS } from "@/lib/site";

const Overture = dynamic(() => import("@/components/hero/Overture"), { ssr: false });
const Atrium = dynamic(() => import("@/components/hero/Atrium"), { ssr: false });

export default function Home() {
  const [arrived, setArrived] = useState(false);

  // the page must not scroll while the centuries are going past
  useEffect(() => {
    if (arrived) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, [arrived]);

  return (
    <main className="relative z-10">
      <Overture onDone={() => setArrived(true)} />

      {/* ── the atrium ── */}
      <section className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden px-5 pb-[14vh] pt-28 md:justify-center md:px-10 md:pb-0 md:pt-0">
        <Atrium className="pointer-events-none absolute inset-0" active={arrived} />

        {/* The kolam is laid on the floor of the room, and the floor runs the
            whole width of it. This lifts the ground back up under the words
            only, so the copy is never read against the weave. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(64% 58% at 0% 50%, var(--ground) 0%, var(--ground) 44%, transparent 82%)",
          }}
        />

        {/* Opacity is binary and never transitioned. A transition that is
            interrupted before its first frame never advances, so a throttled
            tab strands the property at its start value — and stranding THIS
            one hides the entire headline while the inline style cheerfully
            reads opacity: 1. Only the lift is animated; if that freezes, the
            words are 14px low and perfectly legible. */}
        <div
          className="relative z-10 max-w-[34rem] transition-transform duration-[1100ms] ease-[var(--ease-settle)]"
          style={{
            opacity: arrived ? 1 : 0,
            transform: arrived ? "none" : "translate3d(0, 14px, 0)",
            transitionDelay: arrived ? "260ms" : "0ms",
          }}
        >
          <h1 className="folio text-[clamp(2.4rem,6.2vw,4.8rem)]">
            {HERO.head.map((l) => (
              <span key={l} className="block">
                {l}
              </span>
            ))}
          </h1>
          <p className="mt-8 max-w-md text-[15px] leading-relaxed text-fg-soft md:text-base">
            {HERO.sub}
          </p>
          <p className="entry mt-6 max-w-md text-fg-faint">{HERO.note}</p>
          <Link
            href={CTA.href}
            className="margin group mt-10 inline-flex min-h-11 items-center gap-3 border-b-2 border-accent pb-2 text-accent"
          >
            {CTA.label}
            <span className="duration-500 ease-[var(--ease-settle)] transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </section>

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
  );
}

"use client";

/**
 * Home.
 *
 * The hero is a kolam being drawn — see components/hero/Kolam.tsx for why
 * that is the right first image for this company. It takes one screen and
 * about eight seconds, and it is not attached to scroll: you are not
 * operating it, you are watching someone finish something.
 *
 * The page holds a single moment of the record's history rather than
 * travelling through one. Everything below the fold is argument, and argument
 * should sit still.
 */

import Link from "next/link";
import { useEffect } from "react";
import dynamic from "next/dynamic";
import { applyPalette } from "@/lib/era";
import { CTA, ENDING, HERO, PROBLEM, TURN, VAULTS } from "@/lib/site";

const Kolam = dynamic(() => import("@/components/hero/Kolam"), { ssr: false });

export default function Home() {
  // the hour before the household wakes, and the light the system makes
  useEffect(() => {
    applyPalette(1);
  }, []);

  return (
    <main className="relative z-10">
      {/* ── the threshold ── */}
      <section className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden px-5 pb-[14vh] pt-28 md:justify-center md:px-10 md:pb-0 md:pt-0">
        <Kolam className="pointer-events-none absolute inset-0" />

        <div className="relative z-10 max-w-[34rem]">
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

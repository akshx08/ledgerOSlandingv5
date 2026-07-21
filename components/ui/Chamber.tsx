"use client";

/**
 * Chamber — the shell each room shares, and the thing that keeps the world
 * continuous when you leave the journey.
 *
 * The hero establishes that scroll is time and the palette is a date. If the
 * rooms reverted to a fixed scheme, arriving in one would feel like closing
 * the film and opening a brochure. So each chamber declares the moment in the
 * record's history it belongs to, and holds the whole document there — the
 * Document room sits in the era of paper, Prediction sits past the end of the
 * story. You are still inside the same continuous world; you have just
 * stopped walking.
 */

import Link from "next/link";
import { useEffect } from "react";
import { applyPalette } from "@/lib/era";
import { CTA, ROUTE } from "@/lib/site";

export default function Chamber({
  /** where in the record's history this room stands, 0 → 1 */
  when,
  index,
  label,
  head,
  body,
  interaction,
  note,
  real,
  children,
}: {
  when: number;
  index: number;
  label: string;
  head: string[];
  body: string;
  interaction: string;
  note: string;
  real?: string | null;
  children: React.ReactNode;
}) {
  useEffect(() => {
    applyPalette(when);
  }, [when]);

  const next = ROUTE[index + 1];
  const prev = ROUTE[index - 1];

  return (
    <main className="relative z-10 min-h-screen bg-ground">
      <header className="px-5 pb-14 pt-28 md:px-10 md:pb-20 md:pt-32">
        <div className="flex items-baseline gap-4">
          <span className="margin text-accent">{String(index).padStart(2, "0")}</span>
          <span className="margin text-fg-faint">{label}</span>
        </div>
        <h1 className="folio mt-7 max-w-[16ch] text-[clamp(2.2rem,6vw,4.4rem)]">
          {head.map((l) => (
            <span key={l} className="block">
              {l}
            </span>
          ))}
        </h1>
        <p className="mt-7 max-w-xl text-[15px] leading-relaxed text-fg-soft md:text-base">
          {body}
        </p>
        <p className="margin mt-8 text-accent">{interaction}</p>
      </header>

      <section className="px-5 md:px-10">{children}</section>

      <footer className="px-5 pb-32 pt-20 md:px-10">
        <p className="max-w-xl border-l-2 rule pl-6 text-[14.5px] leading-relaxed text-fg-soft">
          {note}
        </p>
        {real && <p className="entry mt-6 pl-6 text-fg-faint">Shipping today — {real}</p>}

        <nav className="mt-20 flex flex-wrap items-baseline justify-between gap-6 border-t rule pt-8">
          <Link
            href={prev ? prev.href : "/"}
            className="margin -my-3 inline-flex min-h-11 items-center text-fg-faint hover:text-fg"
          >
            ← {prev ? prev.label : "The Long Ledger"}
          </Link>
          {next ? (
            <Link href={next.href} className="group text-right">
              <span className="margin block text-fg-faint">Next</span>
              <span className="folio mt-2 block text-[clamp(1.5rem,3.6vw,2.4rem)] transition-transform duration-700 ease-[var(--ease-settle)] group-hover:-translate-x-2">
                {next.label} →
              </span>
            </Link>
          ) : (
            <Link href={CTA.href} className="group text-right">
              <span className="margin block text-accent">{CTA.label}</span>
              <span className="folio mt-2 block text-[clamp(1.5rem,3.6vw,2.4rem)] transition-transform duration-700 ease-[var(--ease-settle)] group-hover:-translate-x-2">
                Bring us a practice →
              </span>
            </Link>
          )}
        </nav>
      </footer>
    </main>
  );
}

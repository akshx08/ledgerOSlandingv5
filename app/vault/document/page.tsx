"use client";

/**
 * Document — where paper becomes structure.
 *
 * The room stands in the era of paper, so the whole document holds there: you
 * have walked back to the part of the story where the record was still
 * something you could hold. Selecting a field lights the exact region of the
 * page it was read from, because a field you cannot trace is a field you
 * cannot trust — and the lowest-confidence reading is selected on arrival,
 * since a system leading with its own weakest work is a stronger claim than
 * any accuracy figure.
 */

import { useState } from "react";
import Chamber from "@/components/ui/Chamber";
import World from "@/components/world/World";
import { DOCUMENT } from "@/lib/site";

const REGIONS: Record<string, { x: number; y: number; w: number; h: number }> = {
  "Document type": { x: 8, y: 7, w: 46, h: 7 },
  Counterparty: { x: 8, y: 22, w: 54, h: 6 },
  GSTIN: { x: 8, y: 30, w: 40, h: 5 },
  "Amount in dispute": { x: 50, y: 55, w: 42, h: 8 },
  "Reply due": { x: 8, y: 76, w: 38, h: 6 },
  Period: { x: 8, y: 45, w: 32, h: 5 },
};

export default function DocumentRoom() {
  const weakest = DOCUMENT.doc.fields.reduce((a, b) => (a.c <= b.c ? a : b));
  const [active, setActive] = useState(weakest.k);
  const region = REGIONS[active];

  return (
    <Chamber
      when={0.06}
      index={1}
      label={DOCUMENT.label}
      head={DOCUMENT.head}
      body={DOCUMENT.body}
      interaction={DOCUMENT.interaction}
      note={DOCUMENT.note}
      real="Document inbox, upload, field extraction"
    >
      <World kind="archive" when={0.06} className="mb-14 h-[46vh] w-full min-h-[20rem]" />
      <div className="grid gap-10 md:grid-cols-12 md:gap-14">
        <div className="md:col-span-5">
          <div className="relative aspect-[1/1.36] w-full border rule bg-surface">
            <div className="absolute inset-0 overflow-hidden p-[7%]">
              {Array.from({ length: 26 }).map((_, i) => (
                <div
                  key={i}
                  className="mb-[3.1%] h-[1.1%] bg-fg/12"
                  style={{ width: `${28 + ((i * 37) % 62)}%` }}
                />
              ))}
            </div>
            {region && (
              <div
                className="absolute border-2 border-accent transition-all duration-500 ease-[var(--ease-settle)]"
                style={{
                  left: `${region.x}%`,
                  top: `${region.y}%`,
                  width: `${region.w}%`,
                  height: `${region.h}%`,
                }}
              >
                <span className="entry absolute -top-6 left-0 whitespace-nowrap text-accent">
                  read here
                </span>
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 flex items-baseline justify-between border-t rule px-4 py-3">
              <span className="margin text-fg-soft">{DOCUMENT.doc.form}</span>
              <span className="entry text-fg-soft">{DOCUMENT.doc.from}</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-7">
          <ul className="border-t rule">
            {DOCUMENT.doc.fields.map((f) => {
              const on = f.k === active;
              const low = f.c < 0.85;
              return (
                <li key={f.k}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(f.k)}
                    onFocus={() => setActive(f.k)}
                    onClick={() => setActive(f.k)}
                    aria-pressed={on}
                    className={`flex w-full flex-col items-start gap-1 border-b rule py-4 text-left md:flex-row md:items-baseline md:gap-8 md:py-5 ${
 on ? "bg-surface" : ""
                    }`}
                  >
                    <span className={`margin shrink-0 md:w-40 ${on ? "text-accent" : "text-fg-faint"}`}>
                      {f.k}
                    </span>
                    <span className="text-[15px] text-fg md:flex-1">{f.v}</span>
                    <span className="mt-1 flex w-full shrink-0 items-center gap-2 md:mt-0 md:w-28">
                      <span className="h-px flex-1 bg-fg/15">
                        <span
                          className="block h-px"
                          style={{
                            width: `${f.c * 100}%`,
                            background: low ? "var(--accent)" : "var(--fg-soft)",
                          }}
                        />
                      </span>
                      <span className={`entry ${low ? "text-accent" : "text-fg-faint"}`}>
                        {f.c.toFixed(2)}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="entry mt-6 text-fg-faint">
            Lowest confidence is selected first — the reading most worth a person&rsquo;s glance.
          </p>
        </div>
      </div>
    </Chamber>
  );
}

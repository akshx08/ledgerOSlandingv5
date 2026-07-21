"use client";

/**
 * Intelligence — where records find their counterparts.
 *
 * The interaction inverts the usual one: a matched pairing is DIMMED, because
 * a match is a thing you never need to look at again. What stays lit is the
 * exception — which is exactly the list a practice actually works from, and
 * the opposite of a dashboard that celebrates its own green ticks.
 */

import { useState } from "react";
import Chamber from "@/components/ui/Chamber";
import World from "@/components/world/World";
import { INTELLIGENCE } from "@/lib/site";

export default function IntelligenceRoom() {
  const [open, setOpen] = useState<number | null>(2);

  return (
    <Chamber
      when={0.55}
      index={3}
      label={INTELLIGENCE.label}
      head={INTELLIGENCE.head}
      body={INTELLIGENCE.body}
      interaction={INTELLIGENCE.interaction}
      note={INTELLIGENCE.note}
      real="GST reconciliation, GSTR-1 review, Form 26AS"
    >
      <World kind="city" when={0.55} className="mb-14 h-[46vh] w-full min-h-[20rem]" />
      <ul className="border-t rule">
        {INTELLIGENCE.pairs.map((p, i) => {
          const quiet = p.state === "matched";
          const on = open === i;
          return (
            <li key={`${p.a}-${p.b}-${i}`} className="border-b rule">
              <button
                type="button"
                onClick={() => setOpen(on ? null : i)}
                aria-expanded={on}
                className={`grid w-full grid-cols-[1fr_auto_1fr] items-center gap-4 py-7 text-left transition-opacity duration-500 md:gap-10 md:py-9 ${
                  quiet ? "opacity-45 hover:opacity-80" : "opacity-100"
                }`}
              >
                <span className="justify-self-end text-right">
                  <span className="folio-sm block text-[clamp(1rem,2.2vw,1.45rem)]">{p.a}</span>
                  <span className="entry text-fg-faint">{p.n}</span>
                </span>
                <span className="relative flex h-8 w-20 items-center md:w-40">
                  <span
                    className="h-px w-full"
                    style={{ background: quiet ? "var(--line)" : "var(--accent)" }}
                  />
                  <span
                    className="absolute left-1/2 -translate-x-1/2 rounded-full"
                    style={{
                      width: quiet ? 5 : 9,
                      height: quiet ? 5 : 9,
                      background: quiet ? "var(--line)" : "var(--accent)",
                    }}
                  />
                </span>
                <span>
                  <span className="folio-sm block text-[clamp(1rem,2.2vw,1.45rem)]">{p.b}</span>
                  <span className={`entry ${quiet ? "text-fg-faint" : "text-accent"}`}>
                    {quiet ? "reconciled" : p.state === "differs" ? `differs · ${p.d}` : "not found"}
                  </span>
                </span>
              </button>
              <div
                className="grid overflow-hidden transition-[grid-template-rows] duration-500 ease-[var(--ease-settle)]"
                style={{ gridTemplateRows: on ? "1fr" : "0fr" }}
              >
                <div className="min-h-0">
                  <p className="max-w-2xl pb-8 text-[14.5px] leading-relaxed text-fg-soft">
                    {quiet
                      ? "Every line on both sides agreed, so this pairing is closed and appears on nobody's list. Reconciled work should cost no attention at all."
                      : "These are the lines that did not close. The output is not a status — it is the amount, the count, and the specific records on each side."}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      <p className="entry mt-8 max-w-xl text-fg-faint">
        Matched pairings are dimmed on purpose. Attention is a budget, and reconciled work should
        not spend any of it.
      </p>
    </Chamber>
  );
}

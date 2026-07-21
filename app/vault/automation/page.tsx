"use client";

/**
 * Automation — where conclusions become actions.
 *
 * The room's argument is restraint: the tracks are short and the last one
 * deliberately ends at a person. A system working on other people's books
 * should be conservative about what it closes without being asked, and the
 * room shows where it hands back rather than hiding it.
 */

import { useState } from "react";
import Chamber from "@/components/ui/Chamber";
import World from "@/components/world/World";
import { AUTOMATION } from "@/lib/site";

export default function AutomationRoom() {
  const [on, setOn] = useState(0);

  return (
    <Chamber
      when={0.78}
      index={4}
      label={AUTOMATION.label}
      head={AUTOMATION.head}
      body={AUTOMATION.body}
      interaction={AUTOMATION.interaction}
      note={AUTOMATION.note}
      real="Compliance calendar, Tally export"
    >
      <World kind="kinetic" when={0.78} className="mb-14 h-[46vh] w-full min-h-[20rem]" />
      <ul className="border-t rule">
        {AUTOMATION.flows.map((f, i) => {
          const active = on === i;
          const handsBack = i === AUTOMATION.flows.length - 1;
          return (
            <li key={f.k} className="border-b rule">
              <button
                type="button"
                onMouseEnter={() => setOn(i)}
                onFocus={() => setOn(i)}
                onClick={() => setOn(i)}
                className="grid w-full items-center gap-4 py-8 text-left md:grid-cols-12 md:gap-8"
              >
                <span className={`margin md:col-span-2 ${active ? "text-accent" : "text-fg-faint"}`}>
                  {f.k}
                </span>
                <span className="relative hidden h-px bg-fg/12 md:col-span-4 md:block">
                  <span
                    className="absolute left-0 top-0 h-px bg-accent transition-all duration-700 ease-[var(--ease-settle)]"
                    style={{ width: active ? "100%" : "0%" }}
                  />
                  <span
                    className="absolute top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-accent transition-all duration-700 ease-[var(--ease-settle)]"
                    style={{ left: active ? "100%" : "0%" }}
                  />
                </span>
                <span className="folio-sm text-[clamp(1.05rem,2.4vw,1.55rem)] md:col-span-3">
                  {f.v}
                </span>
                <span className="entry text-fg-faint md:col-span-3 md:text-right">
                  {handsBack ? "hands back to a person" : "runs unattended"}
                </span>
              </button>
              <div
                className="grid overflow-hidden transition-[grid-template-rows] duration-500 ease-[var(--ease-settle)]"
                style={{ gridTemplateRows: active ? "1fr" : "0fr" }}
              >
                <div className="min-h-0">
                  <p className="max-w-2xl pb-7 text-[14.5px] leading-relaxed text-fg-soft">{f.d}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      <p className="entry mt-8 max-w-xl text-fg-faint">
        The last track ends at a person, and that is the design.
      </p>
    </Chamber>
  );
}

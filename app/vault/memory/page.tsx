"use client";

/**
 * Memory — where one company stops being four companies.
 *
 * Hovering an alias collapses it into the resolved identity: the animation
 * runs in the direction the product runs, many names becoming one, never the
 * reverse. Beneath it, what the system has accumulated about that entity is
 * drawn as rings — a record that grows outward and never loses its centre.
 */

import { useState } from "react";
import Chamber from "@/components/ui/Chamber";
import World from "@/components/world/World";
import { MEMORY } from "@/lib/site";

export default function MemoryRoom() {
  const [pulled, setPulled] = useState<number | null>(null);

  return (
    <Chamber
      when={0.26}
      index={2}
      label={MEMORY.label}
      head={MEMORY.head}
      body={MEMORY.body}
      interaction={MEMORY.interaction}
      note={MEMORY.note}
      real="Clients, working folder, command palette"
    >
      <World kind="rings" when={0.26} className="mb-14 h-[46vh] w-full min-h-[20rem]" />
      <div className="grid gap-14 md:grid-cols-12">
        <div className="md:col-span-7">
          <div className="relative flex min-h-[22rem] items-center justify-center border rule bg-surface/50 p-8 md:min-h-[28rem]">
            <ul className="absolute inset-0">
              {MEMORY.entity.aliases.map((a, i) => {
                const on = pulled === i;
                const spots = [
                  { x: 10, y: 16 },
                  { x: 62, y: 24 },
                  { x: 20, y: 72 },
                ];
                const s = spots[i % spots.length];
                return (
                  <li
                    key={a}
                    className="absolute transition-all duration-700 ease-[var(--ease-settle)]"
                    style={{
                      left: on ? "50%" : `${s.x}%`,
                      top: on ? "50%" : `${s.y}%`,
                      transform: on ? "translate(-50%,-50%) scale(0.8)" : "none",
                      opacity: on ? 0 : 1,
                    }}
                  >
                    <button
                      type="button"
                      onMouseEnter={() => setPulled(i)}
                      onMouseLeave={() => setPulled(null)}
                      onFocus={() => setPulled(i)}
                      onBlur={() => setPulled(null)}
                      className="entry flex min-h-11 items-center whitespace-nowrap border rule bg-ground px-3 text-fg-soft hover:border-accent hover:text-fg"
                    >
                      {a}
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="relative text-center">
              <span
                className="margin text-accent transition-opacity duration-500"
                style={{ opacity: pulled === null ? 0.6 : 1 }}
              >
                resolved identity
              </span>
              <p className="folio mt-4 text-[clamp(1.5rem,3.4vw,2.3rem)]">{MEMORY.entity.name}</p>
              <p className="entry mt-2 text-fg-faint">{MEMORY.entity.gstin}</p>
            </div>
          </div>
        </div>

        <div className="md:col-span-4 md:col-start-9">
          <dl className="border-t rule">
            {MEMORY.entity.rings.map((r, i) => (
              <div key={r.k} className="border-b rule py-4">
                <div className="flex items-baseline justify-between">
                  <dt className="margin text-fg-faint">{r.k}</dt>
                  <dd className="entry text-fg">{r.v}</dd>
                </div>
                {/* a ring per year held — knowledge accumulates outward */}
                <span
                  aria-hidden
                  className="mt-3 block h-px bg-accent/60"
                  style={{ width: `${28 + i * 18}%` }}
                />
                <span className="entry mt-1 block text-fg-faint">since {r.since}</span>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </Chamber>
  );
}

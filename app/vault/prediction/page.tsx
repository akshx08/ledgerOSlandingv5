"use client";

/**
 * Prediction — where the model runs forward.
 *
 * Every figure is a RANGE with a confidence, never a single number, and
 * weakening the assumption visibly widens the spread. A forecast rendered as
 * one confident figure is the most common dishonesty in finance software.
 *
 * This room stands past the end of the story, and is the one describing work
 * that is not shipping. It says so plainly rather than being quietly written
 * in the present tense.
 */

import { useState } from "react";
import Chamber from "@/components/ui/Chamber";
import World from "@/components/world/World";
import { PREDICTION } from "@/lib/site";

export default function PredictionRoom() {
  const [weight, setWeight] = useState(50);

  return (
    <Chamber
      when={1}
      index={5}
      label={PREDICTION.label}
      head={PREDICTION.head}
      body={PREDICTION.body}
      interaction={PREDICTION.interaction}
      note={PREDICTION.note}
      real={null}
    >
      <World kind="branch" when={1} className="mb-14 h-[46vh] w-full min-h-[20rem]" />
      <div className="grid gap-14 md:grid-cols-12">
        <div className="md:col-span-7">
          <ul className="border-t rule">
            {PREDICTION.branches.map((b) => {
              const spread = (1 - b.c) * (1 + Math.abs(50 - weight) / 50);
              return (
                <li key={b.k} className="border-b rule py-7">
                  <div className="flex items-baseline justify-between gap-6">
                    <span className="margin text-fg-faint">{b.k}</span>
                    <span className="entry text-fg-faint">confidence {b.c.toFixed(2)}</span>
                  </div>
                  <p className="folio-sm mt-3 text-[clamp(1.25rem,3vw,2rem)]">{b.v}</p>
                  <span className="mt-4 block h-1 w-full bg-fg/10">
                    <span
                      className="block h-1 bg-accent/70 transition-all duration-500 ease-[var(--ease-settle)]"
                      style={{
                        marginLeft: `${Math.min(45, spread * 40)}%`,
                        width: `${Math.max(12, 100 - spread * 95)}%`,
                      }}
                    />
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="md:col-span-4 md:col-start-9">
          <label className="block">
            <span className="margin text-accent">Suppliers filing on time</span>
            <span className="entry mt-2 block text-fg">{weight}%</span>
            <input
              type="range"
              min={0}
              max={100}
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="mt-4 h-11 w-full cursor-pointer"
              style={{ accentColor: "var(--accent)" }}
              aria-label="Assumed share of suppliers filing on time"
            />
          </label>
          <p className="mt-8 text-[14.5px] leading-relaxed text-fg-soft">
            One assumption, moved by hand. In the product this is not a slider — it is the observed
            filing behaviour of the actual suppliers on the actual ledger, and the interval narrows
            on its own as the period fills in.
          </p>
        </div>
      </div>
    </Chamber>
  );
}

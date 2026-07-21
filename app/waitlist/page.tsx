"use client";

/**
 * The close.
 *
 * The journey ends in the quiet dark the story arrives at, and stays there.
 * No canvas, no motion beyond the form's own states: the visitor has walked
 * through six centuries of the record and the last thing they should meet is
 * a still page and a short form. Complexity here would be the site showing
 * off at the exact moment it should be listening.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { applyPalette } from "@/lib/era";
import { BRAND, FOOT, WAITLIST } from "@/lib/site";

type Phase = "idle" | "sending" | "done" | "invalid" | "unconfigured" | "error";
const F = WAITLIST.form;

export default function Waitlist() {
  const [phase, setPhase] = useState<Phase>("idle");

  // hold the document at the end of the story
  useEffect(() => { applyPalette(1); }, []);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setPhase("sending");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) { setPhase("done"); form.reset(); }
      else if (res.status === 400) setPhase("invalid");
      else if (res.status === 503) setPhase("unconfigured");
      else setPhase("error");
    } catch { setPhase("error"); }
  };

  const field =
    "mt-2 w-full border-0 border-b rule bg-transparent px-0 py-3 text-[16px] text-fg outline-none focus:border-accent";

  return (
    <main className="relative z-10 min-h-screen bg-ground px-5 pb-28 pt-28 md:px-10 md:pt-32">
      <div className="grid gap-16 lg:grid-cols-12 lg:gap-20">
        <div className="lg:col-span-5">
          <h1 className="folio text-[clamp(2.3rem,6vw,4.4rem)]">
            {WAITLIST.head.map((l) => (<span key={l} className="block">{l}</span>))}
          </h1>
          <p className="mt-8 max-w-md text-[15px] leading-relaxed text-fg-soft md:text-base">
            {WAITLIST.body}
          </p>
          <dl className="mt-14 border-t rule">
            {WAITLIST.terms.map(([k, v]) => (
              <div key={k} className="border-b rule py-5">
                <dt className="margin text-accent">{k}</dt>
                <dd className="mt-2 max-w-sm text-[14.5px] leading-relaxed text-fg-soft">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          {phase === "done" ? (
            <div role="status" className="border-t-2 border-accent pt-8">
              <p className="folio text-[clamp(1.7rem,4vw,2.6rem)]">{F.done}</p>
              <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-fg-soft">{F.doneSub}</p>
            </div>
          ) : (
            <>
              <h2 className="folio-sm text-[clamp(1.3rem,3vw,1.9rem)]">{F.head}</h2>
              <p className="mt-3 max-w-sm text-[14.5px] leading-relaxed text-fg-soft">{F.note}</p>
              <form onSubmit={onSubmit} className="mt-12">
                <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"
                  className="absolute -left-[9999px] h-0 w-0 opacity-0" />
                <div className="grid gap-x-10 gap-y-7 sm:grid-cols-2">
                  <label className="block">
                    <span className="margin text-fg-faint">{F.fields.name}</span>
                    <input name="name" required maxLength={120} autoComplete="name" className={field} />
                  </label>
                  <label className="block">
                    <span className="margin text-fg-faint">{F.fields.email}</span>
                    <input name="email" type="email" required maxLength={254} autoComplete="email" className={field} />
                  </label>
                  <label className="block">
                    <span className="margin text-fg-faint">{F.fields.firm}</span>
                    <input name="firm" required maxLength={160} autoComplete="organization" className={field} />
                  </label>
                  <label className="block">
                    <span className="margin text-fg-faint">{F.fields.role}</span>
                    <select name="role" defaultValue={F.roles[0]} className={field}>
                      {F.roles.map((r) => (<option key={r} value={r}>{r}</option>))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="margin text-fg-faint">{F.fields.clients}</span>
                    <input name="clients" maxLength={40} inputMode="numeric" className={field} />
                  </label>
                  <label className="block">
                    <span className="margin text-fg-faint">{F.fields.city}</span>
                    <input name="city" maxLength={80} className={field} />
                  </label>
                </div>
                <button type="submit" disabled={phase === "sending"}
                  className="margin mt-12 min-h-12 w-full border-2 border-accent px-16 text-accent hover:bg-accent hover:text-ground disabled:opacity-60 sm:w-auto">
                  {phase === "sending" ? F.sending : F.submit}
                </button>
                {phase !== "idle" && phase !== "sending" && (
                  <p role="alert" className="mt-7 max-w-md border-l-2 border-accent pl-5 text-[14.5px] leading-relaxed text-fg">
                    {phase === "invalid" && F.invalid}
                    {phase === "unconfigured" && (<>{F.unconfigured}{" "}
                      <a className="text-accent underline underline-offset-4" href={`mailto:${BRAND.contact}`}>{BRAND.contact}</a></>)}
                    {phase === "error" && (<>{F.failed}{" "}
                      <a className="text-accent underline underline-offset-4" href={`mailto:${BRAND.contact}`}>{BRAND.contact}</a></>)}
                  </p>
                )}
              </form>
            </>
          )}
        </div>
      </div>

      <footer className="mt-32 flex flex-wrap items-baseline justify-between gap-6 border-t rule pt-8">
        <Link href="/" className="margin -my-3 inline-flex min-h-11 items-center text-fg-faint hover:text-fg">
          ← The Long Ledger
        </Link>
        <span className="entry text-fg-faint">{FOOT.line}</span>
        <span className="entry text-fg-faint">{FOOT.meta}</span>
      </footer>
    </main>
  );
}

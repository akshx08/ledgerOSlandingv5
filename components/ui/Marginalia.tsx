"use client";

/**
 * Marginalia — the navigation, as the notes a clerk writes in a ledger's
 * margin rather than as a menu bar.
 *
 * A bound book does not have navigation; it has a folio number, a running
 * head, and whatever the bookkeeper pencilled beside the entry. So this sits
 * where those sit — a corner mark, a folio count, and an index that opens
 * only when asked. There is no bar and no menu: four marks in the four
 * corners, and the page between them left alone.
 *
 * On touch the index is one thumb-height target opening a full sheet; a
 * hover-revealed margin is unusable without a pointer.
 *
 * The three permanent marks fade on `--legible`, which lib/era.ts drops to 0
 * while the journey crosses from a paper world to a screen one — for those few
 * frames the ground is exactly the colour of the ink and nothing readable may
 * be on the page.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BRAND, CTA, ROUTE } from "@/lib/site";

export default function Marginalia() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const here = ROUTE.findIndex((r) => r.href === pathname);
  const folio = here < 0 ? 0 : here;

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      {/* The margin of a page is empty because the text stops before it. These
          hold that margin open: the ground bleeds in behind the marks so body
          copy passing underneath on scroll never collides with them. They are
          gradients rather than bars because a bar would be a UI chrome, and
          the ground is a live variable, so they travel with the era. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-40 h-24"
        style={{
          background:
            "linear-gradient(to bottom, var(--ground) 0%, var(--ground) 42%, transparent 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 bottom-0 z-40 h-20"
        style={{
          background:
            "linear-gradient(to top, var(--ground) 0%, var(--ground) 40%, transparent 100%)",
        }}
      />

      {/* the running head */}
      <Link
        href="/"
        style={{ opacity: "var(--legible, 1)" }}
        className="margin fixed left-5 top-4 z-50 inline-flex min-h-11 items-center text-fg hover:text-accent md:left-10 md:top-7"
      >
        {BRAND.name}
      </Link>

      {/* the standing request — a waitlist that is a destination, not a footer link */}
      <Link
        href={CTA.href}
        style={{ opacity: "var(--legible, 1)" }}
        className="margin group fixed right-5 top-4 z-50 inline-flex min-h-11 items-center gap-2 border-b rule pb-1 text-fg hover:border-accent hover:text-accent md:right-10 md:top-7"
      >
        {CTA.label}
        <span className="transition-transform duration-500 ease-[var(--ease-settle)] group-hover:translate-x-1">
          →
        </span>
      </Link>

      {/* the folio number — where you are in the book */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-label="Open index"
        style={{ opacity: "var(--legible, 1)" }}
        className="margin fixed bottom-4 right-5 z-50 inline-flex min-h-11 items-center gap-3 text-fg-faint hover:text-fg md:bottom-7 md:right-10"
      >
        <span className="hidden sm:inline">Index</span>
        <span className="text-fg">
          {String(folio + 1).padStart(2, "0")}
          <span className="text-fg-faint"> / {String(ROUTE.length).padStart(2, "0")}</span>
        </span>
      </button>

      {/* the index — a leaf that turns over the page */}
      {open && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close index"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ground/92"
          />
          <div className="absolute inset-x-0 bottom-0 border-t rule bg-ground md:inset-y-0 md:left-auto md:right-0 md:w-[26rem] md:border-l md:border-t-0">
            <p className="margin px-6 pb-4 pt-8 text-fg-faint md:px-10 md:pt-12">Contents</p>
            <ul>
              {ROUTE.map((r, i) => {
                const active = pathname === r.href;
                return (
                  <li key={r.href} className="border-t rule">
                    <Link
                      href={r.href}
                      className="flex items-baseline justify-between gap-4 px-6 py-5 md:px-10"
                    >
                      <span
                        className={`folio-sm text-[clamp(1.3rem,4vw,1.75rem)] ${
 active ? "text-accent" : "text-fg"
                        }`}
                      >
                        {r.label}
                      </span>
                      <span className="margin text-fg-faint">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="border-t rule p-6 md:px-10">
              <Link
                href={CTA.href}
                className="margin inline-flex min-h-11 items-center border-b-2 border-accent pb-1 text-accent"
              >
                {CTA.label} →
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

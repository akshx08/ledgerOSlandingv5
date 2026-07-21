import type { Metadata } from "next";
import { Eczar, Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import Marginalia from "@/components/ui/Marginalia";
import Smooth from "@/components/ui/Smooth";
import { BRAND } from "@/lib/site";

/*
 * THE DISPLAY FACE IS ECZAR, and the choice is the argument.
 *
 * Eczar was drawn by Vaibhav Singh for Devanagari first, with Latin built to
 * sit beside it — a face made for Indian text rather than a Western serif
 * borrowed for an Indian subject. For a site about the bahi-khata and the
 * lineage of Indian bookkeeping, using a Latin-first revival would be a
 * costume. This is the real thing, and its high-contrast, slightly restless
 * strokes read as written rather than typeset.
 *
 * Hanken Grotesk handles values and marginalia: neutral, quiet, and content
 * to be the part of a ledger that was printed rather than penned.
 *
 * Neither face appears in any previous LedgerOS build, and neither is one of
 * the reflex serif choices that would have made this look like every other
 * heritage-flavoured site.
 */
const display = Eczar({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-display-face",
  display: "swap",
});
const body = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-body-face",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${BRAND.name} — ${BRAND.line}`,
  description:
    "For centuries the ledger changed shape — handwritten, printed, filed, tabulated, networked — and none of it changed what it takes to understand a business. LedgerOS is the layer that reads the record, resolves it, and keeps it connected.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // The face variables MUST sit on <html>, not <body>. Tailwind's @theme emits
  // `--font-display: var(--font-display-face), serif` onto :root, and a custom
  // property resolves its own var() references on the element that declares
  // it — so with the faces on <body>, :root sees nothing, the declaration is
  // invalid at computed-value time, and every font-family in the site falls
  // back to the browser UI stack without a single error.
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="antialiased">
        <Smooth />
        {children}
        <Marginalia />
      </body>
    </html>
  );
}

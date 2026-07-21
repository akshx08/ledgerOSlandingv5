"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Inertial scroll. The camera and the palette are both driven by scroll
 * position, so the scroll itself needs mass — a raw wheel event makes time
 * step rather than pass. Bails on reduced motion and on `?native=1`.
 */
export default function Smooth() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const native = new URLSearchParams(window.location.search).has("native");
    if (reduce || native) return;

    const lenis = new Lenis({ lerp: 0.075, wheelMultiplier: 0.9, touchMultiplier: 1.5 });
    let raf = 0;
    const tick = (t: number) => { lenis.raf(t); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); lenis.destroy(); };
  }, []);

  return null;
}

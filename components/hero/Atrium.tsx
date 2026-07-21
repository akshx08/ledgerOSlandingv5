"use client";

/**
 * ATRIUM — the hero proper, once the centuries have finished flashing past.
 *
 * A kolam is laid on the floor and you are standing at the edge of it. Above
 * it, the surfaces LedgerOS actually produces hang in the air at different
 * depths: a document read and scored, a reconciliation, an identity resolved
 * out of four spellings, a filing that runs itself, a forecast given as a
 * range. Each is tethered to the floor by a single thread, because none of
 * them is free-standing — every one of them is a point on the same unbroken
 * line.
 *
 * That is the argument of the whole company in one image, and it is why the
 * panels are real product surfaces with real numbers rather than the
 * abstract glass rectangles this kind of shot usually gets filled with.
 *
 * The panels are drawn with the 2D canvas API and mapped onto planes, so the
 * type in them is genuinely typeset — same faces, same palette, same scale
 * relationships as the rest of the site — rather than being modelled or faked
 * with textures.
 */

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { ERAS, css } from "@/lib/era";
import { kolamDots, kolamRibbon, oklchToLinear } from "./kolam-geom";

const W = 9;
const H = 7;

type Row = { k: string; v: string; bar?: number; flag?: boolean };
type PanelSpec = {
  tag: string;
  title: string;
  rows: Row[];
  foot: string;
  /** x, y, z in the room */
  at: [number, number, number];
  /** world width; height follows the 1.6 aspect */
  w: number;
};

/**
 * Real surfaces, real numbers — the same ones the vault pages carry. If the
 * hero shows a confidence of 0.94 then that is what the Document room shows
 * too, because a hero that invents its own product is a hero that will be
 * contradicted two clicks later.
 */
const PANELS: PanelSpec[] = [
  {
    tag: "Read",
    title: "GST · ASMT-10",
    rows: [
      { k: "Supplier", v: "Meridian Textiles", bar: 0.97 },
      { k: "Taxable value", v: "₹4,82,300", bar: 0.99 },
      { k: "Period", v: "Jul 2026", bar: 0.94 },
    ],
    foot: "Every field carries where it was read from.",
    at: [1.0, 3.5, -1.4],
    w: 2.2,
  },
  {
    tag: "Reconcile",
    title: "Register ↔ GSTR-2B",
    rows: [
      { k: "Matched", v: "412 lines" },
      { k: "Value differs", v: "9 lines", flag: true },
      { k: "Missing upstream", v: "3 lines", flag: true },
    ],
    foot: "The work is in the gap.",
    at: [3.7, 2.3, 0.4],
    w: 2.1,
  },
  {
    tag: "Resolve",
    title: "Meridian Textiles",
    rows: [
      { k: "27AAACM····1Z5", v: "GSTIN" },
      { k: "Meridian Tex.", v: "invoice" },
      { k: "MERIDAN TEXTILE", v: "bank" },
    ],
    foot: "One client. Every mention.",
    at: [1.55, 1.4, 1.7],
    w: 1.9,
  },
  {
    tag: "Act",
    title: "GSTR-3B · 20 Aug",
    rows: [
      { k: "Register built", v: "runs unattended" },
      { k: "Books out", v: "Tally export" },
      { k: "Exception raised", v: "hands back", flag: true },
    ],
    foot: "Inside limits you set. Every action logged.",
    at: [4.0, 4.4, -2.7],
    w: 1.9,
  },
  {
    tag: "Foresee",
    title: "₹18.4L – ₹21.9L",
    rows: [
      { k: "Liability at close", v: "confidence 0.78", bar: 0.78 },
      { k: "Input credit", v: "₹6.2L – ₹7.1L", bar: 0.84 },
    ],
    foot: "A range, never a single confident number.",
    at: [2.6, 0.85, 3.0],
    w: 2.3,
  },
];

/* ── the panel, typeset ─────────────────────────────────────────────────── */

const PW = 1024;
const PH = 640;

function drawPanel(ctx: CanvasRenderingContext2D, s: PanelSpec, display: string, body: string) {
  const p = ERAS[ERAS.length - 1].p;
  const surface = css(p.surface);
  const fg = css(p.fg);
  const fgSoft = css(p.fgSoft);
  const fgFaint = css(p.fgFaint);
  const accent = css(p.accent);
  const line = css(p.line);

  ctx.clearRect(0, 0, PW, PH);

  // the card. Slightly translucent, because it is hanging in a room and the
  // room should be faintly visible through it.
  ctx.globalAlpha = 0.93;
  ctx.fillStyle = surface;
  ctx.beginPath();
  ctx.roundRect(2, 2, PW - 4, PH - 4, 14);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = line;
  ctx.lineWidth = 2;
  ctx.stroke();

  const pad = 56;

  ctx.textBaseline = "alphabetic";
  ctx.letterSpacing = "3.4px";
  ctx.font = `500 24px ${body}`;
  ctx.fillStyle = accent;
  ctx.fillText(s.tag.toUpperCase(), pad, pad + 26);
  ctx.letterSpacing = "0px";

  ctx.font = `400 62px ${display}`;
  ctx.fillStyle = fg;
  ctx.fillText(s.title, pad, pad + 116);

  ctx.strokeStyle = line;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(pad, pad + 158);
  ctx.lineTo(PW - pad, pad + 158);
  ctx.stroke();

  let y = pad + 232;
  for (const r of s.rows) {
    ctx.font = `400 29px ${body}`;
    ctx.fillStyle = fgSoft;
    ctx.textAlign = "left";
    ctx.fillText(r.k, pad, y);

    ctx.font = `500 31px ${body}`;
    ctx.fillStyle = r.flag ? accent : fg;
    ctx.textAlign = "right";
    ctx.fillText(r.v, PW - pad, y);
    ctx.textAlign = "left";

    if (r.bar !== undefined) {
      const bw = 250;
      const bx = PW - pad - bw;
      ctx.fillStyle = line;
      ctx.fillRect(bx, y + 16, bw, 4);
      ctx.fillStyle = accent;
      ctx.fillRect(bx, y + 16, bw * r.bar, 4);
    }
    y += r.bar !== undefined ? 92 : 80;
  }

  ctx.font = `400 25px ${body}`;
  ctx.fillStyle = fgFaint;
  ctx.fillText(s.foot, pad, PH - pad);
}

type Props = { className?: string; active: boolean };

export default function Atrium({ className, active }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    // `?still=1` holds the finished room. The tuning surface, and the only way
    // to photograph it where the tab throttles requestAnimationFrame.
    const still = new URLSearchParams(window.location.search).get("still") !== null;
    const reduced = still || window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let alive = true;
    let raf = 0;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    // setSize(_, _, false) leaves the CSS box alone, so without this the canvas
    // lays out at its device-pixel buffer and gets cropped by overflow-hidden
    renderer.domElement.style.cssText = "width:100%;height:100%;display:block";
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 200);
    const room = new THREE.Group();
    scene.add(room);

    const dispose: { dispose(): void }[] = [];
    const track = <T extends { dispose(): void }>(o: T) => (dispose.push(o), o);

    const pal = ERAS[ERAS.length - 1].p;
    const flour = oklchToLinear([0.93, 0.012, 84]);
    const brass = oklchToLinear(pal.accent);

    /* ── the floor ──────────────────────────────────────────────────────── */
    const ribbon = track(kolamRibbon(W, H, 0.075));
    const bb = ribbon.boundingBox!;
    const floor = new THREE.Group();
    // The kolam sits under the panels rather than under the whole frame. Left
    // on the room's origin it sprawls across the text column, and a threshold
    // drawing that runs under the writing is just a texture.
    const FS = 0.85;
    const cx = bb.min.x + (bb.max.x - bb.min.x) / 2;
    const cz = bb.min.z + (bb.max.z - bb.min.z) / 2;
    floor.scale.setScalar(FS);
    floor.position.set(2.5 - cx * FS, 0, -cz * FS);
    room.add(floor);

    const lineMat = track(
      new THREE.RawShaderMaterial({
        glslVersion: THREE.GLSL3,
        transparent: true,
        depthWrite: false,
        // The ribbon lies in the XZ plane, so its winding faces down and the
        // default FrontSide culls it away entirely when you look at the floor
        // from above. A kolam is visible from wherever you happen to stand.
        side: THREE.DoubleSide,
        uniforms: {
          uHead: { value: reduced ? 1 : 0 },
          uFlour: { value: new THREE.Vector3(...flour) },
        },
        vertexShader: /* glsl */ `
          precision highp float;
          uniform mat4 projectionMatrix, modelViewMatrix;
          in vec3 position;
          in float aArc;
          in float aSide;
          out float vArc;
          out float vSide;
          out vec2 vGround;
          void main() {
            vArc = aArc; vSide = aSide; vGround = position.xz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          precision highp float;
          uniform float uHead;
          uniform vec3 uFlour;
          in float vArc;
          in float vSide;
          in vec2 vGround;
          out vec4 frag;
          float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
          void main() {
            if (vArc > uHead) discard;
            float edge = 1.0 - smoothstep(0.34, 1.0, abs(vSide));
            float g = hash(floor(vGround * 190.0));
            float grain = smoothstep(0.13, 0.72, g);
            float head = smoothstep(0.05, 0.0, uHead - vArc);
            float a = edge * mix(0.5, 1.0, grain) * (0.72 + head * 0.6);
            if (a < 0.015) discard;
            vec3 col = uFlour * (1.0 + head * 0.5);
            frag = vec4(pow(max(col, vec3(0.0)), vec3(1.0 / 2.2)), a);
          }
        `,
      })
    );
    floor.add(new THREE.Mesh(ribbon, lineMat));

    const dotGeo = track(new THREE.BufferGeometry());
    dotGeo.setAttribute("position", new THREE.BufferAttribute(kolamDots(W, H), 3));
    const dotMat = track(
      new THREE.PointsMaterial({
        size: 5,
        sizeAttenuation: false,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
        color: new THREE.Color(brass[0], brass[1], brass[2]).convertLinearToSRGB(),
      })
    );
    floor.add(new THREE.Points(dotGeo, dotMat));

    /* ── the floating surfaces ──────────────────────────────────────────── */
    type Card = { mesh: THREE.Mesh; thread: THREE.Line; base: THREE.Vector3; i: number };
    const cards: Card[] = [];

    const buildCards = () => {
      const root = document.documentElement;
      const display =
        getComputedStyle(root).getPropertyValue("--font-display-face").trim() || "serif";
      const body =
        getComputedStyle(root).getPropertyValue("--font-body-face").trim() || "sans-serif";

      PANELS.forEach((spec, i) => {
        const cv = document.createElement("canvas");
        cv.width = PW;
        cv.height = PH;
        const ctx = cv.getContext("2d");
        if (!ctx) return;
        drawPanel(ctx, spec, `${display}, serif`, `${body}, sans-serif`);

        const tex = track(new THREE.CanvasTexture(cv));
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.generateMipmaps = true;

        const h = (spec.w * PH) / PW;
        const geo = track(new THREE.PlaneGeometry(spec.w, h));
        const mat = track(
          new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false })
        );
        const mesh = new THREE.Mesh(geo, mat);
        const base = new THREE.Vector3(...spec.at);
        mesh.position.copy(base);
        mesh.renderOrder = 2;
        room.add(mesh);

        // the tether — nothing here is free-standing
        const tg = track(new THREE.BufferGeometry());
        tg.setAttribute(
          "position",
          new THREE.BufferAttribute(
            new Float32Array([base.x, base.y - h / 2, base.z, base.x, 0.01, base.z]),
            3
          )
        );
        const tm = track(
          new THREE.LineBasicMaterial({
            color: new THREE.Color(brass[0], brass[1], brass[2]).convertLinearToSRGB(),
            transparent: true,
            opacity: 0.3,
            depthWrite: false,
          })
        );
        const thread = new THREE.Line(tg, tm);
        room.add(thread);

        cards.push({ mesh, thread, base, i });
      });
    };

    // wait for the real faces, or the panels get typeset in the fallback and
    // every measurement in them is wrong
    if (document.fonts?.status === "loaded") buildCards();
    else document.fonts?.ready.then(() => alive && buildCards());

    /* ── framing ────────────────────────────────────────────────────────── */
    const resize = () => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      const aspect = w / h;
      camera.aspect = aspect;
      // on a wide screen the words hold the left, so the room sits right; on a
      // narrow one it centres and pulls back to keep the panels inside
      const wide = aspect > 1.05;
      const compact = w < 700;
      room.position.x = compact ? -2.5 : wide ? 0.4 : -1.6;
      room.position.y = 0;
      camera.updateProjectionMatrix();
      if (reduced) renderer.render(scene, camera);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    /* ── the move ───────────────────────────────────────────────────────── */
    const ptr = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMove = (e: PointerEvent) => {
      ptr.tx = (e.clientX / window.innerWidth) * 2 - 1;
      ptr.ty = (e.clientY / window.innerHeight) * 2 - 1;
    };
    if (!reduced) window.addEventListener("pointermove", onMove, { passive: true });

    const place = (t: number, reveal: number) => {
      const wide = host.clientWidth / host.clientHeight > 1.05;
      // A phone cannot carry five panels. At 375px a card is ninety pixels
      // across and its type is a smear, so the room drops them and shows the
      // floor alone — which is the same argument, and legible at any size.
      const compact = host.clientWidth < 700;
      const drift = reduced ? 0 : Math.sin(t * 0.14);

      if (compact) {
        // Far enough back that the whole loop fits the narrow frame — at this
        // aspect the view is barely five units wide, and a cropped kolam is a
        // kolam that does not close. Aimed well below the floor so it sits in
        // the band above the words rather than behind them.
        camera.position.set(ptr.x * 0.35 + drift * 0.12, 11.5 - reveal * 0.6, 24.5);
        camera.lookAt(0, -6.2, -0.2);
      } else {
        // a slow push in, and a sway you notice only if you look for it
        camera.position.set(
          (wide ? 2.0 : 0) + ptr.x * 0.5 + drift * 0.18,
          6.4 - reveal * 0.7 - ptr.y * 0.45,
          13.2 - reveal * 1.4 + drift * 0.22
        );
        camera.lookAt(wide ? 2.3 : 0, 1.9, -0.2);
      }

      cards.forEach((c) => {
        c.mesh.visible = !compact;
        c.thread.visible = !compact;
        if (compact) return;
        const k = Math.max(0, Math.min(1, (reveal - c.i * 0.11) / 0.42));
        const e = k * k * (3 - 2 * k);
        const bob = reduced ? 0 : Math.sin(t * 0.42 + c.i * 1.7) * 0.045;
        c.mesh.position.set(c.base.x, c.base.y + bob + (1 - e) * -0.5, c.base.z);
        c.mesh.scale.setScalar(0.94 + e * 0.06);
        (c.mesh.material as THREE.MeshBasicMaterial).opacity = e;
        c.mesh.lookAt(camera.position);
        (c.thread.material as THREE.LineBasicMaterial).opacity = e * 0.3;
      });
    };

    let t0 = 0;
    const frame = (now: number) => {
      if (!alive) return;
      raf = requestAnimationFrame(frame);
      if (!activeRef.current) return;
      if (!t0) t0 = now;
      const t = (now - t0) / 1000;
      ptr.x += (ptr.tx - ptr.x) * 0.045;
      ptr.y += (ptr.ty - ptr.y) * 0.045;
      // the line sweeps round as the surfaces rise off it
      lineMat.uniforms.uHead.value = Math.min(1, t / 1.5);
      place(t, Math.min(1, t / 1.3));
      renderer.render(scene, camera);
    };

    resize();
    if (reduced) {
      place(0, 1);
      renderer.render(scene, camera);
      // panels arrive asynchronously with the fonts, so paint again once they do
      document.fonts?.ready.then(() => {
        if (!alive) return;
        place(0, 1);
        renderer.render(scene, camera);
      });
    } else {
      raf = requestAnimationFrame(frame);
    }

    const onLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(raf);
    };
    renderer.domElement.addEventListener("webglcontextlost", onLost);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      renderer.domElement.removeEventListener("webglcontextlost", onLost);
      dispose.forEach((d) => d.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={hostRef} className={className} aria-hidden />;
}

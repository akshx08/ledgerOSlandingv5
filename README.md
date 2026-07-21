# LedgerOS — The Long Ledger

The fifth site. Not a redesign of the fourth — a different argument.

Indian accounting did not begin with software. It began with a bahi-khata: a
cloth-bound book, ruled by hand, kept in daylight on a wooden desk. Everything
since has been the same discipline in a new material — the printed book, the
filing cabinet, the spreadsheet, the PDF, the email thread, the shared drive.
Each material solved the last one's problem and created a worse one. The record
is now scattered across more places than any one person can hold.

The site opens on the practice that predates every one of those materials —
a kolam drawn at the threshold — and treats LedgerOS as the next material
rather than as a rupture.

---

## The one idea

**The site does not have a colour scheme. It has a date.**

`lib/era.ts` defines seven stops — Bahi-khata, Press, Cabinet, Sheet, Network,
Flood, LedgerOS — each a full palette sampled from that moment's materials.
Scroll position interpolates between them continuously and writes the result
onto `:root` as CSS custom properties. Every surface in the document, DOM and
WebGL alike, reads from those variables.

Each room therefore holds the document at one moment in that history rather
than travelling through it: the Document vault sits in the age of paper and
looks it, and the home page holds the last stop — the quiet dark lit by the
system itself, which is the hour a kolam is drawn in.

Every text token in all seven eras is contrast-solved against its own era's
ground: primary ≈ 11:1, secondary ≈ 7:1, tertiary ≈ 4.8:1. The accent is solved
against both the ground *and* the raised surface, because small accent text
appears on each.

## The hero

A kolam, drawn.

Before the household wakes, the threshold is swept and wetted and a kolam is
laid on it: first the pulli, a grid of dots placed from memory, then a single
line threaded around them. A sikku kolam has rules — the line may loop, cross
and double back, but it may not lift, it may not leave a dot unaccounted for,
and it must return to the point it began. It is drawn in rice flour, walked
over by noon, and drawn again the next morning.

That is the oldest picture anyone has of a set of books that balances: a field
of separate marks, and the claim that one continuous line can pass around all
of them and come back to where it started. Mathematicians study kolam as
formal grammars for exactly that reason.

The weave is not drawn by hand or by an artist. It is a ray at 45° reflecting
off the walls of a 9×7 lattice — the skeleton of a real sikku kolam, which
falls out of the grid rather than being invented on it. Two constraints make
it work:

- the sides are **coprime**, so the path closes into exactly one loop instead
  of several — the same reason a real kolam grid is chosen with care before a
  single dot is laid;
- the ray runs on a **doubled lattice offset by one**, so it can never reach a
  corner. At a corner both components of the direction flip at once, which is
  a reversal rather than a reflection: the ray turns round and retraces its own
  route, and the kolam collapses into a line walked there and back.

The line itself is an arc-length-parameterised ribbon revealed by a single
`uHead` uniform, with the flour's grain, its soft edge and its gaps done in the
fragment shader. The hand wavers and presses unevenly — both wobbles are
periodic in arc length so the loop has no seam where it closes.

It takes one screen and about eight seconds, and **nothing about it is attached
to scroll.** You are not operating it. You are watching someone finish
something.

`?draw=0.4` freezes the hand mid-stroke.

## The five worlds

Five environments that share only scaffolding — no common geometry, lighting,
camera language or motion:

| Vault | World | Camera |
| --- | --- | --- |
| Document | receding ranks of shelved sheets | endless forward glide |
| Memory | concentric growth rings, mentions as marks | near-vertical, slow rotation |
| Intelligence | a city of records, spans between tall ones | street-level orbit |
| Automation | lanes of parcels travelling to outcomes | fixed broadside |
| Prediction | futures diverging from a settled trunk | slow breathing dolly |

The last automation lane stops short of the others. A person still owns it, and
the site does not pretend otherwise.

## Stack

Next.js 15 · React 19 · Tailwind v4 · vanilla Three.js · Eczar + Hanken Grotesk

Vanilla Three, not React Three Fiber: `<Canvas>` mounts without error in this
environment and never fires `onCreated`.

## Running it

```bash
npm install
npm run dev     # http://localhost:3345
npm run build
```

### Tuning surface

- `?draw=0.42` — freeze the kolam mid-stroke; also the only way to photograph
  a finished one where the tab throttles `requestAnimationFrame`
- `?native=1` — disable smooth scrolling

## Waitlist

`POST /api/waitlist` writes to Supabase when `SUPABASE_URL` and
`SUPABASE_SERVICE_ROLE_KEY` are set. Length caps on every field, a honeypot,
and a null-body guard. With no backend configured it returns 503 and the form
says so plainly and offers an email address, rather than showing a success
state it has not earned. A duplicate email is a success — they are already on
the list.

```sql
create table if not exists waitlist (
  id         bigint generated always as identity primary key,
  name       text not null,
  email      text not null unique,
  firm       text not null,
  role       text,
  city       text,
  clients    text,
  created_at timestamptz not null default now()
);
alter table waitlist enable row level security;  -- writes go through the service role only
```

## Honesty

The copy describes a product being built. Vault pages carry a
"Shipping today" line naming what actually exists; everything past it is
written as intent, not as inventory.

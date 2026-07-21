# LedgerOS — The Long Ledger

The fifth site. Not a redesign of the fourth — a different argument.

Indian accounting did not begin with software. It began with a bahi-khata: a
cloth-bound book, ruled by hand, kept in daylight on a wooden desk. Everything
since has been the same discipline in a new material — the printed book, the
filing cabinet, the spreadsheet, the PDF, the email thread, the shared drive.
Each material solved the last one's problem and created a worse one. The record
is now scattered across more places than any one person can hold.

This site walks that history in a single continuous shot, and arrives at
LedgerOS as the next material rather than as a rupture.

---

## The one idea

**The site does not have a colour scheme. It has a date.**

`lib/era.ts` defines seven stops — Bahi-khata, Press, Cabinet, Sheet, Network,
Flood, LedgerOS — each a full palette sampled from that moment's materials.
Scroll position interpolates between them continuously and writes the result
onto `:root` as CSS custom properties. Every surface in the document, DOM and
WebGL alike, reads from those variables.

So there is never a frame where the page changes and the world does not. You
begin in full daylight on handmade paper and end in a quiet dark lit by the
system itself, and there is no moment where one palette stops and another
starts.

Each vault holds the document at its own moment in that history, so walking
into the Document room is walking back into the age of paper — and it looks it.

Every text token in all seven eras is contrast-solved against its own era's
ground: primary ≈ 11:1, secondary ≈ 7:1, tertiary ≈ 4.8:1. The accent is solved
against both the ground *and* the raised surface, because small accent text
appears on each.

## The hero

7,200 instanced leaves, each baked with **six** positions — the bahi-khata, the
shelved volume, the filed folder, the tabulated grid, the flood, and the
understood spine. The vertex shader interpolates between them from a single
scroll uniform, and the camera runs a seven-station Catmull-Rom path through
the same value.

Nothing fades. Every leaf that exists at the end existed at the beginning; it
has only been rearranged. That is the whole argument of the site, expressed as
geometry.

Attributes are packed to eleven to stay inside the 16-attribute floor that WebGL
actually guarantees. The material is a raw `ShaderMaterial`, which bypasses
three's output colour management, so the fragment shader gamma-encodes itself.

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

- `?t=0.62` — pin the journey to a moment and skip the scroll listener
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

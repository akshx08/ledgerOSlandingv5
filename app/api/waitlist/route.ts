import { NextResponse } from "next/server";

/**
 * POST /api/waitlist — store a signup.
 *
 * Backed by Supabase REST when the deployment provides:
 *   SUPABASE_URL                  e.g. https://xyz.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY    server-only; never NEXT_PUBLIC
 *
 * Table (the migration is in the README):
 *   waitlist(id, name, email unique, firm, role, city, clients, created_at)
 *
 * Unconfigured deployments return 503 and the form shows an honest email
 * fallback — this endpoint never fakes a success (the honeypot below is the
 * one exception: bots get a hollow 200 so they don't retry).
 */

/** hard caps — the endpoint is public and writes with the service role */
const LIMITS: Record<string, number> = {
  name: 120,
  email: 254,
  firm: 160,
  role: 60,
  city: 80,
  clients: 40,
};

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 });
  }
  // JSON.parse("null") parses fine — guard the shape, not just the parse
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 });
  }
  const b = body as Record<string, unknown>;

  // honeypot: real users never see the field, bots fill it — hollow success
  if (typeof b.website === "string" && b.website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const take = (k: keyof typeof LIMITS) => String(b[k] ?? "").trim();
  const name = take("name");
  const email = take("email").toLowerCase();
  const firm = take("firm");
  const role = take("role");
  const city = take("city");
  const clients = take("clients");

  const overLimit = Object.entries({ name, email, firm, role, city, clients }).some(
    ([k, v]) => v.length > LIMITS[k]
  );
  if (overLimit || !name || !firm || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return NextResponse.json({ ok: false, error: "unconfigured" }, { status: 503 });
  }

  let res: Response;
  try {
    res = await fetch(`${url.replace(/\/$/, "")}/rest/v1/waitlist`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        name,
        email,
        firm,
        role: role || null,
        city: city || null,
        clients: clients || null,
      }),
      cache: "no-store",
    });
  } catch {
    // DNS/TLS/outage/malformed SUPABASE_URL — keep the JSON error contract
    return NextResponse.json({ ok: false, error: "upstream" }, { status: 502 });
  }

  // duplicate email — they're already on the list; that's a success
  if (res.status === 409) return NextResponse.json({ ok: true, duplicate: true });

  if (!res.ok) {
    return NextResponse.json({ ok: false, error: "upstream" }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}

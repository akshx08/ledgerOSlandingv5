/**
 * LedgerOS — all copy, one file. The brand is LedgerOS alone.
 *
 * Capability claims track what the product repository actually ships:
 * document inbox and field extraction, clients, GST (GSTR-2B, GSTR-1 review,
 * reconciliation), TDS (Form 26AS), purchase register, invoices, compliance,
 * copilot, Tally export. Prediction is the one forward-looking room and says
 * so in its own words.
 */

export const BRAND = {
  name: "LedgerOS",
  line: "The next form of the ledger.",
  contact: "akshx08@gmail.com",
};

export const CTA = { href: "/waitlist", label: "Request access" };

export const ROUTE = [
  { href: "/", label: "The Long Ledger" },
  { href: "/vault/document", label: "Document" },
  { href: "/vault/memory", label: "Memory" },
  { href: "/vault/intelligence", label: "Intelligence" },
  { href: "/vault/automation", label: "Automation" },
  { href: "/vault/prediction", label: "Prediction" },
];

/**
 * The journey. Each beat is pinned to a point in the camera move, and the
 * copy is deliberately sparse — the visitor is meant to be watching, not
 * reading, until the arrival.
 */
export const JOURNEY = [
  {
    at: 0.0,
    era: "Bahi-khata",
    note: "A single book. One hand. Everything the business is, written down once and trusted.",
  },
  {
    at: 0.17,
    era: "Press",
    note: "Printed and bound. More of it, faster, and for the first time not written by the person who knew it.",
  },
  {
    at: 0.34,
    era: "Cabinet",
    note: "Filed. Findable, in principle, by someone who knows where to look.",
  },
  {
    at: 0.5,
    era: "Sheet",
    note: "Tabulated. The grid arrives and never leaves. Arithmetic gets easy; meaning gets harder.",
  },
  {
    at: 0.67,
    era: "Network",
    note: "Everywhere at once. Mail, drives, portals, phones. Nothing is lost and nothing can be found.",
  },
  {
    at: 0.84,
    era: "Flood",
    note: "More record than any practice can read. The information is complete and the understanding is gone.",
  },
];

export const ARRIVAL = {
  head: ["Accounting never", "evolved.", "Only its paper did."],
  sub: "Every form the ledger has taken changed how much a business could record — and none of them changed what it takes to understand one. That is the part LedgerOS is for.",
  cue: "Begin",
};

export const PROBLEM = {
  head: "Nothing connects",
  body: "A practice today holds more of a client's financial life than any bookkeeper in history, spread across more places than any of them would have tolerated.",
  places: [
    "GST portal",
    "Purchase register",
    "Bank statements",
    "WhatsApp",
    "Email attachments",
    "Tally",
    "Excel",
    "Scanned PDFs",
    "Form 26AS",
    "Client's phone",
  ],
  note: "Each of these is complete on its own. None of them knows about any of the others.",
};

export const TURN = {
  head: ["Then something", "reads all of it."],
  body: "Not a faster filing system. A layer that reads every document a practice receives, resolves who and what it concerns, and holds the connections between them — so the record stops being a pile and starts being a model.",
  steps: [
    { k: "Reads", v: "Every document, whatever shape it arrives in, with a confidence attached to each field it lifts." },
    { k: "Resolves", v: "One client across every spelling, GSTIN and misfiled scan that names them." },
    { k: "Relates", v: "Purchase register against GSTR-2B. Deductions against 26AS. The gap is the output." },
    { k: "Remembers", v: "What was decided, when, and on what evidence — so the reasoning survives the staff turnover." },
  ],
};

export const VAULTS = {
  head: "Five rooms",
  body: "The same intelligence, entered from five directions. Each room is a different world because each is a different kind of thinking.",
  items: [
    {
      href: "/vault/document",
      label: "Document",
      tag: "An archive that rebuilds itself",
      body: "Where paper becomes structure. Every field lifted off a page, with the confidence that came with it.",
      real: "Document inbox, upload, field extraction",
    },
    {
      href: "/vault/memory",
      label: "Memory",
      tag: "Knowledge accumulates like rings",
      body: "Where the system keeps what it has understood, so a client is one identity across every document that names them.",
      real: "Clients, working folder, command palette",
    },
    {
      href: "/vault/intelligence",
      label: "Intelligence",
      tag: "A city built from records",
      body: "Where records find their counterparts. Purchase register against GSTR-2B, deductions against 26AS.",
      real: "GST reconciliation, GSTR-1 review, Form 26AS",
    },
    {
      href: "/vault/automation",
      label: "Automation",
      tag: "Systems that operate themselves",
      body: "Where conclusions become actions — inside limits the practice sets, every one of them reversible.",
      real: "Compliance calendar, Tally export",
    },
    {
      href: "/vault/prediction",
      label: "Prediction",
      tag: "Futures held simultaneously",
      body: "Where the model runs forward. Liability and position before the period closes, with the spread shown honestly.",
      real: null,
    },
  ],
};

export const ENDING = {
  head: ["No more paper.", "Only the record."],
  body: "The best infrastructure is the kind nobody thinks about. LedgerOS is not trying to be the thing a practice looks at all day — it is trying to be the reason they no longer have to.",
  quiet: "Quiet. Always working.",
};

/* ── rooms ──────────────────────────────────────────────────────────── */

export const DOCUMENT = {
  label: "Document",
  head: ["Paper in.", "Structure out."],
  body: "A document does not arrive as data. It arrives as a photograph of a page, often crooked, often the fourth generation of a copy. The first thing the system does is read it — and say how sure it is.",
  interaction: "Select a field to see where it was read from.",
  doc: {
    form: "GST · ASMT-10",
    from: "compliance@meridiantex.in",
    fields: [
      { k: "Document type", v: "GST · ASMT-10", c: 0.99 },
      { k: "Counterparty", v: "Meridian Textiles", c: 0.97 },
      { k: "GSTIN", v: "27AAACM····1Z5", c: 0.99 },
      { k: "Amount in dispute", v: "₹4,18,200", c: 0.94 },
      { k: "Reply due", v: "18 Aug 2026", c: 0.91 },
      { k: "Period", v: "FY 2025-26 · Q1", c: 0.72 },
    ],
  },
  note: "Confidence is shown because it is real. A field the system is unsure of is worth a glance; a field it is sure of is worth none of your attention.",
};

export const MEMORY = {
  label: "Memory",
  head: ["One client.", "Every mention."],
  body: "The same company arrives as a GSTIN on one document, a trade name on another, and a misspelling on a third. Memory is where those collapse into one identity — and stay collapsed.",
  interaction: "Hover a name to resolve it.",
  entity: {
    name: "Meridian Textiles",
    gstin: "27AAACM····1Z5",
    aliases: ["Meridian Textiles Pvt Ltd", "MERIDIAN TEX", "Meridian Textile"],
    rings: [
      { k: "Documents", v: "412", since: "Apr 2024" },
      { k: "Invoices", v: "168", since: "Apr 2024" },
      { k: "Open items", v: "2", since: "Jul 2026" },
      { k: "Decisions kept", v: "37", since: "Jun 2024" },
    ],
  },
  note: "Resolving an entity once is worth more than any single extraction, because every later inference depends on it having been right.",
};

export const INTELLIGENCE = {
  label: "Intelligence",
  head: ["Two records.", "One truth."],
  body: "Reconciliation is the whole job, and it is almost never done by looking at one document. Your purchase register says one thing. GSTR-2B says another. The work is in the gap.",
  interaction: "Open a pairing.",
  pairs: [
    { a: "Purchase register", b: "GSTR-2B", state: "matched", n: "1,204 lines" },
    { a: "TDS deducted", b: "Form 26AS", state: "matched", n: "318 entries" },
    { a: "Purchase register", b: "GSTR-2B", state: "differs", n: "37 lines", d: "₹2,14,880" },
    { a: "Sales register", b: "GSTR-1", state: "missing", n: "6 invoices" },
  ],
  note: "What reconciles goes quiet. What differs is the output — stated as an amount, not as a status.",
};

export const AUTOMATION = {
  label: "Automation",
  head: ["Conclusions", "become actions."],
  body: "A finding nobody acts on is a finding wasted. The last step is the system doing the mechanical part itself — inside limits you set, with every action logged and reversible.",
  interaction: "Follow a track to its outcome.",
  flows: [
    { k: "Filing due", v: "GSTR-3B · 20 Aug", d: "Tracked per client and surfaced before the date rather than after it." },
    { k: "Books out", v: "Tally export", d: "Reconciled ledgers pushed in the format the practice already runs on." },
    { k: "Register built", v: "Purchase · TDS", d: "Assembled from documents already parsed, not re-keyed from them." },
    { k: "Exception raised", v: "37 lines", d: "The short list a person actually needs to look at." },
  ],
  note: "Elegant automation is mostly restraint: it does the part that is genuinely mechanical, and it stops there.",
};

export const PREDICTION = {
  label: "Prediction",
  head: ["Before", "the period", "closes."],
  body: "Every branch here is a position the business could be in. The system runs the model forward from what it already understands and shows the range, never a single confident number.",
  interaction: "Move the assumption and watch the spread respond.",
  note: "This room is in development, and is written as such deliberately. The rest of the system is shipping; this is the direction it points.",
  branches: [
    { k: "Liability at close", v: "₹18.4L – ₹21.9L", c: 0.78 },
    { k: "Input credit available", v: "₹6.2L – ₹7.1L", c: 0.84 },
    { k: "Exceptions expected", v: "24 – 41 lines", c: 0.66 },
  ],
};

export const WAITLIST = {
  head: ["Bring us", "a practice."],
  body: "LedgerOS is being built with a small number of firms running it against their real document flow. In exchange the system gets shaped around what actually breaks in a working practice rather than what demonstrates well.",
  terms: [
    ["Real documents", "Your clients' actual notices, registers and statements. Not a sample set."],
    ["Direct line", "You talk to the people building it, and what you report changes the next build."],
    ["Leave with your data", "Export everything, any time. No exit negotiation."],
  ],
  form: {
    head: "Request access",
    note: "We onboard in small groups and reply personally.",
    fields: {
      name: "Name",
      email: "Work email",
      firm: "Firm",
      role: "Role",
      clients: "Clients handled",
      city: "City",
    },
    roles: ["Partner", "Chartered Accountant", "Articled assistant", "Staff accountant", "Other"],
    submit: "Request access",
    sending: "Sending",
    done: "Received.",
    doneSub: "We reply personally, usually within a few days.",
    invalid: "That didn't validate — check the email has a full domain, and that name and firm aren't blank.",
    unconfigured: "The store isn't connected on this deployment. Write to us directly and we'll add you by hand:",
    failed: "Something broke on our side. Try again, or write to",
  },
};

export const FOOT = { line: "LedgerOS — the next form of the ledger.", meta: "MMXXVI" };

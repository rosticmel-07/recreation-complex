import "server-only";
import { houses, type HouseSlug } from "@/data/houses";
import { addDays, overlaps, today, type Range } from "./dates";

export type BookingRequest = {
  house: HouseSlug;
  from: string;
  to: string;
  guests: number;
  name: string;
  phone: string;
  comment?: string;
  locale?: string;
};

export type Availability = {
  source: "sheets" | "demo";
  updatedAt: string;
  houses: Record<HouseSlug, Range[]>;
};

export class DatesTakenError extends Error {}

const SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;
const SCRIPT_TOKEN = process.env.GOOGLE_SCRIPT_TOKEN ?? "";

/* ---------- Demo store (used until a Google Sheet is connected) ---------- */

type DemoStore = Record<HouseSlug, Range[]>;
const g = globalThis as unknown as { __tyshaDemo?: DemoStore };

function demoStore(): DemoStore {
  if (!g.__tyshaDemo) {
    const t = today();
    const r = (a: number, b: number): Range => ({ from: addDays(t, a), to: addDays(t, b) });
    g.__tyshaDemo = {
      smereka: [r(1, 3), r(6, 8), r(13, 16), r(27, 30), r(41, 44)],
      polonyna: [r(0, 2), r(4, 6), r(11, 15), r(20, 22), r(34, 37)],
      vatra: [r(2, 5), r(8, 10), r(16, 19), r(29, 33), r(48, 51)],
    };
  }
  return g.__tyshaDemo;
}

/* ---------- Google Sheets via Apps Script ---------- */

async function sheetsAvailability(): Promise<Availability["houses"]> {
  const res = await fetch(`${SCRIPT_URL}?action=availability`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Apps Script responded ${res.status}`);
  const data = (await res.json()) as { houses: Record<string, Range[]> };
  const out = {} as Availability["houses"];
  for (const h of houses) out[h.slug] = data.houses[h.sheetName] ?? data.houses[h.slug] ?? [];
  return out;
}

async function sheetsCreate(req: BookingRequest) {
  const house = houses.find((h) => h.slug === req.house)!;
  const res = await fetch(SCRIPT_URL!, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ ...req, house: house.sheetName, token: SCRIPT_TOKEN }),
    cache: "no-store",
  });
  const data = (await res.json()) as { ok: boolean; error?: string; id?: string };
  if (!data.ok && data.error === "taken") throw new DatesTakenError();
  if (!data.ok) throw new Error(data.error ?? "Apps Script error");
  return data.id ?? "";
}

/* ---------- Public API ---------- */

export const isLive = () => Boolean(SCRIPT_URL);

export async function getAvailability(): Promise<Availability> {
  const data = isLive() ? await sheetsAvailability() : structuredClone(demoStore());
  return { source: isLive() ? "sheets" : "demo", updatedAt: new Date().toISOString(), houses: data };
}

export async function createBooking(req: BookingRequest): Promise<string> {
  const wanted: Range = { from: req.from, to: req.to };

  if (isLive()) {
    // The Apps Script re-checks overlaps under a lock; this is only a fast pre-check.
    const current = await sheetsAvailability();
    if (current[req.house].some((r) => overlaps(r, wanted))) throw new DatesTakenError();
    const id = await sheetsCreate(req);
    await notifyTelegram(req);
    return id;
  }

  const store = demoStore();
  if (store[req.house].some((r) => overlaps(r, wanted))) throw new DatesTakenError();
  store[req.house].push(wanted);
  await notifyTelegram(req);
  return `DEMO-${Date.now().toString(36).toUpperCase()}`;
}

async function notifyTelegram(req: BookingRequest) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) return;
  const house = houses.find((h) => h.slug === req.house)!;
  const text = [
    `Нова заявка з сайту: ${house.name.uk}`,
    `${req.from} → ${req.to}, гостей: ${req.guests}`,
    `${req.name}, ${req.phone}`,
    req.comment ? `Побажання: ${req.comment}` : "",
  ]
    .filter(Boolean)
    .join("\n");
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chat, text }),
    });
  } catch {
    // A failed notification must not fail the booking itself.
  }
}

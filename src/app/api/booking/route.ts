import { NextResponse } from "next/server";
import { houseBySlug } from "@/data/houses";
import { createBooking, DatesTakenError, type BookingRequest } from "@/lib/bookings";
import { isValidISO, nightsBetween, today } from "@/lib/dates";

export async function POST(request: Request) {
  let body: Partial<BookingRequest>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  const house = houseBySlug(String(body.house ?? ""));
  const name = String(body.name ?? "").trim().slice(0, 120);
  const phone = String(body.phone ?? "").trim().slice(0, 40);
  const comment = String(body.comment ?? "").trim().slice(0, 1000);
  const guests = Number(body.guests);
  const { from, to } = body;

  const valid =
    house &&
    isValidISO(from) &&
    isValidISO(to) &&
    from >= today() &&
    nightsBetween(from, to) >= 1 &&
    nightsBetween(from, to) <= 60 &&
    name.length > 0 &&
    phone.replace(/\D/g, "").length >= 9 &&
    Number.isInteger(guests) &&
    guests >= 1 &&
    guests <= house.guests;

  if (!valid) return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });

  try {
    const id = await createBooking({
      house: house.slug,
      from,
      to,
      guests,
      name,
      phone,
      comment,
      locale: body.locale === "en" ? "en" : "uk",
    });
    return NextResponse.json({ ok: true, id });
  } catch (e) {
    if (e instanceof DatesTakenError) {
      return NextResponse.json({ ok: false, error: "taken" }, { status: 409 });
    }
    console.error(e);
    return NextResponse.json({ ok: false, error: "server" }, { status: 502 });
  }
}

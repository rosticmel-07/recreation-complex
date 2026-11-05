import { NextResponse } from "next/server";
import { getAvailability } from "@/lib/bookings";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await getAvailability(), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "unavailable" }, { status: 502 });
  }
}

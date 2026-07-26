import { DateTime } from "luxon";
import { NextResponse } from "next/server";
import { calendarApiError } from "@/lib/api-error";
import { getBusy } from "@/lib/google-calendar";
import { prisma } from "@/lib/prisma";
import { buildSlots } from "@/lib/slots";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const type = await prisma.bookingType.findUnique({ where: { slug } });
    if (!type?.active) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const from = DateTime.now().setZone(type.timezone).startOf("day");
    const until = from.plus({ days: 14 });
    const [googleBusy, bookings] = await Promise.all([
      getBusy(type.userId, from.toJSDate(), until.toJSDate()),
      prisma.booking.findMany({
        where: { bookingType: { userId: type.userId }, startsAt: { lt: until.toJSDate() }, endsAt: { gt: from.toJSDate() } },
        select: { startsAt: true, endsAt: true },
      }),
    ]);
    const busy = [
      ...googleBusy,
      ...bookings.map((b) => ({ start: b.startsAt.toISOString(), end: b.endsAt.toISOString() })),
    ];
    return NextResponse.json({
      timezone: type.timezone,
      slots: buildSlots({ from, days: 14, durationMin: type.durationMin, timezone: type.timezone, startHour: type.startHour, endHour: type.endHour, weekdays: type.weekdays, busy }),
    });
  } catch (error) {
    return calendarApiError(error);
  }
}

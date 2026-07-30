import { DateTime } from "luxon";
import { NextResponse } from "next/server";
import { calendarApiError } from "@/lib/api-error";
import { getBusy, getCalendarWindows } from "@/lib/google-calendar";
import { prisma } from "@/lib/prisma";
import { buildSlots } from "@/lib/slots";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const type = await prisma.bookingType.findUnique({ where: { slug } });
    if (!type?.active) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const from = DateTime.now().setZone(type.timezone).startOf("day");
    const until = from.plus({ days: type.availabilityDays });
    const [calendarAvailability, bookings] = await Promise.all([
      type.availabilityMode === "EVENT" && type.sourceEventTitle
        ? getCalendarWindows(type.userId, type.sourceEventTitle, from.toJSDate(), until.toJSDate())
        : getBusy(type.userId, from.toJSDate(), until.toJSDate()).then((busy) => ({ busy, allowed: undefined })),
      prisma.booking.findMany({
        where: { bookingType: { userId: type.userId }, startsAt: { lt: until.toJSDate() }, endsAt: { gt: from.toJSDate() } },
        select: { startsAt: true, endsAt: true },
      }),
    ]);
    const busy = [
      ...calendarAvailability.busy,
      ...bookings.map((b) => ({ start: b.startsAt.toISOString(), end: b.endsAt.toISOString() })),
    ];
    return NextResponse.json({
      timezone: type.timezone,
      slots: buildSlots({
        from,
        days: type.availabilityDays,
        durationMin: type.durationMin,
        timezone: type.timezone,
        startHour: type.availabilityMode === "EVENT" ? 0 : type.startHour,
        endHour: type.availabilityMode === "EVENT" ? 24 : type.endHour,
        weekendStartHour: type.availabilityMode === "EVENT" ? 0 : type.weekendStartHour,
        weekendEndHour: type.availabilityMode === "EVENT" ? 24 : type.weekendEndHour,
        weekdays: type.availabilityMode === "EVENT" ? [1, 2, 3, 4, 5, 6, 7] : type.weekdays,
        busy,
        allowed: calendarAvailability.allowed,
      }),
    });
  } catch (error) {
    return calendarApiError(error);
  }
}

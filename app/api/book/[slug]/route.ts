import { randomUUID } from "crypto";
import { DateTime } from "luxon";
import { NextResponse } from "next/server";
import { z } from "zod";
import { calendarApiError } from "@/lib/api-error";
import { calendarForUser, getBusy } from "@/lib/google-calendar";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  startsAt: z.string().datetime(),
  guestName: z.string().min(2).max(100),
  guestEmail: z.string().email(),
  notes: z.string().max(1000).optional(),
});

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Проверьте данные" }, { status: 400 });
    const type = await prisma.bookingType.findUnique({ where: { slug }, include: { user: true } });
    if (!type?.active) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const start = DateTime.fromISO(parsed.data.startsAt).toUTC();
    const end = start.plus({ minutes: type.durationMin });
    if (start <= DateTime.utc()) return NextResponse.json({ error: "Это время уже прошло" }, { status: 409 });

    const [busy, existing] = await Promise.all([
      getBusy(type.userId, start.toJSDate(), end.toJSDate()),
      prisma.booking.findFirst({ where: { bookingType: { userId: type.userId }, startsAt: { lt: end.toJSDate() }, endsAt: { gt: start.toJSDate() } } }),
    ]);
    if (busy.length || existing) return NextResponse.json({ error: "Это время только что заняли. Выберите другое." }, { status: 409 });

    const calendar = await calendarForUser(type.userId);
    const event = await calendar.events.insert({
      calendarId: "primary",
      conferenceDataVersion: 1,
      sendUpdates: "all",
      requestBody: {
        summary: `${type.title} — ${parsed.data.guestName}`,
        description: [type.description, parsed.data.notes && `Комментарий гостя: ${parsed.data.notes}`].filter(Boolean).join("\n\n"),
        start: { dateTime: start.toISO()!, timeZone: type.timezone },
        end: { dateTime: end.toISO()!, timeZone: type.timezone },
        attendees: [{ email: parsed.data.guestEmail, displayName: parsed.data.guestName }],
        conferenceData: { createRequest: { requestId: randomUUID(), conferenceSolutionKey: { type: "hangoutsMeet" } } },
      },
    });

    try {
      const booking = await prisma.booking.create({
        data: {
          bookingTypeId: type.id,
          guestName: parsed.data.guestName,
          guestEmail: parsed.data.guestEmail,
          notes: parsed.data.notes || null,
          startsAt: start.toJSDate(),
          endsAt: end.toJSDate(),
          googleEventId: event.data.id,
          meetUrl: event.data.hangoutLink,
        },
      });
      return NextResponse.json({ id: booking.id, meetUrl: booking.meetUrl, startsAt: booking.startsAt });
    } catch (error) {
      console.error("Failed to save booking", error);
      if (event.data.id) await calendar.events.delete({ calendarId: "primary", eventId: event.data.id }).catch(() => undefined);
      return NextResponse.json({ error: "Не удалось сохранить бронь" }, { status: 409 });
    }
  } catch (error) {
    return calendarApiError(error);
  }
}

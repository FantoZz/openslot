import { randomUUID } from "crypto";
import { DateTime } from "luxon";
import { NextResponse } from "next/server";
import { z } from "zod";
import { calendarApiError } from "@/lib/api-error";
import { calendarForUser, getBusy, getCalendarWindows } from "@/lib/google-calendar";
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
    if (!parsed.success) return NextResponse.json({ error: "Перевірте дані" }, { status: 400 });
    const type = await prisma.bookingType.findUnique({ where: { slug }, include: { user: true } });
    if (!type?.active) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const start = DateTime.fromISO(parsed.data.startsAt).toUTC();
    const end = start.plus({ minutes: type.durationMin });
    if (start <= DateTime.utc()) {
      return NextResponse.json({ error: "Цей час уже минув" }, { status: 409 });
    }
    if (type.availabilityDate && start.setZone(type.timezone).toISODate() !== type.availabilityDate) {
      return NextResponse.json({ error: "Цей час не належить до вибраної дати." }, { status: 409 });
    }

    const [calendarAvailability, existing] = await Promise.all([
      type.availabilityMode === "EVENT" && type.sourceEventTitle
        ? getCalendarWindows(type.userId, type.sourceEventTitle, start.toJSDate(), end.toJSDate())
        : getBusy(type.userId, start.toJSDate(), end.toJSDate()).then((busy) => ({ busy, allowed: undefined })),
      prisma.booking.findFirst({
        where: {
          bookingType: { userId: type.userId },
          startsAt: { lt: end.toJSDate() },
          endsAt: { gt: start.toJSDate() },
        },
      }),
    ]);
    const isInsideAllowedWindow = !calendarAvailability.allowed || calendarAvailability.allowed.some((window) => {
      return start >= DateTime.fromISO(window.start) && end <= DateTime.fromISO(window.end);
    });
    if (calendarAvailability.busy.length || existing || !isInsideAllowedWindow) {
      return NextResponse.json({ error: "Цей час уже недоступний. Оберіть інший." }, { status: 409 });
    }

    if (type.singleUse) {
      const claimed = await prisma.bookingType.updateMany({
        where: { id: type.id, active: true },
        data: { active: false },
      });
      if (claimed.count !== 1) {
        return NextResponse.json({ error: "Це посилання вже використано." }, { status: 409 });
      }
    }

    const calendar = await calendarForUser(type.userId);
    let event;
    try {
      event = await calendar.events.insert({
        calendarId: "primary",
        conferenceDataVersion: 1,
        sendUpdates: "all",
        requestBody: {
          summary: `${type.title} — ${parsed.data.guestName}`,
          description: [
            type.description,
            parsed.data.notes && `Коментар гостя: ${parsed.data.notes}`,
          ].filter(Boolean).join("\n\n"),
          start: { dateTime: start.toISO()!, timeZone: type.timezone },
          end: { dateTime: end.toISO()!, timeZone: type.timezone },
          attendees: [{ email: parsed.data.guestEmail, displayName: parsed.data.guestName }],
          conferenceData: {
            createRequest: {
              requestId: randomUUID(),
              conferenceSolutionKey: { type: "hangoutsMeet" },
            },
          },
        },
      });
    } catch (error) {
      if (type.singleUse) {
        await prisma.bookingType.update({
          where: { id: type.id },
          data: { active: true },
        }).catch(() => undefined);
      }
      throw error;
    }

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
      if (event.data.id) {
        await calendar.events.delete({ calendarId: "primary", eventId: event.data.id }).catch(() => undefined);
      }
      if (type.singleUse) {
        await prisma.bookingType.update({
          where: { id: type.id },
          data: { active: true },
        }).catch(() => undefined);
      }
      return NextResponse.json({ error: "Не вдалося зберегти бронювання" }, { status: 409 });
    }
  } catch (error) {
    return calendarApiError(error);
  }
}

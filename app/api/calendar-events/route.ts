import { DateTime } from "luxon";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { calendarApiError } from "@/lib/api-error";
import { findCalendarEventTitles } from "@/lib/google-calendar";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Не авторизовано" }, { status: 401 });
  }
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (query.length < 2) return NextResponse.json({ events: [] });

  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: { email: session.user.email },
      select: { id: true },
    });
    const from = DateTime.utc();
    const events = await findCalendarEventTitles(
      user.id,
      query,
      from.toJSDate(),
      from.plus({ days: 90 }).toJSDate(),
    );
    return NextResponse.json({ events });
  } catch (error) {
    return calendarApiError(error);
  }
}

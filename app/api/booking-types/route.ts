import { randomBytes } from "crypto";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  title: z.string().min(3).max(100),
  slug: z.union([z.string().regex(/^[a-z0-9-]+$/).min(3).max(60), z.literal("")]).optional(),
  description: z.string().max(1000).optional(),
  durationMin: z.coerce.number().int().min(15).max(480),
  availabilityDays: z.coerce.number().int().min(1).max(90),
  timezone: z.string().min(3),
  startHour: z.coerce.number().int().min(0).max(23),
  endHour: z.coerce.number().int().min(1).max(24),
  weekendStartHour: z.coerce.number().int().min(0).max(23).default(10),
  weekendEndHour: z.coerce.number().int().min(1).max(24).default(16),
  includeWeekends: z.boolean().default(false),
  availabilityMode: z.enum(["FREE", "EVENT"]),
  sourceEventTitle: z.string().max(200).optional(),
  singleUse: z.boolean().default(false),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Не авторизовано" }, { status: 401 });
  const parsed = schema.safeParse(await request.json());
  if (
    !parsed.success ||
    parsed.data.startHour >= parsed.data.endHour ||
    (parsed.data.includeWeekends && parsed.data.weekendStartHour >= parsed.data.weekendEndHour) ||
    (parsed.data.availabilityMode === "EVENT" && !parsed.data.sourceEventTitle?.trim())
  ) {
    return NextResponse.json({ error: "Перевірте заповнені поля" }, { status: 400 });
  }
  const user = await prisma.user.findUniqueOrThrow({ where: { email: session.user.email } });
  try {
    const { includeWeekends, ...data } = parsed.data;
    const slug = data.slug || `meeting-${randomBytes(3).toString("hex")}`;
    const bookingType = await prisma.bookingType.create({
      data: {
        ...data,
        slug,
        description: data.description || null,
        sourceEventTitle: data.availabilityMode === "EVENT" ? data.sourceEventTitle?.trim() : null,
        weekdays: includeWeekends ? [1, 2, 3, 4, 5, 6, 7] : [1, 2, 3, 4, 5],
        userId: user.id,
      },
    });
    return NextResponse.json(bookingType, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Таке посилання вже зайняте" }, { status: 409 });
  }
}

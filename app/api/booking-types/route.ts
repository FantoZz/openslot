import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  title: z.string().min(3).max(100),
  slug: z.string().regex(/^[a-z0-9-]+$/).min(3).max(60),
  description: z.string().max(1000).optional(),
  durationMin: z.coerce.number().int().min(15).max(480),
  timezone: z.string().min(3),
  startHour: z.coerce.number().int().min(0).max(23),
  endHour: z.coerce.number().int().min(1).max(24),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success || parsed.data.startHour >= parsed.data.endHour) {
    return NextResponse.json({ error: "Проверьте заполненные поля" }, { status: 400 });
  }
  const user = await prisma.user.findUniqueOrThrow({ where: { email: session.user.email } });
  try {
    const bookingType = await prisma.bookingType.create({
      data: { ...parsed.data, description: parsed.data.description || null, userId: user.id },
    });
    return NextResponse.json(bookingType, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Такая ссылка уже занята" }, { status: 409 });
  }
}

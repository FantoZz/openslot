import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Не авторизовано" }, { status: 401 });

  const { id } = await params;
  const result = await prisma.bookingType.updateMany({
    where: { id, active: true, user: { email: session.user.email } },
    data: { active: false },
  });

  if (!result.count) return NextResponse.json({ error: "Сторінку не знайдено" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

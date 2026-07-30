import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { BookingForm } from "@/components/booking-form";
import { prisma } from "@/lib/prisma";

type BookingPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: BookingPageProps): Promise<Metadata> {
  const { slug } = await params;
  const type = await prisma.bookingType.findUnique({
    where: { slug },
    select: { title: true, description: true, active: true },
  });

  if (!type?.active) {
    return { title: "Зустріч недоступна — MATAS University" };
  }

  const title = `${type.title} — MATAS University`;
  const description =
    type.description?.trim() || "Оберіть зручний час і забронюйте зустріч";

  return {
    title,
    description,
    alternates: { canonical: `/book/${slug}` },
    openGraph: {
      type: "website",
      locale: "uk_UA",
      siteName: "OpenSlot — MATAS University",
      url: `/book/${slug}`,
      title,
      description,
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: "OpenSlot — планувальник зустрічей MATAS University",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/opengraph-image"],
    },
  };
}

export default async function BookingPage({ params }: BookingPageProps) {
  const { slug } = await params;
  const type = await prisma.bookingType.findUnique({
    where: { slug },
    include: { user: { select: { name: true } } },
  });

  if (!type?.active) notFound();

  return (
    <main className="shell booking-shell">
      <nav className="nav">
        <BrandLogo />
        <span className="meta">{type.timezone}</span>
      </nav>
      <section className="card">
        <p>Зустріч з {type.user.name || "організатором"}</p>
        <h1 className="booking-title">{type.title}</h1>
        <p>{type.description}</p>
        <p>
          <strong>{type.durationMin} хвилин</strong> · Google Meet
        </p>
        <BookingForm
          slug={type.slug}
          timezone={type.timezone}
          availabilityDays={type.availabilityDays}
          availabilityDate={type.availabilityDate}
        />
      </section>
    </main>
  );
}

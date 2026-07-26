import { notFound } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { BookingForm } from "@/components/booking-form";
import { prisma } from "@/lib/prisma";

export default async function BookingPage({ params }:{params:Promise<{slug:string}>}) {
  const {slug}=await params;
  const type=await prisma.bookingType.findUnique({where:{slug},include:{user:{select:{name:true}}}});
  if(!type?.active) notFound();
  return <main className="shell booking-shell"><nav className="nav"><BrandLogo /><span className="meta">{type.timezone}</span></nav><section className="card">
    <p>Зустріч з {type.user.name || "організатором"}</p><h1 className="booking-title">{type.title}</h1><p>{type.description}</p><p><strong>{type.durationMin} хвилин</strong> · Google Meet</p><BookingForm slug={type.slug} timezone={type.timezone} availabilityDays={type.availabilityDays} />
  </section></main>;
}

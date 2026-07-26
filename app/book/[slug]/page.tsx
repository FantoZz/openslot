import { notFound } from "next/navigation";
import { BookingForm } from "@/components/booking-form";
import { prisma } from "@/lib/prisma";

export default async function BookingPage({ params }:{params:Promise<{slug:string}>}) {
  const {slug}=await params;
  const type=await prisma.bookingType.findUnique({where:{slug},include:{user:{select:{name:true}}}});
  if(!type?.active) notFound();
  return <main className="shell" style={{maxWidth:760}}><nav className="nav"><span className="logo">MeetSlot</span><span className="meta">{type.timezone}</span></nav><section className="card">
    <p>Встреча с {type.user.name || "организатором"}</p><h1 style={{fontSize:48}}>{type.title}</h1><p>{type.description}</p><p><strong>{type.durationMin} минут</strong> · Google Meet</p><BookingForm slug={type.slug} timezone={type.timezone} availabilityDays={type.availabilityDays} />
  </section></main>;
}

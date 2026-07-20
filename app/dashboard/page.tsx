import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthButton } from "@/components/auth-button";
import { CreateBookingType } from "@/components/create-booking-type";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/");
  const types = await prisma.bookingType.findMany({ where:{ user:{ email:session.user.email } }, orderBy:{ createdAt:"desc" } });
  return <main className="shell">
    <nav className="nav"><Link className="logo" href="/">MeetSlot</Link><AuthButton signedIn /></nav>
    <h1 style={{fontSize:52}}>Ваши встречи</h1>
    <div className="grid">
      <section className="card"><h2>Новый тип встречи</h2><CreateBookingType /></section>
      <section><h2>Ссылки</h2>{types.length === 0 ? <p>Пока нет ни одной. Создайте первую.</p> : types.map((type) => <div className="card" key={type.id} style={{marginBottom:12}}>
        <h3>{type.title}</h3><p>{type.durationMin} минут · {type.startHour}:00–{type.endHour}:00 · {type.timezone}</p>
        <Link href={`/book/${type.slug}`}>Открыть страницу →</Link>
      </div>)}</section>
    </div>
  </main>;
}

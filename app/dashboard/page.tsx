import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { AuthButton } from "@/components/auth-button";
import { BrandLogo } from "@/components/brand-logo";
import { CreateBookingType } from "@/components/create-booking-type";
import { CopyBookingLink } from "@/components/copy-booking-link";
import { DeleteBookingType } from "@/components/delete-booking-type";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/");
  const types = await prisma.bookingType.findMany({ where:{ active:true, user:{ email:session.user.email } }, orderBy:{ createdAt:"desc" } });
  return <main className="shell">
    <nav className="nav"><BrandLogo /><AuthButton signedIn /></nav>
    <span className="eyebrow">Планувальник MATAS</span>
    <h1 className="dashboard-title">Ваші зустрічі</h1>
    <div className="grid">
      <section className="card"><h2>Новий формат зустрічі</h2><CreateBookingType /></section>
      <section><h2>Посилання</h2><p className="section-note">Кожен формат працює як планувальник: різні люди можуть бронювати різні вільні слоти.</p>{types.length === 0 ? <p>Поки що немає жодного. Створіть перший.</p> : types.map((type) => <article className="card booking-type-card" key={type.id}>
        <DeleteBookingType id={type.id} title={type.title} />
        <h3>{type.title}</h3><p>{type.durationMin} хв · {type.startHour}:00–{type.endHour}:00 · {type.timezone}</p>
        <div className="booking-link-actions">
          <a href={`/book/${type.slug}`}>Відкрити сторінку →</a>
          <CopyBookingLink path={`/book/${type.slug}`} />
        </div>
      </article>)}</section>
    </div>
  </main>;
}

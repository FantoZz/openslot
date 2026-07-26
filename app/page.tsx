import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { AuthButton } from "@/components/auth-button";
import { BrandLogo } from "@/components/brand-logo";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);
  return <main className="shell">
    <nav className="nav"><BrandLogo /><AuthButton signedIn={!!session} /></nav>
    <section className="hero">
      <Image className="hero-mark" src="/matas-mark.svg" alt="" width={153} height={177} aria-hidden="true" />
      <span className="eyebrow">MATAS University Planner</span>
      <h1>Зустрічі без листування про вільний час.</h1>
      <p>Створіть формат зустрічі та надішліть одне посилання. Кожен гість обере власний вільний слот, а Google Calendar додасть подію та Google Meet.</p>
      {session && <Link className="button" href="/dashboard">Відкрити кабінет</Link>}
    </section>
    <section className="grid">
      <div className="card"><h3>Без конфліктів</h3><p>Зайняті проміжки Google Calendar автоматично приховуються.</p></div>
      <div className="card"><h3>Google Meet</h3><p>Посилання на відеозустріч створюється разом із подією.</p></div>
      <div className="card"><h3>Одне посилання</h3><p>Необмежена кількість гостей може бронювати різні доступні слоти.</p></div>
    </section>
  </main>;
}

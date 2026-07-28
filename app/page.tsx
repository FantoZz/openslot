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
      <span className="eyebrow">MATAS University</span>
      <h1>OpenSlot — планувальник зустрічей</h1>
      <p>OpenSlot допомагає організаторам створювати сторінки бронювання, а гостям — обирати вільний час без листування. Після бронювання сервіс створює подію в Google Calendar і посилання Google Meet.</p>
      {session && <Link className="button" href="/dashboard">Відкрити кабінет</Link>}
    </section>
    <section className="grid">
      <div className="card"><h3>Без конфліктів</h3><p>Зайняті проміжки Google Calendar автоматично приховуються.</p></div>
      <div className="card"><h3>Google Meet</h3><p>Посилання на відеозустріч створюється разом із подією.</p></div>
      <div className="card"><h3>Одне посилання</h3><p>Необмежена кількість гостей може бронювати різні доступні слоти.</p></div>
    </section>
    <section className="google-data-note">
      <h2>Як OpenSlot використовує Google Calendar</h2>
      <p>OpenSlot перевіряє зайняті проміжки календаря організатора, щоб не пропонувати гостям час із конфліктами, та створює підтверджені зустрічі з Google Meet. Дані календаря не використовуються для реклами й не продаються.</p>
    </section>
    <footer className="site-footer">
      <span>© {new Date().getFullYear()} MATAS University</span>
      <Link href="/privacy">Політика конфіденційності</Link>
      <Link href="/terms">Умови використання</Link>
      <a href="mailto:yevgeniif@gmail.com">Підтримка</a>
    </footer>
  </main>;
}

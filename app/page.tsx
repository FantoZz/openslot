import { getServerSession } from "next-auth";
import Link from "next/link";
import { AuthButton } from "@/components/auth-button";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);
  return <main className="shell">
    <nav className="nav"><span className="logo">MeetSlot</span><AuthButton signedIn={!!session} /></nav>
    <section className="hero">
      <p>Ваш календарь. Ваше время.</p>
      <h1>Встречи без переписки о свободных окнах.</h1>
      <p>Создайте тип встречи, отправьте ссылку — гость выберет время, а Google Calendar добавит событие и ссылку Google Meet.</p>
      {session && <Link className="button" href="/dashboard">Открыть кабинет</Link>}
    </section>
    <section className="grid">
      <div className="card"><h3>Без конфликтов</h3><p>Занятые интервалы Google Calendar автоматически скрыты.</p></div>
      <div className="card"><h3>Google Meet</h3><p>Ссылка на видеовстречу создаётся вместе с событием.</p></div>
      <div className="card"><h3>Одна ссылка</h3><p>Отправляйте её лидам, кандидатам или клиентам.</p></div>
    </section>
  </main>;
}

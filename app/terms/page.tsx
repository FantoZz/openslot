import type { Metadata } from "next";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export const metadata: Metadata = {
  title: "Умови використання — OpenSlot",
  description: "Умови використання планувальника зустрічей OpenSlot MATAS University.",
};

export default function TermsPage() {
  return (
    <main className="shell legal-page">
      <nav className="nav"><BrandLogo /><Link href="/">На головну</Link></nav>
      <article className="card legal-card">
        <p className="eyebrow">OpenSlot · MATAS University</p>
        <h1>Умови використання</h1>
        <p className="meta">Останнє оновлення: 28 липня 2026 року</p>

        <h2>1. Призначення сервісу</h2>
        <p>OpenSlot допомагає організаторам публікувати доступний час, а гостям — бронювати зустрічі, які додаються до Google Calendar разом із Google Meet.</p>

        <h2>2. Обліковий запис і доступ</h2>
        <p>Організатор відповідає за безпеку свого Google Account і за правомірність надання OpenSlot доступу до календаря. Доступ можна відкликати в налаштуваннях Google Account.</p>

        <h2>3. Правила використання</h2>
        <p>Заборонено використовувати OpenSlot для спаму, незаконної діяльності, введення інших осіб в оману, несанкціонованого збору даних або створення шкідливих подій і запрошень.</p>

        <h2>4. Надійність сервісу</h2>
        <p>Ми докладаємо розумних зусиль для безперервної роботи, але не гарантуємо абсолютну відсутність перебоїв у роботі OpenSlot, Google Calendar, Google Meet, мережі або зовнішніх постачальників.</p>

        <h2>5. Відповідальність</h2>
        <p>Організатор самостійно перевіряє коректність розкладу й створених подій. У межах, дозволених законом, MATAS University не відповідає за непрямі збитки, пропущені зустрічі або перебої сторонніх сервісів.</p>

        <h2>6. Конфіденційність</h2>
        <p>Обробка персональних даних описана в <Link href="/privacy">Політиці конфіденційності</Link>.</p>

        <h2>7. Контакти</h2>
        <p>Запитання щодо цих умов можна надіслати на <a href="mailto:yevgeniif@gmail.com">yevgeniif@gmail.com</a>.</p>
      </article>
    </main>
  );
}

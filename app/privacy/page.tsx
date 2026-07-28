import type { Metadata } from "next";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export const metadata: Metadata = {
  title: "Політика конфіденційності — OpenSlot",
  description: "Як OpenSlot MATAS University обробляє персональні дані та дані Google Calendar.",
};

export default function PrivacyPage() {
  return (
    <main className="shell legal-page">
      <nav className="nav"><BrandLogo /><Link href="/">На головну</Link></nav>
      <article className="card legal-card">
        <p className="eyebrow">OpenSlot · MATAS University</p>
        <h1>Політика конфіденційності</h1>
        <p className="meta">Останнє оновлення: 28 липня 2026 року</p>

        <h2>1. Хто обробляє дані</h2>
        <p>OpenSlot — сервіс планування зустрічей MATAS University. Із питань конфіденційності або видалення даних звертайтеся на <a href="mailto:yevgeniif@gmail.com">yevgeniif@gmail.com</a>.</p>

        <h2>2. Які дані ми отримуємо</h2>
        <ul>
          <li>під час входу організатора через Google: ім’я, email, ідентифікатор облікового запису та OAuth-токени;</li>
          <li>з Google Calendar: інформацію про зайняті часові проміжки, необхідну для перевірки доступності;</li>
          <li>для створення зустрічі: назву й опис події, час, учасників та посилання Google Meet;</li>
          <li>від гостя: ім’я, email, обраний час і необов’язковий коментар;</li>
          <li>технічні session cookies, потрібні для безпечної авторизації.</li>
        </ul>

        <h2>3. Як використовуються дані Google</h2>
        <p>OpenSlot використовує доступ до Google Calendar виключно для того, щоб:</p>
        <ul>
          <li>визначати зайняті проміжки та приховувати конфліктні слоти;</li>
          <li>створювати підтверджені календарні події;</li>
          <li>додавати гостя до події та створювати Google Meet.</li>
        </ul>
        <p>OpenSlot не читає вміст подій для реклами, не продає дані Google, не передає їх рекламним платформам і не використовує для навчання моделей штучного інтелекту. Використання інформації, отриманої від Google APIs, відповідає <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noreferrer">Google API Services User Data Policy</a>, включно з вимогами Limited Use.</p>

        <h2>4. Кому передаються дані</h2>
        <p>Дані передаються Google лише в обсязі, потрібному для OAuth, Calendar і Meet. Дані гостя додаються до календарної події організатора та можуть бути видимі запрошеним учасникам. Ми не продаємо персональні дані й не передаємо їх стороннім маркетинговим компаніям.</p>

        <h2>5. Зберігання і захист</h2>
        <p>Дані зберігаються в приватній базі PostgreSQL на сервері MATAS University. Секрети й OAuth-токени не публікуються та не зберігаються в репозиторії коду. Передавання даних захищене HTTPS. Дані зберігаються лише стільки, скільки потрібно для роботи планувальника, виконання домовленостей і захисту від подвійного бронювання.</p>

        <h2>6. Видалення даних і відкликання доступу</h2>
        <p>Організатор може відкликати доступ OpenSlot у налаштуваннях свого Google Account. Щоб отримати копію даних або видалити облікові, OAuth чи booking-дані з OpenSlot, надішліть запит на <a href="mailto:yevgeniif@gmail.com">yevgeniif@gmail.com</a>. Запит буде опрацьовано протягом 30 днів.</p>

        <h2>7. Зміни політики</h2>
        <p>Ця політика може оновлюватися разом зі змінами функціональності або вимог законодавства. Актуальна версія завжди доступна за цією адресою.</p>
      </article>
    </main>
  );
}

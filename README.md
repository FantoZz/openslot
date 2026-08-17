# OpenSlot

Планувальник зустрічей MATAS University з інтеграцією Google Calendar і Google Meet.
Організатор створює формат зустрічі та ділиться публічним посиланням. Кожен гість
обирає окремий вільний слот, після чого подія з Google Meet додається до календаря.

Production: [https://openslot.matasuniversity.com](https://openslot.matasuniversity.com)

## Можливості

- вхід організатора через Google OAuth;
- необмежена кількість бронювань через одне посилання;
- автоматична перевірка зайнятості Google Calendar;
- зворотний режим доступності: слоти лише всередині подій із вибраною назвою;
- одноразові посилання, які закриваються після першого успішного бронювання;
- захист від подвійного бронювання;
- створення події, Google Meet та email-запрошення;
- окреме email-сповіщення організатору про кожне нове бронювання;
- окремий горизонт доступності: сьогодні, 2, 3, 7 або 14 днів;
- вибір одного конкретного дня в майбутньому замість діапазону;
- довільна тривалість зустрічі в годинах, включно з дробовими значеннями;
- окремі години роботи для буднів і вихідних;
- автоматична адреса посилання, якщо організатор не задав її вручну;
- копіювання публічного посилання з панелі;
- безпечне видалення сторінки без видалення вже запланованих подій;
- український інтерфейс і бренд MATAS University;
- favicon та Open Graph-прев’ю для месенджерів.

## Як працює горизонт доступності

`Доступні слоти наперед` завжди відраховуються від дня, коли гість відкрив сторінку
бронювання. Наприклад, формат із горизонтом `3 дні` сьогодні покаже слоти на сьогодні
і два наступні календарні дні. Якщо відкрити те саме посилання через місяць, відлік
почнеться заново від тієї дати. Дні, які не входять до робочого розкладу, пропускаються.

## Стек

- Next.js 15;
- PostgreSQL 16;
- Prisma;
- NextAuth;
- Google Calendar API;
- Docker Compose;
- Cloudflare Tunnel.

## Локальний запуск

Потрібні Node.js 20+, Docker і Google OAuth-клієнт.

```bash
npm install
cp .env.example .env
docker compose up -d postgres
npm run db:push
npm run dev
```

Сайт буде доступний на `http://localhost:3000`.

## Змінні середовища

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
POSTGRES_PASSWORD=
WEB_PORT=3002
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM="OpenSlot <notifications@matasuniversity.com>"
```

Для Gmail у `SMTP_PASSWORD` використовуйте пароль застосунку, а не звичайний пароль
Google-акаунта. Якщо SMTP тимчасово недоступний, бронювання все одно зберігається,
а помилка надсилання записується в журнал застосунку.

Секрети зберігаються тільки в `.env`. Файл `.env` не можна комітити.

Для локального OAuth додайте redirect URI:

```text
http://localhost:3000/api/auth/callback/google
```

Для production:

```text
https://openslot.matasuniversity.com/api/auth/callback/google
```

Google Calendar API має бути увімкнений, а OAuth-клієнт повинен мати scopes:

```text
https://www.googleapis.com/auth/calendar.freebusy
https://www.googleapis.com/auth/calendar.events
```

## Production на HomePI4YF

Проєкт працює в `/home/yfs/projects/openslot`. Зарезервований порт — `3002`.
Зовнішній HTTPS-трафік надходить через Cloudflare Tunnel.

Оновлення:

```bash
cd ~/projects/openslot
git pull
docker compose build app
docker compose exec -T postgres psql -U postgres -d openslot < prisma/migrations/20260726_add_weekend_hours/migration.sql
docker compose up -d app
docker compose logs --tail=100 app
```

Перед змінами:

```bash
~/server/scripts/backup-project openslot
```

## Важливо

- не комітьте `.env`, OAuth secrets або дані PostgreSQL;
- не змінюйте порт без оновлення `~/server/docs/ports.md`;
- не публікуйте додаткові порти — використовуйте наявний Cloudflare Tunnel;
- перед production-деплоєм перевіряйте `npm run build`.

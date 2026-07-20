# OpenSlot

Сервис записи на встречу через Google Calendar. Организатор создаёт тип встречи и получает публичную ссылку. Гость видит только свободные окна; после бронирования событие с Google Meet появляется в основном календаре организатора, а приглашение уходит гостю.

## Что уже есть в каркасе

- вход организатора через Google OAuth;
- создание публичных типов встреч (название, описание, длительность, часы работы, часовой пояс);
- проверка занятости основного Google Calendar на 14 дней;
- защита от повторной брони непосредственно перед созданием события;
- создание события, Google Meet и email-приглашения;
- PostgreSQL через Prisma и локальный Docker Compose.

## Локальный запуск

Требования: Node.js 20+, Docker, аккаунт Google.

```bash
npm install
cp .env.example .env
docker compose up -d
npm run db:push
npm run dev
```

До запуска заполните Google-переменные в `.env` по инструкции ниже. Сайт откроется на `http://localhost:3000`.

## Подключение Google Calendar и Meet

Google Calendar API подключается к проекту, а не к Gmail отдельно. Тот же Google OAuth даёт вход, доступ к календарю и право создавать Meet-конференции.

1. Откройте [Google Cloud Console](https://console.cloud.google.com/) и создайте новый проект.
2. В **APIs & Services → Library** включите **Google Calendar API**.
3. В **Google Auth Platform / OAuth consent screen** настройте приложение:
   - тип аудитории — External (если это не Workspace-приложение организации);
   - добавьте свой email как test user, пока приложение в режиме Testing;
   - добавьте scope `https://www.googleapis.com/auth/calendar`.
4. В **Credentials → Create credentials → OAuth client ID** выберите **Web application**.
5. Добавьте Authorized redirect URI:
   - локально: `http://localhost:3000/api/auth/callback/google`;
   - после деплоя: `https://ВАШ-ДОМЕН/api/auth/callback/google`.
6. Скопируйте Client ID и Client secret в `.env`:

```env
GOOGLE_CLIENT_ID="...apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="..."
NEXTAUTH_SECRET="результат-команды-ниже"
```

Секрет создаётся так:

```bash
openssl rand -base64 32
```

Важно: при первом входе разрешите доступ к календарю. Refresh token сохраняется в БД и нужен для работы публичной страницы, когда организатор не находится на сайте. `.env` и содержимое БД нельзя коммитить.

## Как привязать проект к вашему GitHub

### Что нужно сделать вам

1. Создайте на GitHub пустой приватный репозиторий, например `openslot`. Не добавляйте README, `.gitignore` или лицензию — они уже есть здесь.
2. Сообщите мне **URL репозитория** вида `https://github.com/USERNAME/openslot.git`.
3. Авторизуйте GitHub CLI на компьютере командой `gh auth login` или настройте SSH-ключ. Пароль и personal access token мне в чат не присылайте.
4. Напишите, можно ли мне создать первый commit и push. После явного разрешения я это сделаю.

Если хотите сделать самостоятельно:

```bash
git init
git add .
git commit -m "Initial OpenSlot MVP"
git branch -M main
git remote add origin https://github.com/USERNAME/openslot.git
git push -u origin main
```

## Что прислать для следующего этапа

Без секретов:

- GitHub repository URL;
- желаемое название сервиса и домен;
- ваш рабочий часовой пояс и расписание (сейчас: будни, 09:00–18:00, `Europe/Kyiv`);
- где разворачивать: Vercel + Neon/Supabase или другой хостинг;
- нужны ли буферы между встречами, отмена/перенос, несколько календарей и вопросы гостю;
- логотип/цвета или примеры понравившихся сайтов, если нужен фирменный дизайн.

Секреты `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET`, пароли и токены храните только в `.env` локально и в Environment Variables хостинга.

## Ограничения текущего MVP

- один основной Google Calendar на организатора;
- рабочие дни пока понедельник–пятница;
- шаг слотов равен длительности встречи;
- нет отмены, переноса, буферов, лимитов в день и email-напоминаний;
- для коммерческого публичного запуска Google может потребовать OAuth verification из-за calendar scope.

## Production на HomePI4YF

Зарезервированный адрес: `https://openslot.elephantrobotics.store`, внутренний порт: `3002`.

1. Скопируйте `.env.example` в `.env` и заполните Google OAuth-переменные и секреты.
2. В Google OAuth добавьте redirect URI `https://openslot.elephantrobotics.store/api/auth/callback/google`.
3. Запустите приложение: `docker compose up -d --build`.
4. В Cloudflare Tunnel добавьте Public Hostname `openslot.elephantrobotics.store`, направленный на HTTP-сервис приложения на порту `3002`.

# OpenSlot Project Context

OpenSlot is hosted on the HomePI4YF Raspberry Pi pet-project server.

Production URL:
- https://openslot.elephantrobotics.store

Server path:
- `/home/yfs/projects/openslot`

Runtime:
- Next.js app
- PostgreSQL
- Docker Compose
- Reserved host port: `3002`

Important files:
- `docker-compose.yml`
- `Dockerfile`
- `.env`
- `.env.example`
- `prisma/`
- `app/`
- `lib/`

Rules:
- Do not commit `.env`.
- Keep Google OAuth secrets only in `.env`.
- Prefer Docker Compose for production runs.
- Do not change the reserved port without updating `/home/yfs/server/docs/ports.md`.
- Cloudflare Tunnel currently serves the domain routing for `elephantrobotics.store`.
- Do not start or expose the service until Google OAuth values are present unless the user asks for a partial smoke test.

Useful commands:

```bash
cd /home/yfs/projects/openslot
npm run build
docker compose up -d --build
docker compose logs -f
docker compose down
```

Expected `.env` keys:

```text
NEXTAUTH_URL
NEXTAUTH_SECRET
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
POSTGRES_PASSWORD
WEB_PORT
```


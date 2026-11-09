# until

until is a simple, shareable timer.

## Requirements

- Node.js 26 or newer
- Docker (for the local PostgreSQL database)

## Local development

```bash
npm install
cp .env.example .env
docker compose up -d --wait db
npm run dev
```

The database container applies `schema.sql` on first start. After changing the
schema, re-apply it to the running database, or reset everything:

```bash
docker compose exec -T db psql -U until -d until < schema.sql
docker compose down -v
```

`docker compose down` stops the container; `-v` also deletes the data volume.

If Docker reports a permission error, add yourself to the `docker` group and log
back in:

```bash
sudo usermod -aG docker $USER
```

## Configuration

| Variable        | Required | Description                                            |
| --------------- | -------- | ------------------------------------------------------ |
| `DATABASE_URL`  | yes      | PostgreSQL connection string.                          |
| `PG_POOL_MAX`   | no       | Max pool connections per instance (default `10`).      |
| `COOKIE_SECURE` | no       | On when `NODE_ENV=production`; set `false` to disable. |

## Scripts

| Command                                                                      | Description                      |
| ---------------------------------------------------------------------------- | -------------------------------- |
| `npm run dev`                                                                | Start the development server.    |
| `npm run build`                                                              | Production build.                |
| `npm start`                                                                  | Serve the production build.      |
| `npm run lint`                                                               | ESLint.                          |
| `npm run format` / `format:check`                                            | Prettier write / check.          |
| `npm run typecheck`                                                          | TypeScript check.                |
| `npm test`                                                                   | Unit, property, and integration. |
| `npm run test:unit` / `test:property` / `test:integration` / `test:coverage` | Individual test suites.          |

Example-based tests live in `tests/unit`; property-based tests (fast-check) in
`tests/properties`; server-action and cookie integration tests (Vitest) in
`tests/integration`.

## Deployment

until is a standard Next.js application. It needs:

- a Node.js 26 runtime,
- a PostgreSQL database reachable through `DATABASE_URL`,
- the schema applied once: `psql "$DATABASE_URL" -f schema.sql`.

Build and serve it with `npm run build` and `npm start`, or deploy it to any
Next.js-capable platform. If the database uses a pooled connection (for example
Neon), use its pooled connection string and set `PG_POOL_MAX` low.

## Operations

- `GET /api/health` returns 503 when the database is unavailable.
- Timer creation is rate-limited per client IP with a global fallback.
  Limits live in memory per process, so they are approximate across instances
  and cold starts.
- Cookies are `Secure` in production unless `COOKIE_SECURE=false`.

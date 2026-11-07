# Until

Until is a simple countdown timer, sharable via URL.

## Local development

Requires [Node.js](https://nodejs.org) 26 or newer.

```bash
npm install
psql "$DATABASE_URL" -f schema.sql
npm run dev
```

Copy `.env.example` to `.env` and point `DATABASE_URL` at your PostgreSQL database.

Run the checks with:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Docker

The repository includes a multi-stage `Dockerfile` and two Compose stacks: a development
stack for local work with hot reload, and a hardened production stack.

### Development

The development stack uses project `until-dev`, runs the Dockerfile `dev` target with
`next dev`, and bind-mounts the repository into the container. Next.js recompiles on
changes, so edits appear without rebuilding (hot reload); `node_modules` and `.next` are
kept in isolated volumes.

```bash
cp .env.dev.example .env
docker compose up --build
```

- App: `http://127.0.0.1:3000`
- PostgreSQL: `127.0.0.1:5432` (override with `POSTGRES_PORT`)

`docker compose down -v` resets only development data (`until-dev_db_data`).

On macOS, Windows, or network filesystems, set `WATCHPACK_POLLING=true` in the `web`
service environment (for example, in a Compose override file) if file changes are not
detected.

### Production

The production stack uses project `until`, builds the hardened `runner` target, and runs
as a non-root user with a read-only filesystem.

```bash
cp .env.prod.example .env.prod
docker compose -f docker-compose.prod.yml --env-file .env.prod up --build -d
```

Set a strong `POSTGRES_PASSWORD` in `.env.prod` before deploying. Use a URL-safe password,
since it is embedded in `DATABASE_URL`; characters such as `@`, `:`, `/`, or `#` must be
percent-encoded.

- App: `127.0.0.1:${PORT:-3000}` only
- PostgreSQL: not published to the host; reachable only on the Compose backend network
- Data volume: `until_db_data`, separate from development's `until-dev_db_data`

Development and production cannot both bind the same host ports at the same time.
Override `PORT` (and `POSTGRES_PORT` for the development database) if you need to avoid
a conflict.

### Cloudflare Tunnel

Cloudflare terminates TLS, so no TLS proxy is included. Point the tunnel at the
loopback-bound production app:

```yaml
tunnel: <TUNNEL_ID>
credentials-file: /etc/cloudflared/<TUNNEL_ID>.json

ingress:
  - hostname: until.example.com
    service: http://localhost:3000
  - service: http_status:404
```

If `cloudflared` runs as a bridge container in the same Compose project, use
`http://web:3000` and attach it to the project's default network instead. If you changed
`PORT`, update the tunnel service URL to match. Do not expose port 3000 publicly.

## Operations

- `GET /api/health` checks the database and returns 503 when it is unavailable.
- Countdown creation is rate-limited per `CF-Connecting-IP`, with a global fallback
  limit. Add a Cloudflare rate-limiting rule for edge-level protection.
- Cookies are `Secure` in production. Set `COOKIE_SECURE=false` only when testing the
  production container over plain HTTP.
- PostgreSQL is only reachable from the Compose network in production. For maintenance,
  use
  `docker compose -f docker-compose.prod.yml --env-file .env.prod exec db sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"'`,
  or add a localhost port mapping if you need host access.

The database schema is applied automatically the first time the `db_data` volume is
created. To re-apply it or reset production data (destructive):

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod exec -T db sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"' < schema.sql
docker compose -f docker-compose.prod.yml --env-file .env.prod down -v
```

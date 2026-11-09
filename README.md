# until

until is a simple countdown timer you can share via link or as image.

## Features

- Create a named countdown for a date or duration.
- Accepts `1d 2h 3m` or `25-12-2026 18:00` style input.
- Live countdown in days, hours, minutes, and seconds.
- Every moment gets a shareable link.
- Save moments to a personal list via cookie.
- Copy or download a moment as a PNG image.
- Themes plus light, dark, and system modes.
- Cookie consent gate with no tracking.

## Requirements

- Node.js 26 or newer
- Docker for the local PostgreSQL database

## Local development

```bash
npm install
cp .env.example .env
docker compose up -d --wait db
npm run dev
```

`schema.sql` is applied on first database start.

## Configuration

| Variable        | Required | Description                   |
| --------------- | -------- | ----------------------------- |
| `DATABASE_URL`  | yes      | PostgreSQL connection string. |
| `COOKIE_SECURE` | no       | Defaults on in production.    |

## Deployment

until is a standard Next.js app. It needs Node.js 26, PostgreSQL through
`DATABASE_URL`, and the schema applied once:

```bash
psql "$DATABASE_URL" -f schema.sql
```

Build with `npm run build` and serve with `npm start`.

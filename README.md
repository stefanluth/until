# until

until is a simple countdown timer for moments you can share via link or as an image.

## Features

- Share a moment via URL or as an image.
- No database: the details live in the URL.
- Themes with light & dark mode.
- Save moments to a personal list.

## Requirements

- Node.js 26 or newer

## Local development

```bash
npm install
npm run dev
```

## Configuration

| Variable        | Required | Description                                                |
| --------------- | -------- | ---------------------------------------------------------- |
| `COOKIE_SECURE` | no       | Force secure cookies on or off. Defaults on in production. |

## Deployment

until is a standard Next.js app. Build with `npm run build` and serve with
`npm start`.

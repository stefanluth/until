import { buildCountdownImageContent, buildCountdownImageFilename } from './countdownImage.ts';
import { renderCountdownImagePng, triggerPngDownload } from './countdownImageRenderer.ts';
import type { CountdownImageTheme } from './countdownImageTypes.ts';
import { splitRemaining } from './duration.ts';

export async function downloadCountdownImage({
  id,
  name,
  date,
}: {
  id: string;
  name: string;
  date: Date;
}): Promise<void> {
  const remaining = splitRemaining(date.getTime() - Date.now());
  const content = buildCountdownImageContent({
    name,
    date,
    remaining,
    url: `${location.origin}/${id}`,
  });
  const theme = readTheme();

  await waitForFont(theme.fontFamily);

  const blob = await renderCountdownImagePng(content, theme);
  triggerPngDownload(blob, buildCountdownImageFilename(name, date));
}

function readTheme(): CountdownImageTheme {
  const root = getComputedStyle(document.documentElement);
  const body = getComputedStyle(document.body);

  return {
    backgroundStart: `rgb(${readRgbTriplet(root.getPropertyValue('--background-start-rgb'), '214, 219, 220')})`,
    backgroundEnd: `rgb(${readRgbTriplet(root.getPropertyValue('--background-end-rgb'), '255, 255, 255')})`,
    foreground: body.color || 'rgb(0, 0, 0)',
    fontFamily: body.fontFamily || 'sans-serif',
  };
}

function readRgbTriplet(value: string, fallback: string): string {
  const match = /^(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})$/.exec(value.trim());

  if (!match) {
    return fallback;
  }

  const parts = match.slice(1).map(Number);

  if (parts.some((part) => part > 255)) {
    return fallback;
  }

  return parts.join(', ');
}

async function waitForFont(fontFamily: string): Promise<void> {
  try {
    await document.fonts.ready;
    await document.fonts.load(`700 16px ${fontFamily}`);
  } catch {
    return;
  }
}

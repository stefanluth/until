import type { Moment } from '../types.ts';
import { type MomentImageTheme, buildMomentImageContent, buildMomentImageFilename } from './momentImage.ts';
import { renderMomentImagePng, triggerPngDownload } from './momentImageRenderer.ts';
import { momentDisplayPath } from './momentUrl.ts';
import { splitRemaining } from './timer.ts';

export async function renderMomentImageBlob({ id, name, date }: Moment): Promise<Blob> {
  const remaining = splitRemaining(date.getTime() - Date.now());
  const content = buildMomentImageContent({
    name,
    date,
    remaining,
    url: `${location.origin}${momentDisplayPath(id)}`,
  });
  const theme = readTheme();

  await waitForFont(theme.fontFamily);

  return await renderMomentImagePng(content, theme);
}

export async function copyMomentImage({ id, name, date }: Moment): Promise<void> {
  if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') {
    throw new Error('Copying images to the clipboard is not supported in this browser');
  }

  const png = renderMomentImageBlob({ id, name, date });

  await navigator.clipboard.write([new ClipboardItem({ 'image/png': png })]);
}

export async function downloadMomentImage({ id, name, date }: Moment): Promise<void> {
  const blob = await renderMomentImageBlob({ id, name, date });
  triggerPngDownload(blob, buildMomentImageFilename(name, date));
}

function readTheme(): MomentImageTheme {
  const root = getComputedStyle(document.documentElement);
  const body = getComputedStyle(document.body);
  const start = `rgb(${readRgbTriplet(root.getPropertyValue('--background-start-rgb'), '214, 219, 220')})`;
  const end = `rgb(${readRgbTriplet(root.getPropertyValue('--background-end-rgb'), '255, 255, 255')})`;
  const dark = document.documentElement.dataset.appearance === 'dark';

  return {
    backgroundStart: dark ? start : end,
    backgroundEnd: dark ? end : start,
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

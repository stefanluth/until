import type { CountdownImageContent, CountdownImageTheme } from './countdownImageTypes';

export const COUNTDOWN_IMAGE_SIZE = 1080;

const WORDMARK = 'Until';
const MAX_TITLE_LINES = 3;
const MAX_TITLE_HEIGHT = 200;

type FontWeight = 400 | 600 | 700;

type FittedLine = {
  text: string;
  size: number;
};

export function drawCountdownImage(
  ctx: CanvasRenderingContext2D,
  content: CountdownImageContent,
  theme: CountdownImageTheme,
  size: number = COUNTDOWN_IMAGE_SIZE,
): void {
  const scale = size / COUNTDOWN_IMAGE_SIZE;
  const padding = 96 * scale;
  const maxWidth = size - padding * 2;
  const centerX = size / 2;
  const foreground = theme.foreground || 'rgb(0, 0, 0)';
  const fontFamily = theme.fontFamily || 'sans-serif';

  ctx.save();

  const background = ctx.createLinearGradient(0, 0, 0, size);
  background.addColorStop(0, theme.backgroundStart);
  background.addColorStop(1, theme.backgroundEnd);
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = foreground;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.globalAlpha = 0.9;
  ctx.font = font(600, 44 * scale, fontFamily);
  ctx.fillText(WORDMARK, padding, 64 * scale);

  const title = fitTitle(ctx, content.name || ' ', maxWidth, scale, fontFamily);
  const titleTop = 300 * scale;
  const titleLineHeight = title.size * 1.12;

  ctx.textAlign = 'center';
  ctx.globalAlpha = 1;
  ctx.font = font(700, title.size, fontFamily);
  title.lines.forEach((line, index) => {
    ctx.fillText(line, centerX, titleTop + index * titleLineHeight);
  });

  const titleBottom = titleTop + (title.lines.length - 1) * titleLineHeight + title.size;
  const dateY = titleBottom + 40 * scale;
  const date = fitLine(ctx, content.dateLabel, maxWidth, 36 * scale, 26 * scale, fontFamily, 400);

  ctx.globalAlpha = 0.8;
  ctx.font = font(400, date.size, fontFamily);
  ctx.fillText(date.text, centerX, dateY);

  const unitsY = 710 * scale;

  if (content.ended || content.units.length === 0) {
    ctx.globalAlpha = 1;
    ctx.textBaseline = 'middle';
    ctx.font = font(700, 64 * scale, fontFamily);
    ctx.fillText('Countdown has ended!', centerX, unitsY);
  } else {
    drawUnits(ctx, content, unitsY, padding, maxWidth, fontFamily, scale, foreground);
  }

  if (content.url) {
    ctx.globalAlpha = 0.7;
    ctx.textBaseline = 'bottom';
    ctx.textAlign = 'center';
    const url = fitLine(ctx, content.url, maxWidth, 28 * scale, 18 * scale, fontFamily, 400);
    ctx.font = font(400, url.size, fontFamily);
    ctx.fillText(url.text, centerX, size - 56 * scale);
  }

  ctx.restore();
}

export async function renderCountdownImagePng(
  content: CountdownImageContent,
  theme: CountdownImageTheme,
  size: number = COUNTDOWN_IMAGE_SIZE,
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas 2D is not available');
  }

  drawCountdownImage(ctx, content, theme, size);

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Failed to encode the countdown image'))),
      'image/png',
    );
  });
}

export function triggerPngDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function drawUnits(
  ctx: CanvasRenderingContext2D,
  content: CountdownImageContent,
  unitsY: number,
  padding: number,
  maxWidth: number,
  fontFamily: string,
  scale: number,
  foreground: string,
): void {
  const count = content.units.length;
  const gap = count > 1 ? 24 * scale : 0;
  const columnWidth = (maxWidth - gap * (count - 1)) / count;
  const base = count === 1 ? 220 : count === 2 ? 190 : count === 3 ? 160 : 140;

  let numberSize = Math.min(base * scale, columnWidth * 0.9);
  ctx.font = font(700, numberSize, fontFamily);
  const widest = Math.max(...content.units.map((entry) => ctx.measureText(String(entry.value)).width));
  if (widest > columnWidth * 0.92) {
    numberSize *= (columnWidth * 0.92) / widest;
  }

  const labelSize = Math.min(30 * scale, columnWidth * 0.35);

  ctx.fillStyle = foreground;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.globalAlpha = 1;

  content.units.forEach((entry, index) => {
    const x = padding + index * (columnWidth + gap) + columnWidth / 2;
    ctx.font = font(700, numberSize, fontFamily);
    ctx.fillText(String(entry.value), x, unitsY);
    ctx.globalAlpha = 0.8;
    ctx.font = font(400, labelSize, fontFamily);
    ctx.fillText(entry.label.toUpperCase(), x, unitsY + numberSize * 0.72);
    ctx.globalAlpha = 1;
  });
}

function fitTitle(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  scale: number,
  fontFamily: string,
): { size: number; lines: string[] } {
  const maxSize = Math.round(88 * scale);
  const minSize = Math.round(44 * scale);

  for (let size = maxSize; size >= minSize; size -= 2) {
    ctx.font = font(700, size, fontFamily);
    const lines = wrapText(ctx, text, maxWidth);

    if (
      lines.length <= MAX_TITLE_LINES &&
      lines.length * size * 1.12 <= MAX_TITLE_HEIGHT * scale &&
      lines.every((line) => ctx.measureText(line).width <= maxWidth)
    ) {
      return { size, lines };
    }
  }

  ctx.font = font(700, minSize, fontFamily);
  const lines = wrapText(ctx, text, maxWidth).slice(0, MAX_TITLE_LINES);

  if (lines.length > 0) {
    lines[lines.length - 1] = truncateLine(ctx, lines[lines.length - 1], maxWidth);
  }

  return { size: minSize, lines };
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';

  const flush = () => {
    if (current) {
      lines.push(current);
      current = '';
    }
  };

  for (const word of words) {
    for (const piece of splitWord(ctx, word, maxWidth)) {
      const candidate = current ? `${current} ${piece}` : piece;

      if (!current || ctx.measureText(candidate).width <= maxWidth) {
        current = candidate;
      } else {
        flush();
        current = piece;
      }
    }
  }

  flush();

  return lines.length > 0 ? lines : [''];
}

function splitWord(ctx: CanvasRenderingContext2D, word: string, maxWidth: number): string[] {
  if (ctx.measureText(word).width <= maxWidth) {
    return [word];
  }

  const pieces: string[] = [];
  let current = '';

  for (const character of word) {
    const candidate = current + character;

    if (current && ctx.measureText(candidate).width > maxWidth) {
      pieces.push(current);
      current = character;
    } else {
      current = candidate;
    }
  }

  if (current) {
    pieces.push(current);
  }

  return pieces;
}

function truncateLine(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) {
    return text;
  }

  let result = text;

  while (result.length > 1 && ctx.measureText(`${result}\u2026`).width > maxWidth) {
    result = result.slice(0, -1);
  }

  return `${result}\u2026`;
}

function fitLine(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  preferredSize: number,
  minSize: number,
  fontFamily: string,
  weight: FontWeight,
): FittedLine {
  for (let size = Math.round(preferredSize); size >= Math.round(minSize); size -= 2) {
    ctx.font = font(weight, size, fontFamily);

    if (ctx.measureText(text).width <= maxWidth) {
      return { text, size };
    }
  }

  const size = Math.round(minSize);
  ctx.font = font(weight, size, fontFamily);

  return { text: truncateLine(ctx, text, maxWidth), size };
}

function font(weight: FontWeight, size: number, family: string): string {
  return `${weight} ${Math.round(size)}px ${family}`;
}

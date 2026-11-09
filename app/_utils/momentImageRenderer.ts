import type { MomentImageContent, MomentImageTheme } from './momentImage';

export const MOMENT_IMAGE_WIDTH = 720;

const WORDMARK = 'until';
const MAX_TITLE_LINES = 3;
const MAX_TITLE_HEIGHT = 200;
const UNIT_SIZES: Record<number, number> = { 1: 240, 2: 214, 3: 188, 4: 104 };
const PADDING = 64;
const GAP = 64;

type FontWeight = 400 | 600 | 700;

type UnitsLayout = {
  height: number;
  numberSize: number;
  labelSize: number;
  labelOffset: number;
  centers: number[];
};

type MomentImageLayout = {
  width: number;
  height: number;
  scale: number;
  padding: number;
  centerX: number;
  maxWidth: number;
  foreground: string;
  fontFamily: string;
  wordmark: { y: number; size: number };
  title: { y: number; size: number; lineHeight: number; lines: string[] };
  date: { y: number; size: number };
  units: (UnitsLayout & { top: number }) | null;
  finished: { y: number; size: number } | null;
  url: { y: number; size: number; text: string } | null;
};

export function layoutMomentImage(
  ctx: CanvasRenderingContext2D,
  content: MomentImageContent,
  theme: MomentImageTheme,
  width: number = MOMENT_IMAGE_WIDTH,
): MomentImageLayout {
  const scale = width / MOMENT_IMAGE_WIDTH;
  const padding = PADDING * scale;
  const gap = GAP * scale;
  const maxWidth = width - padding * 2;
  const centerX = width / 2;
  const foreground = theme.foreground || 'rgb(0, 0, 0)';
  const fontFamily = theme.fontFamily || 'sans-serif';
  let y = padding;

  const wordmarkSize = 46 * scale;
  const wordmark = { y, size: wordmarkSize };
  y += wordmarkSize + gap;

  const title = fitTitle(ctx, content.name || ' ', maxWidth, scale, fontFamily);
  const lineHeight = title.size * 1.12;
  const titleLayout = { ...title, y, lineHeight };
  y += (title.lines.length - 1) * lineHeight + title.size + gap;

  const dateSize = measureDateLine(ctx, content, maxWidth, fontFamily, scale);
  const date = { y, size: dateSize };
  y += dateSize + gap;

  let units: (UnitsLayout & { top: number }) | null = null;
  let finished: { y: number; size: number } | null = null;

  if (content.units.length === 0) {
    const size = 70 * scale;
    finished = { y, size };
    y += size;
  } else {
    units = { ...layoutUnits(ctx, content, padding, width, fontFamily, scale), top: y };
    y += units.height;
  }

  let url: { y: number; size: number; text: string } | null = null;

  if (content.url) {
    y += gap;
    const fitted = fitLine(ctx, content.url, maxWidth, 28 * scale, 16 * scale, fontFamily, 400);
    url = { y, size: fitted.size, text: fitted.text };
    y += fitted.size;
  }

  return {
    width,
    height: Math.ceil(y + padding),
    scale,
    padding,
    centerX,
    maxWidth,
    foreground,
    fontFamily,
    wordmark,
    title: titleLayout,
    date,
    units,
    finished,
    url,
  };
}

export function drawMomentImage(
  ctx: CanvasRenderingContext2D,
  content: MomentImageContent,
  theme: MomentImageTheme,
  width: number = MOMENT_IMAGE_WIDTH,
): number {
  const layout = layoutMomentImage(ctx, content, theme, width);
  const { height, maxWidth, scale, centerX, padding, foreground, fontFamily } = layout;

  ctx.save();

  const background = ctx.createLinearGradient(0, 0, 0, height);
  background.addColorStop(0, theme.backgroundStart);
  background.addColorStop(1, theme.backgroundEnd);
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, layout.width, height);

  ctx.fillStyle = foreground;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.globalAlpha = 0.9;
  ctx.font = font(600, layout.wordmark.size, fontFamily);
  ctx.fillText(WORDMARK, padding, layout.wordmark.y);

  ctx.textAlign = 'center';
  ctx.globalAlpha = 1;
  ctx.font = font(700, layout.title.size, fontFamily);
  layout.title.lines.forEach((line, index) => {
    ctx.fillText(line, centerX, layout.title.y + index * layout.title.lineHeight);
  });

  drawDateLine(ctx, content, centerX, layout.date.y, maxWidth, fontFamily, scale, foreground, layout.date.size);

  if (layout.finished) {
    ctx.globalAlpha = 1;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.font = font(700, layout.finished.size, fontFamily);
    ctx.fillText('Timer finished.', centerX, layout.finished.y + layout.finished.size / 2);
  } else if (layout.units) {
    drawUnits(ctx, content, layout.units, fontFamily, foreground);
  }

  if (layout.url) {
    ctx.globalAlpha = 0.7;
    ctx.textBaseline = 'top';
    ctx.textAlign = 'center';
    ctx.font = font(400, layout.url.size, fontFamily);
    ctx.fillText(layout.url.text, centerX, layout.url.y);
  }

  ctx.restore();

  return height;
}

export async function renderMomentImagePng(
  content: MomentImageContent,
  theme: MomentImageTheme,
  width: number = MOMENT_IMAGE_WIDTH,
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = width;

  let ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas 2D is not available');
  }

  canvas.height = layoutMomentImage(ctx, content, theme, width).height;
  ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas 2D is not available');
  }

  drawMomentImage(ctx, content, theme, width);

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Failed to encode the moment image'))),
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

function measureDateLine(
  ctx: CanvasRenderingContext2D,
  content: MomentImageContent,
  maxWidth: number,
  fontFamily: string,
  scale: number,
): number {
  const gap = 12 * scale;
  const dividerWidth = Math.max(1, scale);
  const minSize = Math.round(20 * scale);
  const hasTime = content.timeLabel !== null;
  const measureWidth = (size: number) => {
    ctx.font = font(400, size, fontFamily);
    const dateWidth = ctx.measureText(content.dateLabel).width;
    const timeWidth = content.timeLabel ? ctx.measureText(content.timeLabel).width : 0;

    return dateWidth + (hasTime ? gap + dividerWidth + gap + timeWidth : 0);
  };

  let size = Math.round(32 * scale);

  while (size > minSize && measureWidth(size) > maxWidth) {
    size -= 2;
  }

  return size;
}

function drawDateLine(
  ctx: CanvasRenderingContext2D,
  content: MomentImageContent,
  centerX: number,
  y: number,
  maxWidth: number,
  fontFamily: string,
  scale: number,
  foreground: string,
  size: number,
): void {
  const gap = 12 * scale;
  const dividerWidth = Math.max(1, scale);
  const hasTime = content.timeLabel !== null;

  ctx.font = font(400, size, fontFamily);

  const timeWidth = content.timeLabel ? ctx.measureText(content.timeLabel).width : 0;
  let dateText = content.dateLabel;
  let dateWidth = ctx.measureText(dateText).width;
  let totalWidth = dateWidth + (hasTime ? gap + dividerWidth + gap + timeWidth : 0);

  if (totalWidth > maxWidth) {
    const available = maxWidth - (hasTime ? gap + dividerWidth + gap + timeWidth : 0);
    dateText = truncateLine(ctx, dateText, Math.max(0, available));
    dateWidth = ctx.measureText(dateText).width;
    totalWidth = dateWidth + (hasTime ? gap + dividerWidth + gap + timeWidth : 0);
  }

  let x = centerX - totalWidth / 2;

  ctx.globalAlpha = 0.8;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.font = font(400, size, fontFamily);
  ctx.fillStyle = foreground;
  ctx.fillText(dateText, x, y);

  if (!content.timeLabel) {
    return;
  }

  x += dateWidth + gap;
  ctx.globalAlpha = 0.25;
  ctx.fillRect(x, y + size * 0.15, dividerWidth, size * 0.7);
  x += dividerWidth + gap;
  ctx.globalAlpha = 0.8;
  ctx.fillText(content.timeLabel, x, y);
}

function layoutUnits(
  ctx: CanvasRenderingContext2D,
  content: MomentImageContent,
  padding: number,
  width: number,
  fontFamily: string,
  scale: number,
): UnitsLayout {
  const count = content.units.length;
  const available = width - padding * 2;
  const minGap = 24 * scale;

  const measureNumbers = (fontSize: number) =>
    content.units.map((entry) => {
      ctx.font = font(700, fontSize, fontFamily);
      return ctx.measureText(String(entry.value)).width;
    });

  const measureLabels = (fontSize: number) => {
    ctx.font = font(400, fontSize, fontFamily);
    return content.units.map((entry) => ctx.measureText(entry.label.toUpperCase()).width);
  };

  let numberSize = (UNIT_SIZES[count] ?? 104) * scale;
  let numberWidths = measureNumbers(numberSize);
  const totalNumberWidth = numberWidths.reduce((sum, entry) => sum + entry, 0);
  const boxWidthsFor = (labelWidths: number[]) =>
    numberWidths.map((numberWidth, index) => Math.max(numberWidth, labelWidths[index]));

  if (count > 1 && totalNumberWidth + minGap * (count - 1) > available) {
    numberSize *= (available - minGap * (count - 1)) / totalNumberWidth;
    numberWidths = measureNumbers(numberSize);
  }

  numberSize = Math.max(1, Math.round(numberSize));
  numberWidths = measureNumbers(numberSize);

  const fits = (labelSize: number) => {
    const boxWidths = boxWidthsFor(measureLabels(labelSize));

    return boxWidths.reduce((sum, box) => sum + box, 0) + minGap * (count - 1) <= available;
  };

  let labelSize = 40 * scale;

  if (count > 1 && !fits(labelSize)) {
    let low = 1;
    let high = labelSize;

    for (let attempt = 0; attempt < 30; attempt += 1) {
      const middle = (low + high) / 2;

      if (fits(middle)) {
        low = middle;
      } else {
        high = middle;
      }
    }

    labelSize = low;
  }

  labelSize = Math.max(1, Math.round(labelSize));

  const labelWidths = measureLabels(labelSize);
  const boxWidths = boxWidthsFor(labelWidths);
  const totalBoxWidth = boxWidths.reduce((sum, box) => sum + box, 0);
  const gap = count > 1 ? (available - totalBoxWidth) / (count - 1) : 0;
  const centers: number[] = [];
  let cursor = padding + (count === 1 ? (available - totalBoxWidth) / 2 : 0);

  for (const boxWidth of boxWidths) {
    centers.push(cursor + boxWidth / 2);
    cursor += boxWidth + gap;
  }

  const labelOffset = numberSize * 0.6;

  return {
    height: numberSize / 2 + labelOffset + labelSize / 2,
    numberSize,
    labelSize,
    labelOffset,
    centers,
  };
}

function drawUnits(
  ctx: CanvasRenderingContext2D,
  content: MomentImageContent,
  layout: UnitsLayout & { top: number },
  fontFamily: string,
  foreground: string,
): void {
  const { top, numberSize, labelSize, labelOffset, centers } = layout;
  const unitsY = top + numberSize / 2;

  ctx.fillStyle = foreground;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.globalAlpha = 1;

  content.units.forEach((entry, index) => {
    const x = centers[index];
    ctx.font = font(700, numberSize, fontFamily);
    ctx.fillText(String(entry.value), x, unitsY);
    ctx.globalAlpha = 0.8;
    ctx.font = font(400, labelSize, fontFamily);
    ctx.fillText(entry.label.toUpperCase(), x, unitsY + labelOffset);
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
  const maxSize = Math.round(80 * scale);
  const minSize = Math.round(38 * scale);

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
) {
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

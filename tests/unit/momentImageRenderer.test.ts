import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { MOMENT_IMAGE_SIZE, drawMomentImage } from '../../app/_utils/momentImageRenderer.ts';
import type { MomentImageContent, MomentImageTheme } from '../../app/_utils/momentImageTypes.ts';

class FakeContext {
  font = '10px sans-serif';
  fillStyle: string | CanvasGradient = '#000000';
  textAlign: CanvasTextAlign = 'start';
  textBaseline: CanvasTextBaseline = 'alphabetic';
  globalAlpha = 1;
  texts: { text: string; x: number; y: number; font: string; alpha: number }[] = [];
  gradientStops: { offset: number; color: string }[] = [];

  fillText(text: string, x: number, y: number) {
    this.texts.push({ text, x, y, font: this.font, alpha: this.globalAlpha });
  }

  measureText(text: string) {
    return { width: text.length * fontSize(this.font) * 0.55 } as TextMetrics;
  }

  createLinearGradient() {
    return {
      addColorStop: (offset: number, color: string) => {
        this.gradientStops.push({ offset, color });
      },
    } as unknown as CanvasGradient;
  }

  fillRect() {}
  save() {}
  restore() {}
}

const THEME: MomentImageTheme = {
  backgroundStart: 'rgb(214, 219, 220)',
  backgroundEnd: 'rgb(255, 255, 255)',
  foreground: 'rgb(0, 0, 0)',
  fontFamily: 'sans-serif',
};

const CONTENT: MomentImageContent = {
  name: 'New Year 2027',
  dateLabel: 'Friday, January 1, 2027',
  timeLabel: '13:05',
  units: [
    { unit: 'days', value: 42, label: 'days' },
    { unit: 'hours', value: 3, label: 'hours' },
    { unit: 'minutes', value: 2, label: 'minutes' },
    { unit: 'seconds', value: 1, label: 'seconds' },
  ],
  url: 'https://until.example/new-year-2027-1a2b3c4d',
};

function fontSize(font: string): number {
  return Number(/(?:^|\s)(\d+(?:\.\d+)?)px/.exec(font)?.[1] ?? 10);
}

function textWidth(entry: { text: string; font: string }): number {
  return entry.text.length * fontSize(entry.font) * 0.55;
}

function draw(content: MomentImageContent = CONTENT): FakeContext {
  const ctx = new FakeContext();
  drawMomentImage(ctx as unknown as CanvasRenderingContext2D, content, THEME, MOMENT_IMAGE_SIZE);
  return ctx;
}

describe('drawMomentImage', () => {
  it('draws the wordmark, name, date, units, and URL', () => {
    const ctx = draw();
    const all = ctx.texts.map((entry) => entry.text);

    assert.ok(all.includes('until'));
    assert.ok(all.join(' ').includes('New Year 2027'));
    assert.ok(all.includes('Friday, January 1, 2027'));
    assert.ok(all.includes('13:05'));
    assert.ok(all.includes('42'));
    assert.ok(all.includes('DAYS'));
    assert.ok(all.includes('https://until.example/new-year-2027-1a2b3c4d'));
  });

  it('keeps every text position and width inside the canvas', () => {
    const ctx = draw();

    for (const entry of ctx.texts) {
      assert.ok(Number.isFinite(entry.x) && entry.x >= 0 && entry.x <= MOMENT_IMAGE_SIZE);
      assert.ok(Number.isFinite(entry.y) && entry.y >= 0 && entry.y <= MOMENT_IMAGE_SIZE);
      assert.ok(textWidth(entry) <= MOMENT_IMAGE_SIZE - 128);
    }

    const title = ctx.texts.find((entry) => entry.text === CONTENT.name);
    const date = ctx.texts.find((entry) => entry.text === CONTENT.dateLabel);
    const days = ctx.texts.find((entry) => entry.text === '42');

    assert.ok(title && date && days);
    assert.ok(date.y >= title.y + fontSize(title.font));
    assert.ok(date.y + fontSize(date.font) <= days.y - fontSize(days.font) / 2);
  });

  it('wraps and truncates a long name within the canvas', () => {
    const ctx = draw({ ...CONTENT, name: 'a'.repeat(300) });
    const titleLines = ctx.texts.filter((entry) => /^a+\u2026?$/.test(entry.text));

    assert.ok(titleLines.length <= 3);

    for (const entry of ctx.texts) {
      assert.ok(entry.x >= 0 && entry.x <= MOMENT_IMAGE_SIZE);
      assert.ok(entry.y >= 0 && entry.y <= MOMENT_IMAGE_SIZE);
      assert.ok(textWidth(entry) <= MOMENT_IMAGE_SIZE - 128);
    }

    const date = ctx.texts.find((entry) => entry.text === CONTENT.dateLabel);
    const days = ctx.texts.find((entry) => entry.text === '42');
    const lastTitle = titleLines[titleLines.length - 1];

    assert.ok(date && days && lastTitle);
    assert.ok(date.y >= lastTitle.y + fontSize(lastTitle.font));
    assert.ok(date.y + fontSize(date.font) <= days.y - fontSize(days.font) / 2);
  });

  it('draws the ended message without unit values', () => {
    const ctx = draw({ ...CONTENT, units: [] });
    const all = ctx.texts.map((entry) => entry.text);

    assert.ok(all.includes('Timer finished.'));
    assert.ok(!all.includes('42'));
    assert.ok(!all.includes('DAYS'));
  });

  it('draws only the date when there is no time', () => {
    const ctx = draw({ ...CONTENT, timeLabel: null });
    const all = ctx.texts.map((entry) => entry.text);

    assert.ok(all.includes('Friday, January 1, 2027'));
    assert.ok(!all.includes('13:05'));
  });

  it('uses the theme colors for the background gradient', () => {
    const ctx = draw();

    assert.deepEqual(ctx.gradientStops, [
      { offset: 0, color: THEME.backgroundStart },
      { offset: 1, color: THEME.backgroundEnd },
    ]);
  });
});

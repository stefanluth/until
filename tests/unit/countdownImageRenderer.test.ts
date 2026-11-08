import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { COUNTDOWN_IMAGE_SIZE, drawCountdownImage } from '../../app/_utils/countdownImageRenderer.ts';
import type { CountdownImageContent, CountdownImageTheme } from '../../app/_utils/countdownImageTypes.ts';

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

const THEME: CountdownImageTheme = {
  backgroundStart: 'rgb(214, 219, 220)',
  backgroundEnd: 'rgb(255, 255, 255)',
  foreground: 'rgb(0, 0, 0)',
  fontFamily: 'sans-serif',
};

const CONTENT: CountdownImageContent = {
  name: 'New Year 2027',
  dateLabel: 'Friday, January 1, 2027',
  units: [
    { unit: 'days', value: 42, label: 'days' },
    { unit: 'hours', value: 3, label: 'hours' },
    { unit: 'minutes', value: 2, label: 'minutes' },
    { unit: 'seconds', value: 1, label: 'seconds' },
  ],
  ended: false,
  url: 'https://until.example/new-year-2027-1a2b3c4d',
};

function fontSize(font: string): number {
  return Number(/(?:^|\s)(\d+(?:\.\d+)?)px/.exec(font)?.[1] ?? 10);
}

function textWidth(entry: { text: string; font: string }): number {
  return entry.text.length * fontSize(entry.font) * 0.55;
}

function draw(content: CountdownImageContent = CONTENT): FakeContext {
  const ctx = new FakeContext();
  drawCountdownImage(ctx as unknown as CanvasRenderingContext2D, content, THEME, COUNTDOWN_IMAGE_SIZE);
  return ctx;
}

describe('drawCountdownImage', () => {
  it('draws the wordmark, name, date, units, and URL', () => {
    const ctx = draw();
    const all = ctx.texts.map((entry) => entry.text);

    assert.ok(all.includes('until'));
    assert.ok(all.join(' ').includes('New Year 2027'));
    assert.ok(all.includes('Friday, January 1, 2027'));
    assert.ok(all.includes('42'));
    assert.ok(all.includes('DAYS'));
    assert.ok(all.includes('https://until.example/new-year-2027-1a2b3c4d'));
  });

  it('keeps every text position and width inside the canvas', () => {
    const ctx = draw();

    for (const entry of ctx.texts) {
      assert.ok(Number.isFinite(entry.x) && entry.x >= 0 && entry.x <= COUNTDOWN_IMAGE_SIZE);
      assert.ok(Number.isFinite(entry.y) && entry.y >= 0 && entry.y <= COUNTDOWN_IMAGE_SIZE);
      assert.ok(textWidth(entry) <= COUNTDOWN_IMAGE_SIZE - 192);
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
      assert.ok(entry.x >= 0 && entry.x <= COUNTDOWN_IMAGE_SIZE);
      assert.ok(entry.y >= 0 && entry.y <= COUNTDOWN_IMAGE_SIZE);
      assert.ok(textWidth(entry) <= COUNTDOWN_IMAGE_SIZE - 192);
    }

    const date = ctx.texts.find((entry) => entry.text === CONTENT.dateLabel);
    const days = ctx.texts.find((entry) => entry.text === '42');
    const lastTitle = titleLines[titleLines.length - 1];

    assert.ok(date && days && lastTitle);
    assert.ok(date.y >= lastTitle.y + fontSize(lastTitle.font));
    assert.ok(date.y + fontSize(date.font) <= days.y - fontSize(days.font) / 2);
  });

  it('draws the ended message without unit values', () => {
    const ctx = draw({ ...CONTENT, units: [], ended: true });
    const all = ctx.texts.map((entry) => entry.text);

    assert.ok(all.includes('Countdown has ended!'));
    assert.ok(!all.includes('42'));
    assert.ok(!all.includes('DAYS'));
  });

  it('uses the theme colors for the background gradient', () => {
    const ctx = draw();

    assert.deepEqual(ctx.gradientStops, [
      { offset: 0, color: THEME.backgroundStart },
      { offset: 1, color: THEME.backgroundEnd },
    ]);
  });
});

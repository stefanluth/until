import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { MomentImageContent, MomentImageTheme } from '../../app/_utils/momentImage.ts';
import { MOMENT_IMAGE_WIDTH, drawMomentImage, layoutMomentImage } from '../../app/_utils/momentImageRenderer.ts';

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

function draw(content: MomentImageContent = CONTENT): { ctx: FakeContext; height: number } {
  const ctx = new FakeContext();
  const height = drawMomentImage(ctx as unknown as CanvasRenderingContext2D, content, THEME, MOMENT_IMAGE_WIDTH);
  return { ctx, height };
}

const TWO_UNITS: MomentImageContent = {
  ...CONTENT,
  units: [
    { unit: 'minutes', value: 42, label: 'minutes' },
    { unit: 'seconds', value: 17, label: 'seconds' },
  ],
};

const THREE_UNITS: MomentImageContent = {
  ...CONTENT,
  units: [
    { unit: 'hours', value: 10, label: 'hours' },
    { unit: 'minutes', value: 10, label: 'minutes' },
    { unit: 'seconds', value: 14, label: 'seconds' },
  ],
};

const FOUR_UNITS: MomentImageContent = {
  ...CONTENT,
  units: [
    { unit: 'days', value: 6, label: 'days' },
    { unit: 'hours', value: 23, label: 'hours' },
    { unit: 'minutes', value: 59, label: 'minutes' },
    { unit: 'seconds', value: 42, label: 'seconds' },
  ],
};

function unitSpacing(content: MomentImageContent) {
  const ctx = new FakeContext();
  const layout = layoutMomentImage(ctx as unknown as CanvasRenderingContext2D, content, THEME, MOMENT_IMAGE_WIDTH);
  const units = layout.units;

  assert.ok(units);

  const labelWidths = content.units.map((entry) => {
    ctx.font = `400 ${units.labelSize}px ${THEME.fontFamily}`;
    return ctx.measureText(entry.label.toUpperCase()).width;
  });
  const numberWidths = content.units.map((entry) => {
    ctx.font = `700 ${units.numberSize}px ${THEME.fontFamily}`;
    return ctx.measureText(String(entry.value)).width;
  });
  const labelGaps = units.centers
    .slice(1)
    .map((center, index) => center - units.centers[index] - (labelWidths[index] + labelWidths[index + 1]) / 2);
  const numberGaps = units.centers
    .slice(1)
    .map((center, index) => center - units.centers[index] - (numberWidths[index] + numberWidths[index + 1]) / 2);
  const left = Math.min(
    ...units.centers.map((center, index) => center - Math.max(labelWidths[index], numberWidths[index]) / 2),
  );
  const right = Math.max(
    ...units.centers.map((center, index) => center + Math.max(labelWidths[index], numberWidths[index]) / 2),
  );

  return { layout, units, labelGaps, numberGaps, left, right };
}

describe('drawMomentImage', () => {
  it('draws the wordmark, name, date, units, and URL', () => {
    const { ctx } = draw();
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
    const { ctx, height } = draw();

    for (const entry of ctx.texts) {
      assert.ok(Number.isFinite(entry.x) && entry.x >= 0 && entry.x <= MOMENT_IMAGE_WIDTH);
      assert.ok(Number.isFinite(entry.y) && entry.y >= 0 && entry.y <= height);
      assert.ok(textWidth(entry) <= MOMENT_IMAGE_WIDTH - 128);
    }

    const title = ctx.texts.find((entry) => entry.text === CONTENT.name);
    const date = ctx.texts.find((entry) => entry.text === CONTENT.dateLabel);
    const days = ctx.texts.find((entry) => entry.text === '42');

    assert.ok(title && date && days);
    assert.ok(date.y >= title.y + fontSize(title.font));
    assert.ok(date.y + fontSize(date.font) <= days.y - fontSize(days.font) / 2);
  });

  it('wraps and truncates a long name within the canvas', () => {
    const { ctx, height } = draw({ ...CONTENT, name: 'a'.repeat(300) });
    const titleLines = ctx.texts.filter((entry) => /^a+\u2026?$/.test(entry.text));

    assert.ok(titleLines.length <= 3);

    for (const entry of ctx.texts) {
      assert.ok(entry.x >= 0 && entry.x <= MOMENT_IMAGE_WIDTH);
      assert.ok(entry.y >= 0 && entry.y <= height);
      assert.ok(textWidth(entry) <= MOMENT_IMAGE_WIDTH - 128);
    }

    const date = ctx.texts.find((entry) => entry.text === CONTENT.dateLabel);
    const days = ctx.texts.find((entry) => entry.text === '42');
    const lastTitle = titleLines[titleLines.length - 1];

    assert.ok(date && days && lastTitle);
    assert.ok(date.y >= lastTitle.y + fontSize(lastTitle.font));
    assert.ok(date.y + fontSize(date.font) <= days.y - fontSize(days.font) / 2);
  });

  it('draws the ended message without unit values', () => {
    const { ctx } = draw({ ...CONTENT, units: [] });
    const all = ctx.texts.map((entry) => entry.text);

    assert.ok(all.includes('Timer finished.'));
    assert.ok(!all.includes('42'));
    assert.ok(!all.includes('DAYS'));
  });

  it('draws only the date when there is no time', () => {
    const { ctx } = draw({ ...CONTENT, timeLabel: null });
    const all = ctx.texts.map((entry) => entry.text);

    assert.ok(all.includes('Friday, January 1, 2027'));
    assert.ok(!all.includes('13:05'));
  });

  it('uses the theme colors for the background gradient', () => {
    const { ctx } = draw();

    assert.deepEqual(ctx.gradientStops, [
      { offset: 0, color: THEME.backgroundStart },
      { offset: 1, color: THEME.backgroundEnd },
    ]);
  });
});

describe('layoutUnits', () => {
  it('uses the wide label gap for two and three units and keeps four units fitted', () => {
    for (const content of [TWO_UNITS, THREE_UNITS, FOUR_UNITS]) {
      const { labelGaps } = unitSpacing(content);
      const expectedGap = content.units.length === 4 ? 30 : 48;

      assert.ok(labelGaps.length > 0);

      for (const gap of labelGaps) {
        assert.ok(Math.abs(gap - expectedGap) < 0.001, `label gap was ${gap}`);
      }
    }
  });

  it('keeps adjacent numbers apart and the unit row inside the canvas', () => {
    for (const content of [TWO_UNITS, THREE_UNITS, FOUR_UNITS]) {
      const { numberGaps, left, right, units } = unitSpacing(content);
      const minMargin = content.units.length === 4 ? 64 : 24;

      for (const gap of numberGaps) {
        assert.ok(gap >= 23.999, `number gap was ${gap}`);
      }

      assert.ok(left >= minMargin - 0.001, `row started at ${left}`);
      assert.ok(right <= MOMENT_IMAGE_WIDTH - minMargin + 0.001, `row ended at ${right}`);
      assert.ok(units.labelSize >= 24, `label size was ${units.labelSize}`);
    }
  });

  it('shrinks a single-unit number that would overflow the canvas', () => {
    const content: MomentImageContent = {
      ...CONTENT,
      units: [{ unit: 'days', value: 1_234_567, label: 'days' }],
    };
    const { left, right, units } = unitSpacing(content);

    assert.ok(left >= -0.001, `row started at ${left}`);
    assert.ok(right <= MOMENT_IMAGE_WIDTH + 0.001, `row ended at ${right}`);
    assert.ok(units.numberSize < 240);
  });
});

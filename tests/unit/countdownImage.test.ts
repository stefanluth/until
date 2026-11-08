import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { buildCountdownImageContent, buildCountdownImageFilename } from '../../app/_utils/countdownImage.ts';

const DATE = new Date(2027, 0, 1, 0, 0, 0);
const URL = 'https://until.example/new-year-abc12345';

describe('buildCountdownImageContent', () => {
  it('maps the same units as the card display', () => {
    const content = buildCountdownImageContent({
      name: 'New Year',
      date: DATE,
      remaining: { days: 1, hours: 2, minutes: 3, seconds: 4 },
      url: URL,
    });

    assert.equal(content.ended, false);
    assert.equal(content.name, 'New Year');
    assert.equal(content.url, URL);
    assert.equal(content.dateLabel, 'Friday, January 1, 2027');
    assert.equal(content.timeLabel, null);
    assert.deepEqual(content.units, [
      { unit: 'days', value: 1, label: 'day' },
      { unit: 'hours', value: 2, label: 'hours' },
      { unit: 'minutes', value: 3, label: 'minutes' },
      { unit: 'seconds', value: 4, label: 'seconds' },
    ]);
  });

  it('includes the time when the countdown has one', () => {
    const content = buildCountdownImageContent({
      name: 'New Year',
      date: new Date(2027, 0, 1, 13, 5, 0),
      remaining: { days: 1, hours: 2, minutes: 3, seconds: 4 },
    });

    assert.equal(content.dateLabel, 'Friday, January 1, 2027');
    assert.ok(content.timeLabel?.includes('01:05'));
  });

  it('keeps the suffix rule for sub-day countdowns', () => {
    const content = buildCountdownImageContent({
      name: 'Soon',
      date: DATE,
      remaining: { days: 0, hours: 0, minutes: 0, seconds: 30 },
      locale: 'en-US',
    });

    assert.deepEqual(content.units, [{ unit: 'seconds', value: 30, label: 'seconds' }]);
  });

  it('shows only days at the threshold', () => {
    const content = buildCountdownImageContent({
      name: 'Later',
      date: DATE,
      remaining: { days: 7, hours: 5, minutes: 4, seconds: 3 },
      locale: 'en-US',
    });

    assert.deepEqual(content.units, [{ unit: 'days', value: 7, label: 'days' }]);
  });

  it('marks a finished countdown as ended', () => {
    const content = buildCountdownImageContent({
      name: 'Done',
      date: DATE,
      remaining: { days: 0, hours: 0, minutes: 0, seconds: 0 },
      locale: 'en-US',
    });

    assert.equal(content.ended, true);
    assert.deepEqual(content.units, []);
  });
});

describe('buildCountdownImageFilename', () => {
  it('slugifies a decorated name into a safe png filename', () => {
    assert.equal(
      buildCountdownImageFilename("New Year's Eve \u{1f389}", new Date(2026, 11, 31, 12, 0, 0)),
      'until-new-year-s-eve-2026-12-31.png',
    );
  });

  it('falls back to countdown when the name has no safe characters', () => {
    assert.equal(
      buildCountdownImageFilename('???', new Date(2026, 11, 31, 12, 0, 0)),
      'until-countdown-2026-12-31.png',
    );
  });

  it('bounds long names and removes unsafe path characters', () => {
    const filename = buildCountdownImageFilename('../../etc/passwd:*?"<>|', new Date(2026, 11, 31, 12, 0, 0));

    assert.equal(filename, 'until-etc-passwd-2026-12-31.png');
    assert.ok(filename.length <= 69);
    assert.ok(!/[\\/:*?"<>|]/.test(filename));
  });
});

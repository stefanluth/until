import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { buildMomentImageContent, buildMomentImageFilename } from '../../app/_utils/momentImage.ts';

const DATE = new Date(2027, 0, 1, 0, 0, 0);
const URL = 'https://until.example/new-year-abc12345';

describe('buildMomentImageContent', () => {
  it('maps the same units as the card display', () => {
    const content = buildMomentImageContent({
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

  it('includes the time when the moment has one', () => {
    const content = buildMomentImageContent({
      name: 'New Year',
      date: new Date(2027, 0, 1, 13, 5, 0),
      remaining: { days: 1, hours: 2, minutes: 3, seconds: 4 },
    });

    assert.equal(content.dateLabel, 'Friday, January 1, 2027');
    assert.ok(content.timeLabel?.includes('01:05'));
  });

  it('keeps the suffix rule for sub-day moments', () => {
    const content = buildMomentImageContent({
      name: 'Soon',
      date: DATE,
      remaining: { days: 0, hours: 0, minutes: 0, seconds: 30 },
      locale: 'en-US',
    });

    assert.deepEqual(content.units, [{ unit: 'seconds', value: 30, label: 'seconds' }]);
  });

  it('shows only days at the threshold', () => {
    const content = buildMomentImageContent({
      name: 'Later',
      date: DATE,
      remaining: { days: 7, hours: 5, minutes: 4, seconds: 3 },
      locale: 'en-US',
    });

    assert.deepEqual(content.units, [{ unit: 'days', value: 7, label: 'days' }]);
  });

  it('marks a finished moment as ended', () => {
    const content = buildMomentImageContent({
      name: 'Done',
      date: DATE,
      remaining: { days: 0, hours: 0, minutes: 0, seconds: 0 },
      locale: 'en-US',
    });

    assert.equal(content.ended, true);
    assert.deepEqual(content.units, []);
  });
});

describe('buildMomentImageFilename', () => {
  it('slugifies a decorated name into a safe png filename', () => {
    assert.equal(
      buildMomentImageFilename("New Year's Eve \u{1f389}", new Date(2026, 11, 31, 12, 0, 0)),
      'until-new-year-s-eve-2026-12-31.png',
    );
  });

  it('falls back to moment when the name has no safe characters', () => {
    assert.equal(buildMomentImageFilename('???', new Date(2026, 11, 31, 12, 0, 0)), 'until-moment-2026-12-31.png');
  });

  it('bounds long names and removes unsafe path characters', () => {
    const filename = buildMomentImageFilename('../../etc/passwd:*?"<>|', new Date(2026, 11, 31, 12, 0, 0));

    assert.equal(filename, 'until-etc-passwd-2026-12-31.png');
    assert.ok(filename.length <= 69);
    assert.ok(!/[\\/:*?"<>|]/.test(filename));
  });
});

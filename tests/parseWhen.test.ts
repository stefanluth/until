import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { parseWhen } from '../app/utils/parseWhen.ts';

const NOW = new Date('2026-01-01T00:00:00.000Z');

describe('parseWhen', () => {
  it('parses durations', () => {
    const result = parseWhen('1d 2h 3m 4s', NOW);

    assert.ok(result);
    assert.equal(result.toISOString(), '2026-01-02T02:03:04.000Z');
  });

  it('parses calendar dates in local time', () => {
    const result = parseWhen('25-12-2026 18:30', NOW);

    assert.ok(result);
    assert.equal(result.getFullYear(), 2026);
    assert.equal(result.getMonth(), 11);
    assert.equal(result.getDate(), 25);
    assert.equal(result.getHours(), 18);
    assert.equal(result.getMinutes(), 30);
  });

  it('rejects invalid calendar dates', () => {
    assert.equal(parseWhen('31-02-2026', NOW), null);
  });

  it('rejects empty values', () => {
    assert.equal(parseWhen('   ', NOW), null);
  });

  it('rejects durations that overflow the date range', () => {
    assert.equal(parseWhen('999999999999999999999999999999999999999999d', NOW), null);
  });

  it('rejects durations over the maximum', () => {
    assert.equal(parseWhen('40000d', NOW), null);
  });
});

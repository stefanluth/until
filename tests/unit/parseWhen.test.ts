import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { parseWhen } from '../../app/_utils/parseWhen.ts';
import { NOW } from '../support/dates.ts';

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

  it('parses years below 100', () => {
    const result = parseWhen('01-01-0050 12:30', NOW);

    assert.ok(result);
    assert.equal(result.getFullYear(), 50);
    assert.equal(result.getMonth(), 0);
    assert.equal(result.getDate(), 1);
    assert.equal(result.getHours(), 12);
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

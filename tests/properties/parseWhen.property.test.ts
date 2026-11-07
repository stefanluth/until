import fc from 'fast-check';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { parseWhen } from '../../app/_utils/parseWhen.ts';
import { calendarDateParts, durationParts } from '../support/arbitraries.ts';
import { NOW, pad } from '../support/dates.ts';

describe('parseWhen properties', () => {
  it('round-trips durations', () => {
    fc.assert(
      fc.property(durationParts, ({ days, hours, minutes, seconds }) => {
        const totalMs = ((days * 24 * 60 + hours * 60 + minutes) * 60 + seconds) * 1000;
        const result = parseWhen(`${days}d ${hours}h ${minutes}m ${seconds}s`, NOW);

        assert.ok(result);
        assert.equal(result.toISOString(), new Date(NOW.getTime() + totalMs).toISOString());
      }),
    );
  });

  it('round-trips calendar dates', () => {
    fc.assert(
      fc.property(calendarDateParts, ({ day, month, year, hours, minutes, seconds }) => {
        const input = `${pad(day)}-${pad(month)}-${pad(year, 4)} ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
        const result = parseWhen(input, NOW);

        assert.ok(result);
        assert.deepEqual(
          [
            result.getFullYear(),
            result.getMonth() + 1,
            result.getDate(),
            result.getHours(),
            result.getMinutes(),
            result.getSeconds(),
          ],
          [year, month, day, hours, minutes, seconds],
        );
      }),
    );
  });

  it('never throws on arbitrary input', () => {
    fc.assert(
      fc.property(fc.string(), (value) => {
        const result = parseWhen(value, NOW);

        assert.ok(result === null || Number.isFinite(result.getTime()));
      }),
    );
  });
});

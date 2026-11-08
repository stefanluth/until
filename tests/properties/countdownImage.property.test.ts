import fc from 'fast-check';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { buildCountdownImageFilename } from '../../app/_utils/countdownImage.ts';

const DATE = new Date(2026, 11, 31, 12, 0, 0);
const FILENAME_PATTERN = /^until-[a-z0-9]+(?:-[a-z0-9]+)*-\d{4}-\d{2}-\d{2}\.png$/;

describe('buildCountdownImageFilename properties', () => {
  it('always returns a safe, bounded png filename', () => {
    fc.assert(
      fc.property(fc.string(), (name) => {
        const filename = buildCountdownImageFilename(name, DATE);

        assert.match(filename, FILENAME_PATTERN);
        assert.ok(!/[\\/:*?"<>|]/.test(filename));
        assert.ok(filename.length <= 69);
      }),
    );
  });

  it('is deterministic', () => {
    fc.assert(
      fc.property(fc.string(), (name) => {
        assert.equal(buildCountdownImageFilename(name, DATE), buildCountdownImageFilename(name, DATE));
      }),
    );
  });
});

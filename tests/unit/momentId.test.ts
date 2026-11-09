import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createMomentId } from '../../app/_utils/momentId.ts';

const DATE = new Date('2026-01-01T00:00:00.000Z');

describe('createMomentId', () => {
  it('is deterministic for the same name and date', () => {
    assert.equal(createMomentId('Birthday', DATE), createMomentId('Birthday', DATE));
  });

  it('uses a readable lowercase slug and eight hexadecimal hash characters', () => {
    assert.match(createMomentId('My Event', DATE), /^my-event-[0-9a-f]{8}$/);
    assert.match(createMomentId('3 tage', DATE), /^3-tage-[0-9a-f]{8}$/);
  });

  it('strips accents and punctuation', () => {
    assert.match(createMomentId('Café au lait!', DATE), /^cafe-au-lait-[0-9a-f]{8}$/);
  });

  it('falls back to a generic slug when the name has no ASCII letters', () => {
    assert.match(createMomentId('派对', DATE), /^moment-[0-9a-f]{8}$/);
    assert.match(createMomentId('🎉 party', DATE), /^party-[0-9a-f]{8}$/);
  });

  it('keeps the slug bounded and never leaves a trailing hyphen', () => {
    const slug = createMomentId('a'.repeat(100), DATE).slice(0, -9);

    assert.equal(slug.length <= 48, true);
    assert.doesNotMatch(slug, /-$/);
  });

  it('does not contain percent-encoding, spaces, slashes, or uppercase letters', () => {
    const id = createMomentId('A B/C', DATE);

    assert.doesNotMatch(id, /[% /]|[A-Z]/);
  });

  it('distinguishes names that slugify the same', () => {
    assert.notEqual(createMomentId('Café', DATE), createMomentId('Cafe', DATE));
  });

  it('changes when the date changes', () => {
    const later = new Date('2026-01-01T00:00:01.000Z');

    assert.notEqual(createMomentId('Birthday', DATE), createMomentId('Birthday', later));
  });
});

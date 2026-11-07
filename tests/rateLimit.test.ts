import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { consumeRateLimit, getRateLimitKey } from '../app/utils/rateLimit.ts';

const START = 1_700_000_000_000;
const WINDOW_MS = 10 * 60 * 1000;

describe('consumeRateLimit', () => {
  it('allows ten requests per key and blocks the eleventh', () => {
    const key = 'per-key-test';

    for (let index = 0; index < 10; index += 1) {
      assert.equal(consumeRateLimit(key, START + index), true);
    }

    assert.equal(consumeRateLimit(key, START + 10), false);
  });

  it('resets after the window expires', () => {
    const key = 'window-test';

    assert.equal(consumeRateLimit(key, START), true);
    assert.equal(consumeRateLimit(key, START + WINDOW_MS), true);
  });
});

describe('getRateLimitKey', () => {
  it('prefers the Cloudflare client IP', () => {
    const headers = new Headers({
      'cf-connecting-ip': '203.0.113.10',
      'x-forwarded-for': '198.51.100.1, 198.51.100.2',
    });

    assert.equal(getRateLimitKey(headers), '203.0.113.10');
  });

  it('falls back to the first forwarded IP', () => {
    const headers = new Headers({ 'x-forwarded-for': '198.51.100.1, 198.51.100.2' });

    assert.equal(getRateLimitKey(headers), '198.51.100.1');
  });

  it('falls back to unknown', () => {
    assert.equal(getRateLimitKey(new Headers()), 'unknown');
  });
});

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createRateLimiter, getRateLimitKey } from '../../app/_utils/rateLimit.ts';
import { createHeaders } from '../support/headers.ts';

const START = 1_700_000_000_000;
const WINDOW_MS = 10 * 60 * 1000;

describe('createRateLimiter', () => {
  it('allows ten requests per key and blocks the eleventh', () => {
    const limiter = createRateLimiter();

    for (let index = 0; index < 10; index += 1) {
      assert.equal(limiter.consume('per-key-test', START + index), true);
    }

    assert.equal(limiter.consume('per-key-test', START + 10), false);
  });

  it('resets after the window expires', () => {
    const limiter = createRateLimiter();

    assert.equal(limiter.consume('window-test', START), true);
    assert.equal(limiter.consume('window-test', START + WINDOW_MS), true);
  });

  it('shares the global limit across keys', () => {
    const limiter = createRateLimiter();

    for (let index = 0; index < 100; index += 1) {
      assert.equal(limiter.consume(`key-${index}`, START + index), true);
    }

    assert.equal(limiter.consume('other', START + 100), false);
  });

  it('keeps independent state per limiter', () => {
    const first = createRateLimiter();
    const second = createRateLimiter();

    for (let index = 0; index < 10; index += 1) {
      first.consume('shared-key', START + index);
    }

    assert.equal(first.consume('shared-key', START + 10), false);
    assert.equal(second.consume('shared-key', START + 10), true);
  });
});

describe('getRateLimitKey', () => {
  it('prefers the Cloudflare client IP', () => {
    const headers = createHeaders({
      'cf-connecting-ip': '203.0.113.10',
      'x-forwarded-for': '198.51.100.1, 198.51.100.2',
    });

    assert.equal(getRateLimitKey(headers), '203.0.113.10');
  });

  it('falls back to the first forwarded IP', () => {
    const headers = createHeaders({ 'x-forwarded-for': '198.51.100.1, 198.51.100.2' });

    assert.equal(getRateLimitKey(headers), '198.51.100.1');
  });

  it('falls back to x-real-ip', () => {
    assert.equal(getRateLimitKey(createHeaders({ 'x-real-ip': '192.0.2.1' })), '192.0.2.1');
  });

  it('falls back to unknown', () => {
    assert.equal(getRateLimitKey(createHeaders({})), 'unknown');
  });

  it('trims and ignores blank values', () => {
    const headers = createHeaders({ 'cf-connecting-ip': '   ', 'x-forwarded-for': ' 198.51.100.1 ' });

    assert.equal(getRateLimitKey(headers), '198.51.100.1');
  });

  it('truncates keys to 128 characters', () => {
    assert.equal(getRateLimitKey(createHeaders({ 'cf-connecting-ip': 'a'.repeat(200) })), 'a'.repeat(128));
  });
});

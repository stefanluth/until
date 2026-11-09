import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type MomentFormState, submitMomentAction } from '@/_actions/submitMoment';
import { CONSENT_COOKIE, MOMENT_LIST_COOKIE } from '@/_utils/cookies';
import { encodeMomentToken } from '@/_utils/momentUrl';

type CookieCall =
  | { type: 'get'; name: string }
  | { type: 'set'; name: string; value: string; options: unknown }
  | { type: 'delete'; options: { name: string; path: string } };

const runtime = vi.hoisted(() => {
  const values = new Map<string, string>();
  const calls: CookieCall[] = [];
  const cookies = vi.fn(async () => ({
    get(name: string) {
      calls.push({ type: 'get', name });
      const value = values.get(name);
      return value === undefined ? undefined : { value };
    },
    set(name: string, value: string, options: unknown) {
      values.set(name, value);
      calls.push({ type: 'set', name, value, options });
    },
    delete(options: { name: string; path: string }) {
      values.delete(options.name);
      calls.push({ type: 'delete', options });
    },
  }));
  const headers = vi.fn(async () => ({
    get(name: string): string | null {
      const values: Record<string, string> = { 'cf-connecting-ip': '203.0.113.10' };
      return values[name] ?? null;
    },
  }));
  const consumeRateLimit = vi.fn(() => true);
  const getRateLimitKey = vi.fn(() => 'rate-key');
  const redirect = vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  });

  return { calls, cookies, consumeRateLimit, getRateLimitKey, headers, redirect, values };
});

vi.mock('next/headers', () => ({ cookies: runtime.cookies, headers: runtime.headers }));
vi.mock('next/navigation', () => ({ redirect: runtime.redirect }));
vi.mock('@/_utils/rateLimit', () => ({
  consumeRateLimit: runtime.consumeRateLimit,
  getRateLimitKey: runtime.getRateLimitKey,
}));

const INITIAL_STATE: MomentFormState = { error: '', location: '' };
const DATE = '2030-01-01T00:00:00.000Z';

function form(values: { name?: string; when?: string; date?: string }) {
  const data = new FormData();

  if (values.name !== undefined) data.set('name', values.name);
  if (values.when !== undefined) data.set('when', values.when);
  if (values.date !== undefined) data.set('date', values.date);

  return data;
}

function cookieWrites() {
  return runtime.calls.filter((call) => call.type === 'set' || call.type === 'delete');
}

function grantConsent(value = 'true') {
  runtime.values.set(CONSENT_COOKIE, value);
}

beforeEach(() => {
  runtime.calls.length = 0;
  runtime.values.clear();
  runtime.consumeRateLimit.mockReset().mockReturnValue(true);
  runtime.getRateLimitKey.mockReset().mockReturnValue('rate-key');
  runtime.redirect.mockClear();
});

describe('submitMoment guards', () => {
  it('requires consent before reading headers or checking the rate limit', async () => {
    const result = await submitMomentAction(INITIAL_STATE, form({ name: 'Party', when: '1d' }));

    expect(result).toEqual({
      error: 'Accept cookies to create a moment.',
      location: 'consent',
    });
    expect(runtime.headers).not.toHaveBeenCalled();
    expect(runtime.consumeRateLimit).not.toHaveBeenCalled();
    expect(cookieWrites()).toEqual([]);
  });

  it('stops at the rate-limit guard before validation', async () => {
    grantConsent();
    runtime.consumeRateLimit.mockReturnValue(false);

    const result = await submitMomentAction(INITIAL_STATE, form({ name: 'Party', when: '1d' }));

    expect(result).toEqual({
      error: 'Too many moments. Try again later.',
      location: 'form',
    });
    expect(runtime.getRateLimitKey).toHaveBeenCalledTimes(1);
    expect(runtime.consumeRateLimit).toHaveBeenCalledWith('rate-key');
    expect(cookieWrites()).toEqual([]);
  });

  it('validates the name before redirecting', async () => {
    grantConsent();

    const result = await submitMomentAction(INITIAL_STATE, form({ when: '1d' }));

    expect(result).toMatchObject({ error: 'Name is required', location: 'name' });
    expect(runtime.redirect).not.toHaveBeenCalled();
    expect(cookieWrites()).toEqual([]);
  });

  it('validates the when value before redirecting', async () => {
    grantConsent();

    const result = await submitMomentAction(INITIAL_STATE, form({ name: 'Party' }));

    expect(result).toMatchObject({ error: 'Duration or date is required', location: 'when' });
    expect(runtime.redirect).not.toHaveBeenCalled();
    expect(cookieWrites()).toEqual([]);
  });

  it('rejects an unparseable when value before redirecting', async () => {
    grantConsent();

    const result = await submitMomentAction(INITIAL_STATE, form({ name: 'Party', when: 'not a date' }));

    expect(result).toEqual({
      error: 'e.g. 1d 2h 3m or 25-12-2026 18:00',
      location: 'when',
    });
    expect(runtime.redirect).not.toHaveBeenCalled();
    expect(cookieWrites()).toEqual([]);
  });

  it('rejects names longer than 32 characters', async () => {
    grantConsent();

    const result = await submitMomentAction(INITIAL_STATE, form({ name: 'a'.repeat(33), when: '1d' }));

    expect(result).toMatchObject({ error: 'Name must be 32 characters or fewer', location: 'name' });
    expect(runtime.redirect).not.toHaveBeenCalled();
  });
});

describe('submitMoment URL creation', () => {
  it('creates the token, appends the cookie, and redirects to it', async () => {
    grantConsent();
    const id = encodeMomentToken('Party', new Date(DATE));

    await expect(
      submitMomentAction(INITIAL_STATE, form({ name: '  Party  ', when: '1d', date: DATE })),
    ).rejects.toThrow(`REDIRECT:/${id}`);

    expect(runtime.values.get(MOMENT_LIST_COOKIE)).toBe(id);
    expect(runtime.redirect).toHaveBeenCalledWith(`/${id}`);
  });

  it('does not duplicate the cookie entry when the token is already saved', async () => {
    grantConsent();
    const id = encodeMomentToken('Party', new Date(DATE));
    runtime.values.set(MOMENT_LIST_COOKIE, id);

    await expect(submitMomentAction(INITIAL_STATE, form({ name: 'Party', when: '1d', date: DATE }))).rejects.toThrow(
      `REDIRECT:/${id}`,
    );

    expect(runtime.values.get(MOMENT_LIST_COOKIE)).toBe(id);
    expect(runtime.redirect).toHaveBeenCalledWith(`/${id}`);
  });

  it('preserves the exact case and accents in the URL', async () => {
    grantConsent();
    const id = encodeMomentToken('Café', new Date(DATE));

    await expect(submitMomentAction(INITIAL_STATE, form({ name: 'Café', when: '1d', date: DATE }))).rejects.toThrow(
      `REDIRECT:/${id}`,
    );

    expect(id).toMatch(/^Caf%C3%A9@/);
    expect(runtime.redirect).toHaveBeenCalledWith(`/${id}`);
  });

  it('prefers a valid client date over the parsed when value', async () => {
    grantConsent();
    const clientDate = '2031-02-03T04:05:06.000Z';
    const id = encodeMomentToken('Party', new Date(clientDate));

    await expect(
      submitMomentAction(INITIAL_STATE, form({ name: 'Party', when: '25-12-2026 18:00', date: clientDate })),
    ).rejects.toThrow(`REDIRECT:/${id}`);

    expect(runtime.values.get(MOMENT_LIST_COOKIE)).toBe(id);
  });

  it('falls back to the parsed when value when the client date is missing', async () => {
    grantConsent();
    const id = encodeMomentToken('Party', new Date('2026-12-25T18:00:00.000Z'));

    await expect(submitMomentAction(INITIAL_STATE, form({ name: 'Party', when: '25-12-2026 18:00' }))).rejects.toThrow(
      `REDIRECT:/${id}`,
    );

    expect(runtime.values.get(MOMENT_LIST_COOKIE)).toBe(id);
  });

  it('falls back to the parsed when value when the client date is invalid', async () => {
    grantConsent();
    const id = encodeMomentToken('Party', new Date('2026-12-25T18:00:00.000Z'));

    await expect(
      submitMomentAction(INITIAL_STATE, form({ name: 'Party', when: '25-12-2026 18:00', date: 'not-a-date' })),
    ).rejects.toThrow(`REDIRECT:/${id}`);

    expect(runtime.values.get(MOMENT_LIST_COOKIE)).toBe(id);
  });

  it('filters malformed and legacy cookie entries when appending the new token', async () => {
    grantConsent();
    const other = encodeMomentToken('Existing', new Date('2027-01-01T00:00:00.000Z'));
    const id = encodeMomentToken('Party', new Date(DATE));
    runtime.values.set(MOMENT_LIST_COOKIE, `bad id,birthday-abc12345,${other}`);

    await expect(submitMomentAction(INITIAL_STATE, form({ name: 'Party', when: '1d', date: DATE }))).rejects.toThrow(
      `REDIRECT:/${id}`,
    );

    expect(runtime.values.get(MOMENT_LIST_COOKIE)).toBe(`${other},${id}`);
  });
});

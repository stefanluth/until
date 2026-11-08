import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type CountdownFormState, submitCountdownAction } from '@/_actions/submitCountdown';
import { CONSENT_COOKIE, COUNTDOWN_LIST_COOKIE } from '@/_utils/cookies';
import { createCountdownId } from '@/_utils/countdownId';

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
  const createCountdown = vi.fn(async () => true);
  const consumeRateLimit = vi.fn(() => true);
  const getRateLimitKey = vi.fn(() => 'rate-key');
  const redirect = vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  });

  return { calls, cookies, createCountdown, consumeRateLimit, getRateLimitKey, headers, redirect, values };
});

vi.mock('next/headers', () => ({ cookies: runtime.cookies, headers: runtime.headers }));
vi.mock('next/navigation', () => ({ redirect: runtime.redirect }));
vi.mock('@/db', () => ({ createCountdown: runtime.createCountdown }));
vi.mock('@/_utils/rateLimit', () => ({
  consumeRateLimit: runtime.consumeRateLimit,
  getRateLimitKey: runtime.getRateLimitKey,
}));

const INITIAL_STATE: CountdownFormState = { error: '', location: '' };
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
  runtime.createCountdown.mockReset().mockResolvedValue(true);
  runtime.consumeRateLimit.mockReset().mockReturnValue(true);
  runtime.getRateLimitKey.mockReset().mockReturnValue('rate-key');
  runtime.redirect.mockClear();
});

describe('submitCountdown guards', () => {
  it('requires consent before reading headers or creating anything', async () => {
    const result = await submitCountdownAction(INITIAL_STATE, form({ name: 'Party', when: '1d' }));

    expect(result).toEqual({
      error: 'Please accept the cookie notice before creating a countdown.',
      location: 'consent',
    });
    expect(runtime.headers).not.toHaveBeenCalled();
    expect(runtime.consumeRateLimit).not.toHaveBeenCalled();
    expect(runtime.createCountdown).not.toHaveBeenCalled();
    expect(cookieWrites()).toEqual([]);
  });

  it('stops at the rate-limit guard before validation or the database', async () => {
    grantConsent();
    runtime.consumeRateLimit.mockReturnValue(false);

    const result = await submitCountdownAction(INITIAL_STATE, form({ name: 'Party', when: '1d' }));

    expect(result).toEqual({
      error: 'Too many countdowns created. Please try again later.',
      location: 'form',
    });
    expect(runtime.getRateLimitKey).toHaveBeenCalledTimes(1);
    expect(runtime.consumeRateLimit).toHaveBeenCalledWith('rate-key');
    expect(runtime.createCountdown).not.toHaveBeenCalled();
    expect(cookieWrites()).toEqual([]);
  });

  it('validates the name before reaching the database', async () => {
    grantConsent();

    const result = await submitCountdownAction(INITIAL_STATE, form({ when: '1d' }));

    expect(result).toMatchObject({ error: 'Name is required', location: 'name' });
    expect(runtime.createCountdown).not.toHaveBeenCalled();
    expect(cookieWrites()).toEqual([]);
  });

  it('validates the when value before reaching the database', async () => {
    grantConsent();

    const result = await submitCountdownAction(INITIAL_STATE, form({ name: 'Party' }));

    expect(result).toMatchObject({ error: 'Duration or date is required', location: 'when' });
    expect(runtime.createCountdown).not.toHaveBeenCalled();
    expect(cookieWrites()).toEqual([]);
  });

  it('rejects an unparseable when value before reaching the database', async () => {
    grantConsent();

    const result = await submitCountdownAction(INITIAL_STATE, form({ name: 'Party', when: 'not a date' }));

    expect(result).toEqual({
      error: 'Enter a duration like 1d 2h 3m or a date like 25-12-2026 18:00',
      location: 'when',
    });
    expect(runtime.createCountdown).not.toHaveBeenCalled();
    expect(cookieWrites()).toEqual([]);
  });

  it('reports a duplicate when the database insert does nothing', async () => {
    grantConsent();
    runtime.createCountdown.mockResolvedValue(false);

    const result = await submitCountdownAction(INITIAL_STATE, form({ name: 'Party', when: '1d', date: DATE }));

    expect(result).toEqual({ error: 'Countdown already exists', location: 'name' });
    expect(runtime.createCountdown).toHaveBeenCalledTimes(1);
    expect(cookieWrites()).toEqual([]);
  });

  it('reports a duplicate when the id is already in the cookie', async () => {
    grantConsent();
    const id = createCountdownId('Party', new Date(DATE));
    runtime.values.set(COUNTDOWN_LIST_COOKIE, id);

    const result = await submitCountdownAction(INITIAL_STATE, form({ name: 'Party', when: '1d', date: DATE }));

    expect(result).toEqual({ error: 'Countdown already exists', location: 'name' });
    expect(runtime.createCountdown).toHaveBeenCalledTimes(1);
    expect(cookieWrites()).toEqual([]);
  });

  it('creates the countdown, appends the cookie, and redirects on success', async () => {
    grantConsent();

    await expect(
      submitCountdownAction(INITIAL_STATE, form({ name: '  Party  ', when: '1d', date: DATE })),
    ).rejects.toThrow('REDIRECT:/countdowns');

    const id = createCountdownId('Party', new Date(DATE));

    expect(runtime.createCountdown).toHaveBeenCalledWith({ id, name: 'Party', date: new Date(DATE) });
    expect(runtime.values.get(COUNTDOWN_LIST_COOKIE)).toBe(id);
    expect(runtime.redirect).toHaveBeenCalledWith('/countdowns');
  });

  it('prefers a valid client date over the parsed when value', async () => {
    grantConsent();
    const clientDate = '2031-02-03T04:05:06.000Z';

    await expect(
      submitCountdownAction(INITIAL_STATE, form({ name: 'Party', when: '25-12-2026 18:00', date: clientDate })),
    ).rejects.toThrow('REDIRECT:/countdowns');

    expect(runtime.createCountdown).toHaveBeenCalledWith(expect.objectContaining({ date: new Date(clientDate) }));
  });

  it('falls back to the parsed when value when the client date is missing', async () => {
    grantConsent();

    await expect(
      submitCountdownAction(INITIAL_STATE, form({ name: 'Party', when: '25-12-2026 18:00' })),
    ).rejects.toThrow('REDIRECT:/countdowns');

    expect(runtime.createCountdown).toHaveBeenCalledWith(
      expect.objectContaining({ date: new Date('2026-12-25T18:00:00.000Z') }),
    );
  });

  it('falls back to the parsed when value when the client date is invalid', async () => {
    grantConsent();

    await expect(
      submitCountdownAction(INITIAL_STATE, form({ name: 'Party', when: '25-12-2026 18:00', date: 'not-a-date' })),
    ).rejects.toThrow('REDIRECT:/countdowns');

    expect(runtime.createCountdown).toHaveBeenCalledWith(
      expect.objectContaining({ date: new Date('2026-12-25T18:00:00.000Z') }),
    );
  });

  it('filters malformed cookie entries when appending the new id', async () => {
    grantConsent();
    runtime.values.set(COUNTDOWN_LIST_COOKIE, 'bad id,other-def67890');

    await expect(submitCountdownAction(INITIAL_STATE, form({ name: 'Party', when: '1d', date: DATE }))).rejects.toThrow(
      'REDIRECT:/countdowns',
    );

    const id = createCountdownId('Party', new Date(DATE));
    expect(runtime.values.get(COUNTDOWN_LIST_COOKIE)).toBe(`other-def67890,${id}`);
  });

  it('does not write a cookie when the database rejects', async () => {
    grantConsent();
    runtime.createCountdown.mockRejectedValue(new Error('db down'));

    await expect(submitCountdownAction(INITIAL_STATE, form({ name: 'Party', when: '1d', date: DATE }))).rejects.toThrow(
      'db down',
    );

    expect(cookieWrites()).toEqual([]);
  });
});

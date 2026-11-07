import { beforeEach, describe, expect, it, vi } from 'vitest';

import { addCountdown } from '@/_actions/addCountdown';
import { CONSENT_COOKIE, COOKIE_OPTIONS, COUNTDOWN_LIST_COOKIE } from '@/_utils/cookies';

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

  return { calls, cookies, values };
});

vi.mock('next/headers', () => ({ cookies: runtime.cookies }));

const VALID_ID = 'Birthday-abc12345';
const OTHER_ID = 'Other-def67890';

function cookieWrites() {
  return runtime.calls.filter((call) => call.type === 'set' || call.type === 'delete');
}

beforeEach(() => {
  runtime.calls.length = 0;
  runtime.values.clear();
});

describe('addCountdown guards', () => {
  it('rejects an invalid id before reading cookies', async () => {
    const result = await addCountdown('bad id');

    expect(result).toBe('invalid');
    expect(runtime.cookies).not.toHaveBeenCalled();
    expect(runtime.calls).toEqual([]);
  });

  it('treats a missing consent cookie as not granted', async () => {
    const result = await addCountdown(VALID_ID);

    expect(result).toBe('consent');
    expect(cookieWrites()).toEqual([]);
  });

  it('treats a non-exact consent marker as not granted', async () => {
    runtime.values.set(CONSENT_COOKIE, 'TRUE');

    const result = await addCountdown(VALID_ID);

    expect(result).toBe('consent');
    expect(cookieWrites()).toEqual([]);
  });

  it('adds a new id with the shared cookie options', async () => {
    runtime.values.set(CONSENT_COOKIE, 'true');

    const result = await addCountdown(VALID_ID);

    expect(result).toBe('added');
    expect(runtime.values.get(COUNTDOWN_LIST_COOKIE)).toBe(VALID_ID);
    expect(runtime.calls).toContainEqual({
      type: 'set',
      name: COUNTDOWN_LIST_COOKIE,
      value: VALID_ID,
      options: COOKIE_OPTIONS,
    });
  });

  it('does not rewrite an existing id', async () => {
    runtime.values.set(CONSENT_COOKIE, 'true');
    runtime.values.set(COUNTDOWN_LIST_COOKIE, VALID_ID);

    const result = await addCountdown(VALID_ID);

    expect(result).toBe('exists');
    expect(cookieWrites()).toEqual([]);
  });

  it('filters malformed entries before appending', async () => {
    runtime.values.set(CONSENT_COOKIE, 'true');
    runtime.values.set(COUNTDOWN_LIST_COOKIE, `bad id,${OTHER_ID}`);

    const result = await addCountdown(VALID_ID);

    expect(result).toBe('added');
    expect(runtime.values.get(COUNTDOWN_LIST_COOKIE)).toBe(`${OTHER_ID},${VALID_ID}`);
  });
});

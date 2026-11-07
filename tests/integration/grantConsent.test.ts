import { beforeEach, describe, expect, it, vi } from 'vitest';

import { grantConsent } from '@/_actions/grantConsent';
import { CONSENT_COOKIE, COOKIE_OPTIONS } from '@/_utils/cookies';

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

beforeEach(() => {
  runtime.calls.length = 0;
  runtime.values.clear();
});

describe('grantConsent', () => {
  it('writes the consent marker with the shared cookie options', async () => {
    await grantConsent();

    expect(runtime.values.get(CONSENT_COOKIE)).toBe('true');
    expect(runtime.calls).toContainEqual({
      type: 'set',
      name: CONSENT_COOKIE,
      value: 'true',
      options: COOKIE_OPTIONS,
    });
  });
});

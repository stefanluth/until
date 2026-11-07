import { COOKIE_OPTIONS } from '../../app/_utils/cookies.ts';

type CookieStoreCall =
  | { type: 'set'; name: string; value: string; options: typeof COOKIE_OPTIONS }
  | { type: 'delete'; options: { name: string; path: string } };

export type FakeCookieStore = {
  calls: CookieStoreCall[];
  get(name: string): { value: string } | undefined;
  set(name: string, value: string, options: typeof COOKIE_OPTIONS): void;
  delete(options: { name: string; path: string }): void;
};

export function createCookieStore(initial: Record<string, string> = {}): FakeCookieStore {
  const values = new Map(Object.entries(initial));
  const calls: CookieStoreCall[] = [];

  return {
    calls,
    get(name: string): { value: string } | undefined {
      const value = values.get(name);

      return value === undefined ? undefined : { value };
    },
    set(name: string, value: string, options: typeof COOKIE_OPTIONS): void {
      values.set(name, value);
      calls.push({ type: 'set', name, value, options });
    },
    delete(options: { name: string; path: string }): void {
      values.delete(options.name);
      calls.push({ type: 'delete', options });
    },
  };
}

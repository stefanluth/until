import { COOKIE_OPTIONS, COUNTDOWN_LIST_COOKIE } from './cookies.ts';
import { isValidCountdownId } from './validation.ts';

type CookieReader = {
  get(name: string): { value: string } | undefined;
};

type CookieWriter = {
  set(name: string, value: string, options: typeof COOKIE_OPTIONS): void;
  delete(options: { name: string; path: string }): void;
};

export function readCountdownIds(raw: string | undefined): string[] {
  return (raw ?? '').split(',').filter(isValidCountdownId);
}

export function hasCountdownId(raw: string | undefined, countdownId: string): boolean {
  return readCountdownIds(raw).includes(countdownId);
}

export function addCountdownId(countdownIds: string[], countdownId: string): string[] {
  return countdownIds.includes(countdownId) ? countdownIds : [...countdownIds, countdownId];
}

export function removeCountdownId(countdownIds: string[], countdownId: string): string[] {
  return countdownIds.filter((id) => id !== countdownId);
}

export function getCountdownList(cookieStore: CookieReader): string[] {
  return readCountdownIds(cookieStore.get(COUNTDOWN_LIST_COOKIE)?.value);
}

export function setCountdownList(cookieStore: CookieWriter, countdownIds: string[]): void {
  if (countdownIds.length === 0) {
    cookieStore.delete({ name: COUNTDOWN_LIST_COOKIE, path: COOKIE_OPTIONS.path });
    return;
  }

  cookieStore.set(COUNTDOWN_LIST_COOKIE, countdownIds.join(','), COOKIE_OPTIONS);
}

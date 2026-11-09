import { COOKIE_OPTIONS, MOMENT_LIST_COOKIE } from './cookies.ts';
import { decodeMomentToken } from './momentUrl.ts';

export type MomentCookieStore = {
  get(name: string): { value: string } | undefined;
  set(name: string, value: string, options: typeof COOKIE_OPTIONS): void;
  delete(options: { name: string; path: string }): void;
};

export function readMomentIds(raw: string | undefined): string[] {
  return (raw ?? '')
    .split(',')
    .map((value) => decodeMomentToken(value)?.id)
    .filter((id): id is string => id !== undefined);
}

export function hasMomentId(raw: string | undefined, momentId: string): boolean {
  return readMomentIds(raw).includes(momentId);
}

export function addMomentId(momentIds: string[], momentId: string): string[] {
  return momentIds.includes(momentId) ? momentIds : [...momentIds, momentId];
}

export function removeMomentId(momentIds: string[], momentId: string): string[] {
  return momentIds.filter((id) => id !== momentId);
}

export function getMomentList(cookieStore: MomentCookieStore): string[] {
  return readMomentIds(cookieStore.get(MOMENT_LIST_COOKIE)?.value);
}

export function setMomentList(cookieStore: MomentCookieStore, momentIds: string[]): void {
  if (momentIds.length === 0) {
    cookieStore.delete({ name: MOMENT_LIST_COOKIE, path: COOKIE_OPTIONS.path });
    return;
  }

  cookieStore.set(MOMENT_LIST_COOKIE, momentIds.join(','), COOKIE_OPTIONS);
}

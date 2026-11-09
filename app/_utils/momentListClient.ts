import Cookies from 'js-cookie';

import { browserCookieOptions } from './cookies.ts';
import type { MomentCookieStore } from './momentList.ts';
import {
  type AddMomentResult,
  type RemoveMomentResult,
  addMomentToList,
  removeMomentFromList,
} from './momentListActions.ts';

export function createBrowserMomentStore(): MomentCookieStore {
  return {
    get(name) {
      const value = Cookies.get(name);

      return value === undefined ? undefined : { value };
    },
    set(name, value, options) {
      Cookies.set(name, value, browserCookieOptions(window.location.protocol, options));
    },
    delete({ name, path }) {
      Cookies.remove(name, { path });
    },
  };
}

export function saveMoment(momentId: string): AddMomentResult {
  return addMomentToList(createBrowserMomentStore(), momentId);
}

export function unsaveMoment(momentId: string): RemoveMomentResult {
  return removeMomentFromList(createBrowserMomentStore(), momentId);
}

import { type MomentCookieStore, addMomentId, getMomentList, removeMomentId, setMomentList } from './momentList.ts';
import { decodeMomentToken } from './momentUrl.ts';

export type AddMomentResult = 'added' | 'exists' | 'invalid';
export type RemoveMomentResult = 'removed' | 'invalid';

export function addMomentToList(store: MomentCookieStore, momentId: string): AddMomentResult {
  const moment = decodeMomentToken(momentId);

  if (!moment) {
    return 'invalid';
  }

  const moments = getMomentList(store);

  if (moments.includes(moment.id)) {
    return 'exists';
  }

  setMomentList(store, addMomentId(moments, moment.id));

  return 'added';
}

export function removeMomentFromList(store: MomentCookieStore, momentId: string): RemoveMomentResult {
  const moment = decodeMomentToken(momentId);

  if (!moment) {
    return 'invalid';
  }

  setMomentList(store, removeMomentId(getMomentList(store), moment.id));

  return 'removed';
}

import { encodeMomentToken } from './momentUrl.ts';
import { parseWhen } from './parseWhen.ts';
import { validateMomentName, validateMomentWhen } from './validation.ts';

export type MomentInputResult = { ok: true; id: string } | { ok: false; error: string; location: 'name' | 'when' };

export function momentFromInput(name: unknown, when: unknown, now = new Date()): MomentInputResult {
  const nameResult = validateMomentName(name);
  if (!nameResult.ok) {
    return nameResult;
  }

  const whenResult = validateMomentWhen(when);
  if (!whenResult.ok) {
    return whenResult;
  }

  const date = parseWhen(whenResult.value, now);
  if (!date) {
    return {
      ok: false,
      error: 'e.g. 1d 2h 3m or 25-12-2026 18:00',
      location: 'when',
    };
  }

  return { ok: true, id: encodeMomentToken(nameResult.value, date) };
}

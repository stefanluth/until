export const MAX_COUNTDOWN_NAME_LENGTH = 48;
export const MAX_COUNTDOWN_WHEN_LENGTH = 64;
export const MAX_COUNTDOWN_ID_LENGTH = 512;

const COUNTDOWN_ID_RE = /^[A-Za-z0-9!'()*\-._~%]+$/;

type FieldResult<T> = { ok: true; value: T } | { ok: false; error: string; location: 'name' | 'when' };

type TextValidation = {
  value: unknown;
  required: string;
  tooLong: string;
  maxLength: number;
  location: 'name' | 'when';
};

function validateText({ value, required, tooLong, maxLength, location }: TextValidation): FieldResult<string> {
  if (typeof value !== 'string') {
    return { ok: false, error: required, location };
  }

  const text = value.trim();

  if (!text) {
    return { ok: false, error: required, location };
  }

  if (text.length > maxLength) {
    return { ok: false, error: tooLong, location };
  }

  return { ok: true, value: text };
}

export function validateCountdownName(value: unknown): FieldResult<string> {
  return validateText({
    value,
    required: 'Name is required',
    tooLong: `Name must be ${MAX_COUNTDOWN_NAME_LENGTH} characters or fewer`,
    maxLength: MAX_COUNTDOWN_NAME_LENGTH,
    location: 'name',
  });
}

export function validateCountdownWhen(value: unknown): FieldResult<string> {
  return validateText({
    value,
    required: 'Duration or date is required',
    tooLong: `When must be ${MAX_COUNTDOWN_WHEN_LENGTH} characters or fewer`,
    maxLength: MAX_COUNTDOWN_WHEN_LENGTH,
    location: 'when',
  });
}

export function parseClientDate(value: unknown): Date | null {
  if (typeof value !== 'string' || !value || value.length > MAX_COUNTDOWN_WHEN_LENGTH) {
    return null;
  }

  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}

export function isValidCountdownId(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    value.length <= MAX_COUNTDOWN_ID_LENGTH &&
    COUNTDOWN_ID_RE.test(value)
  );
}

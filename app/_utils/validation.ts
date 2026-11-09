export const MAX_MOMENT_NAME_LENGTH = 48;
const MAX_MOMENT_WHEN_LENGTH = 64;
const MAX_MOMENT_ID_LENGTH = 512;

const MOMENT_ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*-[0-9a-f]{8}$/;

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

export function validateMomentName(value: unknown): FieldResult<string> {
  return validateText({
    value,
    required: 'Name is required',
    tooLong: `Name must be ${MAX_MOMENT_NAME_LENGTH} characters or fewer`,
    maxLength: MAX_MOMENT_NAME_LENGTH,
    location: 'name',
  });
}

export function validateMomentWhen(value: unknown): FieldResult<string> {
  return validateText({
    value,
    required: 'Duration or date is required',
    tooLong: `When must be ${MAX_MOMENT_WHEN_LENGTH} characters or fewer`,
    maxLength: MAX_MOMENT_WHEN_LENGTH,
    location: 'when',
  });
}

export function parseClientDate(value: unknown): Date | null {
  if (typeof value !== 'string' || !value || value.length > MAX_MOMENT_WHEN_LENGTH) {
    return null;
  }

  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}

export function isValidMomentId(value: unknown): value is string {
  return (
    typeof value === 'string' && value.length > 0 && value.length <= MAX_MOMENT_ID_LENGTH && MOMENT_ID_RE.test(value)
  );
}

import type { Moment } from '../types.ts';
import { validateMomentName } from './validation.ts';

const SEPARATOR = '@';
const MAX_MOMENT_ID_LENGTH = 512;
const MAX_ENCODED_MOMENT_ID_LENGTH = MAX_MOMENT_ID_LENGTH * 4;
const ISO_SECONDS_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
const ISO_MILLIS_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const EXTRA_ESCAPED_RE = /[!'()*]/g;
const NON_ASCII_PERCENT_RUN_RE = /(?:%[89A-Fa-f][0-9A-Fa-f])+/g;

export function encodeMomentToken(name: string, date: Date): string {
  return `${encodeName(name)}${SEPARATOR}${formatMomentInstant(date)}`;
}

export function decodeMomentToken(value: unknown): Moment | null {
  if (typeof value !== 'string' || value.length === 0 || value.length > MAX_MOMENT_ID_LENGTH) {
    return null;
  }

  const separatorIndex = value.lastIndexOf(SEPARATOR);
  if (separatorIndex <= 0) {
    return null;
  }

  let name: string;

  try {
    name = decodeURIComponent(value.slice(0, separatorIndex));
  } catch {
    return null;
  }

  return buildMoment(name, value.slice(separatorIndex + 1));
}

export function decodeMomentParam(value: unknown): Moment | null {
  if (typeof value !== 'string' || value.length === 0 || value.length > MAX_ENCODED_MOMENT_ID_LENGTH) {
    return null;
  }

  let decoded: string;

  try {
    decoded = decodeURIComponent(value);
  } catch {
    return null;
  }

  if (decoded.length === 0 || decoded.length > MAX_MOMENT_ID_LENGTH) {
    return null;
  }

  const separatorIndex = decoded.lastIndexOf(SEPARATOR);
  if (separatorIndex <= 0) {
    return null;
  }

  return buildMoment(decoded.slice(0, separatorIndex), decoded.slice(separatorIndex + 1));
}

export function isValidMomentId(value: unknown): value is string {
  return decodeMomentToken(value) !== null;
}

export function momentPath(id: string): string {
  return `/${id}`;
}

export function momentDisplayPath(id: string): string {
  return `/${decodeNonAsciiRuns(id)}`;
}

function buildMoment(name: string, rawDate: string): Moment | null {
  const nameResult = validateMomentName(name);
  if (!nameResult.ok || nameResult.value !== name) {
    return null;
  }

  const hasSeconds = ISO_SECONDS_RE.test(rawDate);
  const hasMilliseconds = ISO_MILLIS_RE.test(rawDate);

  if (!hasSeconds && !hasMilliseconds) {
    return null;
  }

  const date = new Date(rawDate);
  if (!Number.isFinite(date.getTime()) || date.getUTCFullYear() < 1) {
    return null;
  }

  if (hasMilliseconds ? date.toISOString() !== rawDate : formatMomentInstant(date) !== rawDate) {
    return null;
  }

  const normalizedDate = new Date(formatMomentInstant(date));

  return { id: encodeMomentToken(name, normalizedDate), name, date: normalizedDate };
}

function encodeName(name: string): string {
  return encodeURIComponent(name).replace(
    EXTRA_ESCAPED_RE,
    (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

function formatMomentInstant(date: Date): string {
  return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

function decodeNonAsciiRuns(value: string): string {
  return value.replace(NON_ASCII_PERCENT_RUN_RE, (run) => {
    try {
      return decodeURIComponent(run);
    } catch {
      return run;
    }
  });
}

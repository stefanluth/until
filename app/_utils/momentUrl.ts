import type { Moment } from '../types.ts';
import { validateMomentName } from './validation.ts';

const SEPARATOR = '@';
const MAX_MOMENT_ID_LENGTH = 512;
const MAX_ENCODED_MOMENT_ID_LENGTH = MAX_MOMENT_ID_LENGTH * 4;
const ISO_INSTANT_RE = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})(?::(\d{2}))?([+-])(\d{2}):(\d{2})$/;
const EXTRA_ESCAPED_RE = /[!'()*]/g;
const NON_ASCII_PERCENT_RUN_RE = /(?:%[89A-Fa-f][0-9A-Fa-f])+/g;

export function encodeMomentToken(name: string, date: Date, offsetMinutes = -date.getTimezoneOffset()): string {
  return `${encodeName(name)}${SEPARATOR}${formatMomentInstant(date, offsetMinutes)}`;
}

export function decodeMomentToken(value: unknown): Moment | null {
  return parseMomentValue(value, MAX_MOMENT_ID_LENGTH, false);
}

export function decodeMomentParam(value: unknown): Moment | null {
  return parseMomentValue(value, MAX_ENCODED_MOMENT_ID_LENGTH, true);
}

function parseMomentValue(value: unknown, maxLength: number, decodeWhole: boolean): Moment | null {
  if (typeof value !== 'string' || value.length === 0 || value.length > maxLength) {
    return null;
  }

  let decoded = value;

  if (decodeWhole) {
    try {
      decoded = decodeURIComponent(value);
    } catch {
      return null;
    }
  }

  if (decoded.length === 0 || decoded.length > MAX_MOMENT_ID_LENGTH) {
    return null;
  }

  const separatorIndex = decoded.lastIndexOf(SEPARATOR);
  if (separatorIndex <= 0) {
    return null;
  }

  let name = decoded.slice(0, separatorIndex);

  if (!decodeWhole) {
    try {
      name = decodeURIComponent(name);
    } catch {
      return null;
    }
  }

  const rawDate = decoded.slice(separatorIndex + 1);

  return buildMoment(name, decodeWhole ? rawDate : rawDate.replace(/%2B/gi, '+'));
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

  const match = ISO_INSTANT_RE.exec(rawDate);
  if (!match) {
    return null;
  }

  const [, dateTime, seconds = '00', sign, hours, minutes] = match;
  if (Number(seconds) > 59) {
    return null;
  }

  const offsetMinutes = parseOffsetMinutes(sign, hours, minutes);
  if (offsetMinutes === null) {
    return null;
  }

  const instant = `${dateTime}:${seconds}${formatOffset(offsetMinutes)}`;
  const date = new Date(instant);
  if (
    !Number.isFinite(date.getTime()) ||
    formatMomentInstant(date, offsetMinutes) !== instant ||
    dateTime.startsWith('0000-')
  ) {
    return null;
  }

  return { id: encodeMomentToken(name, date, offsetMinutes), name, date };
}

function parseOffsetMinutes(sign: string, hours: string, minutes: string): number | null {
  const hourCount = Number(hours);
  const minuteCount = Number(minutes);
  if (minuteCount > 59) {
    return null;
  }

  const total = hourCount * 60 + minuteCount;
  if (total > 14 * 60 || (sign === '-' && total > 12 * 60)) {
    return null;
  }

  return sign === '-' ? -total : total;
}

function formatOffset(offsetMinutes: number): string {
  const sign = offsetMinutes < 0 ? '-' : '+';
  const absolute = Math.abs(offsetMinutes);

  return `${sign}${String(Math.floor(absolute / 60)).padStart(2, '0')}:${String(absolute % 60).padStart(2, '0')}`;
}

function encodeName(name: string): string {
  return encodeURIComponent(name).replace(
    EXTRA_ESCAPED_RE,
    (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

function formatMomentInstant(date: Date, offsetMinutes: number): string {
  const shifted = new Date(date.getTime() + offsetMinutes * 60_000);

  return `${shifted.toISOString().slice(0, 19)}${formatOffset(offsetMinutes)}`;
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

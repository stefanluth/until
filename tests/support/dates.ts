export const NOW = new Date('2026-01-01T00:00:00.000Z');

export function pad(value: number, length = 2): string {
  return String(value).padStart(length, '0');
}

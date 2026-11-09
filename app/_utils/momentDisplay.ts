type DateParts = {
  date: string;
  time: string | null;
};

export function formatDateParts(date: Date, locale?: string, timeZone?: string): DateParts {
  const time = date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', timeZone });
  const dateString = date.toLocaleDateString(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone,
  });
  const isMidnight = isMidnightIn(date, timeZone);

  return { date: dateString, time: isMidnight ? null : time };
}

function isMidnightIn(date: Date, timeZone?: string): boolean {
  const parts = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone,
  }).formatToParts(date);
  const hour = parts.find((part) => part.type === 'hour')?.value;
  const minute = parts.find((part) => part.type === 'minute')?.value;

  return hour === '00' && minute === '00';
}

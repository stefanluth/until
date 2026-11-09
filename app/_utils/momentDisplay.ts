type MomentDateParts = {
  date: string;
  time: string | null;
};

export function formatMomentDateParts(date: Date, locale?: string): MomentDateParts {
  const time = date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  const dateString = date.toLocaleDateString(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const isMidnight = date.getHours() === 0 && date.getMinutes() === 0;

  return { date: dateString, time: isMidnight ? null : time };
}

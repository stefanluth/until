export type CountdownParts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

export function splitRemaining(milliseconds: number): CountdownParts {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));

  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor(totalSeconds / 3600) % 24,
    minutes: Math.floor(totalSeconds / 60) % 60,
    seconds: totalSeconds % 60,
  };
}

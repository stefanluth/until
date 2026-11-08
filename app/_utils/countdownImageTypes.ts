import type { CountdownUnit } from './duration';

export type CountdownImageUnit = {
  unit: CountdownUnit;
  value: number;
  label: string;
};

export type CountdownImageContent = {
  name: string;
  dateLabel: string;
  units: CountdownImageUnit[];
  ended: boolean;
  url?: string;
};

export type CountdownImageTheme = {
  backgroundStart: string;
  backgroundEnd: string;
  foreground: string;
  fontFamily: string;
};

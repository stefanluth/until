import type { TimeUnit } from './timer';

type ImageUnit = {
  unit: TimeUnit;
  value: number;
  label: string;
};

export type MomentImageContent = {
  name: string;
  dateLabel: string;
  timeLabel: string | null;
  units: ImageUnit[];
  ended: boolean;
  url?: string;
};

export type MomentImageTheme = {
  backgroundStart: string;
  backgroundEnd: string;
  foreground: string;
  fontFamily: string;
};

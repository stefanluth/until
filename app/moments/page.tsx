import { cookies } from 'next/headers';
import Link from 'next/link';

import MomentCard from '@/_components/MomentCard';
import { getMomentList } from '@/_utils/momentList';
import { decodeMomentToken } from '@/_utils/momentUrl';
import type { Moment } from '@/types';

export default async function MomentsPage() {
  const cookieStore = await cookies();
  const momentIds = [...new Set(getMomentList(cookieStore))];
  const moments = momentIds
    .map(decodeMomentToken)
    .filter((moment): moment is Moment => moment !== null)
    .sort((first, second) => first.date.getTime() - second.date.getTime());

  if (moments.length === 0) {
    return (
      <section className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-3 px-4 pb-8 text-center sm:gap-4 sm:pb-0">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Your moments</h1>
        <p className="max-w-sm text-base opacity-75 sm:text-lg">No saved moments yet.</p>
        <Link
          className="mt-2 inline-flex min-h-11 items-center justify-center rounded-full bg-brand px-5 text-base font-medium text-brand-foreground transition-colors hover:bg-brand-strong active:bg-brand-strong"
          href="/"
        >
          Start a timer
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 pb-2 sm:gap-6 sm:px-0 sm:pb-0">
      <header className="flex items-end justify-between gap-3 px-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Your moments</h1>
        <p className="shrink-0 pb-1 text-sm opacity-70">
          {moments.length} saved {moments.length === 1 ? 'moment' : 'moments'}
        </p>
      </header>
      <ul className="flex flex-col gap-4 sm:gap-6" aria-label="Saved moments">
        {moments.map((moment) => (
          <li key={moment.id}>
            <MomentCard {...moment} />
          </li>
        ))}
      </ul>
    </section>
  );
}

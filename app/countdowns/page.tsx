import { cookies } from 'next/headers';
import Link from 'next/link';

import CountdownCard from '@/_components/CountdownCard';
import { getCountdownList } from '@/_utils/countdownList';
import { findCountdownsByIds } from '@/db';

export default async function CountdownsPage() {
  const cookieStore = await cookies();
  const countdowns = await findCountdownsByIds(getCountdownList(cookieStore));

  if (countdowns.length === 0) {
    return (
      <section className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-3 px-4 pb-8 text-center sm:gap-4 sm:pb-0">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Your countdowns</h1>
        <p className="max-w-sm text-base opacity-75 sm:text-lg">You haven&apos;t saved any countdowns yet.</p>
        <Link
          className="mt-2 inline-flex min-h-11 items-center justify-center rounded-full bg-brand px-5 text-base font-medium text-brand-foreground transition-colors hover:bg-brand-strong active:bg-brand-strong"
          href="/"
        >
          Create a countdown
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 pb-2 sm:gap-6 sm:px-0 sm:pb-0">
      <header className="flex items-end justify-between gap-3 px-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Your countdowns</h1>
        <p className="shrink-0 pb-1 text-sm opacity-70">
          {countdowns.length} saved {countdowns.length === 1 ? 'countdown' : 'countdowns'}
        </p>
      </header>
      <ul className="flex flex-col gap-4 sm:gap-6" aria-label="Saved countdowns">
        {countdowns.map((countdown) => (
          <li key={countdown.id}>
            <CountdownCard {...countdown} />
          </li>
        ))}
      </ul>
    </section>
  );
}

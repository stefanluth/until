import { cookies } from 'next/headers';

import CountdownCard from '@/_components/Countdown';
import { getCountdownList } from '@/_utils/countdownList';
import { findCountdownsByIds } from '@/db';

export default async function CountdownsPage() {
  const cookieStore = await cookies();
  const countdowns = await findCountdownsByIds(getCountdownList(cookieStore));

  if (countdowns.length === 0) {
    return <div className="text-lg sm:text-xl md:text-2xl text-center">No countdowns found.</div>;
  }

  return (
    <div className="flex flex-col w-full max-w-2xl gap-4 sm:gap-8 mx-auto px-4 md:px-0">
      {countdowns.map((countdown) => (
        <CountdownCard key={countdown.id} {...countdown} />
      ))}
    </div>
  );
}

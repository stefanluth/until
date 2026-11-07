import { cookies } from 'next/headers';

import CountdownCard from '@/app/_components/Countdown';
import { findCountdownsByIds } from '@/app/db';
import { getCountdownList } from '@/app/utils/countdownList';

export default async function CountdownsPage() {
  const cookieStore = await cookies();
  const countdowns = await findCountdownsByIds(getCountdownList(cookieStore));

  if (countdowns.length === 0) {
    return <div className="text-lg sm:text-xl md:text-2xl text-center">No countdowns found.</div>;
  }

  return (
    <div className="flex flex-col w-full max-w-2xl gap-8 mx-auto">
      {countdowns.map((countdown) => (
        <CountdownCard key={countdown.id} {...countdown} />
      ))}
    </div>
  );
}

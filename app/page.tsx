import { cookies } from 'next/headers';

import { CookieNotice } from '@/app/_components/CookieNotice';
import CountdownInput from '@/app/_components/CountdownInput';
import { CONSENT_COOKIE } from '@/app/utils/cookies';

export default async function Home() {
  const accepted = (await cookies()).get(CONSENT_COOKIE)?.value === 'true';

  return (
    <>
      <div className="flex flex-1 flex-col items-center justify-center w-full px-4 mx-auto" inert={!accepted}>
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl leading-none tracking-tight whitespace-nowrap mb-6 sm:mb-8 select-none">
          How long until?
        </h1>
        <div className="w-full max-w-md sm:max-w-lg">
          <CountdownInput />
        </div>
      </div>
      <CookieNotice />
    </>
  );
}

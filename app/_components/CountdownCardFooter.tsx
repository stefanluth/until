'use client';

import Cookies from 'js-cookie';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { AddButton } from './AddButton';
import { RemoveButton } from './RemoveButton';
import { ShareButton } from './ShareButton';

export function CountdownCardFooter({ id }: { id: string }) {
  const countdownInCookies = Cookies.get('countdowns')?.includes(id);
  const path = usePathname();

  return (
    <div className="flex gap-4 justify-end px-4 pb-4 opacity-90" suppressHydrationWarning>
      {!path.endsWith(`/${id}`) && (
        <Link className="text-white hover:underline hover:text-gray-200" href={id}>
          Open
        </Link>
      )}
      <ShareButton id={id} />
      {countdownInCookies ? <RemoveButton id={id} /> : <AddButton id={id} />}
    </div>
  );
}

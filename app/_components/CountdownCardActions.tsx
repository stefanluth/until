'use client';

import Cookies from 'js-cookie';
import { ExternalLink } from 'lucide-react';

import Link from 'next/link';

import { COUNTDOWN_LIST_COOKIE } from '@/utils/cookies';
import { hasCountdownId } from '@/utils/countdownList';

import { AddButton } from './AddButton';
import { RemoveButton } from './RemoveButton';
import { ShareButton } from './ShareButton';

export function CountdownCardActions({ id, showOpen = true }: { id: string; showOpen?: boolean }) {
  const countdownInCookies = hasCountdownId(Cookies.get(COUNTDOWN_LIST_COOKIE), id);

  return (
    <div className="flex items-center gap-4 sm:gap-5 opacity-90" suppressHydrationWarning>
      {showOpen && (
        <Link
          className="inline-flex items-center text-white hover:text-gray-200"
          href={id}
          title="Open this countdown"
          aria-label="Open this countdown"
        >
          <ExternalLink className="w-5 h-5 sm:w-6 sm:h-6" />
        </Link>
      )}
      <ShareButton id={id} />
      {countdownInCookies ? <RemoveButton id={id} /> : <AddButton id={id} />}
    </div>
  );
}

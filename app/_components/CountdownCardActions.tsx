'use client';

import Cookies from 'js-cookie';
import { ExternalLink } from 'lucide-react';

import { useState } from 'react';

import Link from 'next/link';

import { COUNTDOWN_LIST_COOKIE } from '@/_utils/cookies';
import { hasCountdownId } from '@/_utils/countdownList';

import { AddButton } from './AddButton';
import { CopyImageButton } from './CopyImageButton';
import { DownloadButton } from './DownloadButton';
import { LinkButton } from './LinkButton';
import { RemoveButton } from './RemoveButton';

export function CountdownCardActions({
  id,
  name,
  date,
  showOpen = true,
}: {
  id: string;
  name?: string;
  date?: Date;
  showOpen?: boolean;
}) {
  const cookieCountdownInList = hasCountdownId(Cookies.get(COUNTDOWN_LIST_COOKIE), id);
  const [toggled, setToggled] = useState<boolean | null>(null);
  const countdownInCookies = toggled ?? cookieCountdownInList;

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
      <LinkButton id={id} />
      {name && date && <CopyImageButton id={id} name={name} date={date} />}
      {name && date && <DownloadButton id={id} name={name} date={date} />}
      {countdownInCookies ? (
        <RemoveButton id={id} onRemoved={() => setToggled(false)} />
      ) : (
        <AddButton id={id} onAdded={() => setToggled(true)} />
      )}
    </div>
  );
}

'use client';

import { House, Plus } from 'lucide-react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { isValidCountdownId } from '@/_utils/validation';

import { CountdownCardActions } from './CountdownCardActions';
import { useCountdownMeta } from './CountdownMetaContext';

const LINKS = [
  { href: '/', label: 'Create a new countdown', Icon: Plus },
  { href: '/countdowns', label: 'View your saved countdowns', Icon: House },
];

const RESERVED_PATHS = new Set(['', 'countdowns', '_not-found']);
const COUNTDOWN_PATH_RE = /^[A-Za-z0-9!'()*\-._~%]+-[0-9a-f]{8}$/;

function getCountdownId(pathname: string): string | null {
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length !== 1 || RESERVED_PATHS.has(segments[0])) {
    return null;
  }

  try {
    const id = encodeURIComponent(decodeURIComponent(segments[0]));
    return isValidCountdownId(id) && COUNTDOWN_PATH_RE.test(id) ? id : null;
  } catch {
    return null;
  }
}

export function NavBar() {
  const pathname = usePathname();
  const countdownId = getCountdownId(pathname);
  const meta = useCountdownMeta();
  const activeMeta = meta?.id === countdownId ? meta : null;

  return (
    <nav
      className={`flex h-16 sm:h-20 gap-4 sm:gap-5 pl-8 lg:pl-48 justify-end items-center scrollbar-compensate [--compensated-padding:2rem] lg:[--compensated-padding:12rem] ${
        countdownId ? 'nav-reveal' : ''
      }`}
    >
      {countdownId && (
        <>
          <CountdownCardActions id={countdownId} showOpen={false} name={activeMeta?.name} date={activeMeta?.date} />
          <span className="h-6 w-px bg-white/40" aria-hidden />
        </>
      )}
      {LINKS.filter((link) => link.href !== pathname).map(({ href, label, Icon }) => (
        <Link
          key={href}
          className="inline-flex items-center text-white hover:text-gray-200"
          href={href}
          title={label}
          aria-label={label}
        >
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </Link>
      ))}
    </nav>
  );
}

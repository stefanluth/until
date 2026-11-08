'use client';

import { ArrowLeft, House, Plus } from 'lucide-react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { isValidCountdownId } from '@/_utils/validation';

import { CountdownCardActions } from './CountdownCardActions';
import { useCountdownMeta } from './CountdownMetaContext';
import { ICON_BUTTON_CLASS, ICON_CLASS } from './actionStyles';

const LINKS = [
  { href: '/', label: 'Create a new countdown', Icon: Plus },
  { href: '/countdowns', label: 'View your saved countdowns', Icon: House },
];

const RESERVED_PATHS = new Set(['', 'countdowns', '_not-found']);

function getCountdownId(pathname: string): string | null {
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length !== 1 || RESERVED_PATHS.has(segments[0])) {
    return null;
  }

  return isValidCountdownId(segments[0]) ? segments[0] : null;
}

export function NavBar() {
  const pathname = usePathname();
  const countdownId = getCountdownId(pathname);
  const meta = useCountdownMeta();
  const activeMeta = meta?.id === countdownId ? meta : null;

  return (
    <nav
      className={`flex h-16 sm:h-20 items-center justify-between gap-2 pl-4 sm:gap-5 sm:pl-8 lg:pl-48 scrollbar-compensate [--compensated-padding:1.5rem] sm:[--compensated-padding:2rem] lg:[--compensated-padding:12rem] max-sm:[&_a]:h-12 max-sm:[&_a]:min-w-12 max-sm:[&_button]:h-12 max-sm:[&_button]:min-w-12 max-sm:[&_svg]:h-6 max-sm:[&_svg]:w-6 ${
        countdownId ? 'nav-reveal' : ''
      }`}
    >
      <div className="flex items-center">
        {countdownId && (
          <Link
            className={ICON_BUTTON_CLASS}
            href="/countdowns"
            title="Back to your saved countdowns"
            aria-label="Back to your saved countdowns"
          >
            <ArrowLeft className={ICON_CLASS} />
          </Link>
        )}
      </div>
      <div className="flex items-center gap-1 sm:gap-5">
        {countdownId && (
          <>
            <CountdownCardActions id={countdownId} compactOnMobile name={activeMeta?.name} date={activeMeta?.date} />
            <span className="h-6 w-px bg-black/10 dark:bg-white/25" aria-hidden />
          </>
        )}
        {LINKS.filter((link) => link.href !== pathname && !(countdownId && link.href === '/countdowns')).map(
          ({ href, label, Icon }) => (
            <Link key={href} className={ICON_BUTTON_CLASS} href={href} title={label} aria-label={label}>
              <Icon className={ICON_CLASS} />
            </Link>
          ),
        )}
      </div>
    </nav>
  );
}

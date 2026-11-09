'use client';

import { ArrowLeft, House, Plus } from 'lucide-react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { decodeMomentToken } from '@/_utils/momentUrl';

import { MomentCardActions } from './MomentCardActions';
import { useMomentMeta } from './MomentMetaContext';
import { ICON_BUTTON_CLASS, ICON_CLASS } from './actionStyles';

const LINKS = [
  { href: '/', label: 'Start a new timer', Icon: Plus },
  { href: '/moments', label: 'View your saved moments', Icon: House },
];

function getMomentId(pathname: string): string | null {
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length !== 1) {
    return null;
  }

  return decodeMomentToken(segments[0])?.id ?? null;
}

export function NavBar() {
  const pathname = usePathname();
  const momentId = getMomentId(pathname);
  const meta = useMomentMeta();
  const activeMeta = meta?.id === momentId ? meta : null;

  return (
    <nav
      className={`flex h-16 sm:h-20 items-center justify-between gap-2 pl-4 sm:gap-5 sm:pl-8 lg:pl-48 scrollbar-compensate [--compensated-padding:1.5rem] sm:[--compensated-padding:2rem] lg:[--compensated-padding:12rem] max-sm:[&_a]:h-12 max-sm:[&_a]:min-w-12 max-sm:[&_button]:h-12 max-sm:[&_button]:min-w-12 max-sm:[&_svg]:h-6 max-sm:[&_svg]:w-6 ${
        momentId ? 'nav-reveal' : ''
      }`}
    >
      <div className="flex items-center">
        {momentId && (
          <Link
            className={ICON_BUTTON_CLASS}
            href="/moments"
            title="Back to your saved moments"
            aria-label="Back to your saved moments"
          >
            <ArrowLeft className={ICON_CLASS} />
          </Link>
        )}
      </div>
      <div className="flex items-center gap-1 sm:gap-5">
        {momentId && (
          <>
            <MomentCardActions id={momentId} compactOnMobile name={activeMeta?.name} date={activeMeta?.date} />
            <span className="h-6 w-px bg-black/10 dark:bg-white/25" aria-hidden />
          </>
        )}
        {LINKS.filter((link) => link.href !== pathname && !(momentId && link.href === '/moments')).map(
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

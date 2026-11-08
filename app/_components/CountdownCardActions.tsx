'use client';

import Cookies from 'js-cookie';
import { Ellipsis, ExternalLink } from 'lucide-react';

import { useEffect, useId, useRef, useState } from 'react';

import Link from 'next/link';

import { COUNTDOWN_LIST_COOKIE } from '@/_utils/cookies';
import { hasCountdownId } from '@/_utils/countdownList';

import { AddButton } from './AddButton';
import { CopyImageButton } from './CopyImageButton';
import { DownloadButton } from './DownloadButton';
import { LinkButton } from './LinkButton';
import { RemoveButton } from './RemoveButton';

const SHARE_ACTIONS_CLASS =
  'items-center gap-4 sm:static sm:mt-0 sm:flex sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none sm:backdrop-blur-none';
const SHARE_ACTIONS_OPEN_CLASS =
  'absolute right-0 top-full z-20 mt-2 flex rounded-xl border border-white/20 bg-black/70 p-2 shadow-lg backdrop-blur';

export function CountdownCardActions({
  id,
  name,
  date,
  showOpen = true,
  compactOnMobile = false,
}: {
  id: string;
  name?: string;
  date?: Date;
  showOpen?: boolean;
  compactOnMobile?: boolean;
}) {
  const cookieCountdownInList = hasCountdownId(Cookies.get(COUNTDOWN_LIST_COOKIE), id);
  const [toggled, setToggled] = useState<boolean | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();
  const menuRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const countdownInCookies = toggled ?? cookieCountdownInList;

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    panelRef.current?.querySelector<HTMLElement>('a, button')?.focus();

    function onPointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  const shareActions = (
    <>
      <LinkButton id={id} />
      {name && date && <CopyImageButton id={id} name={name} date={date} />}
      {name && date && <DownloadButton id={id} name={name} date={date} />}
    </>
  );

  const removeButton = (
    <RemoveButton
      id={id}
      onRemoved={() => {
        setToggled(false);
        setMenuOpen(false);
        triggerRef.current?.focus();
      }}
    />
  );

  return (
    <div ref={menuRef} className="relative flex items-center gap-4 sm:gap-5 opacity-90" suppressHydrationWarning>
      {showOpen && (
        <Link
          className="inline-flex items-center text-white hover:text-gray-200 p-1 -m-1 sm:p-0 sm:m-0"
          href={id}
          title="Open this countdown"
          aria-label="Open this countdown"
        >
          <ExternalLink className="w-6 h-6" />
        </Link>
      )}
      {compactOnMobile ? (
        <>
          <div
            ref={panelRef}
            id={menuId}
            className={`${menuOpen ? SHARE_ACTIONS_OPEN_CLASS : 'hidden'} ${SHARE_ACTIONS_CLASS}`}
          >
            {shareActions}
            {countdownInCookies && removeButton}
          </div>
          <button
            ref={triggerRef}
            type="button"
            className="inline-flex items-center text-white hover:text-gray-200 p-1 -m-1 sm:hidden"
            title="More actions"
            aria-label="More actions"
            aria-expanded={menuOpen}
            aria-controls={menuId}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <Ellipsis className="w-6 h-6" />
          </button>
          {!countdownInCookies && <AddButton id={id} onAdded={() => setToggled(true)} />}
        </>
      ) : (
        <>
          {shareActions}
          {countdownInCookies ? removeButton : <AddButton id={id} onAdded={() => setToggled(true)} />}
        </>
      )}
    </div>
  );
}

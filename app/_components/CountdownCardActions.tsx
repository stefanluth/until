'use client';

import Cookies from 'js-cookie';
import { Ellipsis } from 'lucide-react';

import { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react';

import { COUNTDOWN_LIST_COOKIE } from '@/_utils/cookies';
import { hasCountdownId } from '@/_utils/countdownList';

import { AddButton } from './AddButton';
import { CopyImageButton } from './CopyImageButton';
import { DownloadButton } from './DownloadButton';
import { LinkButton } from './LinkButton';
import { RemoveButton } from './RemoveButton';
import { ICON_BUTTON_CLASS, ICON_CLASS } from './actionStyles';

const MENU_PANEL_CLASS =
  'absolute right-0 top-full z-30 mt-2 w-56 flex-col gap-1 rounded-2xl border border-white/15 bg-black/85 p-2 text-white shadow-xl backdrop-blur-md';

const subscribeToCookies = () => () => {};
const getServerCookieSnapshot = () => null;

function useCountdownInCookies(id: string) {
  const [toggled, setToggled] = useState<boolean | null>(null);
  const cookieCountdownInList = useSyncExternalStore<boolean | null>(
    subscribeToCookies,
    () => hasCountdownId(Cookies.get(COUNTDOWN_LIST_COOKIE), id),
    getServerCookieSnapshot,
  );

  return { countdownInCookies: toggled ?? cookieCountdownInList, setToggled };
}

function ShareActions({ id, name, date, withLabel }: { id: string; name?: string; date?: Date; withLabel: boolean }) {
  return (
    <>
      <LinkButton id={id} withLabel={withLabel} />
      {name && date && <CopyImageButton id={id} name={name} date={date} withLabel={withLabel} />}
      {name && date && <DownloadButton id={id} name={name} date={date} withLabel={withLabel} />}
    </>
  );
}

function SaveOrRemoveButton({
  id,
  countdownInCookies,
  onAdded,
  onRemoved,
}: {
  id: string;
  countdownInCookies: boolean | null;
  onAdded: () => void;
  onRemoved: () => void;
}) {
  if (countdownInCookies === true) {
    return <RemoveButton id={id} onRemoved={onRemoved} />;
  }

  if (countdownInCookies === false) {
    return <AddButton id={id} onAdded={onAdded} />;
  }

  return null;
}

export function CountdownCardActions({
  id,
  name,
  date,
  compactOnMobile = false,
}: {
  id: string;
  name?: string;
  date?: Date;
  compactOnMobile?: boolean;
}) {
  const { countdownInCookies, setToggled } = useCountdownInCookies(id);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();
  const menuRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

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

  function markAdded() {
    setToggled(true);
  }

  function markRemoved() {
    setToggled(false);
    setMenuOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <div ref={menuRef} className="relative flex items-center gap-1 sm:gap-5">
      {compactOnMobile ? (
        <>
          {countdownInCookies === false && (
            <div className="sm:hidden">
              <AddButton id={id} showLabel onAdded={markAdded} />
            </div>
          )}
          <button
            ref={triggerRef}
            type="button"
            className={`${ICON_BUTTON_CLASS} sm:hidden`}
            title="More actions"
            aria-label="More actions"
            aria-expanded={menuOpen}
            aria-controls={menuId}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <Ellipsis className={ICON_CLASS} />
          </button>
          <div
            ref={panelRef}
            id={menuId}
            role="group"
            aria-label="Countdown actions"
            className={`${menuOpen ? 'flex' : 'hidden'} ${MENU_PANEL_CLASS} sm:hidden`}
          >
            <p className="px-3 py-1 text-xs font-medium uppercase tracking-wider text-white/50">Actions</p>
            <ShareActions id={id} name={name} date={date} withLabel />
            {countdownInCookies === true && (
              <>
                <div className="my-1 h-px bg-white/10" aria-hidden />
                <RemoveButton id={id} withLabel onRemoved={markRemoved} />
              </>
            )}
          </div>
          <div className="hidden items-center gap-5 sm:flex">
            <ShareActions id={id} name={name} date={date} withLabel={false} />
            <SaveOrRemoveButton
              id={id}
              countdownInCookies={countdownInCookies}
              onAdded={markAdded}
              onRemoved={markRemoved}
            />
          </div>
        </>
      ) : (
        <>
          <ShareActions id={id} name={name} date={date} withLabel={false} />
          <SaveOrRemoveButton
            id={id}
            countdownInCookies={countdownInCookies}
            onAdded={markAdded}
            onRemoved={markRemoved}
          />
        </>
      )}
    </div>
  );
}

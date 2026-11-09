'use client';

import Cookies from 'js-cookie';
import { Ellipsis } from 'lucide-react';

import { useState, useSyncExternalStore } from 'react';

import { COUNTDOWN_LIST_COOKIE } from '@/_utils/cookies';
import { hasCountdownId } from '@/_utils/countdownList';

import { AddButton } from './AddButton';
import { CopyImageButton } from './CopyImageButton';
import { DownloadButton } from './DownloadButton';
import { LinkButton } from './LinkButton';
import { Menu, useMenuClose } from './Menu';
import { RemoveButton } from './RemoveButton';
import { ICON_BUTTON_CLASS, ICON_CLASS } from './actionStyles';

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

type ActionProps = {
  id: string;
  name?: string;
  date?: Date;
  countdownInCookies: boolean | null;
  onAdded: () => void;
  onRemoved: () => void;
  className: string;
};

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

function InlineActions({ id, name, date, countdownInCookies, onAdded, onRemoved, className }: ActionProps) {
  return (
    <div className={className}>
      <ShareActions id={id} name={name} date={date} withLabel={false} />
      <SaveOrRemoveButton id={id} countdownInCookies={countdownInCookies} onAdded={onAdded} onRemoved={onRemoved} />
    </div>
  );
}

function CountdownMenu({
  id,
  name,
  date,
  countdownInCookies,
  onRemoved,
}: {
  id: string;
  name?: string;
  date?: Date;
  countdownInCookies: boolean | null;
  onRemoved: () => void;
}) {
  const close = useMenuClose();

  return (
    <>
      <ShareActions id={id} name={name} date={date} withLabel />
      {countdownInCookies === true && (
        <>
          <div className="my-1 h-px bg-black/10 dark:bg-white/10" aria-hidden />
          <RemoveButton
            id={id}
            withLabel
            onRemoved={() => {
              onRemoved();
              close();
            }}
          />
        </>
      )}
    </>
  );
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

  function markAdded() {
    setToggled(true);
  }

  function markRemoved() {
    setToggled(false);
  }

  const inline = {
    id,
    name,
    date,
    countdownInCookies,
    onAdded: markAdded,
    onRemoved: markRemoved,
  };

  return (
    <div className="relative flex items-center gap-1 sm:gap-5">
      {compactOnMobile ? (
        <>
          {countdownInCookies === false && (
            <div className="sm:hidden">
              <AddButton id={id} showLabel onAdded={markAdded} />
            </div>
          )}
          <Menu
            label="Countdown actions"
            placement="auto"
            widthClass="w-56"
            zClass="z-30"
            autoFocusFirst
            className="sm:hidden"
            trigger={({ triggerRef, triggerProps }) => (
              <button
                ref={triggerRef}
                {...triggerProps}
                className={ICON_BUTTON_CLASS}
                title="More actions"
                aria-label="More actions"
              >
                <Ellipsis className={ICON_CLASS} />
              </button>
            )}
          >
            <CountdownMenu
              id={id}
              name={name}
              date={date}
              countdownInCookies={countdownInCookies}
              onRemoved={markRemoved}
            />
          </Menu>
          <InlineActions {...inline} className="hidden items-center gap-5 sm:flex" />
        </>
      ) : (
        <InlineActions {...inline} className="flex items-center gap-1 sm:gap-5" />
      )}
    </div>
  );
}

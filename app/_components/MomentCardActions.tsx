'use client';

import Cookies from 'js-cookie';
import { Ellipsis } from 'lucide-react';

import { useState, useSyncExternalStore } from 'react';

import { MOMENT_LIST_COOKIE } from '@/_utils/cookies';
import { hasMomentId } from '@/_utils/momentList';

import { AddButton } from './AddButton';
import { CopyImageButton } from './CopyImageButton';
import { DownloadButton } from './DownloadButton';
import { LinkButton } from './LinkButton';
import { Menu, useMenuClose } from './Menu';
import { RemoveButton } from './RemoveButton';
import { ICON_BUTTON_CLASS, ICON_CLASS } from './actionStyles';

const subscribeToCookies = () => () => {};
const getServerCookieSnapshot = () => null;

function useMomentInCookies(id: string) {
  const [toggled, setToggled] = useState<boolean | null>(null);
  const cookieMomentInList = useSyncExternalStore<boolean | null>(
    subscribeToCookies,
    () => hasMomentId(Cookies.get(MOMENT_LIST_COOKIE), id),
    getServerCookieSnapshot,
  );

  return { momentInCookies: toggled ?? cookieMomentInList, setToggled };
}

type ActionProps = {
  id: string;
  name?: string;
  date?: Date;
  momentInCookies: boolean | null;
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
  momentInCookies,
  onAdded,
  onRemoved,
}: {
  id: string;
  momentInCookies: boolean | null;
  onAdded: () => void;
  onRemoved: () => void;
}) {
  if (momentInCookies === true) {
    return <RemoveButton id={id} onRemoved={onRemoved} />;
  }

  if (momentInCookies === false) {
    return <AddButton id={id} onAdded={onAdded} />;
  }

  return null;
}

function InlineActions({ id, name, date, momentInCookies, onAdded, onRemoved, className }: ActionProps) {
  return (
    <div className={className}>
      <ShareActions id={id} name={name} date={date} withLabel={false} />
      <SaveOrRemoveButton id={id} momentInCookies={momentInCookies} onAdded={onAdded} onRemoved={onRemoved} />
    </div>
  );
}

function MomentMenu({
  id,
  name,
  date,
  momentInCookies,
  onRemoved,
}: {
  id: string;
  name?: string;
  date?: Date;
  momentInCookies: boolean | null;
  onRemoved: () => void;
}) {
  const close = useMenuClose();

  return (
    <>
      <ShareActions id={id} name={name} date={date} withLabel />
      {momentInCookies === true && (
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

export function MomentCardActions({
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
  const { momentInCookies, setToggled } = useMomentInCookies(id);

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
    momentInCookies,
    onAdded: markAdded,
    onRemoved: markRemoved,
  };

  return (
    <div className="relative flex items-center gap-1 sm:gap-5">
      {compactOnMobile ? (
        <>
          {momentInCookies === false && (
            <div className="sm:hidden">
              <AddButton id={id} showLabel onAdded={markAdded} />
            </div>
          )}
          <Menu
            label="Moment actions"
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
            <MomentMenu id={id} name={name} date={date} momentInCookies={momentInCookies} onRemoved={markRemoved} />
          </Menu>
          <InlineActions {...inline} className="hidden items-center gap-5 sm:flex" />
        </>
      ) : (
        <InlineActions {...inline} className="flex items-center gap-1 sm:gap-5" />
      )}
    </div>
  );
}

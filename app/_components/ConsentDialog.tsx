'use client';

import { type SyntheticEvent, useEffect, useRef, useTransition } from 'react';

export function ConsentDialog({ onAccept, onCancel }: { onAccept: () => void | Promise<void>; onCancel: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const acceptRef = useRef<HTMLButtonElement>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (!dialog.open) {
      dialog.showModal();
    }

    acceptRef.current?.focus();

    return () => dialog.close();
  }, []);

  function handleCancel(event: SyntheticEvent<HTMLDialogElement>) {
    event.preventDefault();

    if (!pending) {
      onCancel();
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 z-50 m-0 h-full w-full max-h-none max-w-none border-0 bg-black/50 p-4 open:flex open:items-center open:justify-center"
      aria-labelledby="cookie-consent-title"
      data-consent-gate="true"
      onCancel={handleCancel}
    >
      <div className="flex flex-col w-full max-w-3xl max-h-[calc(100vh-2rem)] gap-2 p-4 overflow-y-auto text-sm sm:text-base text-justify border border-gray-300 bg-white text-gray-800 rounded-lg shadow-xl">
        <h2 id="cookie-consent-title" className="text-lg sm:text-xl font-semibold">
          Cookie consent
        </h2>
        <p>This site uses cookies to store the countdowns you create.</p>
        <b>Here&apos;s how it works:</b>

        <p>
          When you first submit a countdown, a cookie is created in your browser. This cookie also stores any other
          countdowns you&apos;ve created, so you don&apos;t have to enter them again each time you visit. This cookie
          lasts for 365 days.
        </p>
        <p>
          Clicking &quot;Remove&quot; on a countdown only deletes that specific countdown from the cookie, not the
          entire cookie.
        </p>
        <p>
          We also store all countdowns in a database. This allows you to share your countdowns with a URL. However, for
          your privacy, we only store the countdown&apos;s name and target date. We strongly suggest to avoid entering
          personal details in your countdown names.
        </p>
        <b>No other data or information about you, like your device or location, is saved.</b>

        <p>By clicking &quot;Accept&quot;, you agree to the use of cookies.</p>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            className="text-base sm:text-lg text-purple-700 py-2 px-4 rounded-md border border-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
            type="button"
            onClick={onCancel}
            disabled={pending}
          >
            Cancel
          </button>
          <button
            ref={acceptRef}
            className="text-base sm:text-lg bg-purple-700 text-white py-2 px-4 rounded-md disabled:cursor-not-allowed disabled:bg-purple-400"
            type="button"
            onClick={() => startTransition(onAccept)}
            disabled={pending}
          >
            {pending ? 'Accepting...' : 'Accept'}
          </button>
        </div>
      </div>
    </dialog>
  );
}

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
      <div className="flex flex-col w-full max-w-3xl max-h-[calc(100vh-2rem)] gap-2 p-4 overflow-y-auto text-sm sm:text-base text-justify border border-gray-300 bg-white text-gray-800 rounded-2xl shadow-xl dark:border-white/20 dark:bg-zinc-900 dark:text-zinc-100">
        <h2 id="cookie-consent-title" className="text-lg sm:text-xl font-semibold">
          Cookie consent
        </h2>
        <p>This site uses two cookies, both just to make it work. No ads, no tracking.</p>
        <ul className="list-disc pl-5">
          <li>One remembers that you accepted this notice.</li>
          <li>One remembers the moments you saved.</li>
        </ul>
        <p>Both last for one year.</p>
        <p>
          A moment&apos;s name and date are part of its link. Anyone with the link can see them, so please don&apos;t
          put private details in the name.
        </p>
        <p>
          The saved-moments cookie is only set when you save a moment. Removing a moment only removes it from your saved
          list. The shared link still works.
        </p>
        <p>That&apos;s everything. We don&apos;t collect any other data about you.</p>
        <p>By clicking &quot;Accept&quot;, you agree to the use of cookies.</p>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            className="text-base sm:text-lg text-brand-accent py-2 px-4 rounded-xl border border-brand-accent disabled:cursor-not-allowed disabled:opacity-60"
            type="button"
            onClick={onCancel}
            disabled={pending}
          >
            Cancel
          </button>
          <button
            ref={acceptRef}
            className="text-base sm:text-lg bg-brand text-brand-foreground py-2 px-4 rounded-xl disabled:cursor-not-allowed disabled:bg-brand-muted"
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

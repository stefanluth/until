'use client';

import { CircleAlert } from 'lucide-react';

import { type SubmitEvent, useEffect, useRef, useState, useTransition } from 'react';

import { useRouter } from 'next/navigation';

import { type MomentInputResult, momentFromInput } from '@/_utils/momentForm';
import { MAX_MOMENT_NAME_LENGTH } from '@/_utils/validation';

export default function MomentInput() {
  const router = useRouter();
  const nameInputRef = useRef<HTMLInputElement>(null);
  const whenInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');
  const [when, setWhen] = useState('');
  const [error, setError] = useState<Extract<MomentInputResult, { ok: false }> | null>(null);
  const [pending, startTransition] = useTransition();

  const nameError = error?.location === 'name' ? error.error : '';
  const whenError = error?.location === 'when' ? error.error : '';

  useEffect(() => {
    if (error?.location === 'name') {
      nameInputRef.current?.focus();
    } else if (error?.location === 'when') {
      whenInputRef.current?.focus();
    }
  }, [error]);

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const result = momentFromInput(data.get('name'), data.get('when'));

    if (!result.ok) {
      setError(result);
      return;
    }

    setError(null);
    startTransition(() => router.push(`/${result.id}`));
  }

  return (
    <form className="flex flex-col gap-1 sm:gap-1.5" onSubmit={handleSubmit}>
      <div>
        <label className="text-base sm:text-lg" htmlFor="name">
          Moment name
        </label>
        <input
          ref={nameInputRef}
          className="block w-full mt-1 text-base sm:text-lg p-2.5 sm:p-3"
          type="text"
          id="name"
          name="name"
          placeholder="e.g. Family Reunion"
          autoComplete="on"
          maxLength={MAX_MOMENT_NAME_LENGTH}
          value={name}
          onChange={(event) => setName(event.target.value)}
          aria-invalid={nameError ? true : undefined}
          aria-describedby={nameError ? 'name-error' : undefined}
          required
        />
        <FieldError field="name" message={nameError} />
      </div>
      <div>
        <label className="text-base sm:text-lg" htmlFor="when">
          When
        </label>
        <input
          ref={whenInputRef}
          className="block w-full mt-1 text-base sm:text-lg p-2.5 sm:p-3"
          type="text"
          id="when"
          name="when"
          placeholder="1d 2h 3m or 25-12-2026 18:00"
          autoComplete="off"
          value={when}
          onChange={(event) => setWhen(event.target.value)}
          aria-invalid={whenError ? true : undefined}
          aria-describedby={whenError ? 'when-error' : undefined}
          required
        />
        <FieldError field="when" message={whenError} />
      </div>
      <SubmitButton pending={pending} />
    </form>
  );
}

function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <button
      className="text-lg sm:text-xl text-brand-foreground py-2.5 sm:py-3 px-5 sm:px-6 rounded-xl bg-brand disabled:cursor-not-allowed disabled:bg-brand-muted"
      type="submit"
      disabled={pending}
    >
      {pending ? 'Starting…' : 'Start a timer'}
    </button>
  );
}

function FieldError({ field, message }: { field: 'name' | 'when'; message: string }) {
  return (
    <div className="mt-1 min-h-5 sm:min-h-6">
      {message ? (
        <p
          id={`${field}-error`}
          role="alert"
          className="flex items-start gap-1.5 text-sm leading-5 text-red-700 sm:text-base sm:leading-6 dark:text-red-300"
        >
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>{message}</span>
        </p>
      ) : null}
    </div>
  );
}

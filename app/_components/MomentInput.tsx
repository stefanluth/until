'use client';

import Cookies from 'js-cookie';
import { CircleAlert } from 'lucide-react';

import { type SubmitEvent, useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';

import { type MomentFormState, submitMomentAction } from '@/_actions/submitMoment';
import { CONSENT_COOKIE, isConsentGranted } from '@/_utils/cookies';
import { parseWhen } from '@/_utils/parseWhen';
import { MAX_MOMENT_NAME_LENGTH } from '@/_utils/validation';

import { useConsent } from './ConsentProvider';

const INITIAL_STATE: MomentFormState = { error: '', location: '' };

export default function MomentInput() {
  const nameInputRef = useRef<HTMLInputElement>(null);
  const whenInputRef = useRef<HTMLInputElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [name, setName] = useState('');
  const [when, setWhen] = useState('');
  const { requestConsent } = useConsent();
  const [state, formAction] = useActionState(submitMomentAction, INITIAL_STATE);

  const nameError = state.location === 'name' ? state.error : '';
  const whenError = state.location === 'when' ? state.error : '';
  const formError = state.location === 'consent' || state.location === 'form' ? state.error : '';
  const bottomError = whenError || formError;

  useEffect(() => {
    if (state.location === 'name') {
      nameInputRef.current?.focus();
    } else if (state.location === 'when') {
      whenInputRef.current?.focus();
    }
  }, [state]);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    if (!isConsentGranted(Cookies.get(CONSENT_COOKIE))) {
      event.preventDefault();

      if (await requestConsent()) {
        formRef.current?.requestSubmit();
      }

      return;
    }

    const whenText = String(new FormData(event.currentTarget).get('when') ?? '');
    const parsed = parseWhen(whenText);

    if (dateInputRef.current) {
      dateInputRef.current.value = parsed?.toISOString() ?? '';
    }
  }

  return (
    <form ref={formRef} className="flex flex-col gap-1 sm:gap-1.5" action={formAction} onSubmit={handleSubmit}>
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
        <input ref={dateInputRef} type="hidden" name="date" />
        <FieldError field={whenError ? 'when' : 'form'} message={bottomError} />
      </div>
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

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

function FieldError({ field, message }: { field: 'name' | 'when' | 'form'; message: string }) {
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

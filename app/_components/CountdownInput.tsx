'use client';

import Cookies from 'js-cookie';

import { type SubmitEvent, useActionState, useRef } from 'react';
import { useFormStatus } from 'react-dom';

import { type CountdownFormState, submitCountdownAction } from '@/_actions/submitCountdown';
import { CONSENT_COOKIE, isConsentGranted } from '@/_utils/cookies';
import { parseWhen } from '@/_utils/parseWhen';
import { MAX_COUNTDOWN_NAME_LENGTH } from '@/_utils/validation';

import { useConsent } from './ConsentProvider';

const INITIAL_STATE: CountdownFormState = { error: '', location: '' };

export default function CountdownInput() {
  const dateInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const { requestConsent } = useConsent();
  const [state, formAction] = useActionState(submitCountdownAction, INITIAL_STATE);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    if (!isConsentGranted(Cookies.get(CONSENT_COOKIE))) {
      event.preventDefault();

      if (await requestConsent()) {
        formRef.current?.requestSubmit();
      }

      return;
    }

    const when = String(new FormData(event.currentTarget).get('when') ?? '');
    const parsed = parseWhen(when);

    if (dateInputRef.current) {
      dateInputRef.current.value = parsed?.toISOString() ?? '';
    }
  }

  return (
    <form ref={formRef} className="flex flex-col gap-4 sm:gap-5" action={formAction} onSubmit={handleSubmit}>
      <div>
        <div className="flex items-center">
          <label className="text-base sm:text-lg" htmlFor="name">
            Name of the event
          </label>
          <FieldError state={state} field="name" />
        </div>
        <input
          className="block w-full mt-1 text-base sm:text-lg p-2.5 sm:p-3"
          type="text"
          id="name"
          name="name"
          placeholder="e.g. Family Reunion"
          autoComplete="on"
          maxLength={MAX_COUNTDOWN_NAME_LENGTH}
          required
        />
      </div>
      <div>
        <div className="flex items-center">
          <label className="text-base sm:text-lg" htmlFor="when">
            When
          </label>
          <FieldError state={state} field="when" />
        </div>
        <input
          className="block w-full mt-1 text-base sm:text-lg p-2.5 sm:p-3"
          type="text"
          id="when"
          name="when"
          placeholder="1d 2h 3m or 25-12-2026 18:00"
          autoComplete="off"
          required
        />
        <input ref={dateInputRef} type="hidden" name="date" />
      </div>
      {(state.location === 'consent' || state.location === 'form') && (
        <p className="text-base text-red-600">{state.error}</p>
      )}
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
      {pending ? 'Creating...' : 'Create'}
    </button>
  );
}

function FieldError({ state, field }: { state: CountdownFormState; field: 'name' | 'when' }) {
  if (state.location !== field) {
    return null;
  }

  return <ErrorInfo error={state.error} className="ml-auto mr-2" />;
}

function ErrorInfo({ error, className = '' }: { error: string; className?: string }) {
  return (
    <div
      className={`h-6 w-6 leading-5 text-white text-center align-middle bg-red-500 border-2 border-red-500 rounded-full cursor-pointer ${className}`}
      title={error}
    >
      !
    </div>
  );
}

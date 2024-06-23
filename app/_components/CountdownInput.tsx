'use client';

import React, { useEffect, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';

import { submitCountdownAction } from '@/app/_actions/submitCountdown';

export default function CountdownInput() {
  const [useDate, setUseDate] = useState(false);
  const [date, setDate] = useState('');
  const [isoDate, setIsoDate] = useState('');

  const [state, formAction] = useFormState(submitCountdownAction, { error: '', location: '' });

  useEffect(() => {
    if (!date) return;
    const parsedDate = new Date(date);
    setIsoDate(parsedDate.toISOString());
  }, [date]);

  return (
    <form className="flex flex-col gap-4" action={formAction}>
      <div>
        <div className="flex">
          <label htmlFor="name">Name of the event</label>
          {state.location === 'name' && <ErrorInfo error={state.error} />}
        </div>
        <input
          className="block w-full mt-1"
          type="text"
          id="name"
          name="name"
          placeholder="e.g. Family Reunion"
          autoComplete="on"
          maxLength={48}
          required
        />
      </div>
      <div>
        <div className="flex">
          <input
            className="hidden"
            type="checkbox"
            id="useDate"
            checked={useDate}
            onChange={() => setUseDate(!useDate)}
          />
          <label className="flex gap-3 items-center cursor-pointer" htmlFor="useDate">
            <div>Duration</div>
            <div
              className={`w-10 h-5 rounded-full transition-colors ease-linear duration-300 ${
                useDate ? 'bg-purple-700' : 'bg-gray-300'
              }`}
            >
              <div
                className={`bg-white w-5 h-5 rounded-full shadow-md transform duration-300 ${
                  useDate ? 'translate-x-5' : ''
                }`}
              />
            </div>
            <div>Date</div>
          </label>
          {(state.location === 'date' || state.location === 'duration') && <ErrorInfo error={state.error} />}
        </div>
        {useDate ? (
          <>
            <input
              className="block w-full mt-1"
              type="datetime-local"
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0] + 'T00:00'}
              max="2099-12-31T23:59"
              required
            />
            <input hidden type="text" name="date" defaultValue={isoDate} />
          </>
        ) : (
          <input
            className="block w-full mt-1"
            type="text"
            name="duration"
            placeholder="e.g. 1d 2h 3m"
            pattern="(\d+d)?\s*(\d+h)?\s*(\d+m)?\s*(\d+s)?"
            required
          />
        )}
      </div>
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className={`text-white py-2 px-4 rounded-md ${pending ? 'cursor-not-allowed bg-purple-400' : 'bg-purple-700'}`}
      type="submit"
      disabled={pending}
    >
      {pending ? 'Creating...' : 'Create'}
    </button>
  );
}

function ErrorInfo({ error }: { error: string }) {
  return (
    <div
      className="ml-auto h-6 w-6 mr-2 leading-5 translate-y-9 translate-x-10 text-white text-center align-middle bg-red-500 border-2 border-red-500 rounded-full cursor-pointer"
      title={error}
    >
      !
    </div>
  );
}

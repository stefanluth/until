import React from 'react';

import { cookies } from 'next/headers';

import { COOKIE_OPTIONS } from '../utils/cookies';

export function CookieNotice() {
  const consent = cookies().get('consent');

  if (consent?.value === 'true') {
    return null;
  }

  const accept = async () => {
    'use server';
    cookies().set('consent', 'true', COOKIE_OPTIONS);
  };

  return (
    <div className="absolute bottom-0 left-0 w-full p-1 sm:p-4">
      <div className="flex flex-col max-w-3xl gap-2 mx-auto p-4 text-sm text-justify border border-gray-300 bg-white text-gray-800 rounded-lg">
        <p>This site uses cookies to store the countdowns you create.</p>
        <b>Here's how it works:</b>

        <p>
          When you first submit a countdown, a cookie is created in your browser. This cookie also stores any other
          countdowns you've created, so you don't have to enter them again each time you visit. This cookie lasts for
          365 days.
        </p>
        <p>
          Clicking "Remove" on a countdown only deletes that specific countdown from the cookie, not the entire cookie.
        </p>
        <p>
          We also store all countdowns in a database. This allows you to share your countdowns with a URL. However, for
          your privacy, we only store the countdown's name and target date. We strongly suggest to avoid entering
          personal details in your countdown names.
        </p>
        <b>No other data or information about you, like your device or location, is saved.</b>

        <p>By clicking "Accept", you agree to the use of cookies.</p>

        <form action={accept}>
          <button className="w-full bg-purple-700 text-white py-2 px-4 rounded-md" type="submit">
            Accept
          </button>
        </form>
      </div>
    </div>
  );
}

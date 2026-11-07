import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

import { CONSENT_COOKIE, COOKIE_OPTIONS } from '../utils/cookies';

export async function CookieNotice() {
  const consent = (await cookies()).get(CONSENT_COOKIE);

  if (consent?.value === 'true') {
    return null;
  }

  const accept = async () => {
    'use server';
    const cookieStore = await cookies();
    cookieStore.set(CONSENT_COOKIE, 'true', COOKIE_OPTIONS);
    revalidatePath('/');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-consent-title"
      data-consent-gate="true"
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

        <form action={accept}>
          <button
            className="w-full text-base sm:text-lg bg-purple-700 text-white py-2 px-4 rounded-md"
            type="submit"
            autoFocus
          >
            Accept
          </button>
        </form>
      </div>
    </div>
  );
}

'use client';

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 mx-auto text-center">
      <h1 className="text-3xl sm:text-5xl md:text-6xl">Something went wrong</h1>
      <p className="text-base sm:text-lg md:text-xl">The countdown could not be loaded. Please try again.</p>
      <button
        className="text-base sm:text-lg md:text-xl underline hover:opacity-80"
        onClick={reset}
        type="button"
      >
        Try again
      </button>
    </div>
  );
}

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center gap-4 mx-auto text-center">
      <h1 className="text-3xl sm:text-5xl md:text-6xl">Countdown not found</h1>
      <p className="text-base sm:text-lg md:text-xl">This countdown may have been removed, or the URL is incorrect.</p>
      <Link className="text-base sm:text-lg md:text-xl text-white underline hover:text-gray-200" href="/">
        Create a new countdown
      </Link>
    </div>
  );
}

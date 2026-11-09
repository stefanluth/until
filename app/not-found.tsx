import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center gap-4 mx-auto text-center">
      <h1 className="text-3xl sm:text-5xl md:text-6xl">Moment not found</h1>
      <p className="text-base sm:text-lg md:text-xl">This moment may have been removed, or the URL is incorrect.</p>
      <Link className="text-base sm:text-lg md:text-xl underline hover:opacity-80" href="/">
        Start a timer
      </Link>
    </div>
  );
}

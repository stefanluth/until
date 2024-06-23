'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Countdown } from '@prisma/client';

import { DeleteButton } from './DeleteButton';

export default function CountdownCard(countdown: Countdown) {
  const [now, setNow] = useState(new Date().getTime());
  const countdownTime = useMemo(() => Number(countdown.date), [countdown.date]);
  const diff = countdownTime - now;

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date().getTime());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor(diff / (1000 * 60));
  const seconds = Math.floor(diff / 1000);

  return (
    <CountdownCardContainer>
      <CountdownCardHeader name={countdown.name} date={new Date(countdownTime)} />
      <CountdownCardBody d={days} h={hours % 24} m={minutes % 60} s={seconds % 60} />
      <CountdownCardFooter id={countdown.id} />
    </CountdownCardContainer>
  );
}

function CountdownCardContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col justify-between w-full h-72 max-w-2xl rounded-2xl backdrop-brightness-105">
      {children}
    </div>
  );
}

function CountdownCardHeader({ name, date }: { name: string; date: Date }) {
  const timeString = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  const dateString = date.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="flex flex-col w-full h-24 gap-2 text-center justify-center border-b overflow-y-scroll">
      <h1 className="text-4xl">{name}</h1>
      <h3>
        {dateString} | {timeString}
      </h3>
    </div>
  );
}

function CountdownCardBody({ d, h, m, s }: { d: number; h: number; m: number; s: number }) {
  switch (true) {
    case d > 0:
      return (
        <div className="flex w-full justify-center gap-8 p-4 text-lg">
          <div suppressHydrationWarning>{d} days</div>
        </div>
      );
    case h > 0:
      return (
        <div className="flex w-full justify-center gap-8 p-4 text-lg">
          <div suppressHydrationWarning>{h} hours</div>
          <div suppressHydrationWarning>{m} minutes</div>
          <div suppressHydrationWarning>{s} seconds</div>
        </div>
      );
    case m > 0:
      return (
        <div className="flex w-full justify-center gap-8 p-4 text-lg">
          <div suppressHydrationWarning>{m} minutes</div>
          <div suppressHydrationWarning>{s} seconds</div>
        </div>
      );
    case s > 0:
      return (
        <div className="flex w-full justify-center gap-8 p-4 text-lg">
          <div suppressHydrationWarning>{s} seconds</div>
        </div>
      );
    default:
      return <div className="flex w-full justify-center gap-8 p-4 text-lg">Countdown has ended!</div>;
  }
}

function CountdownCardFooter({ id }: { id: string }) {
  const path = usePathname();

  return (
    <div className="flex gap-4 justify-end px-4 pb-4 opacity-90">
      {!path.endsWith(`/${id}`) && (
        <Link className="text-white hover:underline hover:text-gray-200" href={id}>
          Open
        </Link>
      )}
      <ShareButton id={id} />
      <DeleteButton id={id} />
    </div>
  );
}

function ShareButton({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className="text-white hover:underline w-14 hover:text-gray-200"
      onClick={() => {
        navigator.clipboard.writeText(`${location.origin}/${id}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? 'Copied!' : 'Share'}
    </button>
  );
}

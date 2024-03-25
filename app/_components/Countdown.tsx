"use client";

import { Countdown } from "@prisma/client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CountdownCard(countdown: Countdown) {
  const [now, setNow] = useState(new Date().getTime());
  const diff = Number(countdown.date) - now;

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
      <CountdownCardHeader name={countdown.name} />
      <CountdownCardBody d={days} h={hours % 24} m={minutes % 60} s={seconds % 60} />
      <CountdownCardFooter id={countdown.id} />
    </CountdownCardContainer>
  );
}

function CountdownCardContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col justify-between w-full h-72 min-w-[22rem] max-w-2xl rounded-2xl backdrop-brightness-105">
      {children}
    </div>
  );
}

function CountdownCardHeader({ name }: { name: string }) {
  return (
    <div className="flex w-full h-24 border-b overflow-y-scroll">
      <h1 className="text-4xl w-full max-w-full max-h-full self-center text-center px-4">{name}</h1>
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
  return (
    <div className="flex gap-4 justify-end px-4 pb-4 opacity-90">
      <Link className="text-white hover:underline hover:text-gray-200" href={id}>
        Open
      </Link>
      <ShareButton id={id} />
      <button className="text-white hover:underline">Delete</button>
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
      {copied ? "Copied!" : "Share"}
    </button>
  );
}

import type { Metadata } from 'next';

import { cache } from 'react';

import { notFound } from 'next/navigation';

import CountdownCard from '@/_components/Countdown';
import { findCountdownById } from '@/db';

const getCountdown = cache(findCountdownById);

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const countdown = await getCountdown(id);

  return {
    title: countdown?.name ? `${countdown.name} - Countdown` : 'Until',
    description: countdown ? `How long until ${countdown.name}?` : undefined,
  };
}

export default async function CountdownPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const countdown = await getCountdown(id);

  if (!countdown) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col">
      <CountdownCard {...countdown} variant="detail" />
    </div>
  );
}

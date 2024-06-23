import { Metadata } from 'next';

import CountdownCard from '@/app/_components/Countdown';
import { prisma } from '@/app/prisma';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const countdown = await prisma.countdown.findFirst({ where: { id: params.id } });

  return {
    title: countdown?.name ? `${countdown.name} - Countdown` : 'Until',
    description: countdown ? `How long until ${countdown.name}?` : undefined,
  };
}

export default async function CountdownPage({ params }: { params: { id: string } }) {
  const countdown = await prisma.countdown.findFirst({ where: { id: params.id } });
  if (!countdown) {
    return <div>Countdown not found</div>;
  }

  return (
    <div className="flex flex-col max-w-2xl mx-auto">
      <CountdownCard {...countdown} />
    </div>
  );
}

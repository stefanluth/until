import CountdownCard from '@/app/_components/Countdown';
import { prisma } from '@/app/prisma';

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

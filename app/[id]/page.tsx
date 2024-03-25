import { prisma } from "@/app/prisma";
import CountdownCard from "@/app/_components/Countdown";
import Link from "next/link";

export default async function CountdownPage({ params }: { params: { id: string } }) {
  const countdown = await prisma.countdown.findFirst({ where: { id: params.id } });
  if (!countdown) {
    return <div>Countdown not found</div>;
  }

  return (
    <div className="flex flex-col h-screen w-full max-w-2xl gap-8 pt-8 mx-auto">
      <Link className="absolute right-12 text-white hover:underline hover:text-gray-200" href="/countdowns">
        Show all
      </Link>
      <CountdownCard {...countdown} />
    </div>
  );
}

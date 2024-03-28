import { cookies } from "next/headers";
import CountdownCard from "@/app/_components/Countdown";
import { prisma } from "@/app/prisma";

export default async function CountdownsPage() {
  const cookieStore = cookies();
  const countdownIds: string[] = cookieStore.get("countdowns")?.value.split(",") || [];
  const countdowns = await prisma.countdown.findMany({
    where: {
      id: {
        in: countdownIds,
      },
    },
  });

  if (!countdowns || countdowns.length === 0) {
    return <div className="text-center">No countdowns found.</div>;
  }

  return (
    <div className="flex flex-col max-w-2xl gap-8 mx-auto">
      {countdowns
        .sort((a, b) => Number(a.date) - Number(b.date))
        .map((countdown) => (
          <CountdownCard key={countdown.id} {...countdown} />
        ))}
    </div>
  );
}

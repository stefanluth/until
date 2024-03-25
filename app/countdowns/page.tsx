import { cookies } from "next/headers";
import { Countdown } from "../_actions/submitCountdown";
import CountdownCard from "../_components/Countdown";

export default function CountdownPage() {
  const cookieStore = cookies();
  const countdowns: Countdown[] = JSON.parse(cookieStore.get("countdowns")?.value || "[]");
  return (
    <div className="flex flex-col gap-8 pt-8 w-fit mx-auto">
      {countdowns
        .sort((a, b) => a.date - b.date)
        .map((countdown) => (
          <CountdownCard key={countdown.code} {...countdown} />
        ))}
    </div>
  );
}

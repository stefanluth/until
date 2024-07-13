export function CountdownCardBody({ d, h, m, s }: { d: number; h: number; m: number; s: number }) {
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

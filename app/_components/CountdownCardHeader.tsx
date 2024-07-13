export function CountdownCardHeader({ name, date }: { name: string; date: Date }) {
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
      <h3 suppressHydrationWarning>
        {dateString} | {timeString}
      </h3>
    </div>
  );
}

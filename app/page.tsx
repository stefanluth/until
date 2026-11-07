import CountdownInput from '@/_components/CountdownInput';

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center w-full px-4 mx-auto">
      <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl leading-none tracking-tight whitespace-nowrap mb-6 sm:mb-8 select-none">
        How long until?
      </h1>
      <div className="w-full max-w-md sm:max-w-lg">
        <CountdownInput />
      </div>
    </div>
  );
}

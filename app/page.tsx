import CountdownInput from "./_components/CountdownInput";

export default function Home() {
  return (
    <main className="h-screen w-screen">
      <div className="w-fit pt-[7%] mx-auto">
        <h1 className="text-5xl min-w-max mb-5">How long until?</h1>
        <CountdownInput />
      </div>
    </main>
  );
}

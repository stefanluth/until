import CountdownInput from "./_components/CountdownInput";

export default function Home() {
  return (
    <div className="w-fit mx-auto">
      <h1 className="text-5xl min-w-max mb-5">How long until?</h1>
      <CountdownInput />
    </div>
  );
}

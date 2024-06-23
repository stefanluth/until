import { CookieNotice } from '@/app/_components/CookieNotice';
import CountdownInput from '@/app/_components/CountdownInput';

export default function Home() {
  return (
    <>
      <div className="w-fit mx-auto">
        <h1 className="text-5xl min-w-max mb-5 select-none">How long until?</h1>
        <CountdownInput />
      </div>
      <CookieNotice />
    </>
  );
}

import type { Metadata } from 'next';

import localFont from 'next/font/local';

import { ConsentProvider } from '@/_components/ConsentProvider';
import { CountdownMetaProvider } from '@/_components/CountdownMetaContext';
import { Footer } from '@/_components/Footer';
import { NavBar } from '@/_components/NavBar';

import './globals.css';

const inter = localFont({
  src: '../assets/fonts/inter-latin.woff2',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'until',
  description: 'until is a simple countdown timer, sharable via URL.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={`${inter.className} h-full min-h-screen w-full flex flex-col`}>
        <ConsentProvider>
          <CountdownMetaProvider>
            <div className="group relative flex flex-1 flex-col">
              <header className="absolute inset-x-0 top-0 z-10 flex flex-col">
                <NavBar />
              </header>
              <main className="flex flex-1 flex-col py-20">{children}</main>
              <Footer />
            </div>
          </CountdownMetaProvider>
        </ConsentProvider>
      </body>
    </html>
  );
}

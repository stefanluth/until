import type { Metadata } from 'next';

import localFont from 'next/font/local';

import { ConsentProvider } from '@/_components/ConsentProvider';
import { Footer } from '@/_components/Footer';
import { MomentMetaProvider } from '@/_components/MomentMetaContext';
import { NavBar } from '@/_components/NavBar';
import { ThemeBootScript } from '@/_components/ThemeBootScript';

import './globals.css';

const inter = localFont({
  src: '../assets/fonts/inter-latin.woff2',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'until',
  description: 'until is a simple, shareable timer.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={`${inter.className} h-full min-h-dvh w-full flex flex-col`}>
        {/* Server-injected into <head> before paint; renders null on the client. */}
        <ThemeBootScript />
        <ConsentProvider>
          <MomentMetaProvider>
            <div className="group relative flex flex-1 flex-col">
              <header className="absolute inset-x-0 top-0 z-10 flex flex-col">
                <NavBar />
              </header>
              <main className="flex flex-1 flex-col pt-20 pb-14 sm:pb-16">{children}</main>
              <Footer />
            </div>
          </MomentMetaProvider>
        </ConsentProvider>
      </body>
    </html>
  );
}

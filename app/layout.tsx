import type { Metadata } from 'next';

import localFont from 'next/font/local';

import { Footer } from '@/app/_components/Footer';
import { NavBar } from '@/app/_components/NavBar';

import './globals.css';

const inter = localFont({
  src: './fonts/inter-latin.woff2',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Until',
  description: 'Until is a simple countdown timer, sharable via URL.',
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
        <div className="group flex flex-1 flex-col">
          <header className="flex flex-col">
            <NavBar />
          </header>
          <main className="flex flex-col flex-1 py-8">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}

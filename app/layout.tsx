import type { Metadata } from 'next';

import { Inter } from 'next/font/google';

import { NavBar } from '@/app/_components/NavBar';

import './globals.css';

const inter = Inter({ subsets: ['latin'] });

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
      <body className={`${inter.className} h-full min-h-screen w-screen`}>
        <header>
          <NavBar />
        </header>
        <main className="py-8">{children}</main>
      </body>
    </html>
  );
}

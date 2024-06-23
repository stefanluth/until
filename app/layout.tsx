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
      <body className={`${inter.className} h-full min-h-screen w-screen`}>
        <NavBar />
        <main className="py-8">{children}</main>
      </body>
    </html>
  );
}

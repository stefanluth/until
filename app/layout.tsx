import type { Metadata } from 'next';

import localFont from 'next/font/local';

import { ConsentProvider } from '@/_components/ConsentProvider';
import { CountdownMetaProvider } from '@/_components/CountdownMetaContext';
import { Footer } from '@/_components/Footer';
import { NavBar } from '@/_components/NavBar';
import { DEFAULT_MODE, DEFAULT_THEME, MODES, MODE_STORAGE_KEY, THEMES, THEME_STORAGE_KEY } from '@/_utils/themes';

import './globals.css';

const inter = localFont({
  src: '../assets/fonts/inter-latin.woff2',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
});

const themeBootScript = `(function(){try{var d=document.documentElement;var t=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});if(${JSON.stringify(THEMES.map((theme) => theme.id))}.indexOf(t)>-1&&t!==${JSON.stringify(DEFAULT_THEME)}){d.dataset.theme=t}var m=localStorage.getItem(${JSON.stringify(MODE_STORAGE_KEY)});if(${JSON.stringify(MODES)}.indexOf(m)<0){m=${JSON.stringify(DEFAULT_MODE)}}d.dataset.mode=m;d.dataset.appearance=m==='light'||m==='dark'?m:(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light')}catch(e){}})();`;

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body className={`${inter.className} h-full min-h-dvh w-full flex flex-col`}>
        <ConsentProvider>
          <CountdownMetaProvider>
            <div className="group relative flex flex-1 flex-col">
              <header className="absolute inset-x-0 top-0 z-10 flex flex-col">
                <NavBar />
              </header>
              <main className="flex flex-1 flex-col pt-20 pb-14 sm:pb-16">{children}</main>
              <Footer />
            </div>
          </CountdownMetaProvider>
        </ConsentProvider>
      </body>
    </html>
  );
}

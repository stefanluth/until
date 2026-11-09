'use client';

import { useRef } from 'react';

import { useServerInsertedHTML } from 'next/navigation';

import { themeBootScript } from '@/_utils/themeBootScript';

export function ThemeBootScript() {
  const inserted = useRef(false);

  // Inject outside React's tree so client renders never create an executable <script>.
  useServerInsertedHTML(() => {
    // Hook runs on every flush; emit the script only once per document.
    if (inserted.current) return null;
    inserted.current = true;

    return <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />;
  });

  return null;
}

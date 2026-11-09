import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { ImageResponse } from 'next/og';

import { buildMomentImageContent } from '@/_utils/momentImage';
import type { MomentImageContent } from '@/_utils/momentImageTypes';
import { decodeMomentParam, momentDisplayPath, offsetMinutes } from '@/_utils/momentUrl';
import { resolveSiteUrl } from '@/_utils/siteUrl';
import { splitRemaining } from '@/_utils/timer';

export const runtime = 'nodejs';
export const revalidate = 60;
export const alt = 'until countdown';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const BACKGROUND = 'linear-gradient(180deg, #f8f3ff 0%, #d8b4fe 100%)';
const FOREGROUND = '#28143c';
const MUTED = 'rgba(40, 20, 60, 0.78)';
const MAX_URL_LENGTH = 96;

type ImageFont = {
  name: string;
  data: Buffer;
  weight: 400 | 700;
  style: 'normal';
};

export default async function OpenGraphImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const moment = decodeMomentParam(id);

  if (!moment) {
    return new Response('Not found', { status: 404 });
  }

  const content = buildMomentImageContent({
    name: moment.name,
    date: moment.date,
    remaining: splitRemaining(moment.date.getTime() - Date.now()),
    url: `${resolveSiteUrl()}${momentDisplayPath(moment.id)}`,
    locale: 'en-US',
    offsetMinutes: offsetMinutes(moment.id),
  });

  return new ImageResponse(<MomentCard content={content} />, { ...size, fonts: await loadFonts() });
}

function MomentCard({ content }: { content: MomentImageContent }) {
  const titleSize = content.name.length <= 16 ? 84 : content.name.length <= 26 ? 72 : 60;
  const url =
    content.url && content.url.length > MAX_URL_LENGTH ? `${content.url.slice(0, MAX_URL_LENGTH - 1)}…` : content.url;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '56px 72px 48px',
        background: BACKGROUND,
        color: FOREGROUND,
        fontFamily: 'Inter',
      }}
    >
      <div style={{ display: 'flex', fontSize: 38, fontWeight: 700, letterSpacing: -0.5, opacity: 0.9 }}>until</div>
      <div
        style={{
          display: 'flex',
          flexGrow: 1,
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            maxWidth: 980,
            fontSize: titleSize,
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: -1.5,
          }}
        >
          {content.name}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginTop: 18,
            fontSize: 28,
            fontWeight: 400,
            color: MUTED,
          }}
        >
          <span>{content.dateLabel}</span>
          {content.timeLabel ? (
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ marginLeft: 14, marginRight: 14, opacity: 0.45 }}>•</span>
              <span>{content.timeLabel}</span>
            </span>
          ) : null}
        </div>
        <div style={{ display: 'flex', marginTop: 44 }}>
          {content.units.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
              {content.units.map(({ unit, value, label }, index) => (
                <div
                  key={unit}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    minWidth: 110,
                    marginLeft: index === 0 ? 0 : 48,
                  }}
                >
                  <span
                    style={{
                      fontSize: content.units.length === 1 ? 132 : 96,
                      fontWeight: 700,
                      lineHeight: 1,
                      letterSpacing: -2,
                    }}
                  >
                    {value}
                  </span>
                  <span style={{ marginTop: 8, fontSize: 22, fontWeight: 400, letterSpacing: 3, color: MUTED }}>
                    {label.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', fontSize: 72, fontWeight: 700 }}>Timer finished.</div>
          )}
        </div>
      </div>
      {url ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            fontSize: 22,
            fontWeight: 400,
            color: MUTED,
          }}
        >
          {url}
        </div>
      ) : null}
    </div>
  );
}

let fontsPromise: Promise<ImageFont[]> | null = null;

function loadFonts(): Promise<ImageFont[]> {
  fontsPromise ??= Promise.all([
    readFile(join(process.cwd(), 'assets/fonts/inter-latin-400.woff')),
    readFile(join(process.cwd(), 'assets/fonts/inter-latin-700.woff')),
  ]).then(([regular, bold]) => [
    { name: 'Inter', data: regular, weight: 400, style: 'normal' },
    { name: 'Inter', data: bold, weight: 700, style: 'normal' },
  ]);

  return fontsPromise;
}

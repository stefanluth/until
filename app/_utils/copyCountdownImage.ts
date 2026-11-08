import { renderCountdownImageBlob } from './downloadCountdownImage.ts';

export async function copyCountdownImage({ id, name, date }: { id: string; name: string; date: Date }): Promise<void> {
  if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') {
    throw new Error('Copying images to the clipboard is not supported in this browser');
  }

  const png = renderCountdownImageBlob({ id, name, date });

  await navigator.clipboard.write([new ClipboardItem({ 'image/png': png })]);
}

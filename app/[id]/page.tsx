import type { Metadata } from 'next';

import { notFound } from 'next/navigation';

import MomentCard from '@/_components/MomentCard';
import { MomentDetailMeta } from '@/_components/MomentDetailMeta';
import { decodeMomentParam } from '@/_utils/momentUrl';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const moment = decodeMomentParam(id);

  return {
    title: moment?.name ? `${moment.name} - until` : 'until',
    description: moment ? `How long until ${moment.name}?` : undefined,
  };
}

export default async function MomentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const moment = decodeMomentParam(id);

  if (!moment) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col pb-10 pt-2 sm:pb-0">
      <MomentDetailMeta id={moment.id} name={moment.name} date={moment.date} />
      <MomentCard {...moment} variant="detail" />
    </div>
  );
}
